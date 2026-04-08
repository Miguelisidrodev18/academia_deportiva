<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inscripcion extends Model
{
    // Laravel pluraliza como "inscripcions", le decimos la tabla real
    protected $table = 'inscripciones';

    protected $fillable = [
        'alumno_id', 'taller_id', 'fecha_alta', 'activo', 'qr_code', 'estado',
    ];

    protected $casts = [
        'fecha_alta' => 'date',
        'activo'     => 'boolean',
    ];

    /** El alumno inscripto. */
    public function alumno(): BelongsTo
    {
        return $this->belongsTo(Alumno::class);
    }

    /** El taller en el que está inscripto. */
    public function taller(): BelongsTo
    {
        return $this->belongsTo(Taller::class);
    }

    /** Los pagos de cuota de esta inscripción. */
    public function pagos(): HasMany
    {
        return $this->hasMany(Pago::class);
    }

    /** El registro de asistencias de esta inscripción. */
    public function asistencias(): HasMany
    {
        return $this->hasMany(Asistencia::class);
    }

    /**
     * Cuenta las faltas sin justificar.
     * Si llega a 3 → se genera alerta para el dueño.
     */
    public function faltasSinJustificar(): int
    {
        return $this->asistencias()->where('estado', 'falta')->count();
    }

    /**
     * Verifica si el alumno tiene deuda de más de 2 cuotas.
     * Si es así, no se puede inscribir a un nuevo taller.
     */
    public function tieneDeudasExcesivas(): bool
    {
        $mesesTranscurridos = $this->fecha_alta->diffInMonths(now());
        $pagosRealizados    = $this->pagos()->count();
        $cuotasAtrasadas    = $mesesTranscurridos - $pagosRealizados;

        return $cuotasAtrasadas > 2;
    }

    /**
     * Calcula la deuda actual de esta inscripción en pesos.
     *
     * Fórmula: (meses desde fecha_alta hasta hoy) * precio_taller - total_pagado
     *
     * Nota: usamos el precio_base del taller sin descuento en este método básico.
     * Para aplicar descuentos multi-taller/hermanos, el controlador usa CuotaService
     * y pasa el precio_final correspondiente.
     */
    public function deudaActual(float $precioFinal = null): float
    {
        // Si no se pasa precio_final, usamos el precio_base del taller
        $precio = $precioFinal ?? (float) $this->taller->precio_base;

        // Meses completos transcurridos desde la fecha de alta (mínimo 1)
        $meses = max(1, $this->fecha_alta->diffInMonths(now()));

        // Total que debería haber pagado hasta ahora
        $totalEsperado = $meses * $precio;

        // Total que efectivamente pagó
        $totalPagado = (float) $this->pagos()->sum('monto');

        return max(0, round($totalEsperado - $totalPagado, 2));
    }
}
