import { useState, ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { User } from '@/types';
import toast, { Toaster } from 'react-hot-toast';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Props {
    /** El título de la página (aparece en la pestaña del navegador) */
    title?: string;
    children: ReactNode;
}

interface NavItem {
    label: string;
    href?: string;       // undefined = módulo no disponible aún
    icon: string;        // emoji o nombre de ícono
    badge?: string;      // "Pronto" | "En construcción" | "Fuera de MVP"
    roles?: string[];    // qué roles pueden ver este item (undefined = todos)
}

// ─── Ítems del Sidebar ────────────────────────────────────────────────────────

/**
 * Lista de ítems del sidebar en orden lógico.
 * - href definido → link activo
 * - href undefined → módulo deshabilitado, muestra badge y toast al hacer clic
 * - roles → filtro por rol (si el usuario no tiene ese rol, no se muestra)
 */
const navItems: NavItem[] = [
    // ── Módulos activos ──────────────────────────────────────────────────────
    { label: 'Dashboard',        href: '/dashboard',           icon: '📊' },
    { label: 'Disciplinas',      href: '/disciplinas',         icon: '🏅', roles: ['dueno'] },
    { label: 'Talleres',         href: '/talleres',            icon: '⚽' },
    { label: 'Alumnos',          href: '/alumnos',             icon: '👥' },
    { label: 'Inscripciones',    href: '/inscripciones',       icon: '📋' },
    { label: 'Pagos',            href: '/pagos',               icon: '💰' },
    { label: 'Asistencia QR',    href: '/asistencia/escanear', icon: '📷', roles: ['dueno', 'entrenador'] },
    { label: 'Historial asist.', href: '/asistencias',         icon: '✅', roles: ['dueno', 'entrenador'] },
    // ── Próximas sesiones (sin ruta aún) ────────────────────────────────────
    { label: 'Alquileres',       href: '/reservas',            icon: '🏟️', roles: ['dueno', 'admin_alquiler'] },
    { label: 'Equipamiento',     icon: '🎽',  badge: 'Pronto' },
    { label: 'Ventas',           icon: '🛒',  badge: 'Pronto' },
    // ── Solo dueño ──────────────────────────────────────────────────────────
    { label: 'Usuarios y roles', href: '/usuarios',            icon: '👤', roles: ['dueno'] },
    { label: 'Reportes',         icon: '📈',  badge: 'Pronto', roles: ['dueno'] },
    { label: 'Configuración',    icon: '⚙️',   badge: 'Pronto', roles: ['dueno'] },
];

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AppLayout({ title, children }: Props) {
    // Estado del sidebar en mobile: abierto o cerrado
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // usePage() nos da el usuario autenticado y sus datos vía Inertia
    const { auth } = usePage<{ auth: { user: User & { rol: string; academia?: { nombre: string } } } }>().props;
    const user = auth.user;

    // Ruta actual para resaltar el ítem activo en el sidebar
    const currentPath = window.location.pathname;

    /**
     * Maneja el clic en un ítem deshabilitado:
     * muestra un toast informativo y no navega.
     */
    const handleDisabledClick = (badge: string) => {
        const messages: Record<string, string> = {
            'Pronto':             '🚀 Módulo disponible en la próxima versión',
            'En construcción':    '🔧 Este módulo está en construcción',
            'Fuera de MVP':       '⏳ Módulo disponible en una versión futura',
        };
        toast(messages[badge] ?? 'Módulo no disponible aún', {
            icon: '⚙️',
            duration: 3000,
        });
    };

    // ─── Sidebar content (reutilizado en desktop y mobile) ──────────────────

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo / Nombre de la academia */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                    A
                </div>
                <div className="overflow-hidden">
                    <p className="text-white font-semibold text-sm truncate">
                        {user?.academia?.nombre ?? 'Mi Academia'}
                    </p>
                    <p className="text-slate-400 text-xs truncate capitalize">{user?.rol ?? 'usuario'}</p>
                </div>
            </div>

            {/* Navegación principal */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {navItems
                    // Filtrar por rol si el ítem tiene restricción
                    .filter((item) => !item.roles || item.roles.includes(user?.rol ?? ''))
                    .map((item) => {
                        const isActive = item.href && currentPath.startsWith(item.href);
                        const isDisabled = !item.href;

                        if (isDisabled) {
                            // Ítem deshabilitado: muestra badge gris y toast al hacer clic
                            return (
                                <button
                                    key={item.label}
                                    onClick={() => handleDisabledClick(item.badge!)}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-700 transition-colors text-sm text-left"
                                >
                                    <span className="text-base">{item.icon}</span>
                                    <span className="flex-1">{item.label}</span>
                                    <span className="text-xs bg-slate-600 text-slate-300 px-2 py-0.5 rounded-full">
                                        {item.badge}
                                    </span>
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={item.label}
                                href={item.href!}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                                    isActive
                                        ? 'bg-primary text-white font-medium'
                                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                }`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <span className="text-base">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
            </nav>

            {/* Footer del sidebar: usuario + logout */}
            <div className="border-t border-slate-700 px-4 py-4">
                <div className="text-slate-400 text-xs truncate mb-2">{user?.email}</div>
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="w-full text-left text-sm text-slate-400 hover:text-white transition-colors"
                >
                    🚪 Cerrar sesión
                </Link>
            </div>
        </div>
    );

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Toast container (para mensajes de módulos deshabilitados y otros) */}
            <Toaster position="top-right" />

            {/* ── SIDEBAR DESKTOP (fijo, siempre visible) ── */}
            <aside className="hidden md:flex md:flex-col md:w-64 bg-secondary flex-shrink-0">
                <SidebarContent />
            </aside>

            {/* ── SIDEBAR MOBILE (overlay, se abre con toggle) ── */}
            {sidebarOpen && (
                <>
                    {/* Overlay oscuro al fondo */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                    {/* Panel del sidebar */}
                    <aside className="fixed inset-y-0 left-0 w-64 bg-secondary z-30 flex flex-col md:hidden">
                        <SidebarContent />
                    </aside>
                </>
            )}

            {/* ── CONTENIDO PRINCIPAL ── */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Header (solo visible en mobile para mostrar el toggle) */}
                <header className="md:hidden bg-secondary text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
                    {/* Botón hamburguesa */}
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-white focus:outline-none"
                        aria-label="Abrir menú"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span className="font-semibold text-sm">{user?.academia?.nombre ?? 'Academia Deportiva'}</span>
                </header>

                {/* Área de contenido scrollable */}
                <main className="flex-1 overflow-y-auto p-6">
                    {title && (
                        <h1 className="text-2xl font-bold text-gray-800 mb-6">{title}</h1>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
