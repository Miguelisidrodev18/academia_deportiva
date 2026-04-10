<?php

namespace Tests\Unit;

use App\Models\Espacio;
use App\Models\Reserva;
use App\Models\RangoHorario;
use App\Services\DisponibilidadService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Sesión 7 – Tests del módulo de alquiler de espacios.
 *
 * Casos:
 * 1. DisponibilidadService retorna solo los rangos del día correcto.
 * 2. Un rango ya reservado aparece como NO disponible.
 * 3. Un rango con reserva cancelada vuelve a aparecer como disponible.
 * 4. estaDisponible() retorna false cuando hay reserva confirmada.
 * 5. estaDisponible() retorna true cuando la reserva está cancelada.
 * 6. Reserva con alumno_id null no rompe la relación alumno().
 */
class ReservaTest extends TestCase
{
    use RefreshDatabase;

    private DisponibilidadService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new DisponibilidadService();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Crea un espacio con una academia ficticia (sin pasar por SetTenant).
     */
    private function crearEspacio(): Espacio
    {
        // Crear academia y espacio directamente en la BD
        $academia = \App\Models\Academia::create([
            'nombre'   => 'Academia Test',
            'slug'     => 'academia-test-' . uniqid(),
            'plan'     => 'basico',
        ]);

        return Espacio::create([
            'academia_id'      => $academia->id,
            'nombre'           => 'Cancha Test',
            'descripcion'      => null,
            'equipamiento_base' => [],
        ]);
    }

    private function crearRango(Espacio $espacio, int $diaSemana = 1, string $inicio = '09:00', string $fin = '10:00'): RangoHorario
    {
        return $espacio->rangosHorarios()->create([
            'dia_semana'  => $diaSemana,
            'hora_inicio' => $inicio,
            'hora_fin'    => $fin,
            'precio'      => 1000,
            'disponible'  => true,
        ]);
    }

    private function crearReserva(Espacio $espacio, RangoHorario $rango, string $fecha, string $estado = 'confirmada'): Reserva
    {
        return Reserva::create([
            'espacio_id'       => $espacio->id,
            'rango_horario_id' => $rango->id,
            'alumno_id'        => null,
            'fecha_reserva'    => $fecha,
            'tipo_cliente'     => 'externo',
            'cliente_nombre'   => 'Cliente Test',
            'monto_pagado'     => 1000,
            'estado'           => $estado,
        ]);
    }

    // ── Tests ─────────────────────────────────────────────────────────────────

    /**
     * 1. horariosDisponibles() solo retorna rangos del día de la semana correcto.
     *    Lunes = 1 (PHP date('N')), creamos rango para Lunes y Martes,
     *    pedimos los del lunes → solo debe volver 1.
     */
    public function test_horarios_disponibles_filtra_por_dia(): void
    {
        $espacio = $this->crearEspacio();
        $this->crearRango($espacio, 1, '09:00', '10:00'); // Lunes
        $this->crearRango($espacio, 2, '09:00', '10:00'); // Martes

        // Buscar próximo lunes
        $fecha = $this->proximoDia(1); // 1 = lunes

        $resultado = $this->service->horariosDisponibles($espacio, $fecha);

        $this->assertCount(1, $resultado);
        $this->assertEquals(1, $resultado->first()->dia_semana);
    }

    /**
     * 2. Un rango con reserva confirmada aparece como no disponible
     *    (el estado 'confirmada' está en la lista que bloquea el slot).
     */
    public function test_rango_con_reserva_confirmada_no_disponible(): void
    {
        $espacio = $this->crearEspacio();
        $fecha   = $this->proximoDia(1);
        $rango   = $this->crearRango($espacio, 1);
        $reserva = $this->crearReserva($espacio, $rango, $fecha, 'confirmada');

        // Verificar que la reserva fue persistida con TODOS los valores correctos
        $this->assertNotNull($reserva->id);
        $this->assertDatabaseHas('reservas', [
            'id'               => $reserva->id,
            'espacio_id'       => $espacio->id,
            'rango_horario_id' => $rango->id,
            'estado'           => 'confirmada',
        ]);

        $resultado = $this->service->horariosDisponibles($espacio, $fecha);

        $this->assertCount(1, $resultado);
        $this->assertFalse($resultado->first()->disponible);
    }

    /**
     * 3. Un rango con reserva cancelada vuelve a aparecer como disponible.
     */
    public function test_rango_con_reserva_cancelada_esta_disponible(): void
    {
        $espacio = $this->crearEspacio();
        $fecha   = $this->proximoDia(1);
        $rango   = $this->crearRango($espacio, 1);
        $this->crearReserva($espacio, $rango, $fecha, 'cancelada');

        $resultado = $this->service->horariosDisponibles($espacio, $fecha);

        $this->assertCount(1, $resultado);
        $this->assertTrue($resultado->first()->disponible);
    }

    /**
     * 4. estaDisponible() retorna false cuando hay reserva confirmada.
     */
    public function test_esta_disponible_false_cuando_reserva_confirmada(): void
    {
        $espacio = $this->crearEspacio();
        $fecha   = now()->addDays(1)->toDateString();
        $rango   = $this->crearRango($espacio, (int) date('N', strtotime($fecha)));
        $this->crearReserva($espacio, $rango, $fecha, 'confirmada');

        $this->assertFalse($this->service->estaDisponible($rango->id, $fecha));
    }

    /**
     * 5. estaDisponible() retorna true cuando la reserva está cancelada.
     */
    public function test_esta_disponible_true_cuando_reserva_cancelada(): void
    {
        $espacio = $this->crearEspacio();
        $fecha   = now()->addDays(1)->toDateString();
        $rango   = $this->crearRango($espacio, (int) date('N', strtotime($fecha)));
        $this->crearReserva($espacio, $rango, $fecha, 'cancelada');

        $this->assertTrue($this->service->estaDisponible($rango->id, $fecha));
    }

    /**
     * 6. Reserva con alumno_id null no lanza excepción al acceder a la relación.
     */
    public function test_reserva_sin_alumno_no_rompe_relacion(): void
    {
        $espacio = $this->crearEspacio();
        $rango   = $this->crearRango($espacio, 1);
        $reserva = $this->crearReserva($espacio, $rango, $this->proximoDia(1), 'confirmada');

        $this->assertNull($reserva->alumno);
        $this->assertNull($reserva->alumno_id);
    }

    // ── Helper de fechas ──────────────────────────────────────────────────────

    /**
     * Retorna la fecha del próximo día de la semana indicado (1=Lunes … 7=Domingo).
     * Si hoy es ese día, devuelve la fecha de la próxima ocurrencia (en 7 días).
     */
    private function proximoDia(int $diaSemana): string
    {
        $hoy = now();
        $dif = ($diaSemana - (int) $hoy->format('N') + 7) % 7;
        if ($dif === 0) $dif = 7; // evitar "hoy" para no depender del horario
        return $hoy->addDays($dif)->toDateString();
    }
}
