<?php

namespace App\Http\Controllers;

use App\Models\LogAuditoria;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LogAuditoriaController extends Controller
{
    // Solo el dueño puede ver los logs de auditoría
    public function index(Request $request): Response
    {
        abort_unless(auth()->user()->esDueno(), 403);

        $academiaId = auth()->user()->academia_id;

        $logs = LogAuditoria::where('academia_id', $academiaId)
            // Filtro por fecha
            ->when($request->filled('fecha'), fn($q) =>
                $q->whereDate('fecha_hora', $request->fecha)
            )
            // Filtro por tipo de acción
            ->when($request->filled('accion'), fn($q) =>
                $q->where('accion', $request->accion)
            )
            // Filtro por usuario
            ->when($request->filled('usuario_id'), fn($q) =>
                $q->where('usuario_id', $request->usuario_id)
            )
            ->with('usuario:id,name')
            ->orderBy('fecha_hora', 'desc')
            ->paginate(30)
            ->withQueryString();

        // Lista de usuarios de esta academia para el filtro
        $usuarios = User::where('academia_id', $academiaId)
            ->orderBy('name')
            ->get(['id', 'name']);

        // Tipos de acción distintos que hay en esta academia (para el selector de filtro)
        $acciones = LogAuditoria::where('academia_id', $academiaId)
            ->distinct()
            ->orderBy('accion')
            ->pluck('accion');

        return Inertia::render('Logs/Index', [
            'logs'     => $logs,
            'usuarios' => $usuarios,
            'acciones' => $acciones,
            'filters'  => [
                'fecha'     => $request->fecha,
                'accion'    => $request->accion,
                'usuario_id' => $request->usuario_id,
            ],
        ]);
    }
}
