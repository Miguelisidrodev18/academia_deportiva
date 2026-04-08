<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Academia extends Model
{
    /**
     * Los campos que se pueden asignar en masa.
     */
    protected $fillable = [
        'nombre',
        'direccion',
        'telefono',
        'plan',
        'fecha_registro',
    ];

    /**
     * Castings de tipos para los atributos.
     */
    protected $casts = [
        'fecha_registro' => 'datetime',
    ];

    /**
     * Una academia tiene muchos usuarios (dueño, entrenadores, admins, alumnos).
     */
    public function usuarios(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
