import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Equipamiento {
    id: number;
    nombre: string;
    tipo: string;
    stock_disponible: number;
}

interface Props {
    equipamientos: Equipamiento[];
    fechaHoy: string;
}

// Un ítem en la lista dinámica del formulario
interface ItemForm {
    equipamiento_id: number | '';
    cantidad: number;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function PrestamosCreate({ equipamientos, fechaHoy }: Props) {
    const [form, setForm] = useState({
        solicitante_nombre:        '',
        solicitante_tipo:          'alumno' as 'alumno' | 'externo',
        fecha_prestamo:            fechaHoy,
        fecha_devolucion_esperada: '',
    });

    // Lista dinámica de ítems: empieza con una fila vacía
    const [items, setItems] = useState<ItemForm[]>([{ equipamiento_id: '', cantidad: 1 }]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [procesando, setProcesando] = useState(false);

    // ── Handlers del encabezado ───────────────────────────────────────────────

    function handleChange(field: string, value: string) {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    // ── Handlers de los ítems dinámicos ──────────────────────────────────────

    function agregarItem() {
        setItems(prev => [...prev, { equipamiento_id: '', cantidad: 1 }]);
    }

    function quitarItem(index: number) {
        setItems(prev => prev.filter((_, i) => i !== index));
    }

    function updateItem(index: number, field: keyof ItemForm, value: string | number) {
        setItems(prev => prev.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        ));
    }

    // Devuelve el stock disponible del equipamiento seleccionado en una fila
    function stockDe(equipamientoId: number | ''): number | null {
        if (!equipamientoId) return null;
        const eq = equipamientos.find(e => e.id === equipamientoId);
        return eq ? eq.stock_disponible : null;
    }

    // ── Envío del formulario ──────────────────────────────────────────────────

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrors({});

        // Validaciones locales antes de enviar
        if (!form.solicitante_nombre.trim()) {
            setErrors({ solicitante_nombre: 'El nombre es obligatorio.' });
            return;
        }
        if (!form.fecha_devolucion_esperada) {
            setErrors({ fecha_devolucion_esperada: 'La fecha de devolución es obligatoria.' });
            return;
        }
        if (items.some(item => !item.equipamiento_id)) {
            setErrors({ items: 'Seleccioná el equipamiento en todas las filas.' });
            return;
        }

        setProcesando(true);

        router.post(route('prestamos.store'), { ...form, items: items as any }, {
            onError: (err) => {
                setErrors(err);
                setProcesando(false);
            },
        });
    }

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <AppLayout title="Nuevo préstamo">
            <div className="max-w-2xl mx-auto">

                {/* Encabezado */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href={route('prestamos.index')} className="text-muted hover:text-secondary text-sm">
                        ← Préstamos
                    </Link>
                    <span className="text-muted">/</span>
                    <h1 className="text-xl font-bold text-secondary">Nuevo préstamo</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Tarjeta: datos del solicitante */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-sm font-semibold text-secondary mb-4 uppercase tracking-wide">
                            Solicitante
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Nombre */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-secondary mb-1">
                                    Nombre completo <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.solicitante_nombre}
                                    onChange={e => handleChange('solicitante_nombre', e.target.value)}
                                    placeholder="Ej: Juan Pérez"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                {errors.solicitante_nombre && (
                                    <p className="text-xs text-red-500 mt-1">{errors.solicitante_nombre}</p>
                                )}
                            </div>

                            {/* Tipo */}
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1">Tipo</label>
                                <select
                                    value={form.solicitante_tipo}
                                    onChange={e => handleChange('solicitante_tipo', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="alumno">Alumno de la academia</option>
                                    <option value="externo">Externo</option>
                                </select>
                            </div>

                            {/* Fecha préstamo */}
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1">
                                    Fecha de préstamo <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={form.fecha_prestamo}
                                    onChange={e => handleChange('fecha_prestamo', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            {/* Fecha devolución esperada */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-secondary mb-1">
                                    Devolución esperada <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={form.fecha_devolucion_esperada}
                                    min={form.fecha_prestamo}
                                    onChange={e => handleChange('fecha_devolucion_esperada', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                {errors.fecha_devolucion_esperada && (
                                    <p className="text-xs text-red-500 mt-1">{errors.fecha_devolucion_esperada}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tarjeta: ítems de equipamiento */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-sm font-semibold text-secondary mb-4 uppercase tracking-wide">
                            Equipamiento a prestar
                        </h2>

                        {/* Error general de ítems */}
                        {errors.items && (
                            <p className="text-xs text-red-500 mb-3 bg-red-50 px-3 py-2 rounded-lg">{errors.items}</p>
                        )}

                        <div className="space-y-3">
                            {items.map((item, index) => {
                                const stock = stockDe(item.equipamiento_id);
                                return (
                                    <div key={index} className="flex gap-3 items-start">

                                        {/* Selector de equipamiento */}
                                        <div className="flex-1">
                                            <select
                                                value={item.equipamiento_id}
                                                onChange={e => updateItem(index, 'equipamiento_id', Number(e.target.value))}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                                            >
                                                <option value="">-- Seleccionar equipamiento --</option>
                                                {equipamientos.map(eq => (
                                                    <option key={eq.id} value={eq.id}>
                                                        {eq.nombre} ({eq.tipo}) — {eq.stock_disponible} disponible(s)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Cantidad */}
                                        <div className="w-24">
                                            <input
                                                type="number"
                                                min={1}
                                                max={stock ?? undefined}
                                                value={item.cantidad}
                                                onChange={e => updateItem(index, 'cantidad', Math.max(1, Number(e.target.value)))}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="Cant."
                                            />
                                        </div>

                                        {/* Botón quitar (solo si hay más de 1 fila) */}
                                        {items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => quitarItem(index)}
                                                className="mt-0.5 text-red-400 hover:text-red-600 text-lg leading-none px-1"
                                                title="Quitar ítem"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Botón para agregar más ítems */}
                        <button
                            type="button"
                            onClick={agregarItem}
                            className="mt-4 text-sm text-primary hover:underline flex items-center gap-1"
                        >
                            + Agregar otro ítem
                        </button>
                    </div>

                    {/* Acciones */}
                    <div className="flex justify-end gap-3">
                        <Link
                            href={route('prestamos.index')}
                            className="border border-gray-300 hover:bg-gray-50 text-secondary px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={procesando}
                            className="bg-primary hover:bg-orange-600 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            {procesando ? 'Guardando…' : 'Registrar préstamo'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
