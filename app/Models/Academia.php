<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Academia extends Model
{
    protected $fillable = [
        'nombre', 'direccion', 'telefono', 'plan', 'fecha_registro',
    ];

    protected $casts = [
        'fecha_registro' => 'datetime',
    ];

    /** Usuarios de esta academia (dueño, entrenadores, admins, alumnos). */
    public function usuarios(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /** Disciplinas deportivas de esta academia. */
    public function disciplinas(): HasMany
    {
        return $this->hasMany(Disciplina::class);
    }

    /** Alumnos registrados en esta academia. */
    public function alumnos(): HasMany
    {
        return $this->hasMany(Alumno::class);
    }

    /** Espacios físicos (canchas) disponibles para alquiler. */
    public function espacios(): HasMany
    {
        return $this->hasMany(Espacio::class);
    }

    /** Inventario de equipamiento. */
    public function equipamientos(): HasMany
    {
        return $this->hasMany(Equipamiento::class);
    }

    /** Productos del kiosco/cantina. */
    public function productos(): HasMany
    {
        return $this->hasMany(Producto::class);
    }

    /** Préstamos especiales activos o históricos. */
    public function prestamosEspeciales(): HasMany
    {
        return $this->hasMany(PrestamoEspecial::class);
    }

    /** Logs de auditoría de esta academia. */
    public function logs(): HasMany
    {
        return $this->hasMany(LogAuditoria::class);
    }
}
