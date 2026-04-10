<?php

namespace Tests\Unit;

use App\Models\Taller;
use Carbon\Carbon;
use PHPUnit\Framework\TestCase;

/**
 * Tests unitarios del método Taller::estaEnHorario().
 *
 * Usamos Carbon::setTestNow() para simular el tiempo sin tocar la DB.
 * Creamos instancias de Taller con `new Taller()` y asignamos atributos directamente
 * (sin guardar en BD, por eso estos son tests unitarios rápidos).
 */
class TallerHorarioTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
    }

    protected function tearDown(): void
    {
        // Limpiar el tiempo simulado después de cada test
        Carbon::setTestNow(null);
        parent::tearDown();
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    /**
     * Crea un taller sin persistir en BD.
     * Necesitamos usar fill() para simular los atributos del modelo.
     */
    private function makeTaller(string $diaSemana, string $horaInicio, string $horaFin): Taller
    {
        $taller = new Taller();
        // dias_semana ahora es un array JSON (admite múltiples días)
        $taller->forceFill([
            'dias_semana' => [$diaSemana],
            'hora_inicio' => $horaInicio,
            'hora_fin'    => $horaFin,
        ]);
        return $taller;
    }

    // ─── Tests dentro del horario ─────────────────────────────────────────────

    /** Escaneo exactamente al inicio del taller → válido. */
    public function test_en_horario_exactamente_al_inicio(): void
    {
        // Simulamos que hoy es lunes a las 09:00
        Carbon::setTestNow(Carbon::parse('2025-01-06 09:00:00')); // lunes

        $taller = $this->makeTaller('lunes', '09:00', '10:00');

        $this->assertTrue($taller->estaEnHorario(15));
    }

    /** Escaneo 10 minutos antes del inicio (dentro del margen de 15 min) → válido. */
    public function test_en_horario_10_minutos_antes(): void
    {
        Carbon::setTestNow(Carbon::parse('2025-01-06 08:50:00')); // lunes

        $taller = $this->makeTaller('lunes', '09:00', '10:00');

        $this->assertTrue($taller->estaEnHorario(15));
    }

    /** Escaneo 10 minutos después del fin (dentro del margen de 15 min) → válido. */
    public function test_en_horario_10_minutos_despues_del_fin(): void
    {
        Carbon::setTestNow(Carbon::parse('2025-01-06 10:10:00')); // lunes

        $taller = $this->makeTaller('lunes', '09:00', '10:00');

        $this->assertTrue($taller->estaEnHorario(15));
    }

    // ─── Tests fuera del horario ──────────────────────────────────────────────

    /** Escaneo 20 minutos antes del inicio (fuera del margen de 15 min) → inválido. */
    public function test_fuera_horario_20_minutos_antes(): void
    {
        Carbon::setTestNow(Carbon::parse('2025-01-06 08:39:00')); // lunes

        $taller = $this->makeTaller('lunes', '09:00', '10:00');

        $this->assertFalse($taller->estaEnHorario(15));
    }

    /** Escaneo 20 minutos después del fin → inválido. */
    public function test_fuera_horario_20_minutos_despues(): void
    {
        Carbon::setTestNow(Carbon::parse('2025-01-06 10:21:00')); // lunes

        $taller = $this->makeTaller('lunes', '09:00', '10:00');

        $this->assertFalse($taller->estaEnHorario(15));
    }

    /** Taller de martes, escaneado un lunes → inválido. */
    public function test_fuera_horario_dia_equivocado(): void
    {
        Carbon::setTestNow(Carbon::parse('2025-01-06 09:30:00')); // lunes

        $taller = $this->makeTaller('martes', '09:00', '10:00');

        $this->assertFalse($taller->estaEnHorario(15));
    }

    /** Taller de miércoles, escaneado un miércoles → válido. */
    public function test_dia_miercoles_correcto(): void
    {
        Carbon::setTestNow(Carbon::parse('2025-01-08 14:00:00')); // miércoles

        $taller = $this->makeTaller('miercoles', '13:45', '15:00');

        $this->assertTrue($taller->estaEnHorario(15));
    }

    /** Taller de sábado, escaneado un sábado en horario → válido. */
    public function test_sabado_en_horario(): void
    {
        Carbon::setTestNow(Carbon::parse('2025-01-11 10:00:00')); // sábado

        $taller = $this->makeTaller('sabado', '09:30', '11:00');

        $this->assertTrue($taller->estaEnHorario(15));
    }
}
