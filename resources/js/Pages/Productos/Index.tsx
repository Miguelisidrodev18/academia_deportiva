import { Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Producto {
    id: number;
    nombre: string;
    precio: string;
    stock: number;
}

interface Props {
    productos: Producto[];
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ProductosIndex({ productos }: Props) {
    const { flash } = usePage().props as any;

    function eliminar(producto: Producto) {
        if (!confirm(`¿Eliminar «${producto.nombre}»? Esta acción no se puede deshacer.`)) return;
        router.delete(route('productos.destroy', producto.id));
    }

    return (
        <AppLayout title="Productos">
            <div className="max-w-4xl mx-auto">

                {/* Encabezado */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary">Catálogo de productos</h1>
                        <p className="text-muted text-sm mt-1">
                            Productos del kiosco o cantina de la academia.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={route('ventas.index')}
                            className="border border-gray-300 hover:bg-gray-50 text-secondary px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                            🧾 Ver ventas
                        </Link>
                        <Link
                            href={route('productos.create')}
                            className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            + Nuevo producto
                        </Link>
                    </div>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="bg-green-50 border border-green-300 text-green-700 rounded-lg px-4 py-3 mb-5 text-sm">
                        {flash.success}
                    </div>
                )}

                {/* Alertas de stock bajo */}
                {productos.filter(p => p.stock < 5 && p.stock > 0).length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg px-4 py-3 mb-5 text-sm">
                        ⚠️ <strong>Stock bajo:</strong>{' '}
                        {productos.filter(p => p.stock < 5 && p.stock > 0).map(p => p.nombre).join(', ')}.
                        Considerá reabastecer.
                    </div>
                )}
                {productos.filter(p => p.stock === 0).length > 0 && (
                    <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
                        ❌ <strong>Sin stock:</strong>{' '}
                        {productos.filter(p => p.stock === 0).map(p => p.nombre).join(', ')}.
                    </div>
                )}

                {/* Tabla / vacío */}
                {productos.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-muted">
                        <p className="text-4xl mb-3">🛒</p>
                        <p className="font-medium text-secondary mb-1">Sin productos cargados aún</p>
                        <Link
                            href={route('productos.create')}
                            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium mt-3 inline-block"
                        >
                            Agregar primer producto
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Producto</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase">Precio</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted uppercase">Stock</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {productos.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3 font-medium text-secondary">{p.nombre}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-secondary">
                                            S/ {parseFloat(p.precio).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {/* Semáforo visual de stock */}
                                            <span className={`inline-block font-semibold text-sm px-2 py-0.5 rounded-full ${
                                                p.stock === 0
                                                    ? 'bg-red-100 text-red-700'
                                                    : p.stock < 5
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-green-100 text-green-700'
                                            }`}>
                                                {p.stock}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3 justify-end">
                                                <Link
                                                    href={route('productos.edit', p.id)}
                                                    className="text-xs text-primary hover:underline"
                                                >
                                                    Editar
                                                </Link>
                                                <button
                                                    onClick={() => eliminar(p)}
                                                    className="text-xs text-red-400 hover:text-red-600 hover:underline"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Total de productos al pie */}
                        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-muted">
                            {productos.length} producto(s) en catálogo
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
