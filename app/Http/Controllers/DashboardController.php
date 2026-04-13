<?php

namespace App\Http\Controllers;

use App\Models\Alumno;
use App\Models\Pago;
use App\Models\Reserva;
use App\Models\Taller;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
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

        // ── Talleres próximos (activos con inscripciones) ─────────────────────

        $talleres = Taller::whereHas('disciplina', fn($q) => $q->where('academia_id', $academiaId))
            ->with('disciplina:id,nombre')
            ->withCount(['inscripciones as inscriptos' => fn($q) => $q->where('activo', true)])
            ->orderBy('nombre')
            ->take(6)
            ->get(['id', 'nombre', 'disciplina_id', 'cupo_maximo', 'nivel']);

        // ── Pagos últimos 6 meses (para gráfico) ─────────────────────────────

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
                'alumnos_activos' => $alumnosActivos,
                'talleres_activos' => $talleresActivos,
                'reservas_hoy' => $reservasHoy,
                'deuda_total' => $deudaTotal,
            ],
            'alumnos_con_deuda'  => $alumnosConDeuda,
            'reservas_hoy'       => $reservasDelDia,
            'talleres'           => $talleres,
            'pagos_mensuales'    => $pagosMensuales,
        ]);
    }
}
