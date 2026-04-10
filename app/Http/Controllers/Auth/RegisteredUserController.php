<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Academia;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Muestra el formulario de registro.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Procesa el registro de un nuevo usuario dueño de academia.
     *
     * Flujo:
     * 1. Validar los datos del formulario
     * 2. Crear la Academia nueva para este usuario
     * 3. Crear el User con rol 'dueno' asignado a esa Academia
     * 4. Login automático
     *
     * Usamos una transacción de BD para que si algo falla,
     * no quede ni la academia ni el usuario a medias.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name'           => 'required|string|max:255',
            'email'          => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password'       => ['required', 'confirmed', Rules\Password::defaults()],
            // Nombre de la academia que el nuevo dueño está registrando
            'academia_nombre' => 'required|string|max:255',
        ]);

        // Usamos transacción para garantizar consistencia:
        // si falla la creación del usuario, la academia tampoco se guarda.
        $user = DB::transaction(function () use ($request) {
            // Paso 1: Crear la Academia
            $academia = Academia::create([
                'nombre'         => $request->academia_nombre,
                'plan'           => 'basico',
                'fecha_registro' => now(),
            ]);

            // Paso 2: Crear el Usuario como dueño de esa academia
            $user = User::create([
                'name'        => $request->name,
                'email'       => $request->email,
                'password'    => Hash::make($request->password),
                'academia_id' => $academia->id,
                'rol'         => 'dueno',
            ]);

            // Paso 3: Crear disciplinas por defecto para la academia
            $now = now();
            $academia->disciplinas()->insert(
                array_map(fn ($nombre) => [
                    'academia_id' => $academia->id,
                    'nombre'      => $nombre,
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ], ['Fútbol', 'Vóley', 'Básquet', 'Tenis', 'Natación', 'Atletismo', 'Artes Marciales', 'Gimnasia'])
            );

            return $user;
        });

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
