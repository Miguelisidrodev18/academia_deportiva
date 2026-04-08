import { Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Alumno {
    id: number;
    nombre: string;
    dni: string;
    telefono: string | null;
    fecha_nacimiento: string;
    inscripciones_activas_count: number;
}

interface Props {
    alumnos: Alumno[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AlumnosIndex({ alumnos }: Props) {
    const { flash } = usePage().props as any;

    function handleEliminar(id: number, nombre: string) {
        if (!confirm(`¿Eliminar al alumno "${nombre}"? Esta acción no se puede deshacer.`)) return;
        router.delete(route('alumnos.destroy', id));
    }

    return (
        <AppLayout title="Alumnos">
            <div className="max-w-5xl mx-auto">

                {/* Encabezado */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary">Alumnos</h1>
                        <p className="text-muted text-sm mt-1">
                            {alumnos.length} {alumnos.length === 1 ? 'alumno registrado' : 'alumnos registrados'}
                        </p>
                    </div>
                    <Link
                        href={route('alumnos.create')}
                        className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        + Nuevo alumno
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

                {/* Tabla */}
                {alumnos.length === 0 ? (
                    <div className="text-center py-16 text-muted">
                        <p className="text-4xl mb-3">👤</p>
                        <p className="text-lg font-medium">Todavía no hay alumnos registrados.</p>
                        <p className="text-sm mt-1">Registrá el primero para comenzar a gestionar inscripciones.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-muted uppercase text-xs tracking-wide">
                                <tr>
                                    <th className="px-5 py-3 text-left">Nombre</th>
                                    <th className="px-5 py-3 text-left">DNI</th>
                                    <th className="px-5 py-3 text-center">Edad</th>
                                    <th className="px-5 py-3 text-center">Talleres activos</th>
                                    <th className="px-5 py-3 text-left">Teléfono</th>
                                    <th className="px-5 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {alumnos.map((a) => (
                                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3">
                                            <Link
                                                href={route('alumnos.show', a.id)}
                                                className="font-medium text-secondary hover:text-primary"
                                            >
                                                {a.nombre}
                                            </Link>
                                        </td>
                                        <td className="px-5 py-3 text-gray-600 font-mono text-xs">{a.dni}</td>
                                        <td className="px-5 py-3 text-center text-gray-600">
                                            {calcularEdad(a.fecha_nacimiento)} años
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                                a.inscripciones_activas_count > 0
                                                    ? 'bg-orange-100 text-primary'
                                                    : 'bg-gray-100 text-muted'
                                            }`}>
                                                {a.inscripciones_activas_count}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-gray-600">{a.telefono ?? '—'}</td>
                                        <td className="px-5 py-3 text-right space-x-3">
                                            <Link
                                                href={route('alumnos.show', a.id)}
                                                className="text-blue-600 hover:underline"
                                            >
                                                Ver
                                            </Link>
                                            <Link
                                                href={route('alumnos.edit', a.id)}
                                                className="text-gray-600 hover:underline"
                                            >
                                                Editar
                                            </Link>
                                            <button
                                                onClick={() => handleEliminar(a.id, a.nombre)}
                                                disabled={a.inscripciones_activas_count > 0}
                                                title={a.inscripciones_activas_count > 0 ? 'Tiene inscripciones activas' : ''}
                                                className="text-danger hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
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
