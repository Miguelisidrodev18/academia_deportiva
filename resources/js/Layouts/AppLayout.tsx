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
    DocumentTextIcon,
} from '@heroicons/react/24/outline';

interface Props {
    title?: string;
    children: ReactNode;
}

interface NavItem {
    label: string;
    routeName?: string;
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    badge?: string;
    roles?: string[];
}

interface NavGroup {
    label?: string;
    items: NavItem[];
}

const navGroups: NavGroup[] = [
    {
        items: [
            { label: 'Dashboard', routeName: 'dashboard', Icon: Squares2X2Icon },
        ],
    },
    {
        label: 'Gestion',
        items: [
            { label: 'Disciplinas', routeName: 'disciplinas.index', Icon: TrophyIcon, roles: ['dueno'] },
            { label: 'Talleres', routeName: 'talleres.index', Icon: AcademicCapIcon },
            { label: 'Alumnos', routeName: 'alumnos.index', Icon: UserGroupIcon },
            { label: 'Inscripciones', routeName: 'inscripciones.index', Icon: ClipboardDocumentListIcon },
            { label: 'Pagos', routeName: 'pagos.index', Icon: CreditCardIcon },
        ],
    },
    {
        label: 'Asistencia',
        items: [
            { label: 'Escanear QR', routeName: 'asistencia.escanear', Icon: QrCodeIcon, roles: ['dueno', 'entrenador'] },
            { label: 'Historial', routeName: 'asistencias.index', Icon: ClockIcon, roles: ['dueno', 'entrenador'] },
        ],
    },
    {
        label: 'Alquileres',
        items: [
            { label: 'Reservas', routeName: 'reservas.index', Icon: BuildingOffice2Icon, roles: ['dueno', 'admin_alquiler'] },
            { label: 'Prestamos', routeName: 'prestamos.index', Icon: WrenchScrewdriverIcon, roles: ['dueno', 'admin_alquiler'] },
        ],
    },
    {
        label: 'Ventas',
        items: [
            { label: 'Ventas', routeName: 'ventas.index', Icon: ShoppingCartIcon, roles: ['dueno', 'admin_caja'] },
            { label: 'Productos', routeName: 'productos.index', Icon: WrenchScrewdriverIcon, roles: ['dueno'] },
        ],
    },
    {
        label: 'Administracion',
        items: [
            { label: 'Usuarios', routeName: 'usuarios.index', Icon: UserCircleIcon, roles: ['dueno'] },
            { label: 'Logs', routeName: 'logs.index', Icon: DocumentTextIcon, roles: ['dueno'] },
            { label: 'Reportes', Icon: ChartBarIcon, badge: 'Pronto', roles: ['dueno'] },
            { label: 'Configuracion', Icon: Cog6ToothIcon, badge: 'Pronto', roles: ['dueno'] },
        ],
    },
];

