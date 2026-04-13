<?php

namespace App\Http\Controllers;

use App\Models\Alumno;
use App\Models\Pago;
use App\Models\Reserva;
use App\Models\Taller;
use App\Models\VentaProducto;
use App\Services\AlertaService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    // Inyectamos AlertaService por constructor (Laravel lo resuelve automáticamente)
    public function __construct(private AlertaService $alerta) {}

    public function index(): Response
    {
        $user = auth()->user();
        $academiaId = $user->academia_id;
        $hoy = now()->toDateString();

        // ── KPIs ─────────────────────────────────────────────────────────────

        $alumnosActivos = Alumno::where('academia_id', $academiaId)
            ->whereHas('inscripcionesActivas')
            ->count();

        $talleresActivos = Taller::whereHas('disciplina', fn($q) => $q->where('academia_id', $academiaId))
            ->count();

        $reservasHoy = Reserva::whereHas('espacio', fn($q) => $q->where('academia_id', $academiaId))
            ->whereDate('fecha_reserva', $hoy)
            ->whereIn('estado', ['confirmada'])
            ->count();

        // Deuda total: suma de deuda de todos los alumnos con inscripciones activas
        $deudaTotal = Alumno::where('academia_id', $academiaId)
            ->whereHas('inscripcionesActivas')
            ->with(['inscripciones' => fn($q) => $q->where('activo', true)->with(['taller', 'pagos'])])
            ->get()
            ->sum(fn($alumno) => $alumno->deudaTotal());

        // Ventas del mes actual (suma de venta_productos)
        $ventasMes = VentaProducto::whereHas('producto', fn($q) =>
                $q->where('academia_id', $academiaId)
            )
            ->whereYear('fecha', now()->year)
            ->whereMonth('fecha', now()->month)
            ->sum('total');

        // ── Alertas (AlertaService) ───────────────────────────────────────────

        $alertas = [];

        // Préstamos con devolución atrasada
        $prestamosAtrasados = $this->alerta->prestamosAtrasados($academiaId);
        if ($prestamosAtrasados->count() > 0) {
            $count = $prestamosAtrasados->count();
            $alertas[] = [
                'tipo'    => 'warning',
                'mensaje' => $count === 1
                    ? '1 préstamo tiene la devolución atrasada.'
                    : "{$count} préstamos tienen la devolución atrasada.",
                'href'    => '/prestamos?estado=atrasado',
                'label'   => 'Ver préstamos',
            ];
        }

        // Productos sin stock o con stock bajo
        $stockBajo = $this->alerta->productosStockBajo($academiaId);
        $sinStock  = $stockBajo->where('stock', 0);
        $bajo      = $stockBajo->where('stock', '>', 0);

        if ($sinStock->count() > 0) {
            $alertas[] = [
                'tipo'    => 'danger',
                'mensaje' => 'Sin stock: ' . $sinStock->pluck('nombre')->join(', ') . '.',
                'href'    => '/productos',
                'label'   => 'Ver productos',
            ];
        }
        if ($bajo->count() > 0) {
            $alertas[] = [
                'tipo'    => 'warning',
                'mensaje' => 'Stock bajo: ' . $bajo->pluck('nombre')->join(', ') . '.',
                'href'    => '/productos',
                'label'   => 'Ver productos',
            ];
        }

        // Alumnos con 3+ faltas injustificadas en los últimos 30 días
        $conFaltas = $this->alerta->alumnosConFaltas($academiaId);
        if ($conFaltas->count() > 0) {
            $count = $conFaltas->count();
            $alertas[] = [
                'tipo'    => 'warning',
                'mensaje' => $count === 1
                    ? '1 alumno tiene 3 o más faltas injustificadas en los últimos 30 días.'
                    : "{$count} alumnos tienen 3 o más faltas injustificadas en los últimos 30 días.",
                'href'    => '/asistencias',
                'label'   => 'Ver asistencias',
            ];
        }

        // ── Alumnos con deuda ─────────────────────────────────────────────────

        $alumnosConDeuda = Alumno::where('academia_id', $academiaId)
            ->whereHas('inscripcionesActivas')
            ->with(['inscripciones' => fn($q) => $q->where('activo', true)->with(['taller', 'pagos'])])
            ->orderBy('nombre')
            ->get()
            ->map(fn($a) => ['id' => $a->id, 'nombre' => $a->nombre, 'deuda' => $a->deudaTotal()])
            ->filter(fn($a) => $a['deuda'] > 0)
            ->sortByDesc('deuda')
            ->values()
            ->take(5);

        // ── Reservas del día ──────────────────────────────────────────────────

        $reservasDelDia = Reserva::whereHas('espacio', fn($q) => $q->where('academia_id', $academiaId))
            ->whereDate('fecha_reserva', $hoy)
            ->with([
                'espacio:id,nombre',
                'rangoHorario:id,hora_inicio,hora_fin',
                'alumno:id,nombre',
            ])
            ->get()
            ->sortBy('rangoHorario.hora_inicio')
            ->values();

        // ── Talleres activos (con ocupación) ──────────────────────────────────

        $talleres = Taller::whereHas('disciplina', fn($q) => $q->where('academia_id', $academiaId))
            ->with('disciplina:id,nombre')
            ->withCount(['inscripciones as inscriptos' => fn($q) => $q->where('activo', true)])
            ->orderBy('nombre')
            ->take(6)
            ->get(['id', 'nombre', 'disciplina_id', 'cupo_maximo', 'nivel']);

        // ── Top productos más vendidos este mes ───────────────────────────────

        $topProductos = VentaProducto::whereHas('producto', fn($q) =>
                $q->where('academia_id', $academiaId)
            )
            ->whereYear('fecha', now()->year)
            ->whereMonth('fecha', now()->month)
            ->selectRaw('producto_id, SUM(cantidad) as total_cantidad, SUM(total) as total_monto')
            ->groupBy('producto_id')
            ->with('producto:id,nombre')
            ->orderByDesc('total_cantidad')
            ->take(5)
            ->get()
            ->map(fn($v) => [
                'nombre'         => $v->producto->nombre,
                'total_cantidad' => (int) $v->total_cantidad,
                'total_monto'    => (float) $v->total_monto,
            ]);

        // ── Pagos últimos 6 meses (para gráfico de cuotas) ───────────────────

        $pagosMensuales = collect(range(5, 0))->map(function ($mesesAtras) use ($academiaId) {
            $fecha = now()->subMonths($mesesAtras);
            $total = Pago::whereHas('inscripcion.alumno', fn($q) =>
                    $q->where('academia_id', $academiaId)
                )
                ->whereYear('fecha_pago', $fecha->year)
                ->whereMonth('fecha_pago', $fecha->month)
                ->sum('monto');

            return [
                'mes'   => $fecha->translatedFormat('M'),
                'total' => (float) $total,
            ];
        });

        return Inertia::render('Dashboard', [
            'kpis' => [
                'alumnos_activos'  => $alumnosActivos,
                'talleres_activos' => $talleresActivos,
                'reservas_hoy'     => $reservasHoy,
                'deuda_total'      => $deudaTotal,
                'ventas_mes'       => (float) $ventasMes,
            ],
            'alertas'            => $alertas,
            'alumnos_con_deuda'  => $alumnosConDeuda,
            'reservas_hoy'       => $reservasDelDia,
            'talleres'           => $talleres,
            'top_productos'      => $topProductos,
            'pagos_mensuales'    => $pagosMensuales,
        ]);
    }
}
