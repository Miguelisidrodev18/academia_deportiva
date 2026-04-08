import { Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Disciplina {
    id: number;
    nombre: string;
}

interface Entrenador {
    id: number;
    name: string;
}

interface Taller {
    id: number;
    nombre: string;
    nivel: 'inicial' | 'intermedio' | 'avanzado';
    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
    precio_base: string;
    cupo_maximo: number;
    rango_edad_min: number;
    rango_edad_max: number;
    inscripciones_count: number;
    disciplina: Disciplina;
    entrenador: Entrenador | null;
}

interface Props {
    talleres: Taller[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NIVEL_COLOR: Record<string, string> = {
    inicial:     'bg-green-100 text-green-700',
    intermedio:  'bg-yellow-100 text-yellow-700',
    avanzado:    'bg-red-100 text-red-700',
};

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function TalleresIndex({ talleres }: Props) {
    const { flash } = usePage().props as any;

    function handleEliminar(id: number, nombre: string) {
        if (!confirm(`¿Eliminar el taller "${nombre}"?`)) return;
        router.delete(route('talleres.destroy', id));
    }

    return (
        <AppLayout title="Talleres">
            <div className="max-w-6xl mx-auto">

                {/* Encabezado */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary">Talleres</h1>
                        <p className="text-muted text-sm mt-1">Clases y grupos organizados por disciplina.</p>
                    </div>
                    <Link
                        href={route('talleres.create')}
                        className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        + Nuevo taller
                    </Link>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="bg-green-50 border border-success text-success rounded-lg px-4 py-3 mb-4 text-sm">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-red-50 border border-danger text-danger rounded-lg px-4 py-3 mb-4 text-sm">
                        {flash.error}
                    </div>
                )}

                {/* Listado */}
                {talleres.length === 0 ? (
                    <div className="text-center py-16 text-muted">
                        <p className="text-4xl mb-3">🏋️</p>
                        <p className="text-lg font-medium">Todavía no hay talleres.</p>
                        <p className="text-sm mt-1">Creá el primero para comenzar a inscribir alumnos.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {talleres.map((t) => (
                            <div key={t.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">

                                {/* Encabezado de la card */}
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <div>
                                        <h2 className="font-semibold text-secondary">{t.nombre}</h2>
                                        <p className="text-xs text-muted">{t.disciplina.nombre}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${NIVEL_COLOR[t.nivel]}`}>
                                        {capitalize(t.nivel)}
                                    </span>
                                </div>

                                {/* Detalles en grid */}
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 mb-3">
                                    <span>📅 {capitalize(t.dia_semana)}</span>
                                    <span>🕐 {t.hora_inicio} – {t.hora_fin}</span>
                                    <span>👶 {t.rango_edad_min}–{t.rango_edad_max} años</span>
                                    <span>👤 {t.entrenador?.name ?? 'Sin entrenador'}</span>
                                    <span>💰 ${parseFloat(t.precio_base).toLocaleString('es-AR')}</span>
                                    <span>
                                        🪑 {t.inscripciones_count}/{t.cupo_maximo} inscritos
                                        {t.inscripciones_count >= t.cupo_maximo && (
                                            <span className="ml-1 text-danger font-medium">(lleno)</span>
                                        )}
                                    </span>
                                </div>

                                {/* Acciones */}
                                <div className="flex gap-3 pt-2 border-t border-gray-100">
                                    <Link
                                        href={route('talleres.edit', t.id)}
                                        className="text-blue-600 hover:underline text-xs"
                                    >
                                        Editar
                                    </Link>
                                    <button
                                        onClick={() => handleEliminar(t.id, t.nombre)}
                                        disabled={t.inscripciones_count > 0}
                                        title={t.inscripciones_count > 0 ? 'Tiene inscripciones activas' : ''}
                                        className="text-danger hover:underline text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
