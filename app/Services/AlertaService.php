<?php

namespace App\Services;

use App\Models\Alumno;
use App\Models\Equipamiento;
use App\Models\Inscripcion;
use App\Models\Producto;
use Illuminate\Database\Eloquent\Collection;

/**
 * AlertaService — Detecta situaciones que requieren atención del dueño.
 *
 * Todos los métodos reciben el academia_id para respetar la multitenencia.
 * Se usa en el DashboardController para poblar las alertas del panel.
 */
class AlertaService
{
    /**
     * Alumnos con 3 o más faltas sin justificar en los últimos 30 días.
     * Retorna una colección con [alumno, taller, faltas_count].
     */
    public function alumnosConFaltas(int $academiaId): Collection
    {
        // Buscamos inscripciones activas con 3+ faltas en los últimos 30 días
        return Inscripcion::query()
            ->whereHas('alumno', fn($q) => $q->where('academia_id', $academiaId))
            ->where('activo', true)
            ->withCount(['asistencias as faltas_count' => function ($q) {
                $q->where('estado', 'falta')
                  ->where('fecha', '>=', now()->subDays(30)->toDateString());
            }])
            ->with([
                'alumno:id,nombre,dni',
                'taller:id,nombre',
            ])
            ->having('faltas_count', '>=', 3)
            ->orderByDesc('faltas_count')
            ->get();
    }

    /**
     * Inscripciones con deuda de más de 2 cuotas atrasadas.
     * Se usa para alertar al admin sobre alumnos con deuda excesiva.
     */
    public function alumnosConDeudaExcesiva(int $academiaId): Collection
    {
        return Inscripcion::query()
            ->whereHas('alumno', fn($q) => $q->where('academia_id', $academiaId))
            ->where('activo', true)
            ->with(['alumno:id,nombre', 'taller:id,nombre,precio_base', 'pagos'])
            ->get()
            ->filter(fn($i) => $i->tieneDeudasExcesivas());
    }

    /**
     * Equipamiento no devuelto: préstamos atrasados o sin fecha de devolución real.
     */
    public function equipamientoNoDevuelto(int $academiaId): Collection
    {
        return \App\Models\PrestamoEspecial::where('academia_id', $academiaId)
            ->where('estado', 'activo')
            ->where('fecha_devolucion_esperada', '<', now()->toDateString())
            ->whereNull('fecha_devolucion_real')
            ->with(['prestamo_detalles.equipamiento'])
            ->orderBy('fecha_devolucion_esperada')
            ->get();
    }

    /**
     * Productos con stock por debajo del umbral (default: 5 unidades).
     */
    public function productosStockBajo(int $academiaId, int $umbral = 5): Collection
    {
        return Producto::where('academia_id', $academiaId)
            ->where('stock', '<', $umbral)
            ->orderBy('stock')
            ->get(['id', 'nombre', 'stock']);
    }
}
