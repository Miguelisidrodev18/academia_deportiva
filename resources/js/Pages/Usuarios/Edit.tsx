import { FormEventHandler } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface UsuarioProp { id: number; name: string; email: string; rol: string; }

interface Props {
    usuario: UsuarioProp;
    rolesPermitidos: string[];
}

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

export default function UsuariosEdit({ usuario, rolesPermitidos }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name:  usuario.name,
        email: usuario.email,
        rol:   rolesPermitidos.includes(usuario.rol) ? usuario.rol : rolesPermitidos[0] ?? 'entrenador',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('usuarios.update', usuario.id));
    };

    return (
        <AppLayout title="Editar Usuario">
            <div className="max-w-lg mx-auto">

                <div className="mb-6">
                    <Link href={route('usuarios.index')} className="text-muted text-sm hover:text-secondary">
                        ← Volver a Usuarios
                    </Link>
                    <h1 className="text-2xl font-bold text-secondary mt-2">Editar Usuario</h1>
                    <p className="text-muted text-sm mt-1">{usuario.name}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <form onSubmit={submit} className="space-y-5">

                        <Field label="Nombre completo" error={errors.name} required>
                            <input
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                maxLength={255}
                                className={inputCls(!!errors.name)}
                            />
                        </Field>

                        <Field label="Correo electrónico" error={errors.email} required>
                            <input
                                type="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                className={inputCls(!!errors.email)}
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

                        {/* Nota sobre contraseña */}
                        <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-xs text-muted">
                            Para cambiar la contraseña del usuario, pedile que lo haga desde su propio perfil.
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-primary hover:bg-orange-600 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                {processing ? 'Guardando...' : 'Guardar cambios'}
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
