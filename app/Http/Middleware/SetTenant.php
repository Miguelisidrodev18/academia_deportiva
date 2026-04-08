<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware de Multitenencia (SetTenant)
 *
 * Este middleware se ejecuta en cada request autenticado.
 * Su trabajo es verificar que el usuario tiene una academia asignada.
 *
 * ¿Por qué es importante?
 * En un sistema multitenant, cada academia es un "inquilino" (tenant).
 * TODOS los datos (alumnos, pagos, talleres, etc.) pertenecen a UNA academia.
 * Este middleware asegura que nunca se procese un request sin saber a qué academia pertenece.
 */
class SetTenant
{
    /**
     * Maneja el request entrante.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Si el usuario está autenticado pero no tiene academia asignada, bloqueamos.
        // Esto previene que un usuario "huérfano" acceda al sistema.
        if (auth()->check() && auth()->user()->academia_id === null) {
            auth()->logout();
            return redirect()->route('login')
                ->withErrors(['email' => 'Tu cuenta no tiene una academia asignada. Contacta al administrador.']);
        }

        return $next($request);
    }
}
