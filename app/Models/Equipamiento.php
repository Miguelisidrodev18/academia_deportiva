<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Equipamiento extends Model
{
    protected $fillable = [
        'academia_id', 'nombre', 'tipo', 'stock_total', 'stock_disponible',
    ];

    /** Pertenece a una academia (multitenencia). */
    public function academia(): BelongsTo
    {
        return $this->belongsTo(Academia::class);
    }

    /** Talleres que usan este equipamiento. */
    public function talleres(): BelongsToMany
    {
        return $this->belongsToMany(Taller::class, 'equipamiento_taller')
                    ->withPivot('cantidad_asignada')
                    ->withTimestamps();
    }

    /** Reservas que incluyen este equipamiento. */
    public function reservas(): BelongsToMany
    {
        return $this->belongsToMany(Reserva::class, 'equipamiento_reserva')
                    ->withPivot('cantidad_reservada', 'cantidad_devuelta')
                    ->withTimestamps();
    }

    /** Detalles de préstamos especiales que incluyen este equipamiento. */
    public function prestamoDetalles(): HasMany
    {
        return $this->hasMany(PrestamoDetalle::class);
    }

    /**
     * Calcula si el equipamiento tiene unidades disponibles.
     * Útil para validar antes de un préstamo o reserva.
     */
    public function tieneDisponibilidad(int $cantidad = 1): bool
    {
        return $this->stock_disponible >= $cantidad;
    }
}
