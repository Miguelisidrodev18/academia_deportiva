<?php

namespace App\Http\Controllers;

use App\Models\Disciplina;
use App\Models\Taller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TallerController extends Controller
{
    /**
     * Lista los talleres de la academia con sus relaciones básicas.
     */
    public function index(): Response
    {
        $talleres = Taller::whereHas('disciplina', function ($q) {
                $q->where('academia_id', auth()->user()->academia_id);
            })
            ->with(['disciplina', 'entrenador:id,name'])
            ->withCount('inscripciones')
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Talleres/Index', [
            'talleres' => $talleres,
        ]);
    }

    /**
     * Muestra el formulario para crear un nuevo taller.
     * Necesitamos pasar disciplinas y entrenadores disponibles.
     */
    public function create(): Response
    {
        return Inertia::render('Talleres/Create', [
            'disciplinas' => $this->getDisciplinas(),
            'entrenadores' => $this->getEntrenadores(),
        ]);
    }

    /**
     * Guarda el nuevo taller.
     * Verificamos que la disciplina seleccionada pertenezca a la academia.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'disciplina_id'   => 'required|integer',
            'nombre'          => 'required|string|max:100',
            'rango_edad_min'  => 'required|integer|min:1|max:99',
            'rango_edad_max'  => 'required|integer|min:1|max:99|gte:rango_edad_min',
            'nivel'           => 'required|in:inicial,intermedio,avanzado',
            'precio_base'     => 'required|numeric|min:0',
            'dia_semana'      => 'required|in:lunes,martes,miercoles,jueves,viernes,sabado,domingo',
            'hora_inicio'     => 'required|date_format:H:i',
            'hora_fin'        => 'required|date_format:H:i|after:hora_inicio',
            'entrenador_id'   => 'nullable|integer',
            'cupo_maximo'     => 'required|integer|min:1',
        ]);

        // Seguridad: verificar que la disciplina elegida pertenece a esta academia
        $this->verificarDisciplina($validated['disciplina_id']);

        // Si se asignó un entrenador, verificar que también sea de esta academia
        if (!empty($validated['entrenador_id'])) {
            $this->verificarEntrenador($validated['entrenador_id']);
        }

        Taller::create($validated);

        return redirect()->route('talleres.index')
            ->with('success', 'Taller creado exitosamente.');
    }

    /**
     * Muestra el formulario de edición con los datos actuales del taller.
     */
    public function edit(Taller $taller): Response
    {
        $this->authorizar($taller);

        return Inertia::render('Talleres/Edit', [
            'taller'       => $taller,
            'disciplinas'  => $this->getDisciplinas(),
            'entrenadores' => $this->getEntrenadores(),
        ]);
    }

    /**
     * Actualiza el taller.
     */
    public function update(Request $request, Taller $taller): RedirectResponse
    {
        $this->authorizar($taller);

        $validated = $request->validate([
            'disciplina_id'   => 'required|integer',
            'nombre'          => 'required|string|max:100',
            'rango_edad_min'  => 'required|integer|min:1|max:99',
            'rango_edad_max'  => 'required|integer|min:1|max:99|gte:rango_edad_min',
            'nivel'           => 'required|in:inicial,intermedio,avanzado',
            'precio_base'     => 'required|numeric|min:0',
            'dia_semana'      => 'required|in:lunes,martes,miercoles,jueves,viernes,sabado,domingo',
            'hora_inicio'     => 'required|date_format:H:i',
            'hora_fin'        => 'required|date_format:H:i|after:hora_inicio',
            'entrenador_id'   => 'nullable|integer',
            'cupo_maximo'     => 'required|integer|min:1',
        ]);

        $this->verificarDisciplina($validated['disciplina_id']);

        if (!empty($validated['entrenador_id'])) {
            $this->verificarEntrenador($validated['entrenador_id']);
        }

        $taller->update($validated);

        return redirect()->route('talleres.index')
            ->with('success', 'Taller actualizado exitosamente.');
    }

    /**
     * Elimina el taller si no tiene inscripciones activas.
     */
    public function destroy(Taller $taller): RedirectResponse
    {
        $this->authorizar($taller);

        if ($taller->inscripciones()->count() > 0) {
            return redirect()->route('talleres.index')
                ->with('error', 'No se puede eliminar: el taller tiene inscripciones activas.');
        }

        $taller->delete();

        return redirect()->route('talleres.index')
            ->with('success', 'Taller eliminado exitosamente.');
    }

    // ─── Helpers privados ─────────────────────────────────────────────────────

    /**
     * Verifica que el taller pertenezca a la academia del usuario vía su disciplina.
     */
    private function authorizar(Taller $taller): void
    {
        abort_if(
            $taller->disciplina->academia_id !== auth()->user()->academia_id,
            403,
            'No tienes permiso para acceder a este taller.'
        );
    }

    /**
     * Disciplinas de la academia ordenadas por nombre (para los selects del form).
     */
    private function getDisciplinas(): \Illuminate\Database\Eloquent\Collection
    {
        return Disciplina::where('academia_id', auth()->user()->academia_id)
            ->orderBy('nombre')
            ->get(['id', 'nombre']);
    }

    /**
     * Entrenadores de la academia (para el select del form).
     */
    private function getEntrenadores(): \Illuminate\Database\Eloquent\Collection
    {
        return User::where('academia_id', auth()->user()->academia_id)
            ->where('rol', 'entrenador')
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    /**
     * Aborta con 403 si la disciplina no pertenece a esta academia.
     */
    private function verificarDisciplina(int $disciplinaId): void
    {
        $existe = Disciplina::where('id', $disciplinaId)
            ->where('academia_id', auth()->user()->academia_id)
            ->exists();

        abort_unless($existe, 403, 'La disciplina no pertenece a tu academia.');
    }

    /**
     * Aborta con 403 si el entrenador no pertenece a esta academia.
     */
    private function verificarEntrenador(int $entrenadorId): void
    {
        $existe = User::where('id', $entrenadorId)
            ->where('academia_id', auth()->user()->academia_id)
            ->where('rol', 'entrenador')
            ->exists();

        abort_unless($existe, 403, 'El entrenador no pertenece a tu academia.');
    }
}
