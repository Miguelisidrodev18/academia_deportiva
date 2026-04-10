<?php

namespace App\Http\Controllers;

use App\Models\Alumno;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AlumnoController extends Controller
{
    /**
     * Lista los alumnos de la academia con conteo de inscripciones activas.
     */
    public function index(): Response
    {
        $alumnos = Alumno::where('academia_id', auth()->user()->academia_id)
            ->withCount(['inscripciones as inscripciones_activas_count' => function ($q) {
                $q->where('activo', true);
            }])
            ->with(['inscripciones' => fn ($q) => $q->where('activo', true)->with('pagos')])
            ->orderBy('nombre')
            ->get()
            ->map(function ($alumno) {
                $alumno->deuda_total = $alumno->deudaTotal();
                return $alumno;
            });

        return Inertia::render('Alumnos/Index', [
            'alumnos' => $alumnos,
        ]);
    }

    /**
     * Muestra el formulario de creación.
     */
    public function create(): Response
    {
        return Inertia::render('Alumnos/Create');
    }

    /**
     * Guarda el nuevo alumno asignando automáticamente el academia_id.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nombre'            => 'required|string|max:150',
            'apellido_familiar' => 'nullable|string|max:80',
            'fecha_nacimiento'  => 'required|date|before:today',
            'dni'               => 'required|string|max:20',
            'direccion'         => 'nullable|string|max:255',
            'telefono'          => 'nullable|string|max:30',
        ]);

        // Verificar que el DNI no esté duplicado dentro de la misma academia
        $existe = Alumno::where('academia_id', auth()->user()->academia_id)
            ->where('dni', $validated['dni'])
            ->exists();

        if ($existe) {
            return back()->withErrors(['dni' => 'Ya existe un alumno con ese DNI en la academia.'])
                         ->withInput();
        }

        Alumno::create([
            'academia_id' => auth()->user()->academia_id,
            ...$validated,
        ]);

        return redirect()->route('alumnos.index')
            ->with('success', 'Alumno registrado exitosamente.');
    }

    /**
     * Muestra el detalle del alumno con sus inscripciones y últimos pagos.
     */
    public function show(Alumno $alumno): Response
    {
        $this->authorizar($alumno);

        $alumno->load([
            'inscripciones' => function ($q) {
                $q->with(['taller.disciplina', 'pagos' => function ($pq) {
                    $pq->orderByDesc('fecha_pago');
                }]);
            },
        ]);

        $alumno->deuda_total = $alumno->deudaTotal();

        return Inertia::render('Alumnos/Show', [
            'alumno' => $alumno,
        ]);
    }

    /**
     * Muestra el formulario de edición.
     */
    public function edit(Alumno $alumno): Response
    {
        $this->authorizar($alumno);

        return Inertia::render('Alumnos/Edit', [
            'alumno' => $alumno,
        ]);
    }

    /**
     * Actualiza los datos del alumno.
     */
    public function update(Request $request, Alumno $alumno): RedirectResponse
    {
        $this->authorizar($alumno);

        $validated = $request->validate([
            'nombre'            => 'required|string|max:150',
            'apellido_familiar' => 'nullable|string|max:80',
            'fecha_nacimiento'  => 'required|date|before:today',
            'dni'               => 'required|string|max:20',
            'direccion'         => 'nullable|string|max:255',
            'telefono'          => 'nullable|string|max:30',
        ]);

        // Verificar DNI duplicado excluyendo al alumno actual
        $existe = Alumno::where('academia_id', auth()->user()->academia_id)
            ->where('dni', $validated['dni'])
            ->where('id', '!=', $alumno->id)
            ->exists();

        if ($existe) {
            return back()->withErrors(['dni' => 'Ya existe otro alumno con ese DNI en la academia.'])
                         ->withInput();
        }

        $alumno->update($validated);

        return redirect()->route('alumnos.index')
            ->with('success', 'Alumno actualizado exitosamente.');
    }

    /**
     * Elimina el alumno si no tiene inscripciones activas.
     */
    public function destroy(Alumno $alumno): RedirectResponse
    {
        $this->authorizar($alumno);

        if ($alumno->inscripcionesActivas()->count() > 0) {
            return redirect()->route('alumnos.index')
                ->with('error', 'No se puede eliminar: el alumno tiene inscripciones activas.');
        }

        $alumno->delete();

        return redirect()->route('alumnos.index')
            ->with('success', 'Alumno eliminado exitosamente.');
    }

    /**
     * Autocomplete JSON: busca alumnos por nombre o DNI (para el form de reservas).
     */
    public function buscar(Request $request): JsonResponse
    {
        $q = $request->get('q', '');
        $alumnos = Alumno::where('academia_id', auth()->user()->academia_id)
            ->where(fn($query) =>
                $query->where('nombre', 'like', "%{$q}%")
                      ->orWhere('dni', 'like', "%{$q}%")
            )
            ->orderBy('nombre')
            ->limit(10)
            ->get(['id', 'nombre', 'dni']);

        return response()->json($alumnos);
    }

    /**
     * Verifica que el alumno pertenezca a la academia del usuario logueado.
     */
    private function authorizar(Alumno $alumno): void
    {
        abort_if(
            $alumno->academia_id !== auth()->user()->academia_id,
            403,
            'No tienes permiso para acceder a este alumno.'
        );
    }
}
