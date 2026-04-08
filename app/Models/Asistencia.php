<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Asistencia extends Model
{
    protected $fillable = [
        'inscripcion_id', 'fecha', 'hora', 'estado', 'registrado_por_entrenador_id',
    ];

    protected $casts = [
        'fecha' => 'date',
    ];

    /** La inscripción a la que corresponde esta asistencia. */
    public function inscripcion(): BelongsTo
    {
        return $this->belongsTo(Inscripcion::class);
    }

    /** El entrenador que registró la asistencia. */
    public function entrenador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registrado_por_entrenador_id');
    }
}
