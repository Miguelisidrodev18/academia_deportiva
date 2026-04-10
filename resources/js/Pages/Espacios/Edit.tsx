import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface EquipItem { nombre: string; cantidad: number }
interface RangoItem { id?: number; dia_semana: number; hora_inicio: string; hora_fin: string; precio: string; disponible: boolean }

interface Espacio {
    id: number;
    nombre: string;
    descripcion: string | null;
    equipamiento_base: EquipItem[];
    rangos_horarios: (RangoItem & { id: number })[];
}

interface Props { espacio: Espacio }

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DIAS = [
    { value: 1, label: 'Lun' }, { value: 2, label: 'Mar' }, { value: 3, label: 'Mié' },
    { value: 4, label: 'Jue' }, { value: 5, label: 'Vie' }, { value: 6, label: 'Sáb' }, { value: 7, label: 'Dom' },
];

// ─── Componente ───────────────────────────────────────────────────────────────

interface FormData {
    nombre: string;
    descripcion: string;
    equipamiento_base: EquipItem[];
    rangos_horarios: RangoItem[];
}

export default function EspaciosEdit({ espacio }: Props) {
    const { data, setData, put, processing, errors } = useForm<FormData>({
        nombre: espacio.nombre,
        descripcion: espacio.descripcion ?? '',
        equipamiento_base: espacio.equipamiento_base ?? [],
        rangos_horarios: espacio.rangos_horarios.map(r => ({
            id: r.id,
            dia_semana: r.dia_semana,
            hora_inicio: r.hora_inicio,
            hora_fin: r.hora_fin,
            precio: r.precio,
            disponible: r.disponible,
        })),
    });

    function agregarEquip() { setData('equipamiento_base', [...data.equipamiento_base, { nombre: '', cantidad: 1 }]); }
    function actualizarEquip(i: number, f: keyof EquipItem, v: string | number) { const u = [...data.equipamiento_base]; u[i] = { ...u[i], [f]: v }; setData('equipamiento_base', u); }
    function quitarEquip(i: number) { setData('equipamiento_base', data.equipamiento_base.filter((_, idx) => idx !== i)); }

    function agregarRango() { setData('rangos_horarios', [...data.rangos_horarios, { dia_semana: 1, hora_inicio: '09:00', hora_fin: '10:00', precio: '', disponible: true }]); }
    function actualizarRango(i: number, f: string, v: string | number | boolean) { const u = [...data.rangos_horarios]; u[i] = { ...u[i], [f]: v }; setData('rangos_horarios', u); }
    function quitarRango(i: number) { setData('rangos_horarios', data.rangos_horarios.filter((_, idx) => idx !== i)); }

    function handleSubmit(e: React.FormEvent) { e.preventDefault(); put(route('espacios.update', espacio.id)); }

    return (
        <AppLayout title={`Editar – ${espacio.nombre}`}>
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <Link href={route('espacios.index')} className="text-muted text-sm hover:text-secondary">← Volver a Espacios</Link>
                    <h1 className="text-2xl font-bold text-secondary mt-2">Editar: {espacio.nombre}</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Datos básicos */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
                        <h2 className="font-semibold text-secondary text-sm uppercase tracking-wide">Datos del espacio</h2>
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">Nombre <span className="text-danger">*</span></label>
                            <input type="text" value={data.nombre} onChange={e => setData('nombre', e.target.value)}
                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition ${errors.nombre ? 'border-danger' : 'border-gray-300'}`} />
                            {errors.nombre && <p className="text-danger text-xs mt-1">{errors.nombre}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">Descripción</label>
                            <textarea value={data.descripcion} onChange={e => setData('descripcion', e.target.value)}
                                rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition resize-none" />
                        </div>
                    </div>

                    {/* Equipamiento base */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-semibold text-secondary text-sm uppercase tracking-wide">Equipamiento incluido</h2>
                            <button type="button" onClick={agregarEquip} className="text-xs text-primary hover:underline">+ Agregar ítem</button>
                        </div>
                        {data.equipamiento_base.length === 0 ? (
                            <p className="text-xs text-muted">Sin equipamiento.</p>
                        ) : (
                            <div className="space-y-2">
                                {data.equipamiento_base.map((eq, i) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <input type="text" value={eq.nombre} placeholder="Nombre del ítem"
                                            onChange={e => actualizarEquip(i, 'nombre', e.target.value)}
                                            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                        <input type="number" min={1} value={eq.cantidad}
                                            onChange={e => actualizarEquip(i, 'cantidad', parseInt(e.target.value) || 1)}
                                            className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary" />
                                        <button type="button" onClick={() => quitarEquip(i)} className="text-danger text-sm px-1">✕</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Rangos horarios */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-semibold text-secondary text-sm uppercase tracking-wide">Rangos horarios</h2>
                            <button type="button" onClick={agregarRango} className="text-xs text-primary hover:underline">+ Agregar rango</button>
                        </div>
                        {data.rangos_horarios.length === 0 ? (
                            <p className="text-xs text-muted">Sin rangos horarios.</p>
                        ) : (
                            <div className="space-y-3">
                                {data.rangos_horarios.map((rango, i) => (
                                    <div key={i} className="border border-gray-100 rounded-lg p-3 bg-gray-50 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-secondary">Rango {i + 1} {rango.id ? <span className="text-muted">(ID #{rango.id})</span> : ''}</span>
                                            <button type="button" onClick={() => quitarRango(i)} className="text-danger text-xs hover:text-red-700">✕ Quitar</button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs text-muted mb-1">Día</label>
                                                <select value={rango.dia_semana} onChange={e => actualizarRango(i, 'dia_semana', parseInt(e.target.value))}
                                                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary">
                                                    {DIAS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-muted mb-1">Precio ($)</label>
                                                <input type="number" min={0} value={rango.precio} placeholder="0"
                                                    onChange={e => actualizarRango(i, 'precio', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-muted mb-1">Hora inicio</label>
                                                <input type="time" value={rango.hora_inicio} onChange={e => actualizarRango(i, 'hora_inicio', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-muted mb-1">Hora fin</label>
                                                <input type="time" value={rango.hora_fin} onChange={e => actualizarRango(i, 'hora_fin', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                            </div>
                                        </div>
                                        <label className="flex items-center gap-2 text-xs text-secondary cursor-pointer">
                                            <input type="checkbox" checked={rango.disponible} onChange={e => actualizarRango(i, 'disponible', e.target.checked)} className="rounded" />
                                            Disponible para reservas
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3">
                        <button type="submit" disabled={processing || !data.nombre}
                            className="flex-1 bg-primary hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-medium transition-colors">
                            {processing ? 'Guardando...' : '✓ Guardar cambios'}
                        </button>
                        <Link href={route('espacios.index')}
                            className="flex-1 text-center border border-gray-300 hover:bg-gray-50 text-secondary py-2 rounded-lg text-sm font-medium transition-colors">
                            Cancelar
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
