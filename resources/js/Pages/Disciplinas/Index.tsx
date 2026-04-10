import { Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { getSportIcon } from '@/utils/sportIcons';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Disciplina {
    id: number;
    nombre: string;
    talleres_count: number;
}

interface Props {
    disciplinas: Disciplina[];
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function DisciplinasIndex({ disciplinas }: Props) {
    const { flash } = usePage().props as any;

    function handleEliminar(id: number, nombre: string) {
        if (!confirm(`¿Eliminar la disciplina "${nombre}"? Esta acción no se puede deshacer.`)) return;
        router.delete(route('disciplinas.destroy', id));
    }

    return (
        <AppLayout title="Disciplinas">
            <div className="max-w-5xl mx-auto">

                {/* Encabezado */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary">Disciplinas</h1>
                        <p className="text-muted text-sm mt-1">
                            Gestioná las disciplinas deportivas de tu academia.
                        </p>
                    </div>
                    <Link
                        href={route('disciplinas.create')}
                        className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        + Nueva disciplina
                    </Link>
                </div>

                {/* Flash messages */}
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

                {/* Grid de cards */}
                {disciplinas.length === 0 ? (
                    <div className="text-center py-20 text-muted">
                        <p className="text-5xl mb-4">🏅</p>
                        <p className="text-lg font-medium">Todavía no hay disciplinas.</p>
                        <p className="text-sm mt-1">Creá la primera para comenzar a organizar tus talleres.</p>
                        <Link
                            href={route('disciplinas.create')}
                            className="inline-block mt-5 bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                        >
                            + Crear primera disciplina
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {disciplinas.map((d) => (
                            <div
                                key={d.id}
                                className="group bg-white rounded-2xl border border-gray-100 shadow-sm
                                           hover:border-primary hover:shadow-md transition-all duration-200
                                           flex flex-col items-center p-5 text-center relative overflow-hidden"
                            >
                                {/* Ícono de fondo (watermark) */}
                                <span className="absolute -bottom-3 -right-3 text-7xl opacity-5 select-none pointer-events-none">
                                    {getSportIcon(d.nombre)}
                                </span>

                                {/* Ícono principal */}
                                <span className="text-5xl mb-3 block leading-none">
                                    {getSportIcon(d.nombre)}
                                </span>

                                {/* Nombre */}
                                <h3 className="font-semibold text-secondary text-sm leading-tight mb-1">
                                    {d.nombre}
                                </h3>

                                {/* Badge talleres */}
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium mb-4 ${
                                    d.talleres_count > 0
                                        ? 'bg-orange-100 text-primary'
                                        : 'bg-gray-100 text-muted'
                                }`}>
                                    {d.talleres_count} {d.talleres_count === 1 ? 'taller' : 'talleres'}
                                </span>

                                {/* Acciones */}
                                <div className="flex gap-2 w-full mt-auto">
                                    <Link
                                        href={route('disciplinas.edit', d.id)}
                                        className="flex-1 text-center text-xs font-medium text-blue-600
                                                   bg-blue-50 hover:bg-blue-100 rounded-lg py-1.5 transition-colors"
                                    >
                                        Editar
                                    </Link>
                                    <button
                                        onClick={() => handleEliminar(d.id, d.nombre)}
                                        disabled={d.talleres_count > 0}
                                        title={d.talleres_count > 0 ? 'Tiene talleres activos' : ''}
                                        className="flex-1 text-xs font-medium text-danger
                                                   bg-red-50 hover:bg-red-100 rounded-lg py-1.5 transition-colors
                                                   disabled:opacity-30 disabled:cursor-not-allowed"
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
