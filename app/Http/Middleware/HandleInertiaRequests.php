<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * La vista raíz que se carga en la primera visita de página.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determina la versión actual de assets (para cache busting).
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define los props que se comparten globalmente en todos los componentes React.
     *
     * auth.user incluye la academia para que el sidebar pueda mostrar su nombre
     * y todos los componentes puedan saber el rol del usuario sin hacer requests adicionales.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                // Incluimos la relación 'academia' para que el sidebar
                // pueda mostrar el nombre de la academia del usuario logueado.
                'user' => $request->user()?->load('academia'),
            ],
        ];
    }
}
