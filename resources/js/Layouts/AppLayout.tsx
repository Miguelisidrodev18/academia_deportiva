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

    const SidebarContent = () => (
        <div className="flex h-full flex-col">
            <div className="border-b border-slate-700/60 px-4 py-5">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 flex-shrink-0 rounded-xl bg-primary text-base font-bold text-white shadow-md flex items-center justify-center">
                        {(user?.academia?.nombre ?? 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <p className="truncate text-sm font-semibold leading-tight text-white">
                            {user?.academia?.nombre ?? 'Mi Academia'}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-slate-400">
                            {rolLabel[user?.rol ?? ''] ?? user?.rol ?? 'usuario'}
                        </p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-3">
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
                                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                                    {group.label}
                                </p>
                            )}
                            <div className="space-y-0.5">
                                {visibleItems.map((item) => {
                                    const href = item.routeName ? route(item.routeName) : undefined;
                                    const isActive = item.routeName ? route().current(item.routeName) : false;
                                    const isDisabled = !href;

                                    if (isDisabled) {
                                        return (
                                            <button
                                                key={item.label}
                                                onClick={() => handleDisabledClick(item.badge!)}
                                                className="group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-slate-500 transition-colors hover:bg-slate-700/50"
                                            >
                                                <item.Icon className="h-4 w-4 flex-shrink-0" />
                                                <span className="flex-1">{item.label}</span>
                                                <span className="rounded-full bg-slate-700 px-1.5 py-0.5 text-[10px] text-slate-400">
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
                                            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-all ${
                                                isActive
                                                    ? 'bg-primary font-medium text-white shadow-sm'
                                                    : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                                            }`}
                                        >
                                            <item.Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </nav>

            <div className="border-t border-slate-700/60 px-3 py-3">
                <div className="mb-1 flex items-center gap-2.5 px-2 py-1.5">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-600 text-xs font-semibold text-white">
                        {(user?.name ?? 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="truncate text-xs font-medium text-white">{user?.name}</p>
                        <p className="truncate text-[10px] text-slate-400">{user?.email}</p>
                    </div>
                </div>
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                    <ArrowLeftStartOnRectangleIcon className="h-4 w-4" />
                    <span>Cerrar sesion</span>
                </Link>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <title>{title ? `${title} - Academia Deportiva` : 'Academia Deportiva'}</title>
            <Toaster position="top-right" toastOptions={{ className: 'text-sm' }} />

            <aside className="hidden w-60 flex-shrink-0 bg-secondary shadow-xl md:flex md:flex-col">
                <SidebarContent />
            </aside>

            {sidebarOpen && (
                <>
                    <div
                        className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-secondary shadow-2xl md:hidden">
                        <SidebarContent />
                    </aside>
                </>
            )}

            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex flex-shrink-0 items-center gap-3 bg-secondary px-4 py-3 text-white shadow-md md:hidden">
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

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
