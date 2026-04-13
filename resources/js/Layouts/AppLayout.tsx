import { useState, ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { User } from '@/types';
import toast, { Toaster } from 'react-hot-toast';
import {
    Squares2X2Icon,
    TrophyIcon,
    AcademicCapIcon,
    UserGroupIcon,
    ClipboardDocumentListIcon,
    CreditCardIcon,
    QrCodeIcon,
    ClockIcon,
    BuildingOffice2Icon,
    ShoppingCartIcon,
    WrenchScrewdriverIcon,
    UserCircleIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    ArrowLeftStartOnRectangleIcon,
    Bars3Icon,
} from '@heroicons/react/24/outline';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Props {
    title?: string;
    children: ReactNode;
}

interface NavItem {
    label: string;
    href?: string;
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    badge?: string;
    roles?: string[];
}

interface NavGroup {
    label?: string;
    items: NavItem[];
}

// ─── Grupos del Sidebar ───────────────────────────────────────────────────────

const navGroups: NavGroup[] = [
    {
        items: [
            { label: 'Dashboard',        href: '/dashboard',           Icon: Squares2X2Icon },
        ],
    },
    {
        label: 'GESTIÓN',
        items: [
            { label: 'Disciplinas',      href: '/disciplinas',         Icon: TrophyIcon,                  roles: ['dueno'] },
            { label: 'Talleres',         href: '/talleres',            Icon: AcademicCapIcon },
            { label: 'Alumnos',          href: '/alumnos',             Icon: UserGroupIcon },
            { label: 'Inscripciones',    href: '/inscripciones',       Icon: ClipboardDocumentListIcon },
            { label: 'Pagos',            href: '/pagos',               Icon: CreditCardIcon },
        ],
    },
    {
        label: 'ASISTENCIA',
        items: [
            { label: 'Escanear QR',      href: '/asistencia/escanear', Icon: QrCodeIcon,      roles: ['dueno', 'entrenador'] },
            { label: 'Historial',        href: '/asistencias',         Icon: ClockIcon,        roles: ['dueno', 'entrenador'] },
        ],
    },
    {
        label: 'ALQUILERES',
        items: [
            { label: 'Reservas',         href: '/reservas',            Icon: BuildingOffice2Icon,        roles: ['dueno', 'admin_alquiler'] },
            { label: 'Préstamos',        href: '/prestamos',           Icon: WrenchScrewdriverIcon,      roles: ['dueno', 'admin_alquiler'] },
        ],
    },
    {
        label: 'VENTAS',
        items: [
            { label: 'Ventas',           href: '/ventas',              Icon: ShoppingCartIcon,      roles: ['dueno', 'admin_caja'] },
            { label: 'Productos',        href: '/productos',           Icon: WrenchScrewdriverIcon, roles: ['dueno'] },
        ],
    },
    {
        label: 'ADMINISTRACIÓN',
        items: [
            { label: 'Usuarios',         href: '/usuarios',            Icon: UserCircleIcon,  roles: ['dueno'] },
            { label: 'Reportes',         Icon: ChartBarIcon,            badge: 'Pronto',       roles: ['dueno'] },
            { label: 'Configuración',    Icon: Cog6ToothIcon,           badge: 'Pronto',       roles: ['dueno'] },
        ],
    },
];

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AppLayout({ title, children }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { auth } = usePage<{ auth: { user: User & { rol: string; academia?: { nombre: string } } } }>().props;
    const user = auth.user;
    const currentPath = window.location.pathname;

    const handleDisabledClick = (badge: string) => {
        const messages: Record<string, string> = {
            'Pronto':          '🚀 Módulo disponible en la próxima versión',
            'En construcción': '🔧 Este módulo está en construcción',
        };
        toast(messages[badge] ?? 'Módulo no disponible aún', { icon: '⚙️', duration: 3000 });
    };

    const rolLabel: Record<string, string> = {
        dueno: 'Dueño', entrenador: 'Entrenador',
        admin_caja: 'Admin Caja', admin_alquiler: 'Admin Alquiler', alumno: 'Alumno',
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Marca */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/60">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-md">
                    {(user?.academia?.nombre ?? 'A').charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                    <p className="text-white font-semibold text-sm leading-tight truncate">
                        {user?.academia?.nombre ?? 'Mi Academia'}
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5 truncate">
                        {rolLabel[user?.rol ?? ''] ?? user?.rol ?? 'usuario'}
                    </p>
                </div>
            </div>

            {/* Navegación */}
            <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
                {navGroups.map((group, gi) => {
                    const visibleItems = group.items.filter(
                        item => !item.roles || item.roles.includes(user?.rol ?? '')
                    );
                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={gi}>
                            {group.label && (
                                <p className="px-2 mb-1 text-[10px] font-semibold text-slate-500 tracking-widest uppercase">
                                    {group.label}
                                </p>
                            )}
                            <div className="space-y-0.5">
                                {visibleItems.map(item => {
                                    const isActive = item.href && currentPath.startsWith(item.href);
                                    const isDisabled = !item.href;

                                    if (isDisabled) {
                                        return (
                                            <button
                                                key={item.label}
                                                onClick={() => handleDisabledClick(item.badge!)}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-700/50 transition-colors text-[13px] text-left group"
                                            >
                                                <item.Icon className="w-4 h-4 flex-shrink-0" />
                                                <span className="flex-1">{item.label}</span>
                                                <span className="text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded-full">
                                                    {item.badge}
                                                </span>
                                            </button>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={item.label}
                                            href={item.href!}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-[13px] ${
                                                isActive
                                                    ? 'bg-primary text-white font-medium shadow-sm'
                                                    : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                                            }`}
                                        >
                                            <item.Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="border-t border-slate-700/60 px-3 py-3">
                <div className="flex items-center gap-2.5 px-2 py-1.5 mb-1">
                    <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {(user?.name ?? 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden flex-1">
                        <p className="text-white text-xs font-medium truncate">{user?.name}</p>
                        <p className="text-slate-400 text-[10px] truncate">{user?.email}</p>
                    </div>
                </div>
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors text-[13px]"
                >
                    <ArrowLeftStartOnRectangleIcon className="w-4 h-4" />
                    <span>Cerrar sesión</span>
                </Link>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Toaster position="top-right" toastOptions={{ className: 'text-sm' }} />

            {/* Sidebar desktop */}
            <aside className="hidden md:flex md:flex-col md:w-60 bg-secondary flex-shrink-0 shadow-xl">
                <SidebarContent />
            </aside>

            {/* Sidebar mobile overlay */}
            {sidebarOpen && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)} />
                    <aside className="fixed inset-y-0 left-0 w-60 bg-secondary z-30 flex flex-col md:hidden shadow-2xl">
                        <SidebarContent />
                    </aside>
                </>
            )}

            {/* Contenido principal */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Header mobile */}
                <header className="md:hidden bg-secondary text-white px-4 py-3 flex items-center gap-3 flex-shrink-0 shadow-md">
                    <button onClick={() => setSidebarOpen(true)} className="text-white p-1 rounded-md hover:bg-slate-700 transition-colors">
                        <Bars3Icon className="w-5 h-5" />
                    </button>
                    <span className="font-semibold text-sm flex-1 truncate">{user?.academia?.nombre ?? 'Academia Deportiva'}</span>
                </header>

                {/* Área de contenido scrollable */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
