<?php

namespace App\Http\Controllers;

use App\Models\Equipamiento;
use App\Models\PrestamoDetalle;
use App\Models\PrestamoEspecial;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PrestamoEspecialController extends Controller
{
    // ─── Listado ──────────────────────────────────────────────────────────────

    public function index(Request $request): Response
    {
        $user = auth()->user();
        abort_unless($user->esDueno() || $user->rol === 'admin_alquiler', 403);

        // Auto-marcar como "atrasado" los préstamos activos cuya fecha esperada ya pasó.
        // Esto se hace al cargar el índice para no necesitar un job programado.
        PrestamoEspecial::where('academia_id', $user->academia_id)
            ->where('estado', 'activo')
            ->where('fecha_devolucion_esperada', '<', now()->toDateString())
            ->update(['estado' => 'atrasado']);

        $prestamos = PrestamoEspecial::where('academia_id', $user->academia_id)
            // Filtro opcional por estado (activo, completado, atrasado)
            ->when($request->filled('estado'), fn($q) => $q->where('estado', $request->estado))
            // Cargar los ítems de cada préstamo para mostrar el resumen
            ->with('detalles.equipamiento:id,nombre')
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Prestamos/Index', [
            'prestamos' => $prestamos,
            'filters'   => ['estado' => $request->estado],
        ]);
    }

    // ─── Formulario de nuevo préstamo ─────────────────────────────────────────

    public function create(): Response
    {
        $user = auth()->user();
        abort_unless($user->esDueno() || $user->rol === 'admin_alquiler', 403);

        // Solo se muestran equipamientos con stock disponible > 0
        $equipamientos = Equipamiento::where('academia_id', $user->academia_id)
            ->where('stock_disponible', '>', 0)
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'tipo', 'stock_disponible']);

        return Inertia::render('Prestamos/Create', [
            'equipamientos' => $equipamientos,
            'fechaHoy'      => now()->toDateString(),
        ]);
    }

    // ─── Guardar nuevo préstamo ───────────────────────────────────────────────

    public function store(Request $request): RedirectResponse
    {
        $user = auth()->user();
        abort_unless($user->esDueno() || $user->rol === 'admin_alquiler', 403);

        $data = $request->validate([
            'solicitante_nombre'        => 'required|string|max:120',
            'solicitante_tipo'          => 'required|in:alumno,externo',
            'fecha_prestamo'            => 'required|date',
            'fecha_devolucion_esperada' => 'required|date|after_or_equal:fecha_prestamo',
            'items'                     => 'required|array|min:1',
            'items.*.equipamiento_id'   => 'required|integer',
            'items.*.cantidad'          => 'required|integer|min:1',
        ]);

        // Verificar que cada equipamiento pertenece a la academia y tiene stock suficiente
        foreach ($data['items'] as $item) {
            $eq = Equipamiento::where('academia_id', $user->academia_id)
                ->findOrFail($item['equipamiento_id']);

            if ($eq->stock_disponible < $item['cantidad']) {
                return back()->withErrors([
                    'items' => "Stock insuficiente para «{$eq->nombre}». Disponible: {$eq->stock_disponible}.",
                ]);
            }
        }

        // Crear el encabezado del préstamo
        $prestamo = PrestamoEspecial::create([
            'academia_id'               => $user->academia_id,
            'solicitante_nombre'        => $data['solicitante_nombre'],
            'solicitante_tipo'          => $data['solicitante_tipo'],
            'fecha_prestamo'            => $data['fecha_prestamo'],
            'fecha_devolucion_esperada' => $data['fecha_devolucion_esperada'],
            'estado'                    => 'activo',
        ]);

        // Crear los ítems y descontar stock disponible de cada equipamiento
        foreach ($data['items'] as $item) {
            PrestamoDetalle::create([
                'prestamo_id'      => $prestamo->id,
                'equipamiento_id'  => $item['equipamiento_id'],
                'cantidad'         => $item['cantidad'],
                'devuelto_parcial' => 0,
            ]);

            // Descontar del stock disponible (se restaurará al registrar la devolución)
            Equipamiento::where('id', $item['equipamiento_id'])
                ->decrement('stock_disponible', $item['cantidad']);
        }

        return redirect()->route('prestamos.show', $prestamo->id)
            ->with('success', 'Préstamo registrado correctamente.');
    }

    // ─── Detalle del préstamo ─────────────────────────────────────────────────

    public function show(PrestamoEspecial $prestamo): Response
    {
        $this->authorizePrestamo($prestamo);

        // Cargar ítems con info del equipamiento
        $prestamo->load('detalles.equipamiento:id,nombre,tipo,stock_disponible');

        return Inertia::render('Prestamos/Show', [
            'prestamo' => $prestamo,
        ]);
    }

    // ─── Vista de devolución ──────────────────────────────────────────────────

    public function devolucion(PrestamoEspecial $prestamo): Response
    {
        $this->authorizePrestamo($prestamo);

        // Si ya está completado no tiene sentido entrar a esta vista
        if ($prestamo->estado === 'completado') {
            return redirect()->route('prestamos.show', $prestamo->id)
                ->with('info', 'Este préstamo ya fue completado y devuelto.');
        }

        $prestamo->load('detalles.equipamiento:id,nombre,tipo');

        return Inertia::render('Prestamos/Devolucion', [
            'prestamo' => $prestamo,
        ]);
    }

    // ─── Procesar devolución parcial o total (PATCH) ──────────────────────────

    public function updateDevolucion(Request $request, PrestamoEspecial $prestamo): RedirectResponse
    {
        $this->authorizePrestamo($prestamo);

        if ($prestamo->estado === 'completado') {
            return back()->withErrors(['prestamo' => 'Este préstamo ya está completado.']);
        }

        $data = $request->validate([
            'detalles'                     => 'required|array',
            'detalles.*.id'                => 'required|integer',
            'detalles.*.devuelto_parcial'  => 'required|integer|min:0',
        ]);

        foreach ($data['detalles'] as $item) {
            // Buscar el detalle asegurándonos que pertenece a este préstamo
            $detalle = PrestamoDetalle::where('prestamo_id', $prestamo->id)
                ->findOrFail($item['id']);

            // No puede devolver más de lo que se prestó
            $nuevoDev   = min($item['devuelto_parcial'], $detalle->cantidad);
            $diferencia = $nuevoDev - $detalle->devuelto_parcial; // unidades devueltas en esta operación

            if ($diferencia > 0) {
                $detalle->update(['devuelto_parcial' => $nuevoDev]);

                // Restaurar el stock disponible por las unidades devueltas ahora
                Equipamiento::where('id', $detalle->equipamiento_id)
                    ->increment('stock_disponible', $diferencia);
            }
        }

        // Recargar para verificar si todo fue devuelto
        $prestamo->load('detalles');
        $todoDevuelto = $prestamo->detalles->every(
            fn($d) => $d->devuelto_parcial >= $d->cantidad
        );

        // Si todo fue devuelto, marcar como completado y guardar la fecha real
        if ($todoDevuelto) {
            $prestamo->update([
                'estado'               => 'completado',
                'fecha_devolucion_real' => now()->toDateString(),
            ]);
        }

        return redirect()->route('prestamos.show', $prestamo->id)
            ->with('success', 'Devolución registrada correctamente.');
    }

    // ─── Helper: verificar que el prestamo pertenece a la academia ───────────

    private function authorizePrestamo(PrestamoEspecial $prestamo): void
    {
        $user = auth()->user();
        abort_unless($user->esDueno() || $user->rol === 'admin_alquiler', 403);
        abort_if($prestamo->academia_id !== $user->academia_id, 403);
    }
}
