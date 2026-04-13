import { Link, usePage } from '@inertiajs/react';
import QRCode from 'react-qr-code';
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
    dias_semana: string[];
    hora_inicio: string;
    hora_fin: string;
    precio_base: string;
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
    inscripcion: Inscripcion;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatFecha(f: string) {
    return new Date(f).toLocaleDateString('es-PE', {
        day: '2-digit', month: 'long', year: 'numeric',
    });
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function InscripcionesShow({ inscripcion }: Props) {
    const { flash } = usePage().props as any;

    // El valor del QR es solo el código opaco (no contiene datos sensibles).
    // El backend lo busca en la tabla inscripciones cuando se escanea.
    const qrValue = inscripcion.qr_code;

    function handleImprimir() {
        window.print();
    }

    return (
        <AppLayout title={`QR – ${inscripcion.alumno.nombre}`}>
            <div className="max-w-lg mx-auto">

                {/* Breadcrumb */}
                <div className="mb-6">
                    <Link href={route('inscripciones.index')} className="text-muted text-sm hover:text-secondary">
                        ← Volver a Inscripciones
                    </Link>
                </div>

                {/* Flash de éxito (al crear) */}
                {flash?.success && (
                    <div className="bg-green-50 border border-success text-success rounded-lg px-4 py-3 mb-4 text-sm">
                        {flash.success}
                    </div>
                )}

                {/* Tarjeta principal — optimizada para impresión */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center print:shadow-none print:border-none">

                    {/* Logo / nombre academia */}
                    <p className="text-xs text-muted uppercase tracking-widest mb-1">Carnet de Asistencia</p>

                    {/* Nombre del alumno */}
                    <h1 className="text-2xl font-bold text-secondary mt-2">
                        {inscripcion.alumno.nombre}
                    </h1>
                    <p className="text-muted text-sm">DNI: {inscripcion.alumno.dni}</p>

                    {/* Taller */}
                    <div className="mt-3 mb-6">
                        <span className="inline-block bg-orange-100 text-primary text-sm font-medium px-3 py-1 rounded-full">
                            {inscripcion.taller.disciplina.nombre} · {inscripcion.taller.nombre}
                        </span>
                        <p className="text-xs text-muted mt-1">
                            {(inscripcion.taller.dias_semana ?? []).map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')} · {inscripcion.taller.hora_inicio} – {inscripcion.taller.hora_fin}
                        </p>
                    </div>

                    {/* Código QR */}
                    <div className="flex justify-center mb-6">
                        <div className={`p-4 rounded-xl border-2 ${
                            inscripcion.activo ? 'border-primary' : 'border-gray-300 opacity-50'
                        }`}>
                            {/*
                             * react-qr-code renderiza un SVG nativo → no necesita canvas ni libs externas.
                             * El valor es el código opaco de 20 caracteres.
                             */}
                            <QRCode
                                value={qrValue}
                                size={200}
                                bgColor="#ffffff"
                                fgColor="#1E293B"
                            />
                        </div>
                    </div>

                    {/* Código en texto (por si el lector no puede escanear) */}
                    <p className="font-mono text-xs text-muted tracking-widest mb-1">
                        {qrValue}
                    </p>

                    {/* Estado */}
                    <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
                        inscripcion.activo
                            ? 'bg-green-100 text-success'
                            : 'bg-gray-100 text-muted'
                    }`}>
                        {inscripcion.activo ? '✓ Inscripción activa' : 'Inscripción dada de baja'}
                    </span>

                    <p className="text-xs text-muted mt-3">
                        Alta: {formatFecha(inscripcion.fecha_alta)}
                    </p>

                    {/* Advertencia si está inactiva */}
                    {!inscripcion.activo && (
                        <div className="mt-4 bg-red-50 border border-danger text-danger rounded-lg px-4 py-2 text-xs">
                            Este QR ya no es válido para registrar asistencia.
                        </div>
                    )}
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 mt-5">
                    <button
                        onClick={handleImprimir}
                        className="flex-1 bg-secondary hover:bg-slate-700 text-white py-2 rounded-lg text-sm font-medium transition-colors print:hidden"
                    >
                        🖨 Imprimir / Guardar PDF
                    </button>
                    <Link
                        href={route('alumnos.show', inscripcion.alumno.id)}
                        className="flex-1 text-center border border-gray-300 hover:bg-gray-50 text-secondary py-2 rounded-lg text-sm font-medium transition-colors print:hidden"
                    >
                        Ver perfil del alumno
                    </Link>
                </div>

                {/* Info de uso */}
                <div className="mt-4 bg-blue-50 rounded-xl border border-blue-100 p-4 text-xs text-blue-700 print:hidden">
                    <p className="font-semibold mb-1">¿Cómo usar este QR?</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>El entrenador escanea el QR desde la sección <strong>Asistencia QR</strong>.</li>
                        <li>El sistema registra la asistencia automáticamente con fecha y hora.</li>
                        <li>Imprimilo o guardalo como PDF para entregárselo al alumno.</li>
                    </ul>
                </div>

            </div>
        </AppLayout>
    );
}
