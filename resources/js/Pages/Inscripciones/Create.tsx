import { useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Alumno {
    id: number;
    nombre: string;
    dni: string;
    fecha_nacimiento: string;
}

interface Taller {
    id: number;
    nombre: string;
    dias_semana: string[];
    hora_inicio: string;
    hora_fin: string;
    precio_base: string;
    cupo_maximo: number;
    cupo_disponible: number;
    inscriptos: number;
    disciplina: { nombre: string };
}

interface Props {
    alumnos: Alumno[];
    talleres: Taller[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

export default function InscripcionesCreate({ alumnos, talleres }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        alumno_id: '',
        taller_id: '',
    });

    // Para mostrar un preview del taller seleccionado
    const [tallerPreview, setTallerPreview] = useState<Taller | null>(null);
    // Para mostrar preview del alumno seleccionado
    const [alumnoPreview, setAlumnoPreview] = useState<Alumno | null>(null);

    function handleTallerChange(id: string) {
        setData('taller_id', id);
        setTallerPreview(talleres.find(t => String(t.id) === id) ?? null);
    }

    function handleAlumnoChange(id: string) {
        setData('alumno_id', id);
        setAlumnoPreview(alumnos.find(a => String(a.id) === id) ?? null);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('inscripciones.store'));
    }

    return (
        <AppLayout title="Inscribir Alumno">
            <div className="max-w-2xl mx-auto">

                <div className="mb-6">
                    <Link href={route('inscripciones.index')} className="text-muted text-sm hover:text-secondary">
                        ← Volver a Inscripciones
                    </Link>
                    <h1 className="text-2xl font-bold text-secondary mt-2">Inscribir Alumno</h1>
                    <p className="text-muted text-sm mt-1">
                        Al inscribir se genera automáticamente el código QR de asistencia.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5">

                    {/* Formulario principal */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Selector de alumno */}
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1">
                                    Alumno <span className="text-danger">*</span>
                                </label>
                                <select
                                    value={data.alumno_id}
                                    onChange={e => handleAlumnoChange(e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary transition ${
                                        errors.alumno_id ? 'border-danger' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">— Seleccioná un alumno —</option>
                                    {alumnos.map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.nombre} ({a.dni}) · {calcularEdad(a.fecha_nacimiento)} años
                                        </option>
                                    ))}
                                </select>
                                {errors.alumno_id && (
                                    <p className="text-danger text-xs mt-1">{errors.alumno_id}</p>
                                )}
                            </div>

                            {/* Preview del alumno */}
                            {alumnoPreview && (
                                <div className="bg-blue-50 rounded-lg px-4 py-3 text-xs text-blue-700">
                                    <span className="font-medium">{alumnoPreview.nombre}</span>
                                    {' · '}{alumnoPreview.dni}
                                    {' · '}{calcularEdad(alumnoPreview.fecha_nacimiento)} años
                                </div>
                            )}

                            {/* Selector de taller */}
                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1">
                                    Taller <span className="text-danger">*</span>
                                </label>
                                <select
                                    value={data.taller_id}
                                    onChange={e => handleTallerChange(e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary transition ${
                                        errors.taller_id ? 'border-danger' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">— Seleccioná un taller —</option>
                                    {talleres.map(t => (
                                        <option
                                            key={t.id}
                                            value={t.id}
                                            disabled={t.cupo_disponible <= 0}
                                        >
                                            {t.disciplina.nombre} · {t.nombre} ({(t.dias_semana ?? []).map(d => d.charAt(0).toUpperCase() + d.slice(1)).join('/') || '?'} {t.hora_inicio})
                                            {t.cupo_disponible <= 0 ? ' — SIN CUPO' : ` · ${t.cupo_disponible} lugar${t.cupo_disponible !== 1 ? 'es' : ''}`}
                                        </option>
                                    ))}
                                </select>
                                {errors.taller_id && (
                                    <p className="text-danger text-xs mt-1">{errors.taller_id}</p>
                                )}
                            </div>

                            {/* Preview del taller seleccionado */}
                            {tallerPreview && (
                                <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
                                    <p className="font-semibold text-secondary text-sm mb-2">
                                        {tallerPreview.disciplina.nombre} · {tallerPreview.nombre}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                        <span>📅 {(tallerPreview.dias_semana ?? []).map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ') || '—'}</span>
                                        <span>🕐 {tallerPreview.hora_inicio} – {tallerPreview.hora_fin}</span>
                                        <span>💰 S/ {parseFloat(tallerPreview.precio_base).toLocaleString('es-PE')}/mes</span>
                                        <span className={tallerPreview.cupo_disponible <= 0 ? 'text-danger font-medium' : 'text-success font-medium'}>
                                            🪑 {tallerPreview.inscriptos}/{tallerPreview.cupo_maximo} inscriptos
                                            {tallerPreview.cupo_disponible <= 0 ? ' (lleno)' : ` · ${tallerPreview.cupo_disponible} disponibles`}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Botones */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={processing || !data.alumno_id || !data.taller_id}
                                    className="flex-1 bg-primary hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    {processing ? 'Inscribiendo...' : '✓ Inscribir y generar QR'}
                                </button>
                                <Link
                                    href={route('inscripciones.index')}
                                    className="flex-1 text-center border border-gray-300 hover:bg-gray-50 text-secondary py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Cancelar
                                </Link>
                            </div>

                        </form>
                    </div>

                    {/* Nota informativa */}
                    <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 text-xs text-blue-700">
                        <p className="font-semibold mb-1">¿Qué pasa después de inscribir?</p>
                        <ul className="space-y-1 list-disc list-inside">
                            <li>Se genera un código QR único de 20 caracteres para este alumno + taller.</li>
                            <li>El alumno puede presentar el QR para registrar asistencia.</li>
                            <li>Se puede imprimir o compartir digitalmente desde la vista de detalle.</li>
                        </ul>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
