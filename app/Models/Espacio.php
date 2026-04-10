<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Espacio extends Model
{
    protected $fillable = ['academia_id', 'nombre', 'descripcion', 'equipamiento_base'];

    protected $casts = [
        'equipamiento_base' => 'array',
    ];

    /** Pertenece a una academia. */
    public function academia(): BelongsTo
    {
        return $this->belongsTo(Academia::class);
    }

    /** Los rangos horarios disponibles para este espacio. */
    public function rangosHorarios(): HasMany
    {
        return $this->hasMany(RangoHorario::class);
    }

    /** Las reservas de este espacio. */
    public function reservas(): HasMany
    {
        return $this->hasMany(Reserva::class);
    }
}
