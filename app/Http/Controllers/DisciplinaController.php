<?php

namespace App\Http\Controllers;

use App\Models\Disciplina;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DisciplinaController extends Controller
{
    /**
     * Lista las disciplinas de la academia del usuario logueado.
     * SEGURIDAD: siempre filtramos por academia_id para no mezclar datos entre academias.
     */
    public function index(): Response
    {
        $disciplinas = Disciplina::where('academia_id', auth()->user()->academia_id)
            ->withCount('talleres') // cuántos talleres tiene cada disciplina
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Disciplinas/Index', [
            'disciplinas' => $disciplinas,
        ]);
    }

    /**
     * Muestra el formulario para crear una nueva disciplina.
     */
    public function create(): Response
    {
        return Inertia::render('Disciplinas/Create');
    }

    /**
     * Guarda la nueva disciplina en la base de datos.
     * Asignamos automáticamente el academia_id del usuario — nunca del frontend.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
        ]);

        Disciplina::create([
            'academia_id' => auth()->user()->academia_id,
            'nombre'      => $validated['nombre'],
        ]);

        return redirect()->route('disciplinas.index')
            ->with('success', 'Disciplina creada exitosamente.');
    }

    /**
     * Muestra el formulario para editar una disciplina existente.
     * Verificamos que la disciplina pertenezca a la academia del usuario.
     */
    public function edit(Disciplina $disciplina): Response
    {
        $this->authorizar($disciplina);

        return Inertia::render('Disciplinas/Edit', [
            'disciplina' => $disciplina,
        ]);
    }

    /**
     * Actualiza la disciplina en la base de datos.
     */
    public function update(Request $request, Disciplina $disciplina): RedirectResponse
    {
        $this->authorizar($disciplina);

        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
        ]);

        $disciplina->update($validated);

        return redirect()->route('disciplinas.index')
            ->with('success', 'Disciplina actualizada exitosamente.');
    }

    /**
     * Elimina la disciplina.
     * Si tiene talleres activos, Laravel lanzará error de FK (protección en cascada).
     */
    public function destroy(Disciplina $disciplina): RedirectResponse
    {
        $this->authorizar($disciplina);

        // Verificamos que no tenga talleres antes de eliminar
        if ($disciplina->talleres()->count() > 0) {
            return redirect()->route('disciplinas.index')
                ->with('error', 'No se puede eliminar: la disciplina tiene talleres activos.');
        }

        $disciplina->delete();

        return redirect()->route('disciplinas.index')
            ->with('success', 'Disciplina eliminada exitosamente.');
    }

    /**
     * Verifica que la disciplina pertenezca a la academia del usuario logueado.
     * Si no, lanza un error 403 (Forbidden).
     */
    private function authorizar(Disciplina $disciplina): void
    {
        abort_if(
            $disciplina->academia_id !== auth()->user()->academia_id,
            403,
            'No tienes permiso para acceder a esta disciplina.'
        );
    }
}
