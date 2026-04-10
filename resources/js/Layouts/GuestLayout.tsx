import { PropsWithChildren } from 'react';
import { Link } from '@inertiajs/react';

/**
 * Layout de pantalla dividida para páginas de autenticación.
 * - Panel izquierdo (solo desktop): gradiente naranja→oscuro con marca.
 * - Panel derecho: fondo blanco, contenido centrado.
 */
export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen flex">

            {/* ── Panel de marca (solo visible en lg+) ─────────────────────── */}
            <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center
                            bg-gradient-to-br from-primary to-secondary p-12 text-white">

                {/* Logo / ícono */}
                <div className="mb-8 flex h-20 w-20 items-center justify-center
                                rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
                    <span className="text-4xl">🏆</span>
                </div>

                <h1 className="text-4xl font-extrabold tracking-tight mb-3 text-center">
                    AcademiaDeportiva
                </h1>
                <p className="text-lg text-white/80 text-center max-w-xs leading-relaxed">
                    Gestión integral para tu academia: alumnos, talleres, pagos y asistencia en un solo lugar.
                </p>

                {/* Decoración: features */}
                <div className="mt-12 space-y-3 w-full max-w-xs">
                    {[
                        { icon: '👥', text: 'Gestión de alumnos e inscripciones' },
                        { icon: '📷', text: 'Asistencia por código QR' },
                        { icon: '💳', text: 'Control de pagos y cuotas' },
                        { icon: '📊', text: 'Reportes y estadísticas' },
                    ].map(f => (
                        <div key={f.text} className="flex items-center gap-3 text-white/90">
                            <span className="text-xl">{f.icon}</span>
                            <span className="text-sm">{f.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Panel de formulario ───────────────────────────────────────── */}
            <div className="flex flex-1 flex-col items-center justify-center
                            bg-gray-50 p-6 sm:p-10">

                {/* Logo pequeño en mobile */}
                <div className="mb-6 flex flex-col items-center lg:hidden">
                    <div className="flex h-14 w-14 items-center justify-center
                                    rounded-xl bg-primary shadow-md mb-2">
                        <span className="text-2xl">🏆</span>
                    </div>
                    <span className="text-lg font-bold text-secondary">AcademiaDeportiva</span>
                </div>

                {/* Contenido (formulario) */}
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        {children}
                    </div>
                </div>

                {/* Footer */}
                <p className="mt-6 text-xs text-gray-400">
                    &copy; {new Date().getFullYear()} AcademiaDeportiva. Todos los derechos reservados.
                </p>
            </div>

        </div>
    );
}
