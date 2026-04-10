<?php

namespace App\Http\Controllers;

use App\Models\Espacio;
use App\Models\RangoHorario;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EspacioController extends Controller
{
    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function soloDueno(): void
    {
        abort_unless(auth()->user()->esDueno(), 403, 'Solo el dueño puede gestionar espacios.');
    }

    // ─── Listado ──────────────────────────────────────────────────────────────

    public function index(): Response
    {
        $this->soloDueno();
        $user = auth()->user();

        $espacios = Espacio::where('academia_id', $user->academia_id)
            ->withCount('reservas')
            ->with(['rangosHorarios' => fn($q) => $q->orderBy('dia_semana')->orderBy('hora_inicio')])
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Espacios/Index', [
            'espacios' => $espacios,
        ]);
    }

    // ─── Formulario creación ──────────────────────────────────────────────────

    public function create(): Response
    {
        $this->soloDueno();

        return Inertia::render('Espacios/Create');
    }

    // ─── Guardar nuevo espacio + rangos ───────────────────────────────────────

    public function store(Request $request): RedirectResponse
    {
        $this->soloDueno();
        $user = auth()->user();

        $data = $request->validate([
            'nombre'             => 'required|string|max:100',
            'descripcion'        => 'nullable|string|max:500',
            'equipamiento_base'  => 'nullable|array',
            'equipamiento_base.*.nombre'   => 'required|string|max:80',
            'equipamiento_base.*.cantidad' => 'required|integer|min:1',
            // rangos_horarios: array de objetos
            'rangos_horarios'                    => 'nullable|array',
            'rangos_horarios.*.dia_semana'        => 'required|integer|between:1,7',
            'rangos_horarios.*.hora_inicio'       => 'required|date_format:H:i',
            'rangos_horarios.*.hora_fin'          => 'required|date_format:H:i|after:rangos_horarios.*.hora_inicio',
            'rangos_horarios.*.precio'            => 'required|numeric|min:0',
            'rangos_horarios.*.disponible'        => 'boolean',
        ]);

        $espacio = Espacio::create([
            'academia_id'       => $user->academia_id,
            'nombre'            => $data['nombre'],
            'descripcion'       => $data['descripcion'] ?? null,
            'equipamiento_base' => $data['equipamiento_base'] ?? [],
        ]);

        // Crear los rangos horarios inline
        foreach ($data['rangos_horarios'] ?? [] as $rango) {
            $espacio->rangosHorarios()->create([
                'dia_semana'  => $rango['dia_semana'],
                'hora_inicio' => $rango['hora_inicio'],
                'hora_fin'    => $rango['hora_fin'],
                'precio'      => $rango['precio'],
                'disponible'  => $rango['disponible'] ?? true,
            ]);
        }

        return redirect()->route('espacios.index')
            ->with('success', "Espacio «{$espacio->nombre}» creado correctamente.");
    }

    // ─── Formulario edición ───────────────────────────────────────────────────

    public function edit(Espacio $espacio): Response
    {
        $this->soloDueno();
        abort_if($espacio->academia_id !== auth()->user()->academia_id, 403);

        $espacio->load(['rangosHorarios' => fn($q) => $q->orderBy('dia_semana')->orderBy('hora_inicio')]);

        return Inertia::render('Espacios/Edit', [
            'espacio' => $espacio,
        ]);
    }

    // ─── Actualizar espacio + sincronizar rangos ──────────────────────────────

    public function update(Request $request, Espacio $espacio): RedirectResponse
    {
        $this->soloDueno();
        abort_if($espacio->academia_id !== auth()->user()->academia_id, 403);

        $data = $request->validate([
            'nombre'             => 'required|string|max:100',
            'descripcion'        => 'nullable|string|max:500',
            'equipamiento_base'  => 'nullable|array',
            'equipamiento_base.*.nombre'   => 'required|string|max:80',
            'equipamiento_base.*.cantidad' => 'required|integer|min:1',
            'rangos_horarios'                    => 'nullable|array',
            'rangos_horarios.*.id'               => 'nullable|integer',
            'rangos_horarios.*.dia_semana'        => 'required|integer|between:1,7',
            'rangos_horarios.*.hora_inicio'       => 'required|date_format:H:i',
            'rangos_horarios.*.hora_fin'          => 'required|date_format:H:i',
            'rangos_horarios.*.precio'            => 'required|numeric|min:0',
            'rangos_horarios.*.disponible'        => 'boolean',
        ]);

        $espacio->update([
            'nombre'            => $data['nombre'],
            'descripcion'       => $data['descripcion'] ?? null,
            'equipamiento_base' => $data['equipamiento_base'] ?? [],
        ]);

        // Sincronizar rangos: los que vienen con id se actualizan, los nuevos se insertan.
        // Los que no vienen se eliminan (solo si no tienen reservas activas).
        $rangoIds = collect($data['rangos_horarios'] ?? [])->pluck('id')->filter();
        $espacio->rangosHorarios()
            ->whereNotIn('id', $rangoIds)
            ->whereDoesntHave('reservas', fn($q) => $q->where('estado', 'confirmada'))
            ->delete();

        foreach ($data['rangos_horarios'] ?? [] as $rango) {
            if (!empty($rango['id'])) {
                RangoHorario::where('id', $rango['id'])->where('espacio_id', $espacio->id)->update([
                    'dia_semana'  => $rango['dia_semana'],
                    'hora_inicio' => $rango['hora_inicio'],
                    'hora_fin'    => $rango['hora_fin'],
                    'precio'      => $rango['precio'],
                    'disponible'  => $rango['disponible'] ?? true,
                ]);
            } else {
                $espacio->rangosHorarios()->create([
                    'dia_semana'  => $rango['dia_semana'],
                    'hora_inicio' => $rango['hora_inicio'],
                    'hora_fin'    => $rango['hora_fin'],
                    'precio'      => $rango['precio'],
                    'disponible'  => $rango['disponible'] ?? true,
                ]);
            }
        }

        return redirect()->route('espacios.index')
            ->with('success', "Espacio «{$espacio->nombre}» actualizado.");
    }

    // ─── Eliminar ─────────────────────────────────────────────────────────────

    public function destroy(Espacio $espacio): RedirectResponse
    {
        $this->soloDueno();
        abort_if($espacio->academia_id !== auth()->user()->academia_id, 403);

        // No eliminar si tiene reservas activas
        $tieneReservasActivas = $espacio->reservas()
            ->where('estado', 'confirmada')
            ->exists();

        if ($tieneReservasActivas) {
            return back()->withErrors(['espacio' => 'No se puede eliminar: tiene reservas activas.']);
        }

        $espacio->delete();

        return redirect()->route('espacios.index')
            ->with('success', 'Espacio eliminado.');
    }
}
