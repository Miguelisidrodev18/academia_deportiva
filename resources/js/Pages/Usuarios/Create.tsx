import { useState, FormEventHandler } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Props { rolesPermitidos: string[]; }

const ROL_LABEL: Record<string, string> = {
    entrenador:     'Entrenador',
    admin_caja:     'Admin Caja',
    admin_alquiler: 'Admin Alquiler',
};

const ROL_DESC: Record<string, string> = {
    entrenador:     'Puede tomar asistencia y ver sus talleres.',
    admin_caja:     'Puede registrar y ver pagos de cuotas.',
    admin_alquiler: 'Puede gestionar reservas de espacios.',
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function UsuariosCreate({ rolesPermitidos }: Props) {
    const [verPass, setVerPass] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name:                  '',
        email:                 '',
        password:              '',
        password_confirmation: '',
        rol:                   rolesPermitidos[0] ?? 'entrenador',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('usuarios.store'));
    };

    return (
        <AppLayout title="Nuevo Usuario">
            <div className="max-w-lg mx-auto">

                <div className="mb-6">
                    <Link href={route('usuarios.index')} className="text-muted text-sm hover:text-secondary">
                        ← Volver a Usuarios
                    </Link>
                    <h1 className="text-2xl font-bold text-secondary mt-2">Nuevo Usuario</h1>
                    <p className="text-muted text-sm mt-1">Creá un acceso para un entrenador o admin de tu academia.</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <form onSubmit={submit} className="space-y-5">

                        {/* Nombre */}
                        <Field label="Nombre completo" error={errors.name} required>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                placeholder="María García"
                                maxLength={255}
                                autoFocus
                                className={inputCls(!!errors.name)}
                            />
                        </Field>

                        {/* Email */}
                        <Field label="Correo electrónico" error={errors.email} required>
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                placeholder="maria@academia.com"
                                className={inputCls(!!errors.email)}
                            />
                        </Field>

                        {/* Contraseña */}
                        <Field label="Contraseña" error={errors.password} required>
                            <div className="relative">
                                <input
                                    type={verPass ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    className={`${inputCls(!!errors.password)} pr-10`}
                                    placeholder="Mínimo 8 caracteres"
                                />
                                <button
                                    type="button"
                                    onClick={() => setVerPass(!verPass)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition-colors text-xs"
                                    tabIndex={-1}
                                >
                                    {verPass ? 'Ocultar' : 'Ver'}
                                </button>
                            </div>
                        </Field>

                        {/* Confirmar contraseña */}
                        <Field label="Confirmar contraseña" error={errors.password_confirmation} required>
                            <input
                                type={verPass ? 'text' : 'password'}
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                className={inputCls(!!errors.password_confirmation)}
                                placeholder="Repetir contraseña"
                            />
                        </Field>

                        {/* Rol */}
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-2">
                                Rol <span className="text-danger">*</span>
                            </label>
                            <div className="space-y-2">
                                {rolesPermitidos.map(rol => (
                                    <label
                                        key={rol}
                                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                            data.rol === rol
                                                ? 'border-primary bg-orange-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="rol"
                                            value={rol}
                                            checked={data.rol === rol}
                                            onChange={() => setData('rol', rol)}
                                            className="mt-0.5 accent-primary"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-secondary">{ROL_LABEL[rol] ?? rol}</p>
                                            <p className="text-xs text-muted">{ROL_DESC[rol]}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {errors.rol && <p className="text-danger text-xs mt-1">{errors.rol}</p>}
                        </div>

                        {/* Botones */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-primary hover:bg-orange-600 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                {processing ? 'Creando...' : 'Crear usuario'}
                            </button>
                            <Link
                                href={route('usuarios.index')}
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
