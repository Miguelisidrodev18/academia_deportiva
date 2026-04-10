<?php

namespace App\Http\Controllers;

use App\Models\Alumno;
use App\Models\Inscripcion;
use App\Models\Taller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class InscripcionController extends Controller
{
    /**
     * Lista todas las inscripciones activas de la academia.
     * Incluye alumno y taller para mostrar en la tabla.
     */
    public function index(): Response
    {
        $inscripciones = Inscripcion::whereHas('alumno', function ($q) {
                $q->where('academia_id', auth()->user()->academia_id);
            })
            ->with([
                'alumno:id,nombre,dni',
                'taller:id,nombre,disciplina_id',
                'taller.disciplina:id,nombre',
            ])
            ->orderByDesc('fecha_alta')
            ->get();

        return Inertia::render('Inscripciones/Index', [
            'inscripciones' => $inscripciones,
        ]);
    }

    /**
     * Formulario para inscribir un alumno a un taller.
     * Pasamos alumnos y talleres disponibles de la academia.
     */
    public function create(): Response
    {
        $academiaId = auth()->user()->academia_id;

        // Solo talleres que aún tienen cupo disponible
        $talleres = Taller::whereHas('disciplina', fn($q) => $q->where('academia_id', $academiaId))
            ->with('disciplina:id,nombre')
            ->withCount(['inscripciones as inscriptos' => fn($q) => $q->where('activo', true)])
            ->get(['id', 'nombre', 'disciplina_id', 'cupo_maximo', 'dias_semana', 'hora_inicio', 'hora_fin', 'precio_base'])
            ->map(function ($t) {
                $t->cupo_disponible = $t->cupo_maximo - $t->inscriptos;
                return $t;
            });

        $alumnos = Alumno::where('academia_id', $academiaId)
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'dni', 'fecha_nacimiento']);

        return Inertia::render('Inscripciones/Create', [
            'alumnos'  => $alumnos,
            'talleres' => $talleres,
        ]);
    }

    /**
     * Crea la inscripción y genera el QR único de 20 caracteres.
     *
     * Reglas de negocio:
     *  - El alumno no puede estar ya inscripto en el mismo taller.
     *  - El taller no puede estar a cupo completo.
     *  - El QR se genera con Str::random(20) y debe ser único en la tabla.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'alumno_id' => 'required|integer',
            'taller_id' => 'required|integer',
        ]);

        $academiaId = auth()->user()->academia_id;

        // Seguridad: el alumno debe pertenecer a esta academia
        $alumno = Alumno::where('id', $validated['alumno_id'])
            ->where('academia_id', $academiaId)
            ->firstOrFail();

        // Seguridad: el taller debe pertenecer a esta academia
        $taller = Taller::whereHas('disciplina', fn($q) => $q->where('academia_id', $academiaId))
            ->withCount(['inscripciones as inscriptos' => fn($q) => $q->where('activo', true)])
            ->findOrFail($validated['taller_id']);

        // Validar que no esté ya inscripto en el mismo taller
        $yaInscripto = Inscripcion::where('alumno_id', $alumno->id)
            ->where('taller_id', $taller->id)
            ->where('activo', true)
            ->exists();

        if ($yaInscripto) {
            return back()->withErrors([
                'alumno_id' => 'El alumno ya está inscripto en este taller.',
            ])->withInput();
        }

        // Validar cupo disponible
        if ($taller->inscriptos >= $taller->cupo_maximo) {
            return back()->withErrors([
                'taller_id' => 'El taller no tiene cupo disponible.',
            ])->withInput();
        }

        // Generar QR único: bucle para evitar colisiones (muy improbables)
        do {
            $qrCode = Str::random(20);
        } while (Inscripcion::where('qr_code', $qrCode)->exists());

        $inscripcion = Inscripcion::create([
            'alumno_id'  => $alumno->id,
            'taller_id'  => $taller->id,
            'fecha_alta' => now(),
            'activo'     => true,
            'estado'     => 'activo',
            'qr_code'    => $qrCode,
        ]);

        return redirect()->route('inscripciones.show', $inscripcion->id)
            ->with('success', '¡Alumno inscripto! Aquí está su código QR.');
    }

    /**
     * Muestra el detalle de la inscripción con el código QR.
     * Esta es la página que se imprime / comparte con el alumno.
     */
    public function show(Inscripcion $inscripcion): Response
    {
        $this->authorizar($inscripcion);

        $inscripcion->load([
            'alumno:id,nombre,dni',
            'taller:id,nombre,dias_semana,hora_inicio,hora_fin,precio_base,disciplina_id',
            'taller.disciplina:id,nombre',
        ]);

        return Inertia::render('Inscripciones/Show', [
            'inscripcion' => $inscripcion,
        ]);
    }

    /**
     * Dar de baja la inscripción (marcar como inactiva / egresado).
     * No eliminamos el registro para mantener historial.
     */
    public function destroy(Inscripcion $inscripcion): RedirectResponse
    {
        $this->authorizar($inscripcion);

        $inscripcion->update([
            'activo' => false,
            'estado' => 'egresado',
        ]);

        return redirect()->route('inscripciones.index')
            ->with('success', 'Inscripción dada de baja. El historial se conserva.');
    }

    /**
     * Verifica que el alumno de la inscripción pertenezca a esta academia.
     */
    private function authorizar(Inscripcion $inscripcion): void
    {
        // Cargamos el alumno si no está ya cargado
        $inscripcion->loadMissing('alumno');

        abort_if(
            $inscripcion->alumno->academia_id !== auth()->user()->academia_id,
            403,
            'No tenés permiso para acceder a esta inscripción.'
        );
    }
}
