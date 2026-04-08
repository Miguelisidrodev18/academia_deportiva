<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Taller extends Model
{
    // Laravel pluraliza "Taller" como "tallers", le decimos que la tabla real es "talleres"
    protected $table = 'talleres';

    protected $fillable = [
        'disciplina_id', 'nombre', 'rango_edad_min', 'rango_edad_max',
        'nivel', 'precio_base', 'dia_semana', 'hora_inicio', 'hora_fin',
        'entrenador_id', 'cupo_maximo',
    ];

    protected $casts = [
        'precio_base' => 'decimal:2',
    ];

    /** El taller pertenece a una disciplina. */
    public function disciplina(): BelongsTo
    {
        return $this->belongsTo(Disciplina::class);
    }

    /** El entrenador asignado a este taller. */
    public function entrenador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'entrenador_id');
    }

    /** Los alumnos inscriptos en este taller (via inscripciones). */
    public function inscripciones(): HasMany
    {
        return $this->hasMany(Inscripcion::class);
    }

    /** Equipamiento base asignado a este taller. */
    public function equipamientos(): BelongsToMany
    {
        return $this->belongsToMany(Equipamiento::class, 'equipamiento_taller')
                    ->withPivot('cantidad_asignada')
                    ->withTimestamps();
    }
}
