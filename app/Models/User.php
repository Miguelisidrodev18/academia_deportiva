<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Los campos que se pueden asignar en masa.
     * Incluimos academia_id y rol para la multitenencia.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'academia_id',
        'rol',
    ];

    /**
     * Atributos ocultos en serialización (no se envían al frontend).
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Castings de tipos.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * El usuario pertenece a una academia (multitenencia).
     * Todos los datos del sistema están aislados por academia_id.
     */
    public function academia(): BelongsTo
    {
        return $this->belongsTo(Academia::class);
    }

    /**
     * Helpers de rol para usar en controladores y vistas.
     * Ejemplo: $user->esDueno() devuelve true si el usuario es dueño.
     */
    public function esDueno(): bool
    {
        return $this->rol === 'dueno';
    }

    public function esEntrenador(): bool
    {
        return $this->rol === 'entrenador';
    }

    public function esAdminCaja(): bool
    {
        return $this->rol === 'admin_caja';
    }

    public function esAdminAlquiler(): bool
    {
        return $this->rol === 'admin_alquiler';
    }

    public function esAlumno(): bool
    {
        return $this->rol === 'alumno';
    }
}
