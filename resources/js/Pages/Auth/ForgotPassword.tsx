import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

/**
 * Esta academia no gestiona recuperación de contraseñas por email.
 * El dueño debe restablecer el acceso manualmente.
 */
export default function ForgotPassword() {
    return (
        <GuestLayout>
            <Head title="Recuperar acceso" />

            <div className="text-center py-4">
                <span className="text-6xl block mb-5">🔐</span>

                <h2 className="text-xl font-bold text-secondary mb-2">
                    ¿Olvidaste tu contraseña?
                </h2>

                <p className="text-sm text-muted leading-relaxed mb-6">
                    El sistema no utiliza recuperación por email.
                    Comunicate con el <strong className="text-secondary">administrador de tu academia</strong> para
                    que restablezca tu acceso.
                </p>

                <div className="rounded-xl bg-orange-50 border border-orange-100 p-4 mb-6 text-left">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                        ¿Qué hacer?
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1.5">
                        <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">1.</span>
                            Contactá al dueño o encargado de tu academia.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">2.</span>
                            Pedile que ingrese con su cuenta de dueño.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">3.</span>
                            El dueño puede editar tu usuario y cambiar la contraseña.
                        </li>
                    </ul>
                </div>

                <Link
                    href={route('login')}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-orange-600 transition-colors"
                >
                    ← Volver al inicio de sesión
                </Link>
            </div>
        </GuestLayout>
    );
}
