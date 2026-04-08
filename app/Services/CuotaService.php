<?php

namespace App\Services;

use App\Models\Alumno;
use App\Models\Taller;

/**
 * CuotaService — Lógica de descuentos por cuota.
 *
 * Dos tipos de descuento (no acumulables, se aplica el mayor):
 *
 * MULTI-TALLER:
 *   - 2 talleres activos → 10% sobre el taller de menor precio.
 *   - 3+ talleres activos → 15% sobre todos excepto el de mayor precio.
 *
 * HERMANOS (alumnos del mismo apellido_familiar en la academia):
 *   - 2 hermanos → 10% cada uno
 *   - 3 hermanos → 15% cada uno
 *   - 4+ hermanos → 20% cada uno
 */
class CuotaService
{
    // ─── Método principal (usa Eloquent / DB) ─────────────────────────────────

    /**
     * Calcula el descuento para un alumno en un taller específico.
     * Consulta la base de datos para obtener inscripciones activas y hermanos.
     *
     * @param  Alumno   $alumno          El alumno a calcular.
     * @param  Taller   $taller          El taller cuya cuota se está calculando.
     * @param  int|null $totalHermanos   Si se pasa, no consulta DB (útil en tests de integración).
     * @return array{precio_base: float, descuento_tipo: string, descuento_pct: float, precio_final: float}
     */
    public function calcularDescuento(Alumno $alumno, Taller $taller, ?int $totalHermanos = null): array
    {
        // ── 1. Inscripciones activas del alumno (incluye el taller actual) ──
        $inscripcionesActivas = $alumno->inscripcionesActivas()
            ->with('taller:id,precio_base')
            ->get();

        $totalActivos = $inscripcionesActivas->count();

        // El precio máximo entre todos los talleres activos del alumno
        $precioMaximoActivo = $inscripcionesActivas
            ->max(fn($i) => (float) $i->taller->precio_base) ?? (float) $taller->precio_base;

        // ── 2. Hermanos: contar alumnos de la misma academia con el mismo apellido_familiar ──
        if ($totalHermanos === null) {
            $totalHermanos = $this->contarHermanos($alumno);
        }

        // ── 3. Delegar al cálculo puro ──
        return $this->calcular(
            precioBase:        (float) $taller->precio_base,
            totalActivos:      $totalActivos,
            precioMaximoActivo: $precioMaximoActivo,
            totalHermanos:     $totalHermanos > 0 ? $totalHermanos : null,
        );
    }

    // ─── Método puro: testeable sin base de datos ─────────────────────────────

    /**
     * Núcleo del cálculo de descuentos. No toca la base de datos.
     * Recibe valores primitivos para ser fácilmente testeable con PHPUnit.
     *
     * @param  float    $precioBase         Precio base del taller que se está calculando.
     * @param  int      $totalActivos       Total de inscripciones activas del alumno (incluye este taller).
     * @param  float    $precioMaximoActivo Precio máximo entre todas las inscripciones activas.
     * @param  int|null $totalHermanos      Cantidad de hermanos activos en la academia (null = sin hermanos).
     * @return array{precio_base: float, descuento_tipo: string, descuento_pct: float, precio_final: float}
     */
    public function calcular(
        float $precioBase,
        int $totalActivos,
        float $precioMaximoActivo,
        ?int $totalHermanos,
    ): array {
        // ── Calcular descuento multi-taller ──────────────────────────────────
        $pctMultiTaller = $this->descuentoMultiTaller($precioBase, $totalActivos, $precioMaximoActivo);

        // ── Calcular descuento por hermanos ───────────────────────────────────
        $pctHermanos = $this->descuentoHermanos($totalHermanos);

        // ── Aplicar el mayor (no acumulable). En empate → hermanos tiene prioridad ──
        if ($pctHermanos >= $pctMultiTaller) {
            $pct  = $pctHermanos;
            $tipo = $pctHermanos > 0 ? 'hermanos' : 'ninguno';
        } else {
            $pct  = $pctMultiTaller;
            $tipo = 'multi_taller';
        }

        $precioFinal = round($precioBase * (1 - $pct / 100), 2);

        return [
            'precio_base'    => $precioBase,
            'descuento_tipo' => $tipo,
            'descuento_pct'  => $pct,
            'precio_final'   => $precioFinal,
        ];
    }

    // ─── Helpers privados ─────────────────────────────────────────────────────

    /**
     * Determina el porcentaje de descuento multi-taller para ESTE taller.
     *
     * - 2 activos: 10% solo si este taller NO es el más caro.
     *   (El más caro conserva precio base; el más barato recibe el descuento.)
     * - 3+ activos: 15% solo si este taller NO es el más caro.
     */
    private function descuentoMultiTaller(float $precioBase, int $totalActivos, float $precioMaximoActivo): float
    {
        if ($totalActivos === 2) {
            // Este taller recibe descuento si su precio es MENOR que el máximo
            // (es decir, no es el taller más caro del par)
            return $precioBase < $precioMaximoActivo ? 10.0 : 0.0;
        }

        if ($totalActivos >= 3) {
            // Este taller recibe descuento si su precio es MENOR que el máximo
            return $precioBase < $precioMaximoActivo ? 15.0 : 0.0;
        }

        return 0.0; // 0 o 1 taller activo → sin descuento
    }

    /**
     * Determina el porcentaje de descuento por hermanos.
     * $totalHermanos = total de hermanos INCLUYENDO al alumno actual.
     */
    private function descuentoHermanos(?int $totalHermanos): float
    {
        return match (true) {
            $totalHermanos === null || $totalHermanos < 2 => 0.0,
            $totalHermanos === 2                          => 10.0,
            $totalHermanos === 3                          => 15.0,
            default                                       => 20.0, // 4+
        };
    }

    /**
     * Cuenta cuántos alumnos activos (con inscripciones activas) tienen el mismo
     * apellido_familiar en la misma academia. Retorna el total del grupo familiar.
     * Si el alumno no tiene apellido_familiar, retorna 0.
     */
    private function contarHermanos(Alumno $alumno): int
    {
        if (empty($alumno->apellido_familiar)) {
            return 0;
        }

        return Alumno::where('academia_id', $alumno->academia_id)
            ->where('apellido_familiar', $alumno->apellido_familiar)
            ->whereHas('inscripcionesActivas') // solo cuentan los que tienen inscripciones activas
            ->count();
    }
}
