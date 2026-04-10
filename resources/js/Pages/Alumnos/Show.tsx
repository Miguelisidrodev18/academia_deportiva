import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { DIA_LABEL } from '@/utils/talleres';

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

function calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
}

function StatCard({ label, value, icon, valueClass = 'text-secondary' }: {
    label: string; value: string; icon: string; valueClass?: string;
}) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl mb-1">{icon}</p>
            <p className={`text-xl font-bold ${valueClass}`}>{value}</p>
            <p className="text-xs text-muted mt-0.5">{label}</p>
        </div>
    );
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AlumnosShow({ alumno }: Props) {
    const edad = calcularEdad(alumno.fecha_nacimiento);
    const inscripcionesActivas = alumno.inscripciones.filter(i => i.estado === 'activo');

    return (
        <AppLayout title={alumno.nombre}>
            <div className="max-w-3xl mx-auto">

                {/* Breadcrumb */}
                <div className="mb-5">
                    <Link href={route('alumnos.index')} className="text-muted text-sm hover:text-secondary">
                        ← Volver a Alumnos
                    </Link>
                </div>

                {/* Encabezado */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            {/* Avatar grande */}
                            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                                {alumno.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-secondary">{alumno.nombre}</h1>
                                <p className="text-muted text-sm">DNI: {alumno.dni}</p>
                            </div>
                        </div>
                        <Link
                            href={route('alumnos.edit', alumno.id)}
                            className="bg-primary hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0"
                        >
                            Editar datos
                        </Link>
                    </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-4 mb-5">
                    <StatCard label="Edad" value={`${edad} años`} icon="🎂" />
                    <StatCard
                        label="Talleres activos"
                        value={String(inscripcionesActivas.length)}
                        icon="⚽"
                        valueClass={inscripcionesActivas.length > 0 ? 'text-primary' : 'text-muted'}
                    />
                    <StatCard
                        label="Deuda total"
                        value={`$${(alumno.deuda_total ?? 0).toLocaleString('es-AR')}`}
                        icon="💰"
                        valueClass={alumno.deuda_total > 0 ? 'text-danger' : 'text-success'}
                    />
                </div>

                {/* Info de contacto */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
                    <h2 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-3">Datos personales</h2>
                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                        <div>
                            <span className="text-xs text-muted uppercase tracking-wide block mb-0.5">Fecha de nacimiento</span>
                            {new Date(alumno.fecha_nacimiento).toLocaleDateString('es-AR')}
                        </div>
                        {alumno.apellido_familiar && (
                            <div>
                                <span className="text-xs text-muted uppercase tracking-wide block mb-0.5">Grupo familiar</span>
                                <span className="font-medium">{alumno.apellido_familiar}</span>
                                <span className="ml-1 text-xs text-primary">(descuento hermanos)</span>
                            </div>
                        )}
                        {alumno.telefono && (
                            <div>
                                <span className="text-xs text-muted uppercase tracking-wide block mb-0.5">Teléfono</span>
                                {alumno.telefono}
                            </div>
                        )}
                        {alumno.direccion && (
                            <div>
                                <span className="text-xs text-muted uppercase tracking-wide block mb-0.5">Dirección</span>
                                {alumno.direccion}
                            </div>
                        )}
                    </div>
                </div>

                {/* Inscripciones */}
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-secondary">
                        Inscripciones ({alumno.inscripciones.length})
                    </h2>
                    <Link
                        href={route('inscripciones.create')}
                        className="text-sm text-primary hover:underline"
                    >
                        + Inscribir en taller
                    </Link>
                </div>

                {alumno.inscripciones.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-muted">
                        <p className="text-3xl mb-2">📋</p>
                        <p>Este alumno no tiene inscripciones.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {alumno.inscripciones.map((insc) => (
                            <div key={insc.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">

                                {/* Taller info */}
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold text-secondary">{insc.taller.nombre}</h3>
                                        <p className="text-xs text-muted mb-1">{insc.taller.disciplina.nombre}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {(insc.taller.dias_semana ?? []).map(dia => (
                                                <span key={dia} className="px-1.5 py-0.5 bg-secondary/10 text-secondary rounded text-[10px] font-medium">
                                                    {DIA_LABEL[dia] ?? dia}
                                                </span>
                                            ))}
                                            <span className="text-xs text-muted self-center ml-1">
                                                {insc.taller.hora_inicio}–{insc.taller.hora_fin}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                            insc.estado === 'activo'
                                                ? 'bg-green-100 text-success'
                                                : 'bg-gray-100 text-muted'
                                        }`}>
                                            {insc.estado === 'activo' ? 'Activo' : 'Egresado'}
                                        </span>
                                        <Link
                                            href={route('inscripciones.show', insc.id)}
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            Ver QR
                                        </Link>
                                    </div>
                                </div>

                                {/* Pagos */}
                                {insc.pagos.length > 0 ? (
                                    <div>
                                        <p className="text-xs text-muted uppercase tracking-wide mb-2">Pagos registrados</p>
                                        <div className="space-y-1">
                                            {insc.pagos.map((pago) => (
                                                <div key={pago.id} className="flex items-center justify-between text-xs py-1 border-b border-gray-50 last:border-0">
                                                    <span className="text-gray-600">
                                                        {MESES[pago.periodo_mes - 1]} {pago.periodo_anio}
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <span className={`px-1.5 py-0.5 rounded text-xs ${
                                                            pago.metodo === 'yape'
                                                                ? 'bg-purple-100 text-purple-700'
                                                                : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            {pago.metodo === 'yape' ? 'Yape' : 'Efectivo'}
                                                        </span>
                                                        <span className="font-medium text-success">
                                                            ${parseFloat(pago.monto).toLocaleString('es-AR')}
                                                        </span>
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-danger mt-2">Sin pagos registrados</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </AppLayout>
    );
}
