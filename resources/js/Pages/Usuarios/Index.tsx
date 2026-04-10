import { Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Usuario { id: number; name: string; email: string; rol: string; }

interface Props {
    usuarios: Usuario[];
    rolesPermitidos: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROL_BADGE: Record<string, string> = {
    dueno:          'bg-purple-100 text-purple-700',
    entrenador:     'bg-blue-100 text-blue-700',
    admin_caja:     'bg-green-100 text-green-700',
    admin_alquiler: 'bg-orange-100 text-orange-700',
    alumno:         'bg-gray-100 text-gray-600',
};

const ROL_LABEL: Record<string, string> = {
    dueno:          'Dueño',
    entrenador:     'Entrenador',
    admin_caja:     'Admin Caja',
    admin_alquiler: 'Admin Alquiler',
    alumno:         'Alumno',
};

const ROL_ICON: Record<string, string> = {
    dueno:          '👑',
    entrenador:     '🏋️',
    admin_caja:     '💰',
    admin_alquiler: '🏟️',
    alumno:         '👤',
};

const AVATAR_COLORS = [
    'bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-rose-500',
    'bg-amber-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-pink-500',
];

function avatarColor(nombre: string): string {
    return AVATAR_COLORS[nombre.charCodeAt(0) % AVATAR_COLORS.length];
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function UsuariosIndex({ usuarios }: Props) {
    const { flash, auth } = usePage().props as any;
    const currentUserId = auth?.user?.id;

    return (
        <AppLayout title="Equipo">
            <div className="max-w-4xl mx-auto">

                {/* Encabezado */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary">Usuarios y roles</h1>
                        <p className="text-muted text-sm mt-1">
                            {usuarios.length} {usuarios.length === 1 ? 'usuario con acceso' : 'usuarios con acceso'} al sistema
                        </p>
                    </div>
                    <Link
                        href={route('usuarios.create')}
                        className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        + Nuevo usuario
                    </Link>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="bg-green-50 border border-success text-success rounded-lg px-4 py-3 mb-4 text-sm">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-red-50 border border-danger text-danger rounded-lg px-4 py-3 mb-4 text-sm">
                        {flash.error}
                    </div>
                )}

                {/* Info */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5 text-xs text-blue-700">
                    <strong>Nota:</strong> Podés crear usuarios con rol de Entrenador, Admin Caja o Admin Alquiler.
                    Los alumnos se crean desde el módulo de Alumnos.
                </div>

                {/* Tabla */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-muted uppercase text-xs tracking-wide">
                            <tr>
                                <th className="px-5 py-3 text-left">Usuario</th>
                                <th className="px-5 py-3 text-left">Email</th>
                                <th className="px-5 py-3 text-center">Rol</th>
                                <th className="px-5 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {usuarios.map((u) => {
                                const isMe = u.id === currentUserId;
                                return (
                                    <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${isMe ? 'bg-orange-50/40' : ''}`}>
                                        {/* Avatar + nombre */}
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColor(u.name)}`}>
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-secondary">{u.name}</span>
                                                    {isMe && (
                                                        <span className="ml-2 text-xs text-primary font-medium">(vos)</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-gray-500 text-xs">{u.email}</td>
                                        <td className="px-5 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ROL_BADGE[u.rol] ?? 'bg-gray-100 text-gray-600'}`}>
                                                <span>{ROL_ICON[u.rol]}</span>
                                                {ROL_LABEL[u.rol] ?? u.rol}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            {isMe ? (
                                                <span className="text-xs text-muted italic">Tu cuenta</span>
                                            ) : u.rol === 'dueno' ? (
                                                <span className="text-xs text-muted italic">—</span>
                                            ) : (
                                                <Link
                                                    href={route('usuarios.edit', u.id)}
                                                    className="text-blue-600 hover:underline text-xs"
                                                >
                                                    Editar
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

            </div>
        </AppLayout>
    );
}
