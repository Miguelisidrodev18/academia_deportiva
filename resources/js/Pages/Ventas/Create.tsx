import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
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
    fechaHoy: string;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function VentasCreate({ productos, fechaHoy }: Props) {
    const [form, setForm] = useState({
        producto_id: '' as number | '',
        cantidad:    1,
        fecha:       fechaHoy,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [procesando, setProcesando] = useState(false);

    // El producto seleccionado actualmente
    const productoSeleccionado = productos.find(p => p.id === form.producto_id) ?? null;

    // Total calculado en tiempo real
    const totalCalculado = productoSeleccionado
        ? (parseFloat(productoSeleccionado.precio) * form.cantidad).toLocaleString('es-PE', {
            minimumFractionDigits: 2,
          })
        : null;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrors({});
        setProcesando(true);

        router.post(route('ventas.store'), form, {
            onError: (err) => { setErrors(err); setProcesando(false); },
        });
    }

    return (
        <AppLayout title="Registrar venta">
            <div className="max-w-lg mx-auto">

                {/* Breadcrumb */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href={route('ventas.index')} className="text-muted hover:text-secondary text-sm">
                        ← Ventas
                    </Link>
                    <span className="text-muted">/</span>
                    <h1 className="text-xl font-bold text-secondary">Registrar venta</h1>
                </div>

                {/* Aviso si no hay productos */}
                {productos.length === 0 && (
                    <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg px-4 py-4 mb-5 text-sm">
                        ⚠️ No hay productos con stock disponible.{' '}
                        <Link href={route('productos.index')} className="underline font-medium">
                            Administrar productos →
                        </Link>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">

                        {/* Selector de producto */}
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">
                                Producto <span className="text-red-400">*</span>
                            </label>
                            <select
                                value={form.producto_id}
                                onChange={e => setForm(prev => ({ ...prev, producto_id: Number(e.target.value), cantidad: 1 }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">-- Seleccioná un producto --</option>
                                {productos.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.nombre} — S/ {parseFloat(p.precio).toLocaleString('es-PE', { minimumFractionDigits: 2 })} (stock: {p.stock})
                                    </option>
                                ))}
                            </select>
                            {errors.producto_id && <p className="text-xs text-red-500 mt-1">{errors.producto_id}</p>}
                        </div>

                        {/* Cantidad */}
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">
                                Cantidad <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={productoSeleccionado?.stock ?? undefined}
                                value={form.cantidad}
                                onChange={e => setForm(prev => ({ ...prev, cantidad: Math.max(1, Number(e.target.value)) }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            {productoSeleccionado && (
                                <p className="text-xs text-muted mt-1">
                                    Máximo disponible: {productoSeleccionado.stock} unidades
                                </p>
                            )}
                            {errors.cantidad && <p className="text-xs text-red-500 mt-1">{errors.cantidad}</p>}
                        </div>

                        {/* Fecha */}
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">
                                Fecha de venta <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="date"
                                value={form.fecha}
                                onChange={e => setForm(prev => ({ ...prev, fecha: e.target.value }))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            {errors.fecha && <p className="text-xs text-red-500 mt-1">{errors.fecha}</p>}
                        </div>

                        {/* Preview del total */}
                        {totalCalculado && (
                            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted">Total a cobrar</p>
                                    <p className="text-2xl font-bold text-primary">S/ {totalCalculado}</p>
                                </div>
                                <div className="text-right text-xs text-muted">
                                    <p>{form.cantidad} × S/ {parseFloat(productoSeleccionado!.precio).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                                    <p className="mt-0.5 text-secondary font-medium">{productoSeleccionado!.nombre}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Acciones */}
                    <div className="flex justify-end gap-3 mt-5">
                        <Link
                            href={route('ventas.index')}
                            className="border border-gray-300 hover:bg-gray-50 text-secondary px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={procesando || !form.producto_id}
                            className="bg-primary hover:bg-orange-600 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            {procesando ? 'Guardando…' : 'Confirmar venta'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