export default function AppLayout({ title, children }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { auth } = usePage<{ auth: { user: User & { rol: string; academia?: { nombre: string } } } }>().props;
    const user = auth.user;

    const handleDisabledClick = (badge: string) => {
        const messages: Record<string, string> = {
            Pronto: 'Modulo disponible en la proxima version',
            'En construccion': 'Este modulo esta en construccion',
        };

        toast(messages[badge] ?? 'Modulo no disponible aun', { icon: '⚙️', duration: 3000 });
    };

    const rolLabel: Record<string, string> = {
        dueno: 'Dueno',
        entrenador: 'Entrenador',
        admin_caja: 'Admin Caja',
        admin_alquiler: 'Admin Alquiler',
        alumno: 'Alumno',
    };

    const safeRoute = (name?: string) => {
        if (!name || !route().has(name)) {
            return null;
        }

        return route(name);
    };

    const SidebarContent = () => (
        <div className="flex h-full flex-col">
            <div className="border-b border-white/[0.08] px-4 py-5">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-primary to-orange-600 text-base font-bold text-white shadow-lg flex items-center justify-center ring-2 ring-primary/30">
                        {(user?.academia?.nombre ?? 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="truncate text-sm font-bold leading-tight text-white">
                            {user?.academia?.nombre ?? 'Mi Academia'}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-green-400/70">
                            <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400" />
                            {rolLabel[user?.rol ?? ''] ?? user?.rol ?? 'usuario'}
                        </p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
                {navGroups.map((group, gi) => {
                    const visibleItems = group.items.filter(
                        (item) => !item.roles || item.roles.includes(user?.rol ?? ''),
                    );

                    if (visibleItems.length === 0) {
                        return null;
                    }

                    return (
                        <div key={gi}>
                            {group.label && (
                                <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-green-400/40">
                                    {group.label}
                                </p>
                            )}
                            <div className="space-y-0.5">
                                {visibleItems.map((item) => {
                                    const href = safeRoute(item.routeName) ?? undefined;
                                    const isActive = item.routeName ? route().current(item.routeName) : false;
                                    const isDisabled = !href;

                                    if (isDisabled) {
                                        return (
                                            <button
                                                key={item.label}
                                                onClick={() => handleDisabledClick(item.badge!)}
                                                className="group flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] text-slate-600 transition-all duration-200 hover:bg-white/5 hover:text-slate-400"
                                            >
                                                <item.Icon className="h-4 w-4 flex-shrink-0" />
                                                <span className="flex-1">{item.label}</span>
                                                <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-500">
                                                    {item.badge}
                                                </span>
                                            </button>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={item.label}
                                            href={href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] transition-all duration-300 ${
                                                isActive
                                                    ? 'border-l-2 border-green-400 bg-green-500/10 pl-[10px] font-semibold text-white shadow-[0_0_12px_rgba(74,222,128,0.15)]'
                                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                            }`}
                                        >
                                            <item.Icon className={`h-4 w-4 flex-shrink-0 transition-colors ${isActive ? 'text-green-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </nav>

            <div className="border-t border-white/[0.08] px-3 py-4">
                <div className="mb-2 flex items-center gap-2.5 rounded-xl bg-white/5 px-2.5 py-2.5">
                    <div className="relative flex-shrink-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600 text-xs font-bold text-white shadow-md">
                            {(user?.name ?? 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-[#0b2010]" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="truncate text-xs font-semibold text-white">{user?.name}</p>
                        <p className="truncate text-[10px] text-slate-500">{user?.email}</p>
                    </div>
                </div>
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-slate-500 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
                >
                    <ArrowLeftStartOnRectangleIcon className="h-4 w-4" />
                    <span>Cerrar sesion</span>
                </Link>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-[#020617]">
            <title>{title ? `${title} - Academia Deportiva` : 'Academia Deportiva'}</title>
            <Toaster position="top-right" toastOptions={{ className: 'text-sm' }} />

            <aside className="hidden w-60 flex-shrink-0 bg-gradient-to-b from-[#060d08] to-[#030805] border-r border-green-900/30 shadow-[2px_0_40px_rgba(0,0,0,0.60),2px_0_80px_rgba(20,83,45,0.08)] md:flex md:flex-col">
                <SidebarContent />
            </aside>

            {sidebarOpen && (
                <>
                    <div
                        className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-gradient-to-b from-[#060d08] to-[#030805] border-r border-green-900/30 shadow-[2px_0_40px_rgba(0,0,0,0.60)] md:hidden">
                        <SidebarContent />
                    </aside>
                </>
            )}

            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex flex-shrink-0 items-center gap-3 bg-gradient-to-r from-green-900/80 to-[#060d08] px-4 py-4 text-white shadow-lg border-b border-green-900/30 md:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="rounded-md p-1 text-white transition-colors hover:bg-slate-700"
                    >
                        <Bars3Icon className="h-5 w-5" />
                    </button>
                    <span className="flex-1 truncate text-sm font-semibold">
                        {user?.academia?.nombre ?? 'Academia Deportiva'}
                    </span>
                </header>

                <main
                    className="flex-1 overflow-y-auto p-6"
                    style={{
                        backgroundColor: '#020617',
                        backgroundImage: [
                            /* iluminación global — foco cenital verde */
                            'radial-gradient(circle at top, rgba(34,197,94,0.12), transparent 70%)',
                            /* acento inferior suave */
                            'radial-gradient(circle at bottom, rgba(34,197,94,0.08), transparent 70%)',
                            /* focos de estadio desde arriba */
                            'radial-gradient(ellipse 100% 40% at 50% -3%, rgba(34,197,94,0.18) 0%, transparent 58%)',
                            /* glows de esquina */
                            'radial-gradient(ellipse 70% 50% at 88% 0%,   rgba(20,83,45,0.28) 0%, transparent 55%)',
                            'radial-gradient(ellipse 50% 40% at 12% 100%, rgba(20,83,45,0.20) 0%, transparent 50%)',
                            /* cuadrícula de campo — opacity 0.20 */
                            'repeating-linear-gradient(90deg, transparent 0, transparent 80px, rgba(255,255,255,0.20) 80px, rgba(255,255,255,0.20) 81px)',
                            'repeating-linear-gradient(0deg,  transparent 0, transparent 60px, rgba(255,255,255,0.15) 60px, rgba(255,255,255,0.15) 61px)',
                        ].join(','),
                    }}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
