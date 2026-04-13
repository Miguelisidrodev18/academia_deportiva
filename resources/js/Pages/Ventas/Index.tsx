import { Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Producto { id: number; nombre: string; precio: string }
interface Usuario { id: number; name: string }

interface Venta {
    id: number;
    cantidad: number;
    total: string;
    fecha: string;
    producto: Producto;
    registrado_por: Usuario;
}

interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    ventas: Paginator<Venta>;
    productos: { id: number; nombre: string }[];
    totalPeriodo: number;
    filters: { fecha?: string; producto_id?: string };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatFecha(f: string) {
    return new Date(f + 'T00:00:00').toLocaleDateString('es-PE', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function VentasIndex({ ventas, productos, totalPeriodo, filters }: Props) {
    const { flash } = usePage().props as any;

    function filtrar(campo: string, valor: string) {
        router.get(route('ventas.index'), { ...filters, [campo]: valor }, {
            preserveState: true, replace: true,
        });
    }

    return (
        <AppLayout title="Ventas">
            <div className="max-w-5xl mx-auto">

                {/* Encabezado */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary">Ventas del kiosco</h1>
                        <p className="text-muted text-sm mt-1">Historial de ventas de productos.</p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href={route('productos.index')}
                            className="border border-gray-300 hover:bg-gray-50 text-secondary px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                            🛒 Productos
                        </Link>
                        <Link
                            href={route('ventas.create')}
                            className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            + Registrar venta
                        </Link>
                    </div>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="bg-green-50 border border-green-300 text-green-700 rounded-lg px-4 py-3 mb-5 text-sm">
                        {flash.success}
                    </div>
                )}

                {/* Filtros + resumen */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5 flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-xs text-muted mb-1">Fecha</label>
                        <input
                            type="date"
                            value={filters.fecha ?? ''}
                            onChange={e => filtrar('fecha', e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1">Producto</label>
                        <select
                            value={filters.producto_id ?? ''}
                            onChange={e => filtrar('producto_id', e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Todos</option>
                            {productos.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {/* Resumen de totales */}
                    <div className="ml-auto text-right">
                        <p className="text-xs text-muted">Total del período filtrado</p>
                        <p className="text-xl font-bold text-secondary">
                            S/ {totalPeriodo.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                {/* Tabla / vacío */}
                {ventas.data.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-muted">
                        <p className="text-4xl mb-3">🧾</p>
                        <p className="font-medium text-secondary mb-1">Sin ventas para los filtros seleccionados</p>
                        <Link
                            href={route('ventas.create')}
                            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium mt-3 inline-block"
                        >
                            Registrar primera venta
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Producto</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted uppercase">Cantidad</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase">Total</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Fecha</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Registrado por</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {ventas.data.map(v => (
                                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3 font-medium text-secondary">{v.producto.nombre}</td>
                                        <td className="px-4 py-3 text-center text-secondary">{v.cantidad}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-secondary">
                                            S/ {parseFloat(v.total).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-4 py-3 text-muted">{formatFecha(v.fecha)}</td>
                                        <td className="px-4 py-3 text-muted">{v.registrado_por.name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Paginación */}
                        {ventas.last_page > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                                <p className="text-xs text-muted">Total: {ventas.total} ventas</p>
                                <div className="flex gap-1">
                                    {ventas.links.map((link, i) => (
                                        link.url ? (
                                            <Link
                                                key={i} href={link.url}
                                                className={`text-xs px-2 py-1 rounded ${link.active ? 'bg-primary text-white' : 'text-secondary hover:bg-gray-100'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <span key={i} className="text-xs px-2 py-1 text-muted" dangerouslySetInnerHTML={{ __html: link.label }} />
                                        )
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
