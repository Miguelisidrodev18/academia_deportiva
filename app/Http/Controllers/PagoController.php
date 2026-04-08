<?php

namespace App\Http\Controllers;

use App\Models\Alumno;
use App\Models\Inscripcion;
use App\Models\Pago;
use App\Services\CuotaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PagoController extends Controller
{
    public function __construct(private CuotaService $cuotaService) {}

    /**
     * Lista de pagos de la academia con filtros opcionales.
     * Solo el dueño y admin_caja ven todos los pagos.
     */
    public function index(Request $request): Response
    {
        $academiaId = auth()->user()->academia_id;

        $query = Pago::whereHas('inscripcion.alumno', fn($q) => $q->where('academia_id', $academiaId))
            ->with([
                'inscripcion.alumno:id,nombre,dni',
                'inscripcion.taller:id,nombre',
                'registradoPor:id,name',
            ])
            ->orderByDesc('fecha_pago');

        // Filtro opcional por alumno
        if ($request->filled('alumno_id')) {
            $query->whereHas('inscripcion', fn($q) => $q->where('alumno_id', $request->alumno_id));
        }

        // Filtro por rango de fechas
        if ($request->filled('desde')) {
            $query->where('fecha_pago', '>=', $request->desde);
        }
        if ($request->filled('hasta')) {
            $query->where('fecha_pago', '<=', $request->hasta);
        }

        $pagos = $query->get();

        // Lista de alumnos para el filtro del selector
        $alumnos = Alumno::where('academia_id', $academiaId)
            ->orderBy('nombre')
            ->get(['id', 'nombre']);

        return Inertia::render('Pagos/Index', [
            'pagos'   => $pagos,
            'alumnos' => $alumnos,
            'filtros' => $request->only(['alumno_id', 'desde', 'hasta']),
        ]);
    }

    /**
     * Formulario de registro de pago.
     * Muestra los alumnos de la academia; cuando se selecciona uno,
     * el frontend llama a /alumnos/{alumno}/deuda para obtener la deuda por inscripción.
     */
    public function create(): Response
    {
        $alumnos = Alumno::where('academia_id', auth()->user()->academia_id)
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'dni']);

        return Inertia::render('Pagos/Create', [
            'alumnos' => $alumnos,
        ]);
    }

    /**
     * Registra el pago y lo guarda en la base de datos.
     *
     * El frontend envía: inscripcion_id, monto, metodo, comprobante (opcional),
     * periodo_mes, periodo_anio.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'inscripcion_id' => 'required|integer',
            'monto'          => 'required|numeric|min:0.01',
            'metodo'         => 'required|in:efectivo,yape',
            'comprobante'    => 'nullable|string|max:500',
            'periodo_mes'    => 'required|integer|min:1|max:12',
            'periodo_anio'   => 'required|integer|min:2000|max:2100',
        ]);

        // Seguridad: verificar que la inscripción pertenece a esta academia
        $inscripcion = Inscripcion::whereHas('alumno', function ($q) {
                $q->where('academia_id', auth()->user()->academia_id);
            })
            ->where('activo', true)
            ->findOrFail($validated['inscripcion_id']);

        $pago = Pago::create([
            'inscripcion_id'           => $inscripcion->id,
            'monto'                    => $validated['monto'],
            'fecha_pago'               => now()->toDateString(),
            'metodo'                   => $validated['metodo'],
            'comprobante'              => $validated['comprobante'] ?? null,
            'registrado_por_usuario_id' => auth()->id(),
            'periodo_mes'              => $validated['periodo_mes'],
            'periodo_anio'             => $validated['periodo_anio'],
        ]);

        return redirect()->route('pagos.show', $pago->id)
            ->with('success', 'Pago registrado correctamente.');
    }

    /**
     * Detalle de un pago.
     */
    public function show(Pago $pago): Response
    {
        $this->authorizar($pago);

        $pago->load([
            'inscripcion.alumno:id,nombre,dni',
            'inscripcion.taller:id,nombre,precio_base',
            'inscripcion.taller.disciplina:id,nombre',
            'registradoPor:id,name',
        ]);

        return Inertia::render('Pagos/Show', [
            'pago' => $pago,
        ]);
    }

    /**
     * API: devuelve la deuda actual del alumno desglosada por inscripción.
     * El frontend llama a este endpoint vía Inertia después de seleccionar un alumno.
     *
     * Retorna JSON con las inscripciones activas y la deuda calculada con descuentos.
     */
    public function deuda(Alumno $alumno): \Illuminate\Http\JsonResponse
    {
        // Seguridad: el alumno debe pertenecer a esta academia
        abort_if($alumno->academia_id !== auth()->user()->academia_id, 403);

        $inscripciones = $alumno->inscripcionesActivas()
            ->with(['taller.disciplina', 'pagos'])
            ->get();

        // Para calcular el precio_final con descuentos necesitamos el precioMaximo
        $precioMaximo = $inscripciones->max(fn($i) => (float) $i->taller->precio_base) ?? 0;
        $totalActivos = $inscripciones->count();

        // Contar hermanos para el descuento
        $totalHermanos = $this->cuotaService->calcularDescuento(
            alumno: $alumno,
            taller: $inscripciones->first()?->taller ?? new \App\Models\Taller(),
        )['descuento_tipo'] === 'hermanos'
            ? null  // ya calculado internamente
            : null;

        $data = $inscripciones->map(function ($inscripcion) use ($alumno, $totalActivos, $precioMaximo) {
            $descuento  = $this->cuotaService->calcular(
                precioBase:        (float) $inscripcion->taller->precio_base,
                totalActivos:      $totalActivos,
                precioMaximoActivo: $precioMaximo,
                totalHermanos:     null, // se calcula dentro de calcularDescuento
            );

            // Usar calcularDescuento real para incluir hermanos
            $descuentoReal = $this->cuotaService->calcularDescuento($alumno, $inscripcion->taller);

            $deuda = $inscripcion->deudaActual($descuentoReal['precio_final']);

            return [
                'inscripcion_id'  => $inscripcion->id,
                'taller_nombre'   => $inscripcion->taller->nombre,
                'disciplina'      => $inscripcion->taller->disciplina->nombre,
                'precio_base'     => $descuentoReal['precio_base'],
                'descuento_tipo'  => $descuentoReal['descuento_tipo'],
                'descuento_pct'   => $descuentoReal['descuento_pct'],
                'precio_final'    => $descuentoReal['precio_final'],
                'deuda'           => $deuda,
                'fecha_alta'      => $inscripcion->fecha_alta->toDateString(),
                'mes_sugerido'    => now()->month,
                'anio_sugerido'   => now()->year,
            ];
        });

        return response()->json([
            'alumno'        => ['id' => $alumno->id, 'nombre' => $alumno->nombre],
            'inscripciones' => $data,
            'deuda_total'   => round($data->sum('deuda'), 2),
        ]);
    }

    /**
     * Verifica que el pago pertenezca a esta academia (vía la inscripción del alumno).
     */
    private function authorizar(Pago $pago): void
    {
        $pago->loadMissing('inscripcion.alumno');
        abort_if(
            $pago->inscripcion->alumno->academia_id !== auth()->user()->academia_id,
            403,
            'No tenés permiso para ver este pago.'
        );
    }
}
