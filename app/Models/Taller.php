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

    /**
     * Verifica si ahora mismo está dentro del horario del taller
     * con un margen de ±$margenMinutos minutos.
     *
     * El taller guarda dia_semana en español minúsculas (lunes, martes...).
     * Carbon retorna el nombre del día en inglés, así que mapeamos.
     *
     * @param  int $margenMinutos  Margen antes/después del horario (default 15 min)
     * @return bool
     */
    public function estaEnHorario(int $margenMinutos = 15): bool
    {
        $ahora = now();

        // Mapa: nombre en inglés → español (como guardamos en la BD)
        $diasMap = [
            'Monday'    => 'lunes',
            'Tuesday'   => 'martes',
            'Wednesday' => 'miercoles',
            'Thursday'  => 'jueves',
            'Friday'    => 'viernes',
            'Saturday'  => 'sabado',
            'Sunday'    => 'domingo',
        ];

        $diaHoy = $diasMap[$ahora->format('l')] ?? '';

        // Verificar que sea el día correcto
        if ($diaHoy !== $this->dia_semana) {
            return false;
        }

        // Construir timestamps de inicio y fin del taller con el margen
        $inicio = $ahora->copy()->setTimeFromTimeString($this->hora_inicio)->subMinutes($margenMinutos);
        $fin    = $ahora->copy()->setTimeFromTimeString($this->hora_fin)->addMinutes($margenMinutos);

        return $ahora->between($inicio, $fin);
    }
}
