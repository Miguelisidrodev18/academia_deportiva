<?php

namespace App\Http\Controllers;

use App\Models\Espacio;
use App\Models\Reserva;
use App\Services\DisponibilidadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReservaController extends Controller
{
    public function __construct(private DisponibilidadService $disponibilidad) {}

    // ─── Listado ──────────────────────────────────────────────────────────────

    public function index(Request $request): Response
    {
        $user = auth()->user();
        abort_unless($user->esDueno() || $user->rol === 'admin_alquiler', 403);

        $fecha = $request->get('fecha', now()->toDateString());

        $reservas = Reserva::whereHas('espacio', fn($q) =>
                $q->where('academia_id', $user->academia_id)
            )
            ->when($request->filled('espacio_id'), fn($q) =>
                $q->where('espacio_id', $request->espacio_id)
            )
            ->when($request->filled('fecha'), fn($q) =>
                $q->where('fecha_reserva', $fecha)
            )
            ->with(['espacio:id,nombre', 'rangoHorario:id,hora_inicio,hora_fin,precio', 'alumno:id,nombre,dni'])
            ->orderBy('fecha_reserva', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        $espacios = Espacio::where('academia_id', $user->academia_id)
            ->orderBy('nombre')
            ->get(['id', 'nombre']);

        return Inertia::render('Reservas/Index', [
            'reservas' => $reservas,
            'espacios' => $espacios,
            'filters'  => ['fecha' => $fecha, 'espacio_id' => $request->espacio_id],
        ]);
    }

    // ─── Formulario de nueva reserva ─────────────────────────────────────────

    public function create(Request $request): Response
    {
        $user = auth()->user();
        abort_unless($user->esDueno() || $user->rol === 'admin_alquiler', 403);

        // Paso 1: elegir espacio y fecha → cargar rangos disponibles
        $espacios = Espacio::where('academia_id', $user->academia_id)
            ->with(['rangosHorarios' => fn($q) => $q->orderBy('dia_semana')->orderBy('hora_inicio')])
            ->orderBy('nombre')
            ->get();

        $fecha         = $request->get('fecha', now()->toDateString());
        $espacioId     = $request->get('espacio_id');
        $rangoDisponibles = collect();

        if ($espacioId) {
            $espacio = Espacio::where('academia_id', $user->academia_id)->findOrFail($espacioId);
            $rangoDisponibles = $this->disponibilidad->horariosDisponibles($espacio, $fecha);
        }

        return Inertia::render('Reservas/Create', [
            'espacios'          => $espacios,
            'rangoDisponibles'  => $rangoDisponibles,
            'fecha'             => $fecha,
            'espacioId'         => $espacioId ? (int) $espacioId : null,
        ]);
    }

    // ─── Guardar nueva reserva ────────────────────────────────────────────────

    public function store(Request $request): RedirectResponse
    {
        $user = auth()->user();
        abort_unless($user->esDueno() || $user->rol === 'admin_alquiler', 403);

        $data = $request->validate([
            'espacio_id'       => 'required|integer',
            'rango_horario_id' => 'required|integer',
            'alumno_id'        => 'nullable|integer|exists:alumnos,id',
            'fecha_reserva'    => 'required|date|after_or_equal:today',
            'tipo_cliente'     => 'required|in:alumno,externo',
            'cliente_nombre'   => 'required_if:tipo_cliente,externo|nullable|string|max:120',
            'cliente_dni'      => 'nullable|string|max:15',
            'cliente_telefono' => 'nullable|string|max:20',
            'monto_pagado'     => 'required|numeric|min:0',
        ]);

        // Verificar que el espacio pertenece a la academia
        $espacio = Espacio::where('academia_id', $user->academia_id)
            ->findOrFail($data['espacio_id']);

        // Verificar disponibilidad
        if (!$this->disponibilidad->estaDisponible($data['rango_horario_id'], $data['fecha_reserva'])) {
            return back()->withErrors(['rango_horario_id' => 'Ese horario ya está reservado para esa fecha.']);
        }

        $reserva = Reserva::create([
            'espacio_id'       => $espacio->id,
            'rango_horario_id' => $data['rango_horario_id'],
            'alumno_id'        => $data['tipo_cliente'] === 'alumno' ? ($data['alumno_id'] ?? null) : null,
            'fecha_reserva'    => $data['fecha_reserva'],
            'tipo_cliente'     => $data['tipo_cliente'],
            'cliente_nombre'   => $data['tipo_cliente'] === 'alumno' ? null : $data['cliente_nombre'],
            'cliente_dni'      => $data['cliente_dni'] ?? null,
            'cliente_telefono' => $data['cliente_telefono'] ?? null,
            'monto_pagado'     => $data['monto_pagado'],
            'estado'           => 'confirmada',
        ]);

        return redirect()->route('reservas.show', $reserva->id)
            ->with('success', 'Reserva confirmada correctamente.');
    }

    // ─── Detalle de reserva ───────────────────────────────────────────────────

    public function show(Reserva $reserva): Response
    {
        $this->authorizeReserva($reserva);

        $reserva->load([
            'rangoHorario:id,dia_semana,hora_inicio,hora_fin,precio',
            'alumno:id,nombre,dni',
            'equipamientos',
        ]);

        return Inertia::render('Reservas/Show', [
            'reserva' => $reserva,
        ]);
    }

    // ─── Vista de devolución de equipamiento ─────────────────────────────────

    public function devolucion(Reserva $reserva): Response
    {
        $this->authorizeReserva($reserva);

        $reserva->load([
            'rangoHorario:id,hora_inicio,hora_fin',
            'alumno:id,nombre,dni',
            'equipamientos',
        ]);

        return Inertia::render('Reservas/Devolucion', [
            'reserva' => $reserva,
        ]);
    }

    // ─── Procesar devolución (PATCH) ──────────────────────────────────────────

    public function updateDevolucion(Request $request, Reserva $reserva): RedirectResponse
    {
        $this->authorizeReserva($reserva);

        $data = $request->validate([
            'equipamiento'                      => 'required|array',
            'equipamiento.*.id'                 => 'required|integer',
            'equipamiento.*.cantidad_devuelta'  => 'required|integer|min:0',
        ]);

        foreach ($data['equipamiento'] as $item) {
            $reserva->equipamientos()->updateExistingPivot($item['id'], [
                'cantidad_devuelta' => $item['cantidad_devuelta'],
            ]);
        }

        // Si todo fue devuelto y la reserva estaba confirmada, marcar como finalizada
        $reserva->load('equipamientos');
        $todoDevuelto = $reserva->equipamientos->every(fn($eq) =>
            $eq->pivot->cantidad_devuelta >= $eq->pivot->cantidad_reservada
        );

        if ($todoDevuelto && $reserva->estado === 'confirmada') {
            $reserva->update(['estado' => 'finalizada']);
        }

        return redirect()->route('reservas.show', $reserva->id)
            ->with('success', 'Devolución registrada.');
    }

    // ─── Cancelar reserva ─────────────────────────────────────────────────────

    public function destroy(Reserva $reserva): RedirectResponse
    {
        $this->authorizeReserva($reserva);

        if ($reserva->estado !== 'confirmada') {
            return back()->withErrors(['reserva' => 'Solo se pueden cancelar reservas confirmadas.']);
        }

        $reserva->update(['estado' => 'cancelada']);

        return redirect()->route('reservas.index')
            ->with('success', 'Reserva cancelada.');
    }

    // ─── Helper: verificar acceso a la reserva ────────────────────────────────

    private function authorizeReserva(Reserva $reserva): void
    {
        $user = auth()->user();
        abort_unless($user->esDueno() || $user->rol === 'admin_alquiler', 403);

        // Carga espacio con academia_id si aún no está en memoria
        if (!$reserva->relationLoaded('espacio')) {
            $reserva->load('espacio:id,nombre,equipamiento_base,academia_id');
        }

        abort_if($reserva->espacio->academia_id !== $user->academia_id, 403);
    }

    // ─── API: horarios disponibles (fetch desde el form) ─────────────────────

    public function horariosDisponibles(Request $request): JsonResponse
    {
        $user = auth()->user();
        abort_unless($user->esDueno() || $user->rol === 'admin_alquiler', 403);

        $request->validate([
            'espacio_id' => 'required|integer',
            'fecha'      => 'required|date',
        ]);

        $espacio = Espacio::where('academia_id', $user->academia_id)
            ->findOrFail($request->espacio_id);

        $rangos = $this->disponibilidad->horariosDisponibles($espacio, $request->fecha);

        return response()->json($rangos);
    }
}
