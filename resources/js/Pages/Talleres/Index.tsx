import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import FlashMessages from '@/Components/FlashMessages';
import PageHeader from '@/Components/PageHeader';
import EmptyState from '@/Components/EmptyState';
import { DIA_LABEL } from '@/utils/talleres';
import { getSportIcon, NIVEL_GRADIENT, NIVEL_BADGE, NIVEL_LABEL } from '@/utils/sportIcons';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Disciplina { id: number; nombre: string; }
interface Entrenador { id: number; name: string; }

interface Taller {
    id: number;
    nombre: string;
    nivel: 'inicial' | 'intermedio' | 'avanzado';
    dias_semana: string[];
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

interface Props { talleres: Taller[]; }

// ─── Componente ───────────────────────────────────────────────────────────────

export default function TalleresIndex({ talleres }: Props) {
    function handleEliminar(id: number, nombre: string) {
        if (!confirm(`¿Eliminar el taller "${nombre}"?`)) return;
        router.delete(route('talleres.destroy', id));
    }

    return (
        <AppLayout title="Talleres">
            <div className="max-w-6xl mx-auto">

                <PageHeader
                    title="Talleres"
                    subtitle={talleres.length > 0
                        ? `${talleres.length} ${talleres.length === 1 ? 'taller registrado' : 'talleres registrados'}`
                        : 'Clases y grupos organizados por disciplina.'}
                    ctaHref={route('talleres.create')}
                    ctaLabel="+ Nuevo taller"
                />

                <FlashMessages />

                {talleres.length === 0 ? (
                    <EmptyState
                        icon="🏋️"
                        title="Todavía no hay talleres"
                        description="Creá el primero para comenzar a inscribir alumnos."
                        ctaHref={route('talleres.create')}
                        ctaLabel="+ Crear primer taller"
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {talleres.map((t) => {
                            const pct = Math.round((t.inscripciones_count / t.cupo_maximo) * 100);
                            const disponibles = t.cupo_maximo - t.inscripciones_count;
                            const dias = Array.isArray(t.dias_semana) ? t.dias_semana : [];

                            return (
                                <div
                                    key={t.id}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
                                >
                                    {/* Franja de color por nivel */}
                                    <div className={`h-1.5 bg-gradient-to-r ${NIVEL_GRADIENT[t.nivel] ?? 'from-gray-300 to-gray-400'}`} />

                                    <div className="p-5 flex flex-col flex-1">

                                        {/* Header: emoji + nivel badge */}
                                        <div className="flex items-start justify-between gap-2 mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-3xl leading-none">
                                                    {getSportIcon(t.disciplina.nombre)}
                                                </span>
                                                <div>
                                                    <h2 className="font-semibold text-secondary text-sm leading-tight">
                                                        {t.nombre}
                                                    </h2>
                                                    <p className="text-xs text-muted">{t.disciplina.nombre}</p>
                                                </div>
                                            </div>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${NIVEL_BADGE[t.nivel] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {NIVEL_LABEL[t.nivel] ?? t.nivel}
                                            </span>
                                        </div>

                                        {/* Días */}
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {dias.length > 0 ? dias.map(dia => (
                                                <span key={dia} className="px-2 py-0.5 bg-secondary/10 text-secondary rounded text-[10px] font-medium">
                                                    {DIA_LABEL[dia] ?? dia}
                                                </span>
                                            )) : (
                                                <span className="text-xs text-muted italic">Sin días asignados</span>
                                            )}
                                        </div>

                                        {/* Detalles */}
                                        <div className="space-y-1 text-xs text-gray-500 mb-4">
                                            <div className="flex items-center gap-1.5">
                                                <span>🕐</span>
                                                <span>{t.hora_inicio} – {t.hora_fin}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span>👶</span>
                                                <span>{t.rango_edad_min}–{t.rango_edad_max} años</span>
                                                {t.entrenador && (
                                                    <>
                                                        <span className="text-gray-300">·</span>
                                                        <span>👤 {t.entrenador.name}</span>
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span>💰</span>
                                                <span>${parseFloat(t.precio_base).toLocaleString('es-AR')}</span>
                                            </div>
                                        </div>

                                        {/* Barra de ocupación */}
                                        <div className="mt-auto">
                                            <div className="flex justify-between text-xs text-muted mb-1">
                                                <span>{t.inscripciones_count}/{t.cupo_maximo} inscritos</span>
                                                <span className={disponibles <= 0 ? 'text-danger font-medium' : ''}>
                                                    {disponibles > 0 ? `${disponibles} disponibles` : 'Lleno'}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                <div
                                                    className={`h-1.5 rounded-full transition-all ${
                                                        pct >= 100 ? 'bg-danger' : pct >= 80 ? 'bg-yellow-400' : 'bg-success'
                                                    }`}
                                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Acciones */}
                                        <div className="flex gap-2 pt-4 mt-2 border-t border-gray-100">
                                            <Link
                                                href={route('talleres.show', t.id)}
                                                className="flex-1 text-center text-xs font-medium text-secondary bg-gray-50 hover:bg-gray-100 rounded-lg py-1.5 transition-colors"
                                            >
                                                Ver detalle
                                            </Link>
                                            <Link
                                                href={route('talleres.edit', t.id)}
                                                className="flex-1 text-center text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg py-1.5 transition-colors"
                                            >
                                                Editar
                                            </Link>
                                            <button
                                                onClick={() => handleEliminar(t.id, t.nombre)}
                                                disabled={t.inscripciones_count > 0}
                                                title={t.inscripciones_count > 0 ? 'Tiene inscripciones activas' : ''}
                                                className="flex-1 text-xs font-medium text-danger bg-red-50 hover:bg-red-100 rounded-lg py-1.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
