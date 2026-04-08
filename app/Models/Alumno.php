<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Alumno extends Model
{
    protected $fillable = [
        'academia_id', 'user_id', 'nombre', 'apellido_familiar', 'fecha_nacimiento',
        'dni', 'direccion', 'telefono', 'foto',
    ];

    protected $casts = [
        'fecha_nacimiento' => 'date',
    ];

    /** Pertenece a una academia (multitenencia). */
    public function academia(): BelongsTo
    {
        return $this->belongsTo(Academia::class);
    }

    /** Puede tener un User asociado para acceso al sistema. */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /** Las inscripciones del alumno a talleres. */
    public function inscripciones(): HasMany
    {
        return $this->hasMany(Inscripcion::class);
    }

    /**
     * Calcula la edad del alumno en años.
     * Útil para aplicar descuentos por edad en CuotaService.
     */
    public function edad(): int
    {
        return $this->fecha_nacimiento->age;
    }

    /**
     * Devuelve las inscripciones activas del alumno.
     * Si tiene más de 1 inscripción activa → puede aplicar descuento multi-taller.
     */
    public function inscripcionesActivas(): HasMany
    {
        return $this->hasMany(Inscripcion::class)->where('activo', true);
    }

    /**
     * Calcula la deuda total del alumno sumando la deuda de cada inscripción activa.
     * Útil para mostrar en el listado de alumnos y en el dashboard de alertas.
     */
    public function deudaTotal(): float
    {
        return $this->inscripcionesActivas()
            ->with(['taller', 'pagos'])
            ->get()
            ->sum(fn($inscripcion) => $inscripcion->deudaActual());
    }
}
