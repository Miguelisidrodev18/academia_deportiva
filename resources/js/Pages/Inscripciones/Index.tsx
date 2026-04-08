import { Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Alumno {
    id: number;
    nombre: string;
    dni: string;
}

interface Taller {
    id: number;
    nombre: string;
    disciplina: { nombre: string };
}

interface Inscripcion {
    id: number;
    fecha_alta: string;
    activo: boolean;
    estado: 'activo' | 'egresado';
    qr_code: string;
    alumno: Alumno;
    taller: Taller;
}

interface Props {
    inscripciones: Inscripcion[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFecha(fecha: string) {
    return new Date(fecha).toLocaleDateString('es-AR', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function InscripcionesIndex({ inscripciones }: Props) {
    const { flash } = usePage().props as any;

    // Separamos activas de dadas de baja para mostrarlas en secciones distintas
    const activas   = inscripciones.filter(i => i.activo);
    const inactivas = inscripciones.filter(i => !i.activo);

    function handleDarDeBaja(id: number, nombre: string) {
        if (!confirm(`¿Dar de baja la inscripción de "${nombre}"? Se conservará el historial.`)) return;
        router.delete(route('inscripciones.destroy', id));
    }

    return (
        <AppLayout title="Inscripciones">
            <div className="max-w-5xl mx-auto">

                {/* Encabezado */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary">Inscripciones</h1>
                        <p className="text-muted text-sm mt-1">
                            {activas.length} activas · {inactivas.length} dadas de baja
                        </p>
                    </div>
                    <Link
                        href={route('inscripciones.create')}
                        className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        + Inscribir alumno
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

                {/* Tabla de inscripciones activas */}
                {activas.length === 0 ? (
                    <div className="text-center py-16 text-muted bg-white rounded-xl border border-gray-100">
                        <p className="text-4xl mb-3">📋</p>
                        <p className="text-lg font-medium">No hay inscripciones activas.</p>
                        <p className="text-sm mt-1">Inscribí un alumno a un taller para comenzar.</p>
                    </div>
                ) : (
                    <TablaInscripciones
                        inscripciones={activas}
                        onDarDeBaja={handleDarDeBaja}
                        mostrarAccionBaja
                    />
                )}

                {/* Historial de bajas */}
                {inactivas.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-base font-semibold text-muted mb-3 uppercase tracking-wide text-xs">
                            Historial de egresados / bajas
                        </h2>
                        <TablaInscripciones inscripciones={inactivas} />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

// ─── Sub-componente tabla ─────────────────────────────────────────────────────

function TablaInscripciones({
    inscripciones,
    onDarDeBaja,
    mostrarAccionBaja = false,
}: {
    inscripciones: Inscripcion[];
    onDarDeBaja?: (id: number, nombre: string) => void;
    mostrarAccionBaja?: boolean;
}) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-gray-50 text-muted uppercase text-xs tracking-wide">
                    <tr>
                        <th className="px-5 py-3 text-left">Alumno</th>
                        <th className="px-5 py-3 text-left">Taller</th>
                        <th className="px-5 py-3 text-left">Disciplina</th>
                        <th className="px-5 py-3 text-center">Estado</th>
                        <th className="px-5 py-3 text-center">Alta</th>
                        <th className="px-5 py-3 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {inscripciones.map((i) => (
                        <tr key={i.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-3">
                                <span className="font-medium text-secondary">{i.alumno.nombre}</span>
                                <span className="block text-xs text-muted font-mono">{i.alumno.dni}</span>
                            </td>
                            <td className="px-5 py-3 text-gray-700">{i.taller.nombre}</td>
                            <td className="px-5 py-3 text-gray-600">{i.taller.disciplina.nombre}</td>
                            <td className="px-5 py-3 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                    i.activo
                                        ? 'bg-green-100 text-success'
                                        : 'bg-gray-100 text-muted'
                                }`}>
                                    {i.activo ? 'Activo' : 'Egresado'}
                                </span>
                            </td>
                            <td className="px-5 py-3 text-center text-gray-500 text-xs">
                                {formatFecha(i.fecha_alta)}
                            </td>
                            <td className="px-5 py-3 text-right space-x-3">
                                <Link
                                    href={route('inscripciones.show', i.id)}
                                    className="text-blue-600 hover:underline"
                                >
                                    Ver QR
                                </Link>
                                {mostrarAccionBaja && onDarDeBaja && (
                                    <button
                                        onClick={() => onDarDeBaja(i.id, i.alumno.nombre)}
                                        className="text-danger hover:underline"
                                    >
                                        Dar de baja
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
