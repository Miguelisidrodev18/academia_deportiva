import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import AppLayout from '@/Layouts/AppLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Taller { id: number; nombre: string; }

interface Asistencia {
    id: number;
    fecha: string;
    hora: string;
    estado: 'presente' | 'falta' | 'justificada';
    inscripcion: {
        id: number;
        alumno: { id: number; nombre: string; dni: string };
        taller: { id: number; nombre: string };
    };
    entrenador: { name: string } | null;
}

interface Props {
    asistencias: Asistencia[];
    talleres: Taller[];
    fecha: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ESTADO_STYLE: Record<string, string> = {
    presente:    'bg-green-100 text-success',
    falta:       'bg-red-100 text-danger',
    justificada: 'bg-yellow-100 text-yellow-700',
};

const ESTADO_LABEL: Record<string, string> = {
    presente: 'Presente', falta: 'Falta', justificada: 'Justificada',
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AsistenciaListado({ asistencias, talleres, fecha }: Props) {
    const { auth } = usePage().props as any;
    const esDueno = auth?.user?.rol === 'dueno';

    const [fechaFiltro, setFechaFiltro] = useState(fecha);
    const [tallerId, setTallerId]       = useState('');

    function aplicarFiltros() {
        router.get(route('asistencias.index'), { fecha: fechaFiltro, taller_id: tallerId }, { preserveState: true });
    }

    async function justificarFalta(asistenciaId: number) {
        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
        const res = await fetch(route('asistencias.justificar', asistenciaId), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrfToken },
        });
        if (res.ok) {
            toast.success('Falta justificada.');
            router.reload({ only: ['asistencias'] });
        } else {
            const data = await res.json();
            toast.error(data.error ?? 'Error al justificar.');
        }
    }

    const presentes   = asistencias.filter(a => a.estado === 'presente').length;
    const faltas      = asistencias.filter(a => a.estado === 'falta').length;
    const justificadas = asistencias.filter(a => a.estado === 'justificada').length;

    return (
        <AppLayout title="Asistencias">
            <Toaster position="top-center" />
            <div className="max-w-5xl mx-auto">

                {/* Encabezado */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary">Asistencias</h1>
                        <p className="text-muted text-sm mt-1">
                            {new Date(fecha).toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'long' })}
                            {' · '}
                            <span className="text-success font-medium">{presentes} presentes</span>
                            {faltas > 0 && <> · <span className="text-danger font-medium">{faltas} faltas</span></>}
                            {justificadas > 0 && <> · <span className="text-yellow-600 font-medium">{justificadas} justificadas</span></>}
                        </p>
                    </div>
                    <Link
                        href={route('asistencia.escanear')}
                        className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        📷 Escanear QR
                    </Link>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5 flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="block text-xs text-muted mb-1">Fecha</label>
                        <input
                            type="date"
                            value={fechaFiltro}
                            onChange={e => setFechaFiltro(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1">Taller</label>
                        <select
                            value={tallerId}
                            onChange={e => setTallerId(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Todos</option>
                            {talleres.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={aplicarFiltros}
                        className="bg-secondary text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
                    >
                        Filtrar
                    </button>
                </div>

                {/* Tabla */}
                {asistencias.length === 0 ? (
                    <div className="text-center py-16 text-muted bg-white rounded-xl border border-gray-100">
                        <p className="text-4xl mb-3">📋</p>
                        <p className="text-lg font-medium">Sin asistencias registradas para este día.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-muted uppercase text-xs tracking-wide">
                                <tr>
                                    <th className="px-5 py-3 text-left">Alumno</th>
                                    <th className="px-5 py-3 text-left">Taller</th>
                                    <th className="px-5 py-3 text-center">Estado</th>
                                    <th className="px-5 py-3 text-center">Hora</th>
                                    <th className="px-5 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {asistencias.map(a => (
                                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3">
                                            <Link
                                                href={route('alumnos.show', a.inscripcion.alumno.id)}
                                                className="font-medium text-secondary hover:text-primary"
                                            >
                                                {a.inscripcion.alumno.nombre}
                                            </Link>
                                            <span className="block text-xs text-muted font-mono">
                                                {a.inscripcion.alumno.dni}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-gray-600">
                                            {a.inscripcion.taller.nombre}
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_STYLE[a.estado]}`}>
                                                {ESTADO_LABEL[a.estado]}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-center text-gray-500 text-xs font-mono">
                                            {a.hora}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            {a.estado === 'falta' && (
                                                <button
                                                    onClick={() => justificarFalta(a.id)}
                                                    className="text-yellow-600 hover:underline text-xs"
                                                >
                                                    Justificar
                                                </button>
                                            )}
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
