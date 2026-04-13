import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ProductosCreate() {
    const [form, setForm] = useState({ nombre: '', precio: '', stock: '0' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [procesando, setProcesando] = useState(false);

    function handleChange(field: string, value: string) {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrors({});
        setProcesando(true);

        router.post(route('productos.store'), form, {
            onError: (err) => { setErrors(err); setProcesando(false); },
        });
    }

    return (
        <AppLayout title="Nuevo producto">
            <div className="max-w-lg mx-auto">

                {/* Breadcrumb */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href={route('productos.index')} className="text-muted hover:text-secondary text-sm">
                        ← Productos
                    </Link>
                    <span className="text-muted">/</span>
                    <h1 className="text-xl font-bold text-secondary">Nuevo producto</h1>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">

                        {/* Nombre */}
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">
                                Nombre <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.nombre}
                                onChange={e => handleChange('nombre', e.target.value)}
                                placeholder="Ej: Gaseosa 500ml, Alfajor, Agua mineral…"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
                        </div>

                        {/* Precio */}
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">
                                Precio unitario ($) <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.precio}
                                onChange={e => handleChange('precio', e.target.value)}
                                placeholder="0.00"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            {errors.precio && <p className="text-xs text-red-500 mt-1">{errors.precio}</p>}
                        </div>

                        {/* Stock inicial */}
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">
                                Stock inicial <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={form.stock}
                                onChange={e => handleChange('stock', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock}</p>}
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex justify-end gap-3 mt-5">
                        <Link
                            href={route('productos.index')}
                            className="border border-gray-300 hover:bg-gray-50 text-secondary px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={procesando}
                            className="bg-primary hover:bg-orange-600 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            {procesando ? 'Guardando…' : 'Crear producto'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
