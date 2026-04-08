import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

interface Alumno {
    id: number;
    nombre: string;
    fecha_nacimiento: string;
    dni: string;
    direccion: string | null;
    telefono: string | null;
}

interface Props {
    alumno: Alumno;
}

export default function AlumnosEdit({ alumno }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        nombre:           alumno.nombre,
        fecha_nacimiento: alumno.fecha_nacimiento,
        dni:              alumno.dni,
        direccion:        alumno.direccion ?? '',
        telefono:         alumno.telefono ?? '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(route('alumnos.update', alumno.id));
    }

    return (
        <AppLayout title="Editar Alumno">
            <div className="max-w-lg mx-auto">

                <div className="mb-6">
                    <Link href={route('alumnos.index')} className="text-muted text-sm hover:text-secondary">
                        ← Volver a Alumnos
                    </Link>
                    <h1 className="text-2xl font-bold text-secondary mt-2">Editar Alumno</h1>
                    <p className="text-muted text-sm">{alumno.nombre}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <Field label="Nombre completo" error={errors.nombre} required>
                            <input
                                type="text"
                                value={data.nombre}
                                onChange={e => setData('nombre', e.target.value)}
                                maxLength={150}
                                className={inputCls(!!errors.nombre)}
                            />
                        </Field>

                        <Field label="Fecha de nacimiento" error={errors.fecha_nacimiento} required>
                            <input
                                type="date"
                                value={data.fecha_nacimiento}
                                onChange={e => setData('fecha_nacimiento', e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                className={inputCls(!!errors.fecha_nacimiento)}
                            />
                        </Field>

                        <Field label="DNI" error={errors.dni} required>
                            <input
                                type="text"
                                value={data.dni}
                                onChange={e => setData('dni', e.target.value)}
                                maxLength={20}
                                className={inputCls(!!errors.dni)}
                            />
                        </Field>

                        <Field label="Dirección" error={errors.direccion}>
                            <input
                                type="text"
                                value={data.direccion}
                                onChange={e => setData('direccion', e.target.value)}
                                maxLength={255}
                                className={inputCls(!!errors.direccion)}
                            />
                        </Field>

                        <Field label="Teléfono" error={errors.telefono}>
                            <input
                                type="tel"
                                value={data.telefono}
                                onChange={e => setData('telefono', e.target.value)}
                                maxLength={30}
                                className={inputCls(!!errors.telefono)}
                            />
                        </Field>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-primary hover:bg-orange-600 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                {processing ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                            <Link
                                href={route('alumnos.show', alumno.id)}
                                className="flex-1 text-center border border-gray-300 hover:bg-gray-50 text-secondary py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Cancelar
                            </Link>
                        </div>

                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

function Field({ label, error, required, children }: {
    label: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-secondary mb-1">
                {label} {required && <span className="text-danger">*</span>}
            </label>
            {children}
            {error && <p className="text-danger text-xs mt-1">{error}</p>}
        </div>
    );
}

function inputCls(hasError: boolean) {
    return `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition ${
        hasError ? 'border-danger' : 'border-gray-300'
    }`;
}
