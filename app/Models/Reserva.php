<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Reserva extends Model
{
    protected $fillable = [
        'espacio_id', 'rango_horario_id', 'fecha_reserva', 'tipo_cliente',
        'cliente_nombre', 'cliente_dni', 'cliente_telefono', 'monto_pagado', 'estado',
    ];

    protected $casts = [
        'fecha_reserva' => 'date',
        'monto_pagado'  => 'decimal:2',
    ];

    /** El espacio reservado. */
    public function espacio(): BelongsTo
    {
        return $this->belongsTo(Espacio::class);
    }

    /** El rango horario reservado. */
    public function rangoHorario(): BelongsTo
    {
        return $this->belongsTo(RangoHorario::class);
    }

    /**
     * Equipamiento reservado junto con la cancha (devolución parcial posible).
     * El pivot tiene cantidad_reservada y cantidad_devuelta.
     */
    public function equipamientos(): BelongsToMany
    {
        return $this->belongsToMany(Equipamiento::class, 'equipamiento_reserva')
                    ->withPivot('cantidad_reservada', 'cantidad_devuelta')
                    ->withTimestamps();
    }
}
