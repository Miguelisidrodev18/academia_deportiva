import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import FlashMessages from '@/Components/FlashMessages';
import PageHeader from '@/Components/PageHeader';
import EmptyState from '@/Components/EmptyState';
import { avatarColor } from '@/utils/ui';
import { formatFecha } from '@/utils/dates';
import { QrCodeIcon, XCircleIcon } from '@heroicons/react/24/outline';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Alumno { id: number; nombre: string; dni: string; }
interface Taller  { id: number; nombre: string; disciplina: { nombre: string }; }

interface Inscripcion {
    id: number;
    fecha_alta: string;
    activo: boolean;
    estado: 'activo' | 'egresado';
    qr_code: string;
    alumno: Alumno;
    taller: Taller;
}

interface Props { inscripciones: Inscripcion[]; }

// ─── Componente ───────────────────────────────────────────────────────────────

export default function InscripcionesIndex({ inscripciones }: Props) {
    const activas   = inscripciones.filter(i => i.activo);
    const inactivas = inscripciones.filter(i => !i.activo);

    function handleDarDeBaja(id: number, nombre: string) {
        if (!confirm(`¿Dar de baja la inscripción de "${nombre}"? Se conservará el historial.`)) return;
        router.delete(route('inscripciones.destroy', id));
    }

    return (
        <AppLayout title="Inscripciones">
            <div className="max-w-5xl mx-auto">

                <PageHeader
                    title="Inscripciones"
                    subtitle={`${activas.length} activas · ${inactivas.length} dadas de baja`}
                    ctaHref={route('inscripciones.create')}
                    ctaLabel="+ Inscribir alumno"
                />

                <FlashMessages />

                {activas.length === 0 ? (
                    <EmptyState
                        icon="📋"
                        title="No hay inscripciones activas"
                        description="Inscribí un alumno a un taller para comenzar."
                        ctaHref={route('inscripciones.create')}
                        ctaLabel="+ Inscribir alumno"
                    />
                ) : (
                    <TablaInscripciones
                        inscripciones={activas}
                        onDarDeBaja={handleDarDeBaja}
                        mostrarAccionBaja
                    />
                )}

                {inactivas.length > 0 && (
                    <div className="mt-8">
                        <p className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-3 px-1">
                            Historial de egresados / bajas
                        </p>
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
                        <th className="px-5 py-3.5 text-left">Alumno</th>
                        <th className="px-5 py-3.5 text-left">Taller</th>
                        <th className="px-5 py-3.5 text-left hidden sm:table-cell">Disciplina</th>
                        <th className="px-5 py-3.5 text-center">Estado</th>
                        <th className="px-5 py-3.5 text-center hidden md:table-cell">Alta</th>
                        <th className="px-5 py-3.5 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {inscripciones.map(i => (
                        <tr key={i.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColor(i.alumno.nombre)}`}>
                                        {i.alumno.nombre.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-secondary">{i.alumno.nombre}</p>
                                        <p className="text-xs text-muted font-mono">{i.alumno.dni}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-5 py-3.5 text-secondary">{i.taller.nombre}</td>
                            <td className="px-5 py-3.5 text-muted hidden sm:table-cell">{i.taller.disciplina.nombre}</td>
                            <td className="px-5 py-3.5 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                    i.activo ? 'bg-green-100 text-success' : 'bg-gray-100 text-muted'
                                }`}>
                                    {i.activo ? 'Activo' : 'Egresado'}
                                </span>
                            </td>
                            <td className="px-5 py-3.5 text-center text-muted text-xs hidden md:table-cell">
                                {formatFecha(i.fecha_alta)}
                            </td>
                            <td className="px-5 py-3.5">
                                <div className="flex items-center justify-end gap-1">
                                    <Link href={route('inscripciones.show', i.id)}
                                        className="p-1.5 rounded-md text-muted hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                        title="Ver QR">
                                        <QrCodeIcon className="w-4 h-4" />
                                    </Link>
                                    {mostrarAccionBaja && onDarDeBaja && (
                                        <button
                                            onClick={() => onDarDeBaja(i.id, i.alumno.nombre)}
                                            className="p-1.5 rounded-md text-muted hover:text-danger hover:bg-red-50 transition-colors"
                                            title="Dar de baja">
                                            <XCircleIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
