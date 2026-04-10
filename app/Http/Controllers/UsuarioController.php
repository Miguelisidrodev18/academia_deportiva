<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class UsuarioController extends Controller
{
    /**
     * Roles que el dueño puede crear/asignar.
     * No puede crear otro dueño.
     */
    private const ROLES_PERMITIDOS = ['entrenador', 'admin_caja', 'admin_alquiler'];

    public function index(): Response
    {
        $this->soloDueno();

        $usuarios = User::where('academia_id', auth()->user()->academia_id)
            ->orderByRaw("FIELD(rol, 'dueno', 'entrenador', 'admin_caja', 'admin_alquiler', 'alumno')")
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'rol']);

        return Inertia::render('Usuarios/Index', [
            'usuarios'        => $usuarios,
            'rolesPermitidos' => self::ROLES_PERMITIDOS,
        ]);
    }

    public function create(): Response
    {
        $this->soloDueno();

        return Inertia::render('Usuarios/Create', [
            'rolesPermitidos' => self::ROLES_PERMITIDOS,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->soloDueno();

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'rol'      => 'required|in:' . implode(',', self::ROLES_PERMITIDOS),
        ]);

        User::create([
            'name'        => $validated['name'],
            'email'       => $validated['email'],
            'password'    => Hash::make($validated['password']),
            'academia_id' => auth()->user()->academia_id,
            'rol'         => $validated['rol'],
        ]);

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario creado exitosamente.');
    }

    public function edit(User $usuario): Response
    {
        $this->soloDueno();
        $this->verificarMismaAcademia($usuario);

        return Inertia::render('Usuarios/Edit', [
            'usuario'         => $usuario->only('id', 'name', 'email', 'rol'),
            'rolesPermitidos' => self::ROLES_PERMITIDOS,
        ]);
    }

    public function update(Request $request, User $usuario): RedirectResponse
    {
        $this->soloDueno();
        $this->verificarMismaAcademia($usuario);

        // El dueño no puede editar su propio perfil desde aquí
        if ($usuario->id === auth()->id()) {
            return back()->withErrors(['general' => 'No podés editar tu propio usuario desde aquí.']);
        }

        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $usuario->id,
            'rol'   => 'required|in:' . implode(',', self::ROLES_PERMITIDOS),
        ]);

        $usuario->update($validated);

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario actualizado exitosamente.');
    }

    private function soloDueno(): void
    {
        abort_unless(auth()->user()->esDueno(), 403, 'Solo el dueño puede gestionar usuarios.');
    }

    private function verificarMismaAcademia(User $usuario): void
    {
        abort_if(
            $usuario->academia_id !== auth()->user()->academia_id,
            403,
            'Este usuario no pertenece a tu academia.'
        );
    }
}
