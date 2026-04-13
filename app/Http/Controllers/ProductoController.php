<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductoController extends Controller
{
    // Solo el dueño puede gestionar el catálogo de productos
    private function authorize(): void
    {
        abort_unless(auth()->user()->esDueno(), 403);
    }

    // ─── Listado ──────────────────────────────────────────────────────────────

    public function index(): Response
    {
        $this->authorize();

        $productos = Producto::where('academia_id', auth()->user()->academia_id)
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'precio', 'stock']);

        return Inertia::render('Productos/Index', [
            'productos' => $productos,
        ]);
    }

    // ─── Formulario de alta ───────────────────────────────────────────────────

    public function create(): Response
    {
        $this->authorize();
        return Inertia::render('Productos/Create');
    }

    // ─── Guardar producto nuevo ───────────────────────────────────────────────

    public function store(Request $request): RedirectResponse
    {
        $this->authorize();

        $data = $request->validate([
            'nombre' => 'required|string|max:120',
            'precio' => 'required|numeric|min:0',
            'stock'  => 'required|integer|min:0',
        ]);

        Producto::create([
            'academia_id' => auth()->user()->academia_id,
            'nombre'      => $data['nombre'],
            'precio'      => $data['precio'],
            'stock'       => $data['stock'],
        ]);

        return redirect()->route('productos.index')
            ->with('success', "Producto «{$data['nombre']}» creado correctamente.");
    }

    // ─── Formulario de edición ────────────────────────────────────────────────

    public function edit(Producto $producto): Response
    {
        $this->authorize();
        $this->authorizeProducto($producto);

        return Inertia::render('Productos/Edit', [
            'producto' => $producto->only('id', 'nombre', 'precio', 'stock'),
        ]);
    }

    // ─── Guardar cambios ──────────────────────────────────────────────────────

    public function update(Request $request, Producto $producto): RedirectResponse
    {
        $this->authorize();
        $this->authorizeProducto($producto);

        $data = $request->validate([
            'nombre' => 'required|string|max:120',
            'precio' => 'required|numeric|min:0',
            'stock'  => 'required|integer|min:0',
        ]);

        $producto->update($data);

        return redirect()->route('productos.index')
            ->with('success', "Producto «{$data['nombre']}» actualizado.");
    }

    // ─── Eliminar producto ────────────────────────────────────────────────────

    public function destroy(Producto $producto): RedirectResponse
    {
        $this->authorize();
        $this->authorizeProducto($producto);

        $nombre = $producto->nombre;
        $producto->delete();

        return redirect()->route('productos.index')
            ->with('success', "Producto «{$nombre}» eliminado.");
    }

    // ─── Helper: verificar que el producto es de esta academia ───────────────

    private function authorizeProducto(Producto $producto): void
    {
        abort_if($producto->academia_id !== auth()->user()->academia_id, 403);
    }
}
