import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

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
    dia_semana: string;
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
    dni: string;
    fecha_nacimiento: string;
    telefono: string | null;
    direccion: string | null;
    inscripciones: Inscripcion[];
}

interface Props {
    alumno: Alumno;
}

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

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AlumnosShow({ alumno }: Props) {
    const edad = calcularEdad(alumno.fecha_nacimiento);

    return (
        <AppLayout title={alumno.nombre}>
            <div className="max-w-3xl mx-auto">

                {/* Breadcrumb */}
                <div className="mb-6">
                    <Link href={route('alumnos.index')} className="text-muted text-sm hover:text-secondary">
                        ← Volver a Alumnos
                    </Link>
                </div>

                {/* Encabezado alumno */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-secondary">{alumno.nombre}</h1>
                            <p className="text-muted text-sm mt-1">DNI: {alumno.dni} · {edad} años</p>
                        </div>
                        <Link
                            href={route('alumnos.edit', alumno.id)}
                            className="bg-primary hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        >
                            Editar datos
                        </Link>
                    </div>

                    {/* Info de contacto */}
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-600">
                        {alumno.telefono && (
                            <div>
                                <span className="text-xs text-muted uppercase tracking-wide block">Teléfono</span>
                                {alumno.telefono}
                            </div>
                        )}
                        {alumno.direccion && (
                            <div>
                                <span className="text-xs text-muted uppercase tracking-wide block">Dirección</span>
                                {alumno.direccion}
                            </div>
                        )}
                        <div>
                            <span className="text-xs text-muted uppercase tracking-wide block">Fecha de nacimiento</span>
                            {new Date(alumno.fecha_nacimiento).toLocaleDateString('es-AR')}
                        </div>
                    </div>
                </div>

                {/* Inscripciones activas */}
                <h2 className="text-lg font-semibold text-secondary mb-3">
                    Inscripciones activas ({alumno.inscripciones.length})
                </h2>

                {alumno.inscripciones.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-muted">
                        <p className="text-3xl mb-2">📋</p>
                        <p>Este alumno no tiene inscripciones activas.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {alumno.inscripciones.map((inscripcion) => (
                            <div key={inscripcion.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">

                                {/* Info del taller */}
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold text-secondary">
                                            {inscripcion.taller.nombre}
                                        </h3>
                                        <p className="text-xs text-muted">
                                            {inscripcion.taller.disciplina.nombre} · {capitalize(inscripcion.taller.dia_semana)} {inscripcion.taller.hora_inicio}–{inscripcion.taller.hora_fin}
                                        </p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                        inscripcion.estado === 'activo'
                                            ? 'bg-green-100 text-success'
                                            : 'bg-gray-100 text-muted'
                                    }`}>
                                        {capitalize(inscripcion.estado)}
                                    </span>
                                </div>

                                {/* Últimos pagos */}
                                {inscripcion.pagos.length > 0 && (
                                    <div>
                                        <p className="text-xs text-muted uppercase tracking-wide mb-2">Últimos pagos</p>
                                        <div className="space-y-1">
                                            {inscripcion.pagos.map((pago) => (
                                                <div key={pago.id} className="flex items-center justify-between text-xs">
                                                    <span className="text-gray-600">
                                                        {MESES[pago.periodo_mes - 1]} {pago.periodo_anio}
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <span className={`px-1.5 py-0.5 rounded text-xs ${
                                                            pago.metodo === 'yape'
                                                                ? 'bg-purple-100 text-purple-700'
                                                                : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            {capitalize(pago.metodo)}
                                                        </span>
                                                        <span className="font-medium text-success">
                                                            ${parseFloat(pago.monto).toLocaleString('es-AR')}
                                                        </span>
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {inscripcion.pagos.length === 0 && (
                                    <p className="text-xs text-danger">Sin pagos registrados</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
