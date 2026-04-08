<?php

namespace Tests\Unit;

use App\Services\CuotaService;
use PHPUnit\Framework\TestCase;

/**
 * Tests del núcleo de cálculo de descuentos.
 *
 * Usamos el método puro CuotaService::calcular() que acepta valores primitivos
 * (no Eloquent), por lo que estos tests corren sin base de datos.
 *
 * Reglas de negocio:
 *  - Multi-taller (2 talleres): 10% sobre el taller de MENOR precio.
 *  - Multi-taller (3+ talleres): 15% sobre todos excepto el de MAYOR precio.
 *  - Hermanos: 2 → 10%, 3 → 15%, 4+ → 20%.
 *  - No acumulable: se aplica el MAYOR entre ambos descuentos.
 */
class CuotaServiceTest extends TestCase
{
    private CuotaService $servicio;

    protected function setUp(): void
    {
        parent::setUp();
        $this->servicio = new CuotaService();
    }

    // ─── Sin descuento ────────────────────────────────────────────────────────

    /** Alumno con un solo taller y sin hermanos → sin descuento. */
    public function test_sin_descuento_unico_taller_sin_hermanos(): void
    {
        $resultado = $this->servicio->calcular(
            precioBase: 1000.0,
            totalActivos: 1,
            precioMaximoActivo: 1000.0,
            totalHermanos: null,
        );

        $this->assertEquals(1000.0,  $resultado['precio_base']);
        $this->assertEquals(0.0,     $resultado['descuento_pct']);
        $this->assertEquals('ninguno', $resultado['descuento_tipo']);
        $this->assertEquals(1000.0,  $resultado['precio_final']);
    }

    // ─── Descuento multi-taller ───────────────────────────────────────────────

    /**
     * 2 talleres activos. Este taller es el MÁS BARATO (800 < 1200).
     * → Aplica 10% sobre este taller.
     */
    public function test_multitaller_2_este_es_el_mas_barato(): void
    {
        $resultado = $this->servicio->calcular(
            precioBase: 800.0,
            totalActivos: 2,
            precioMaximoActivo: 1200.0,
            totalHermanos: null,
        );

        $this->assertEquals(10.0,          $resultado['descuento_pct']);
        $this->assertEquals('multi_taller', $resultado['descuento_tipo']);
        $this->assertEquals(720.0,         $resultado['precio_final']);
    }

    /**
     * 2 talleres activos. Este taller es el MÁS CARO (1200 == precioMaximo).
     * → No aplica descuento (el descuento va al más barato).
     */
    public function test_multitaller_2_este_es_el_mas_caro(): void
    {
        $resultado = $this->servicio->calcular(
            precioBase: 1200.0,
            totalActivos: 2,
            precioMaximoActivo: 1200.0,
            totalHermanos: null,
        );

        $this->assertEquals(0.0,      $resultado['descuento_pct']);
        $this->assertEquals('ninguno', $resultado['descuento_tipo']);
        $this->assertEquals(1200.0,   $resultado['precio_final']);
    }

    /**
     * 3 talleres activos. Este taller NO es el más caro (800 < 1500).
     * → Aplica 15% como "taller adicional".
     */
    public function test_multitaller_3_este_es_adicional(): void
    {
        $resultado = $this->servicio->calcular(
            precioBase: 800.0,
            totalActivos: 3,
            precioMaximoActivo: 1500.0,
            totalHermanos: null,
        );

        $this->assertEquals(15.0,          $resultado['descuento_pct']);
        $this->assertEquals('multi_taller', $resultado['descuento_tipo']);
        $this->assertEquals(680.0,         $resultado['precio_final']);
    }

    /**
     * 3 talleres activos. Este taller ES el más caro (1500 == precioMaximo).
     * → No aplica descuento.
     */
    public function test_multitaller_3_este_es_el_mas_caro(): void
    {
        $resultado = $this->servicio->calcular(
            precioBase: 1500.0,
            totalActivos: 3,
            precioMaximoActivo: 1500.0,
            totalHermanos: null,
        );

        $this->assertEquals(0.0,      $resultado['descuento_pct']);
        $this->assertEquals('ninguno', $resultado['descuento_tipo']);
        $this->assertEquals(1500.0,   $resultado['precio_final']);
    }

    // ─── Descuento por hermanos ───────────────────────────────────────────────

