<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PrestamoEspecial extends Model
{
    // La tabla real es 'prestamo_especiales'
    protected $table = 'prestamo_especiales';

    protected $fillable = [
        'academia_id', 'solicitante_nombre', 'solicitante_tipo',
        'fecha_prestamo', 'fecha_devolucion_esperada', 'fecha_devolucion_real', 'estado',
    ];

    protected $casts = [
        'fecha_prestamo'             => 'date',
        'fecha_devolucion_esperada'  => 'date',
        'fecha_devolucion_real'      => 'date',
    ];

    /** Pertenece a una academia. */
    public function academia(): BelongsTo
    {
        return $this->belongsTo(Academia::class);
    }

    /** Los ítems incluidos en este préstamo. */
    public function detalles(): HasMany
    {
        return $this->hasMany(PrestamoDetalle::class, 'prestamo_id');
    }

    /** Verifica si el préstamo está vencido (pasó la fecha esperada y sigue activo). */
    public function estaVencido(): bool
    {
        return $this->estado === 'activo' && now()->gt($this->fecha_devolucion_esperada);
    }
}
