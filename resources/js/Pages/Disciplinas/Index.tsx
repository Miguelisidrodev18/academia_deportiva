import { Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

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
    // Flash messages enviados desde el controlador (success / error)
    const { flash } = usePage().props as any;

    function handleEliminar(id: number, nombre: string) {
        if (!confirm(`¿Eliminar la disciplina "${nombre}"? Esta acción no se puede deshacer.`)) return;
        router.delete(route('disciplinas.destroy', id));
    }

    return (
        <AppLayout title="Disciplinas">
            <div className="max-w-4xl mx-auto">

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

                {/* Mensaje flash */}
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

                {/* Tabla */}
                {disciplinas.length === 0 ? (
                    <div className="text-center py-16 text-muted">
                        <p className="text-4xl mb-3">🏅</p>
                        <p className="text-lg font-medium">Todavía no hay disciplinas.</p>
                        <p className="text-sm mt-1">Creá la primera para comenzar a organizar tus talleres.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-muted uppercase text-xs tracking-wide">
                                <tr>
                                    <th className="px-5 py-3 text-left">Nombre</th>
                                    <th className="px-5 py-3 text-center">Talleres</th>
                                    <th className="px-5 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {disciplinas.map((d) => (
                                    <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3 font-medium text-secondary">{d.nombre}</td>
                                        <td className="px-5 py-3 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                                d.talleres_count > 0
                                                    ? 'bg-orange-100 text-primary'
                                                    : 'bg-gray-100 text-muted'
                                            }`}>
                                                {d.talleres_count} {d.talleres_count === 1 ? 'taller' : 'talleres'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right space-x-3">
                                            <Link
                                                href={route('disciplinas.edit', d.id)}
                                                className="text-blue-600 hover:underline"
                                            >
                                                Editar
                                            </Link>
                                            <button
                                                onClick={() => handleEliminar(d.id, d.nombre)}
                                                className="text-danger hover:underline disabled:opacity-50"
                                                disabled={d.talleres_count > 0}
                                                title={d.talleres_count > 0 ? 'Tiene talleres activos' : ''}
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
