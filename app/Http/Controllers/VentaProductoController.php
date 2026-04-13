<?php

namespace App\Http\Controllers;

use App\Models\LogAuditoria;
use App\Models\Producto;
use App\Models\VentaProducto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VentaProductoController extends Controller
{
    // Pueden acceder el dueño y el admin de caja
    private function authorize(): void
    {
        $user = auth()->user();
        abort_unless($user->esDueno() || $user->rol === 'admin_caja', 403);
    }

    // ─── Historial de ventas ──────────────────────────────────────────────────

    public function index(Request $request): Response
    {
        $this->authorize();

        $academiaId = auth()->user()->academia_id;

        $ventas = VentaProducto::whereHas('producto', fn($q) =>
                $q->where('academia_id', $academiaId)
            )
            // Filtro por fecha
            ->when($request->filled('fecha'), fn($q) =>
                $q->where('fecha', $request->fecha)
            )
            // Filtro por producto
            ->when($request->filled('producto_id'), fn($q) =>
                $q->where('producto_id', $request->producto_id)
            )
            ->with([
                'producto:id,nombre,precio',
                'registradoPor:id,name',
            ])
            ->orderBy('fecha', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(25)
            ->withQueryString();

        // Productos disponibles para el filtro del listado
        $productos = Producto::where('academia_id', $academiaId)
            ->orderBy('nombre')
            ->get(['id', 'nombre']);

        // Totales del período filtrado (para el resumen)
        $totalPeriodo = VentaProducto::whereHas('producto', fn($q) =>
                $q->where('academia_id', $academiaId)
            )
            ->when($request->filled('fecha'), fn($q) =>
                $q->where('fecha', $request->fecha)
            )
            ->when($request->filled('producto_id'), fn($q) =>
                $q->where('producto_id', $request->producto_id)
            )
            ->sum('total');

        return Inertia::render('Ventas/Index', [
            'ventas'       => $ventas,
            'productos'    => $productos,
            'totalPeriodo' => (float) $totalPeriodo,
            'filters'      => [
                'fecha'      => $request->fecha,
                'producto_id' => $request->producto_id,
            ],
        ]);
    }

    // ─── Formulario para registrar venta ─────────────────────────────────────

    public function create(): Response
    {
        $this->authorize();

        // Solo productos con stock disponible pueden venderse
        $productos = Producto::where('academia_id', auth()->user()->academia_id)
            ->where('stock', '>', 0)
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'precio', 'stock']);

        return Inertia::render('Ventas/Create', [
            'productos' => $productos,
            'fechaHoy'  => now()->toDateString(),
        ]);
    }

    // ─── Registrar venta ──────────────────────────────────────────────────────

    public function store(Request $request): RedirectResponse
    {
        $this->authorize();

        $data = $request->validate([
            'producto_id' => 'required|integer',
            'cantidad'    => 'required|integer|min:1',
            'fecha'       => 'required|date',
        ]);

        $academiaId = auth()->user()->academia_id;

        // Verificar que el producto pertenece a la academia
        $producto = Producto::where('academia_id', $academiaId)
            ->findOrFail($data['producto_id']);

        // Verificar stock suficiente
        if ($producto->stock < $data['cantidad']) {
            return back()->withErrors([
                'cantidad' => "Stock insuficiente. Solo quedan {$producto->stock} unidades de «{$producto->nombre}».",
            ]);
        }

        // Calcular total al precio actual del producto
        $total = $producto->precio * $data['cantidad'];

        // Registrar la venta
        VentaProducto::create([
            'producto_id'               => $producto->id,
            'cantidad'                  => $data['cantidad'],
            'total'                     => $total,
            'fecha'                     => $data['fecha'],
            'registrado_por_usuario_id' => auth()->id(),
        ]);

        // Descontar del stock
        $producto->decrement('stock', $data['cantidad']);

        LogAuditoria::registrar(
            'registro_venta',
            "Venta de {$data['cantidad']}× «{$producto->nombre}» — Total: S/ " . number_format($total, 2)
        );

        return redirect()->route('ventas.index')
            ->with('success', "Venta de {$data['cantidad']}× «{$producto->nombre}» registrada. Total: S/ " . number_format($total, 2));
    }
}
