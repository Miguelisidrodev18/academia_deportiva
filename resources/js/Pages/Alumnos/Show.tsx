import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import StatCard from '@/Components/StatCard';
import FlashMessages from '@/Components/FlashMessages';
import { DIA_LABEL } from '@/utils/talleres';
import { calcularEdad } from '@/utils/dates';
import { avatarColor } from '@/utils/ui';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Pago {
    id: number;
    monto: string;
    fecha_pago: string;
    metodo: 'efectivo' | 'yape';
    periodo_mes: number;
    periodo_anio: number;
}

interface Taller {
    id: number;
    nombre: string;
    dias_semana: string[];
    hora_inicio: string;
    hora_fin: string;
    disciplina: { nombre: string };
}

interface Inscripcion {
    id: number;
    fecha_alta: string;
    estado: 'activo' | 'egresado';
    qr_code: string;
    taller: Taller;
    pagos: Pago[];
}

interface Alumno {
    id: number;
    nombre: string;
    apellido_familiar: string | null;
    dni: string;
    fecha_nacimiento: string;
    telefono: string | null;
    direccion: string | null;
    deuda_total: number;
    inscripciones: Inscripcion[];
}

interface Props { alumno: Alumno; }

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AlumnosShow({ alumno }: Props) {
    const edad = calcularEdad(alumno.fecha_nacimiento);
    const inscripcionesActivas = alumno.inscripciones.filter(i => i.estado === 'activo');

    return (
        <AppLayout title={alumno.nombre}>
            <div className="max-w-4xl mx-auto">

                <FlashMessages />

                {/* Encabezado del alumno */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-primary p-6 mb-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl ${avatarColor(alumno.nombre)} flex items-center justify-center text-white text-2xl font-bold flex-shrink-0`}>
                                {alumno.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-secondary">{alumno.nombre}</h1>
                                <p className="text-muted text-sm">DNI: <span className="font-mono">{alumno.dni}</span></p>
                                {alumno.telefono && <p className="text-muted text-xs mt-0.5">📞 {alumno.telefono}</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Link href={route('alumnos.index')} className="text-sm text-muted hover:text-secondary transition-colors">
                                ← Volver
                            </Link>
                            <Link href={route('alumnos.edit', alumno.id)}
                                className="bg-primary hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                                Editar datos
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-4 mb-5">
                    <StatCard
                        icon="🎂" label="Edad" value={`${edad} años`}
                        accent="border-l-blue-500" iconBg="bg-blue-100"
                    />
                    <StatCard
                        icon="⚽" label="Talleres activos" value={inscripcionesActivas.length}
                        valueClass={inscripcionesActivas.length > 0 ? 'text-primary' : 'text-muted'}
                        accent="border-l-emerald-500" iconBg="bg-emerald-100"
                    />
                    <StatCard
                        icon="💰" label="Deuda total"
                        value={`S/ ${(alumno.deuda_total ?? 0).toLocaleString('es-PE')}`}
                        valueClass={alumno.deuda_total > 0 ? 'text-danger' : 'text-success'}
                        accent={alumno.deuda_total > 0 ? 'border-l-danger' : 'border-l-success'}
                        iconBg={alumno.deuda_total > 0 ? 'bg-red-100' : 'bg-green-100'}
                    />
                </div>

                {/* Datos personales */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
                    <h2 className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">Datos personales</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                        <InfoField label="Fecha de nacimiento" value={new Date(alumno.fecha_nacimiento + 'T00:00:00').toLocaleDateString('es-PE')} />
                        {alumno.apellido_familiar && (
                            <InfoField label="Grupo familiar" value={alumno.apellido_familiar} badge="descuento hermanos" />
                        )}
                        {alumno.telefono && <InfoField label="Teléfono" value={alumno.telefono} />}
                        {alumno.direccion && <InfoField label="Dirección" value={alumno.direccion} className="sm:col-span-2" />}
                    </div>
                </div>

                {/* Inscripciones */}
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-secondary">
                        Inscripciones <span className="text-muted font-normal text-sm">({alumno.inscripciones.length})</span>
                    </h2>
                    <Link href={route('inscripciones.create')}
                        className="text-sm bg-primary hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg font-medium transition-colors">
                        + Inscribir en taller
                    </Link>
                </div>

                {alumno.inscripciones.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-muted">
                        <p className="text-3xl mb-2">📋</p>
                        <p>Este alumno no tiene inscripciones.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {alumno.inscripciones.map(insc => (
                            <div key={insc.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold text-secondary">{insc.taller.nombre}</h3>
                                        <p className="text-xs text-muted mb-1.5">{insc.taller.disciplina.nombre}</p>
                                        <div className="flex flex-wrap gap-1 items-center">
                                            {(insc.taller.dias_semana ?? []).map(dia => (
                                                <span key={dia} className="px-1.5 py-0.5 bg-secondary/10 text-secondary rounded text-[10px] font-medium">
                                                    {DIA_LABEL[dia] ?? dia}
                                                </span>
                                            ))}
                                            <span className="text-xs text-muted ml-1">
                                                {insc.taller.hora_inicio}–{insc.taller.hora_fin}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                            insc.estado === 'activo' ? 'bg-green-100 text-success' : 'bg-gray-100 text-muted'
                                        }`}>
                                            {insc.estado === 'activo' ? 'Activo' : 'Egresado'}
                                        </span>
                                        <Link href={route('inscripciones.show', insc.id)}
                                            className="text-xs text-blue-600 hover:underline">
                                            Ver QR
                                        </Link>
                                    </div>
                                </div>

                                {insc.pagos.length > 0 ? (
                                    <div className="border-t border-gray-50 pt-3">
                                        <p className="text-[10px] text-muted uppercase tracking-wide mb-2">Pagos registrados</p>
                                        <div className="space-y-1">
                                            {insc.pagos.map(pago => (
                                                <div key={pago.id} className="flex items-center justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                                                    <span className="text-gray-600">{MESES[pago.periodo_mes - 1]} {pago.periodo_anio}</span>
                                                    <span className="flex items-center gap-2">
                                                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                                            pago.metodo === 'yape' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            {pago.metodo === 'yape' ? 'Yape' : 'Efectivo'}
                                                        </span>
                                                        <span className="font-medium text-success">
                                                            S/ {parseFloat(pago.monto).toLocaleString('es-PE')}
                                                        </span>
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-danger mt-2 border-t border-gray-50 pt-2">Sin pagos registrados</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function InfoField({ label, value, badge, className }: {
    label: string; value: string; badge?: string; className?: string;
}) {
    return (
        <div className={className}>
            <p className="text-[10px] text-muted uppercase tracking-wide mb-0.5">{label}</p>
            <p className="text-secondary font-medium">
                {value}
                {badge && <span className="ml-1.5 text-[10px] bg-orange-100 text-primary px-1.5 py-0.5 rounded-full">{badge}</span>}
            </p>
        </div>
    );
}
