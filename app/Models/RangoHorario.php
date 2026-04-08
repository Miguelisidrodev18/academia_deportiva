<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RangoHorario extends Model
{
    // La tabla real es 'rangos_horarios'
    protected $table = 'rangos_horarios';

    protected $fillable = [
        'espacio_id', 'dia_semana', 'hora_inicio', 'hora_fin', 'precio', 'disponible',
    ];

    protected $casts = [
        'disponible' => 'boolean',
        'precio'     => 'decimal:2',
    ];

    /** El espacio al que pertenece este rango horario. */
    public function espacio(): BelongsTo
    {
        return $this->belongsTo(Espacio::class);
    }

    /** Las reservas que usan este rango horario. */
    public function reservas(): HasMany
    {
        return $this->hasMany(Reserva::class);
    }
}
