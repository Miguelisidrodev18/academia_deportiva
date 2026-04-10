<?php

namespace App\Http\Controllers;

use App\Models\Asistencia;
use App\Models\Inscripcion;
use App\Models\Taller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AsistenciaController extends Controller
{
    /**
     * Vista del escáner QR de asistencia.
     * Solo accesible para entrenadores y dueños.
     */
    public function escanear(): Response
    {
        $user = auth()->user();

        // Acceso: solo dueño y entrenadores pueden registrar asistencia
        abort_unless(
            in_array($user->rol, ['dueno', 'entrenador']),
            403,
            'Solo los entrenadores y dueños pueden registrar asistencia.'
        );

        // Si es entrenador, le mostramos solo sus talleres para contexto
        $talleres = Taller::whereHas('disciplina', fn($q) => $q->where('academia_id', $user->academia_id))
            ->when($user->rol === 'entrenador', fn($q) => $q->where('entrenador_id', $user->id))
            ->with('disciplina:id,nombre')
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'dias_semana', 'hora_inicio', 'hora_fin', 'disciplina_id']);

        return Inertia::render('Asistencia/Escanear', [
            'talleres' => $talleres,
        ]);
    }

    /**
     * Endpoint POST: recibe el qr_code escaneado y registra la asistencia.
     *
     * Retorna JSON (no una redirección) porque el frontend hace fetch() directamente
     * desde el escáner QR, sin recargar la página.
     *
     * Validaciones:
     *  1. El qr_code existe y la inscripción está activa.
     *  2. El taller pertenece a la academia del usuario.
     *  3. El usuario es entrenador del taller (o dueño).
     *  4. El taller está en horario (±15 min de margen).
     *  5. No hay asistencia registrada hoy para esta inscripción.
     */
    public function registrarQR(Request $request): JsonResponse
    {
        $request->validate([
            'qr_code'    => 'required|string|size:20',
            'omitir_horario' => 'boolean', // para dueños que quieren forzar el registro
        ]);

        $user = auth()->user();

        // Seguridad: solo dueño y entrenadores
        if (!in_array($user->rol, ['dueno', 'entrenador'])) {
            return response()->json(['error' => 'Sin permiso para registrar asistencia.'], 403);
        }

        // ── 1. Buscar la inscripción por QR ──────────────────────────────────
        $inscripcion = Inscripcion::where('qr_code', $request->qr_code)
            ->where('activo', true)
            ->with(['alumno:id,nombre,dni', 'taller.disciplina'])
            ->first();

        if (!$inscripcion) {
            return response()->json([
                'error' => 'Código QR inválido o la inscripción no está activa.',
            ], 404);
        }

        $taller = $inscripcion->taller;

        // ── 2. El taller debe pertenecer a la academia del usuario ────────────
        if ($taller->disciplina->academia_id !== $user->academia_id) {
            return response()->json([
                'error' => 'Este QR pertenece a otra academia.',
            ], 403);
        }

        // ── 3. Verificar que el entrenador es del taller (dueño puede todo) ──
        if ($user->rol === 'entrenador' && $taller->entrenador_id !== $user->id) {
            return response()->json([
                'error' => "Este taller no está asignado a vos. Entrenador asignado: "
                    . ($taller->entrenador?->name ?? 'sin asignar'),
            ], 403);
        }

        // ── 4. Verificar horario (con margen de 15 minutos) ──────────────────
        // El dueño puede omitir esta validación pasando omitir_horario=true
        $omitirHorario = $request->boolean('omitir_horario') && $user->rol === 'dueno';

        if (!$omitirHorario && !$taller->estaEnHorario(15)) {
            $diasMap = [
                'lunes' => 'Lunes', 'martes' => 'Martes', 'miercoles' => 'Miércoles',
                'jueves' => 'Jueves', 'viernes' => 'Viernes',
                'sabado' => 'Sábado', 'domingo' => 'Domingo',
            ];
            $diasLabel = implode(', ', array_map(
                fn($d) => $diasMap[$d] ?? $d,
                $taller->dias_semana ?? []
            ));
            return response()->json([
                'error' => sprintf(
                    'Fuera de horario. El taller es los %s de %s a %s (margen ±15 min).',
                    $diasLabel ?: 'días sin configurar',
                    $taller->hora_inicio,
                    $taller->hora_fin
                ),
            ], 422);
        }

        // ── 5. Verificar que no haya asistencia duplicada hoy ─────────────────
        if ($inscripcion->asistenciaHoy()) {
            return response()->json([
                'error' => 'Ya se registró la asistencia de este alumno hoy.',
                'alumno' => $inscripcion->alumno->nombre,
            ], 409);
        }

        // ── Registrar la asistencia ───────────────────────────────────────────
        $asistencia = Asistencia::create([
            'inscripcion_id'              => $inscripcion->id,
            'fecha'                       => now()->toDateString(),
            'hora'                        => now()->format('H:i'),
            'estado'                      => 'presente',
            'registrado_por_entrenador_id' => $user->id,
        ]);

        return response()->json([
            'success'  => true,
            'mensaje'  => "✓ Asistencia registrada",
            'alumno'   => [
                'nombre' => $inscripcion->alumno->nombre,
                'dni'    => $inscripcion->alumno->dni,
            ],
            'taller'   => $taller->nombre,
            'disciplina' => $taller->disciplina->nombre,
            'hora'     => $asistencia->hora,
        ]);
    }

    /**
     * Listado de asistencias del día (o con filtros).
     * El entrenador solo ve las de sus talleres; el dueño ve todas.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();

        abort_unless(in_array($user->rol, ['dueno', 'entrenador']), 403);

        $fecha = $request->get('fecha', now()->toDateString());

        $asistencias = Asistencia::whereHas('inscripcion.alumno', fn($q) =>
                $q->where('academia_id', $user->academia_id)
            )
            ->when($user->rol === 'entrenador', fn($q) =>
                $q->where('registrado_por_entrenador_id', $user->id)
            )
            ->when($request->filled('taller_id'), fn($q) =>
                $q->whereHas('inscripcion', fn($qi) => $qi->where('taller_id', $request->taller_id))
            )
            ->where('fecha', $fecha)
            ->with([
                'inscripcion.alumno:id,nombre,dni',
                'inscripcion.taller:id,nombre',
                'entrenador:id,name',
            ])
            ->orderBy('hora', 'desc')
            ->get();

        $talleres = Taller::whereHas('disciplina', fn($q) => $q->where('academia_id', $user->academia_id))
            ->when($user->rol === 'entrenador', fn($q) => $q->where('entrenador_id', $user->id))
            ->orderBy('nombre')
            ->get(['id', 'nombre']);

        return Inertia::render('Asistencia/Listado', [
            'asistencias' => $asistencias,
            'talleres'    => $talleres,
            'fecha'       => $fecha,
        ]);
    }

    /**
     * Marcar una falta manualmente (para un alumno que no fue).
     * Crea una asistencia con estado = 'falta' si no existe hoy.
     */
    public function marcarFalta(Request $request): JsonResponse
    {
        $request->validate([
            'inscripcion_id' => 'required|integer',
            'fecha'          => 'required|date',
        ]);

        $user = auth()->user();
        abort_unless(in_array($user->rol, ['dueno', 'entrenador']), 403);

        $inscripcion = Inscripcion::whereHas('alumno', fn($q) =>
                $q->where('academia_id', $user->academia_id)
            )
            ->where('activo', true)
            ->findOrFail($request->inscripcion_id);

        // Verificar que el entrenador pertenece al taller
        if ($user->rol === 'entrenador' && $inscripcion->taller->entrenador_id !== $user->id) {
            return response()->json(['error' => 'No tenés acceso a este taller.'], 403);
        }

        $fecha = $request->fecha;

        // No duplicar
        $existe = Asistencia::where('inscripcion_id', $inscripcion->id)
            ->where('fecha', $fecha)
            ->exists();

        if ($existe) {
            return response()->json(['error' => 'Ya existe un registro de asistencia para ese día.'], 409);
        }

        Asistencia::create([
            'inscripcion_id'              => $inscripcion->id,
            'fecha'                       => $fecha,
            'hora'                        => now()->format('H:i'),
            'estado'                      => 'falta',
            'registrado_por_entrenador_id' => $user->id,
        ]);

        return response()->json(['success' => true, 'mensaje' => 'Falta registrada.']);
    }

    /**
     * Justificar una falta existente (cambiar estado a 'justificada').
     */
    public function justificar(Asistencia $asistencia): JsonResponse
    {
        $user = auth()->user();

        // Verificar pertenencia a la academia
        abort_if(
            $asistencia->inscripcion->alumno->academia_id !== $user->academia_id,
            403
        );

        abort_unless(in_array($user->rol, ['dueno', 'entrenador']), 403);

        $asistencia->update(['estado' => 'justificada']);

        return response()->json(['success' => true, 'mensaje' => 'Falta justificada.']);
    }
}
