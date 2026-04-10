import { useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface EquipItem {
    nombre: string;
    cantidad: number;
}

interface RangoItem {
    dia_semana: number;
    hora_inicio: string;
    hora_fin: string;
    precio: string;
    disponible: boolean;
}

interface FormData {
    nombre: string;
    descripcion: string;
    equipamiento_base: EquipItem[];
    rangos_horarios: RangoItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DIAS = [
    { value: 1, label: 'Lun' },
    { value: 2, label: 'Mar' },
    { value: 3, label: 'Mié' },
    { value: 4, label: 'Jue' },
    { value: 5, label: 'Vie' },
    { value: 6, label: 'Sáb' },
    { value: 7, label: 'Dom' },
];

const RANGO_VACIO: RangoItem = { dia_semana: 1, hora_inicio: '09:00', hora_fin: '10:00', precio: '', disponible: true };
const EQUIP_VACIO: EquipItem = { nombre: '', cantidad: 1 };

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EspaciosCreate() {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        nombre: '',
        descripcion: '',
        equipamiento_base: [],
        rangos_horarios: [],
    });

    // ── Equipamiento ──────────────────────────────────────────────────────────

    function agregarEquip() {
        setData('equipamiento_base', [...data.equipamiento_base, { ...EQUIP_VACIO }]);
    }

    function actualizarEquip(index: number, field: keyof EquipItem, value: string | number) {
        const updated = [...data.equipamiento_base];
        updated[index] = { ...updated[index], [field]: value };
        setData('equipamiento_base', updated);
    }

    function quitarEquip(index: number) {
        setData('equipamiento_base', data.equipamiento_base.filter((_, i) => i !== index));
    }

    // ── Rangos horarios ───────────────────────────────────────────────────────

    function agregarRango() {
        setData('rangos_horarios', [...data.rangos_horarios, { ...RANGO_VACIO }]);
    }

    function actualizarRango(index: number, field: keyof RangoItem, value: string | number | boolean) {
        const updated = [...data.rangos_horarios];
        updated[index] = { ...updated[index], [field]: value };
        setData('rangos_horarios', updated);
    }

    function quitarRango(index: number) {
        setData('rangos_horarios', data.rangos_horarios.filter((_, i) => i !== index));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('espacios.store'));
    }

    return (
        <AppLayout title="Nuevo Espacio">
            <div className="max-w-2xl mx-auto">

                <div className="mb-6">
                    <Link href={route('espacios.index')} className="text-muted text-sm hover:text-secondary">
                        ← Volver a Espacios
                    </Link>
                    <h1 className="text-2xl font-bold text-secondary mt-2">Nuevo espacio</h1>
                    <p className="text-muted text-sm mt-1">Configura el espacio, su equipamiento y los rangos horarios disponibles.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Datos básicos */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
                        <h2 className="font-semibold text-secondary text-sm uppercase tracking-wide">Datos del espacio</h2>

                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">
                                Nombre <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.nombre}
                                onChange={e => setData('nombre', e.target.value)}
                                placeholder="Ej: Cancha de fútbol 5"
                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition ${errors.nombre ? 'border-danger' : 'border-gray-300'}`}
                            />
                            {errors.nombre && <p className="text-danger text-xs mt-1">{errors.nombre}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">Descripción</label>
                            <textarea
                                value={data.descripcion}
                                onChange={e => setData('descripcion', e.target.value)}
                                placeholder="Superficie, capacidad, características especiales..."
                                rows={2}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition resize-none"
                            />
                        </div>
                    </div>

                    {/* Equipamiento base */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-semibold text-secondary text-sm uppercase tracking-wide">Equipamiento incluido</h2>
                            <button type="button" onClick={agregarEquip} className="text-xs text-primary hover:underline">
                                + Agregar ítem
                            </button>
                        </div>

                        {data.equipamiento_base.length === 0 ? (
                            <p className="text-xs text-muted">Sin equipamiento. Hacé clic en "Agregar ítem" para incluir pelotas, arcos, redes, etc.</p>
                        ) : (
                            <div className="space-y-2">
                                {data.equipamiento_base.map((eq, i) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            value={eq.nombre}
                                            onChange={e => actualizarEquip(i, 'nombre', e.target.value)}
                                            placeholder="Nombre del ítem"
                                            className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                        <input
                                            type="number"
                                            min={1}
                                            value={eq.cantidad}
                                            onChange={e => actualizarEquip(i, 'cantidad', parseInt(e.target.value) || 1)}
                                            className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                        <button type="button" onClick={() => quitarEquip(i)} className="text-danger hover:text-red-700 text-sm px-1">
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Rangos horarios */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-semibold text-secondary text-sm uppercase tracking-wide">Rangos horarios</h2>
                            <button type="button" onClick={agregarRango} className="text-xs text-primary hover:underline">
                                + Agregar rango
                            </button>
                        </div>

                        {data.rangos_horarios.length === 0 ? (
                            <p className="text-xs text-muted">Sin rangos horarios. Agregá los horarios en que el espacio puede ser reservado.</p>
                        ) : (
                            <div className="space-y-3">
                                {data.rangos_horarios.map((rango, i) => (
                                    <div key={i} className="border border-gray-100 rounded-lg p-3 bg-gray-50 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-secondary">Rango {i + 1}</span>
                                            <button type="button" onClick={() => quitarRango(i)} className="text-danger text-xs hover:text-red-700">
                                                ✕ Quitar
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {/* Día */}
                                            <div>
                                                <label className="block text-xs text-muted mb-1">Día</label>
                                                <select
                                                    value={rango.dia_semana}
                                                    onChange={e => actualizarRango(i, 'dia_semana', parseInt(e.target.value))}
                                                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                                                >
                                                    {DIAS.map(d => (
                                                        <option key={d.value} value={d.value}>{d.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {/* Precio */}
                                            <div>
                                                <label className="block text-xs text-muted mb-1">Precio ($)</label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={rango.precio}
                                                    onChange={e => actualizarRango(i, 'precio', e.target.value)}
                                                    placeholder="0"
                                                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                            {/* Hora inicio */}
                                            <div>
                                                <label className="block text-xs text-muted mb-1">Hora inicio</label>
                                                <input
                                                    type="time"
                                                    value={rango.hora_inicio}
                                                    onChange={e => actualizarRango(i, 'hora_inicio', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                            {/* Hora fin */}
                                            <div>
                                                <label className="block text-xs text-muted mb-1">Hora fin</label>
                                                <input
                                                    type="time"
                                                    value={rango.hora_fin}
                                                    onChange={e => actualizarRango(i, 'hora_fin', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                        </div>
                                        {/* Disponible toggle */}
                                        <label className="flex items-center gap-2 text-xs text-secondary cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={rango.disponible}
                                                onChange={e => actualizarRango(i, 'disponible', e.target.checked)}
                                                className="rounded"
                                            />
                                            Disponible para reservas
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={processing || !data.nombre}
                            className="flex-1 bg-primary hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            {processing ? 'Guardando...' : '✓ Crear espacio'}
                        </button>
                        <Link
                            href={route('espacios.index')}
                            className="flex-1 text-center border border-gray-300 hover:bg-gray-50 text-secondary py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Cancelar
                        </Link>
                    </div>

                </form>
            </div>
        </AppLayout>
    );
}
