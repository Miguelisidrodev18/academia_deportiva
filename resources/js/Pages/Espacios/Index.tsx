import { Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface RangoHorario {
    id: number;
    dia_semana: number; // 1=Lun … 7=Dom
    hora_inicio: string;
    hora_fin: string;
    precio: string;
    disponible: boolean;
}

interface Espacio {
    id: number;
    nombre: string;
    descripcion: string | null;
    equipamiento_base: { nombre: string; cantidad: number }[];
    rangos_horarios: RangoHorario[];
    reservas_count: number;
}

interface Props {
    espacios: Espacio[];
    flash?: { success?: string; error?: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DIA_LABEL: Record<number, string> = {
    1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb', 7: 'Dom',
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EspaciosIndex({ espacios }: Props) {
    const { flash } = usePage().props as any;

    function handleEliminar(espacio: Espacio) {
        if (!confirm(`¿Eliminar "${espacio.nombre}"? Esta acción no se puede deshacer.`)) return;
        router.delete(route('espacios.destroy', espacio.id));
    }

    return (
        <AppLayout title="Espacios">
            <div className="max-w-5xl mx-auto">

                {/* Encabezado */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary">Espacios para alquilar</h1>
                        <p className="text-muted text-sm mt-1">Canchas, salones y otros espacios disponibles para reserva.</p>
                    </div>
                    <Link
                        href={route('espacios.create')}
                        className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        + Nuevo espacio
                    </Link>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="bg-green-50 border border-success text-success rounded-lg px-4 py-3 mb-5 text-sm">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-red-50 border border-danger text-danger rounded-lg px-4 py-3 mb-5 text-sm">
                        {flash.error}
                    </div>
                )}

                {/* Lista de espacios */}
                {espacios.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-muted">
                        <p className="text-4xl mb-3">🏟️</p>
                        <p className="font-medium text-secondary mb-1">Sin espacios creados</p>
                        <p className="text-sm mb-4">Crea el primer espacio para empezar a recibir reservas.</p>
                        <Link href={route('espacios.create')} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium">
                            Crear primer espacio
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {espacios.map(espacio => (
                            <div key={espacio.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-5 py-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-white font-bold text-lg">{espacio.nombre}</h2>
                                        <span className="text-xs text-slate-300 bg-slate-600 px-2 py-1 rounded-full">
                                            {espacio.reservas_count} reservas
                                        </span>
                                    </div>
                                    {espacio.descripcion && (
                                        <p className="text-slate-300 text-xs mt-1 truncate">{espacio.descripcion}</p>
                                    )}
                                </div>

                                <div className="p-4 space-y-3">
                                    {/* Equipamiento base */}
                                    {espacio.equipamiento_base && espacio.equipamiento_base.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Equipamiento incluido</p>
                                            <div className="flex flex-wrap gap-1">
                                                {espacio.equipamiento_base.map((eq, i) => (
                                                    <span key={i} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
                                                        {eq.nombre} × {eq.cantidad}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Rangos horarios */}
                                    {espacio.rangos_horarios.length > 0 ? (
                                        <div>
                                            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">Horarios disponibles</p>
                                            <div className="space-y-1">
                                                {espacio.rangos_horarios.map(rango => (
                                                    <div key={rango.id} className="flex items-center justify-between text-xs">
                                                        <span className="text-secondary">
                                                            <span className="font-medium">{DIA_LABEL[rango.dia_semana] ?? '?'}</span>
                                                            {' '}{rango.hora_inicio}–{rango.hora_fin}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-muted">
                                                                ${parseFloat(rango.precio).toLocaleString('es-AR')}
                                                            </span>
                                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                                                rango.disponible ? 'bg-green-100 text-success' : 'bg-gray-100 text-muted'
                                                            }`}>
                                                                {rango.disponible ? 'Activo' : 'Inactivo'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted">Sin rangos horarios definidos.</p>
                                    )}

                                    {/* Acciones */}
                                    <div className="flex gap-2 pt-1 border-t border-gray-100">
                                        <Link
                                            href={route('espacios.edit', espacio.id)}
                                            className="flex-1 text-center text-xs text-secondary border border-gray-200 hover:bg-gray-50 py-1.5 rounded-lg transition-colors"
                                        >
                                            ✏️ Editar
                                        </Link>
                                        <Link
                                            href={route('reservas.create', { espacio_id: espacio.id })}
                                            className="flex-1 text-center text-xs text-white bg-primary hover:bg-orange-600 py-1.5 rounded-lg transition-colors"
                                        >
                                            📅 Nueva reserva
                                        </Link>
                                        <button
                                            onClick={() => handleEliminar(espacio)}
                                            className="text-xs text-danger hover:bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            🗑
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
