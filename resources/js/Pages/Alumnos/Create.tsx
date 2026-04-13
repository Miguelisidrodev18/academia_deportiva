import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import FormActions from '@/Components/FormActions';

export default function AlumnosCreate() {
    const { data, setData, post, processing, errors } = useForm({
        nombre:             '',
        apellido_familiar:  '',
        fecha_nacimiento:   '',
        dni:                '',
        direccion:          '',
        telefono:           '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('alumnos.store'));
    }

    return (
        <AppLayout title="Nuevo Alumno">
            <div className="max-w-3xl mx-auto">

                <PageHeader
                    title="Nuevo Alumno"
                    subtitle="Completá los datos del alumno para registrarlo en el sistema."
                    showDate={false}
                    actions={
                        <Link href={route('alumnos.index')} className="text-sm text-muted hover:text-secondary transition-colors">
                            ← Volver
                        </Link>
                    }
                />

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Sección: Identidad */}
                        <div>
                            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Datos personales</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Nombre completo" error={errors.nombre} required className="sm:col-span-2">
                                    <input type="text" value={data.nombre}
                                        onChange={e => setData('nombre', e.target.value)}
                                        placeholder="Juan Pérez" maxLength={150}
                                        className={inputCls(!!errors.nombre)} />
                                </Field>

                                <Field label="DNI" error={errors.dni} required>
                                    <input type="text" value={data.dni}
                                        onChange={e => setData('dni', e.target.value)}
                                        placeholder="12345678" maxLength={20}
                                        className={inputCls(!!errors.dni)} />
                                </Field>

                                <Field label="Fecha de nacimiento" error={errors.fecha_nacimiento} required>
                                    <input type="date" value={data.fecha_nacimiento}
                                        onChange={e => setData('fecha_nacimiento', e.target.value)}
                                        max={new Date().toISOString().split('T')[0]}
                                        className={inputCls(!!errors.fecha_nacimiento)} />
                                </Field>
                            </div>
                        </div>

                        {/* Separador */}
                        <div className="border-t border-gray-100" />

                        {/* Sección: Contacto */}
                        <div>
                            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-3">Contacto y domicilio</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Teléfono" error={errors.telefono}>
                                    <input type="tel" value={data.telefono}
                                        onChange={e => setData('telefono', e.target.value)}
                                        placeholder="11 1234-5678" maxLength={30}
                                        className={inputCls(!!errors.telefono)} />
                                </Field>

                                <Field label="Apellido familiar" error={errors.apellido_familiar} hint="Para descuento automático por hermanos inscriptos.">
                                    <input type="text" value={data.apellido_familiar}
                                        onChange={e => setData('apellido_familiar', e.target.value)}
                                        placeholder="García" maxLength={80}
                                        className={inputCls(!!errors.apellido_familiar)} />
                                </Field>

                                <Field label="Dirección" error={errors.direccion} className="sm:col-span-2">
                                    <input type="text" value={data.direccion}
                                        onChange={e => setData('direccion', e.target.value)}
                                        placeholder="Av. Corrientes 1234, Buenos Aires" maxLength={255}
                                        className={inputCls(!!errors.direccion)} />
                                </Field>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-4">
                            <FormActions processing={processing} submitLabel="Registrar alumno" cancelHref={route('alumnos.index')} />
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Field({ label, error, required, hint, children, className }: {
    label: string; error?: string; required?: boolean; hint?: string;
    children: React.ReactNode; className?: string;
}) {
    return (
        <div className={className}>
            <label className="block text-sm font-medium text-secondary mb-1">
                {label} {required && <span className="text-danger">*</span>}
            </label>
            {children}
            {hint && !error && <p className="text-xs text-muted mt-1">{hint}</p>}
            {error && <p className="text-danger text-xs mt-1">{error}</p>}
        </div>
    );
}

function inputCls(hasError: boolean) {
    return `w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition ${
        hasError ? 'border-danger' : 'border-gray-200 hover:border-gray-300'
    }`;
}
