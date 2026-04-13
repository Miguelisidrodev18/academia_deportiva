import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import AppLayout from '@/Layouts/AppLayout';
import { DIA_LABEL } from '@/utils/talleres';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Disciplina { nombre: string; }

interface Alumno { id: number; nombre: string; dni: string; }

interface Inscripcion {
    id: number;
    fecha_alta: string;
    qr_code: string;
    alumno: Alumno;
    faltas_sin_justificar: number;
    asistencia_hoy: boolean;
}

interface Taller {
    id: number;
    nombre: string;
    dias_semana: string[];
    hora_inicio: string;
    hora_fin: string;
    nivel: string;
    precio_base: string;
    cupo_maximo: number;
    disciplina: Disciplina;
    entrenador: { name: string } | null;
    inscripciones: Inscripcion[];
}

interface Props {
    taller: Taller;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function TalleresShow({ taller }: Props) {
    const [marcando, setMarcando] = useState<number | null>(null);

    async function marcarFalta(inscripcionId: number) {
        if (!confirm('¿Registrar falta para hoy?')) return;
        setMarcando(inscripcionId);

        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
        const hoy = new Date().toISOString().split('T')[0];

        try {
            const res = await fetch(route('asistencias.falta'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ inscripcion_id: inscripcionId, fecha: hoy }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success('Falta registrada.');
                router.reload({ only: ['taller'] });
            } else {
                toast.error(data.error ?? 'Error al registrar falta.');
            }
        } catch {
            toast.error('Error de red.');
        } finally {
            setMarcando(null);
        }
    }

    const inscritos = taller.inscripciones.length;
    const cupoDisponible = taller.cupo_maximo - inscritos;

    return (
        <AppLayout title={taller.nombre}>
            <Toaster position="top-center" />
            <div className="max-w-4xl mx-auto">

                {/* Breadcrumb */}
                <div className="mb-6">
                    <Link href={route('talleres.index')} className="text-muted text-sm hover:text-secondary">
                        ← Volver a Talleres
                    </Link>
                </div>

                {/* Encabezado del taller */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs text-muted uppercase tracking-wide mb-1">{taller.disciplina.nombre}</p>
                            <h1 className="text-2xl font-bold text-secondary">{taller.nombre}</h1>
                        </div>
                        <Link
                            href={route('talleres.edit', taller.id)}
                            className="text-blue-600 hover:underline text-sm"
                        >
                            Editar
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm text-gray-600">
                        <div>
                            <p className="text-xs text-muted">Días y horario</p>
                            <div className="flex flex-wrap gap-1 mt-0.5 mb-1">
                                {(taller.dias_semana ?? []).map(dia => (
                                    <span key={dia} className="px-1.5 py-0.5 bg-secondary/10 text-secondary rounded text-[10px] font-medium">
                                        {DIA_LABEL[dia] ?? dia}
                                    </span>
                                ))}
                            </div>
                            <p className="font-medium text-secondary text-sm">
                                {taller.hora_inicio}–{taller.hora_fin}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted">Nivel</p>
                            <p className="font-medium text-secondary capitalize">{taller.nivel}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted">Entrenador</p>
                            <p className="font-medium text-secondary">{taller.entrenador?.name ?? 'Sin asignar'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted">Cupo</p>
                            <p className={`font-medium ${cupoDisponible <= 0 ? 'text-danger' : 'text-secondary'}`}>
                                {inscritos}/{taller.cupo_maximo}
                                {cupoDisponible > 0
                                    ? ` · ${cupoDisponible} disponibles`
                                    : ' · Lleno'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Alumnos inscriptos */}
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-secondary">
                        Alumnos inscriptos ({inscritos})
                    </h2>
                    <Link
                        href={route('inscripciones.create')}
                        className="text-sm text-primary hover:underline"
                    >
                        + Inscribir alumno
                    </Link>
                </div>

                {inscritos === 0 ? (
                    <div className="text-center py-12 text-muted bg-white rounded-xl border border-gray-100">
                        <p className="text-3xl mb-2">👤</p>
                        <p>No hay alumnos inscriptos en este taller.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-muted uppercase text-xs tracking-wide">
                                <tr>
                                    <th className="px-5 py-3 text-left">Alumno</th>
                                    <th className="px-5 py-3 text-center">Hoy</th>
                                    <th className="px-5 py-3 text-center">Faltas (30d)</th>
                                    <th className="px-5 py-3 text-center">Alta</th>
                                    <th className="px-5 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {taller.inscripciones.map(insc => (
                                    <tr key={insc.id} className={`hover:bg-gray-50 transition-colors ${
                                        insc.faltas_sin_justificar >= 3 ? 'bg-red-50' : ''
                                    }`}>
                                        <td className="px-5 py-3">
                                            <Link
                                                href={route('alumnos.show', insc.alumno.id)}
                                                className="font-medium text-secondary hover:text-primary"
                                            >
                                                {insc.alumno.nombre}
                                            </Link>
                                            <span className="block text-xs text-muted font-mono">{insc.alumno.dni}</span>
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            {insc.asistencia_hoy ? (
                                                <span className="text-success text-lg">✓</span>
                                            ) : (
                                                <span className="text-muted text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                                insc.faltas_sin_justificar >= 3
                                                    ? 'bg-red-100 text-danger'
                                                    : insc.faltas_sin_justificar > 0
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-gray-100 text-muted'
                                            }`}>
                                                {insc.faltas_sin_justificar}
                                                {insc.faltas_sin_justificar >= 3 && ' ⚠️'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-center text-xs text-gray-500">
                                            {new Date(insc.fecha_alta).toLocaleDateString('es-PE')}
                                        </td>
                                        <td className="px-5 py-3 text-right space-x-3">
                                            <Link
                                                href={route('inscripciones.show', insc.id)}
                                                className="text-blue-600 hover:underline text-xs"
                                            >
                                                QR
                                            </Link>
                                            {!insc.asistencia_hoy && (
                                                <button
                                                    onClick={() => marcarFalta(insc.id)}
                                                    disabled={marcando === insc.id}
                                                    className="text-danger hover:underline text-xs disabled:opacity-50"
                                                >
                                                    {marcando === insc.id ? '...' : 'Marcar falta'}
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