    /** 2 hermanos inscriptos → 10% de descuento. */
    public function test_hermanos_2_descuento_10(): void
    {
        $resultado = $this->servicio->calcular(
            precioBase: 1000.0,
            totalActivos: 1,
            precioMaximoActivo: 1000.0,
            totalHermanos: 2,
        );

        $this->assertEquals(10.0,      $resultado['descuento_pct']);
        $this->assertEquals('hermanos', $resultado['descuento_tipo']);
        $this->assertEquals(900.0,     $resultado['precio_final']);
    }

    /** 3 hermanos inscriptos → 15% de descuento. */
    public function test_hermanos_3_descuento_15(): void
    {
        $resultado = $this->servicio->calcular(
            precioBase: 1000.0,
            totalActivos: 1,
            precioMaximoActivo: 1000.0,
            totalHermanos: 3,
        );

        $this->assertEquals(15.0,      $resultado['descuento_pct']);
        $this->assertEquals('hermanos', $resultado['descuento_tipo']);
        $this->assertEquals(850.0,     $resultado['precio_final']);
    }

    /** 4 hermanos inscriptos → 20% de descuento. */
    public function test_hermanos_4_descuento_20(): void
    {
        $resultado = $this->servicio->calcular(
            precioBase: 1000.0,
            totalActivos: 1,
            precioMaximoActivo: 1000.0,
            totalHermanos: 4,
        );

        $this->assertEquals(20.0,      $resultado['descuento_pct']);
        $this->assertEquals('hermanos', $resultado['descuento_tipo']);
        $this->assertEquals(800.0,     $resultado['precio_final']);
    }

    /** 5 hermanos también aplica 20% (el máximo). */
    public function test_hermanos_5_descuento_20(): void
    {
        $resultado = $this->servicio->calcular(
            precioBase: 500.0,
            totalActivos: 1,
            precioMaximoActivo: 500.0,
            totalHermanos: 5,
        );

        $this->assertEquals(20.0,  $resultado['descuento_pct']);
        $this->assertEquals(400.0, $resultado['precio_final']);
    }

    // ─── No acumulable: se aplica el mayor ───────────────────────────────────

    /**
     * Multi-taller: 10%. Hermanos: 15%.
     * → Gana hermanos (15%).
     */
    public function test_no_acumulable_hermanos_gana_a_multitaller(): void
    {
        $resultado = $this->servicio->calcular(
            precioBase: 800.0,
            totalActivos: 2,
            precioMaximoActivo: 1200.0,
            totalHermanos: 3, // hermanos → 15%
        );

        $this->assertEquals(15.0,      $resultado['descuento_pct']);
        $this->assertEquals('hermanos', $resultado['descuento_tipo']);
        $this->assertEquals(680.0,     $resultado['precio_final']);
    }

    /**
     * Multi-taller: 15%. Hermanos: 10%.
     * → Gana multi-taller (15%).
     */
    public function test_no_acumulable_multitaller_gana_a_hermanos(): void
    {
        $resultado = $this->servicio->calcular(
            precioBase: 800.0,
            totalActivos: 3,
            precioMaximoActivo: 1500.0,
            totalHermanos: 2, // hermanos → 10%
        );

        $this->assertEquals(15.0,          $resultado['descuento_pct']);
        $this->assertEquals('multi_taller', $resultado['descuento_tipo']);
        $this->assertEquals(680.0,         $resultado['precio_final']);
    }

    /**
     * Ambos descuentos son iguales (15% y 15%).
     * → Se aplica el de hermanos (prioridad cuando empatan: hermanos).
     */
    public function test_no_acumulable_empate_prioridad_hermanos(): void
    {
        $resultado = $this->servicio->calcular(
            precioBase: 800.0,
            totalActivos: 3,
            precioMaximoActivo: 1500.0,
            totalHermanos: 3, // hermanos → 15%, multi → 15%
        );

        $this->assertEquals(15.0,      $resultado['descuento_pct']);
        $this->assertEquals('hermanos', $resultado['descuento_tipo']);
        $this->assertEquals(680.0,     $resultado['precio_final']);
    }

    // ─── Precisión del cálculo ────────────────────────────────────────────────

    /** Verificar que el precio_final se redondea a 2 decimales. */
    public function test_precio_final_redondeado_a_2_decimales(): void
    {
        // 333.33 con 15% = 333.33 * 0.85 = 283.3305 → 283.33
        $resultado = $this->servicio->calcular(
            precioBase: 333.33,
            totalActivos: 1,
            precioMaximoActivo: 333.33,
            totalHermanos: 3,
        );

        $this->assertEquals(283.33, $resultado['precio_final']);
    }
}
