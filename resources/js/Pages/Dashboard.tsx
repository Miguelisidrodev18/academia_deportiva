import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import StatCard from '@/Components/StatCard';
import { avatarColor } from '@/utils/ui';
import { getSportIcon, NIVEL_BADGE, NIVEL_LABEL } from '@/utils/sportIcons';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface Kpis {
    alumnos_activos: number;
    talleres_activos: number;
    reservas_hoy: number;
    deuda_total: number;
    ventas_mes: number;
}

interface Alerta {
    tipo: 'danger' | 'warning';
    mensaje: string;
    href: string;
    label: string;
}

interface AlumnoDeuda {
    id: number;
    nombre: string;
    deuda: number;
}

interface ReservaHoy {
    id: number;
    tipo_cliente: 'alumno' | 'externo';
    cliente_nombre: string | null;
    estado: string;
    espacio: { id: number; nombre: string };
    rango_horario: { id: number; hora_inicio: string; hora_fin: string };
    alumno: { id: number; nombre: string } | null;
}

interface Taller {
    id: number;
    nombre: string;
    nivel: string;
    cupo_maximo: number;
    inscriptos: number;
    disciplina: { id: number; nombre: string };
}

interface TopProducto {
    nombre: string;
    total_cantidad: number;
    total_monto: number;
}

interface PagoMensual {
    mes: string;
    total: number;
}

interface Props {
    kpis: Kpis;
    alertas: Alerta[];
    alumnos_con_deuda: AlumnoDeuda[];
    reservas_hoy: ReservaHoy[];
    talleres: Taller[];
    top_productos: TopProducto[];
    pagos_mensuales: PagoMensual[];
}

const ESTADO_BADGE: Record<string, string> = {
    confirmada: 'bg-green-500/20 text-green-400',
    finalizada: 'bg-slate-700/50 text-slate-400',
    cancelada: 'bg-red-500/20 text-red-400',
};

function formatPesos(n: number) {
    return `S/ ${n.toLocaleString('es-PE', { maximumFractionDigits: 0 })}`;
}

function safeRoute(name: string, params?: string | number) {
    return route().has(name) ? route(name, params as never) : null;
}

export default function Dashboard({
    kpis,
    alertas,
    alumnos_con_deuda,
    reservas_hoy,
    talleres,
    top_productos,
    pagos_mensuales,
}: Props) {
    const ocupacionBar = (inscriptos: number, max: number) => {
        const pct = max > 0 ? Math.round((inscriptos / max) * 100) : 0;
        const color = pct >= 100 ? 'bg-danger' : pct >= 80 ? 'bg-yellow-400' : 'bg-success';

        return { pct, color };
    };

    const totalMesActual = pagos_mensuales[pagos_mensuales.length - 1]?.total ?? 0;
    const totalMesAnterior = pagos_mensuales[pagos_mensuales.length - 2]?.total ?? 0;
    const deltaLabel = totalMesAnterior > 0
        ? `${totalMesActual >= totalMesAnterior ? '+' : ''}${Math.round(((totalMesActual - totalMesAnterior) / totalMesAnterior) * 100)}% vs mes anterior`
        : undefined;

    const maxVentas = top_productos[0]?.total_cantidad ?? 1;
    const accesosRapidos = [
        { href: safeRoute('alumnos.create'), icon: '👤', label: 'Nuevo alumno', bg: 'bg-blue-500/10', hover: 'hover:bg-blue-500/20' },
        { href: safeRoute('reservas.create'), icon: '🏟️', label: 'Nueva reserva', bg: 'bg-violet-500/10', hover: 'hover:bg-violet-500/20' },
        { href: safeRoute('ventas.create'), icon: '🛒', label: 'Registrar venta', bg: 'bg-orange-500/10', hover: 'hover:bg-orange-500/20' },
        { href: safeRoute('prestamos.create'), icon: '📦', label: 'Nuevo prestamo', bg: 'bg-yellow-500/10', hover: 'hover:bg-yellow-500/20' },
        { href: safeRoute('asistencia.escanear'), icon: '📷', label: 'Escanear QR', bg: 'bg-emerald-500/10', hover: 'hover:bg-emerald-500/20' },
        { href: safeRoute('pagos.create'), icon: '💳', label: 'Registrar pago', bg: 'bg-slate-500/10', hover: 'hover:bg-slate-500/20' },
    ].filter((link): link is typeof link & { href: string } => Boolean(link.href));

    return (
        <AppLayout title="Dashboard">
            {/* ══ HERO BANNER ══ */}
            <div className="relative mb-6 overflow-hidden rounded-2xl border border-green-500/25 shadow-[0_0_60px_rgba(20,83,45,0.45),0_0_120px_rgba(20,83,45,0.15)]">

                {/* Imagen de cancha */}
                <img
                    src="/images/campo.svg"
                    alt="" aria-hidden
                    className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
                    style={{ opacity: 0.55 }}
                />

                {/* Gradiente oscuro horizontal — legibilidad texto */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/10 pointer-events-none" />
                {/* Gradiente vertical — profundidad inferior */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

                {/* Luces de estadio desde arriba (focos) */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 100% 55% at 50% -8%, rgba(34,197,94,0.20) 0%, transparent 62%)' }}
                />
                {/* Acento naranja de branding desde la derecha */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 40% 80% at 98% 50%, rgba(249,115,22,0.12) 0%, transparent 65%)' }}
                />

                {/* ── Balón con glow verde ── */}
                <img
                    src="/images/balon.svg"
                    alt="" aria-hidden
                    className="pointer-events-none absolute -bottom-6 -right-6 h-48 w-48 select-none"
                    style={{
                        opacity: 0.88,
                        transform: 'rotate(-18deg)',
                        filter: [
                            'drop-shadow(0 0 32px rgba(34,197,94,0.40))',
                            'drop-shadow(0 0 12px rgba(255,255,255,0.12))',
                            'drop-shadow(0 12px 22px rgba(0,0,0,0.65))',
                        ].join(' '),
                    }}
                />

                {/* Contenido */}
                <div className="relative flex items-center px-7 py-8">
                    <div>
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-green-400/75">
                            Panel de control
                        </p>
                        <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.70)]">
                            Bienvenido al panel
                        </h1>
                        <p className="mt-2.5 flex items-center gap-2 text-sm capitalize text-slate-300/80">
                            <span className="text-base leading-none">📅</span>
                            {new Date().toLocaleDateString('es-PE', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Alertas */}
            {alertas.length > 0 && (
                <div className="mb-5 space-y-2">
                    {alertas.map((alerta, i) => (
                        <div
                            key={i}
                            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm backdrop-blur-sm ${
                                alerta.tipo === 'danger'
                                    ? 'border-red-500/30 bg-red-500/10 text-red-400'
                                    : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300'
                            }`}
                        >
                            <span>{alerta.mensaje}</span>
                            <Link
                                href={alerta.href}
                                className={`ml-4 shrink-0 text-xs font-semibold underline ${
                                    alerta.tipo === 'danger' ? 'text-red-400' : 'text-yellow-300'
                                }`}
                            >
                                {alerta.label} →
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* KPI Cards */}
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                <StatCard icon="👥" label="Alumnos activos" value={kpis.alumnos_activos} accent="border-l-blue-500" iconBg="bg-blue-500/20" />
                <StatCard icon="🏋️" label="Talleres" value={kpis.talleres_activos} accent="border-l-emerald-500" iconBg="bg-emerald-500/20" />
                <StatCard icon="🏟️" label="Reservas hoy" value={kpis.reservas_hoy} accent="border-l-violet-500" iconBg="bg-violet-500/20" />
                <StatCard
                    icon="💰"
                    label="Deuda pendiente"
                    value={formatPesos(kpis.deuda_total)}
                    valueClass={kpis.deuda_total > 0 ? 'text-danger' : 'text-success'}
                    accent={kpis.deuda_total > 0 ? 'border-l-danger' : 'border-l-success'}
                    iconBg={kpis.deuda_total > 0 ? 'bg-red-500/20' : 'bg-green-500/20'}
                    sub={kpis.deuda_total > 0 ? 'requiere atencion' : 'todo al dia'}
                />
                <StatCard
                    icon="🛒"
                    label="Ventas del mes"
                    value={formatPesos(kpis.ventas_mes)}
                    accent="border-l-orange-400"
                    iconBg="bg-orange-500/20"
                    sub={kpis.ventas_mes > 0 ? 'kiosco / cantina' : 'sin ventas aun'}
                />
            </div>

            {/* Chart + Accesos rapidos */}
            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-green-500/10 bg-white/5 backdrop-blur-lg p-5 shadow-[0_4px_24px_rgba(0,0,0,0.40)] lg:col-span-2">
                    <div className="mb-4 flex items-start justify-between">
                        <div>
                            <h2 className="font-bold text-white">Ingresos por cuotas</h2>
                            <p className="mt-0.5 text-xs text-slate-500">Ultimos 6 meses</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-black text-white">{formatPesos(totalMesActual)}</p>
                            {deltaLabel && (
                                <p className={`text-xs font-semibold ${totalMesActual >= totalMesAnterior ? 'text-success' : 'text-danger'}`}>
                                    {deltaLabel}
                                </p>
                            )}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={pagos_mensuales} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1a2d1e" />
                            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                            <YAxis
                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => (v === 0 ? '0' : `S/ ${(v / 1000).toFixed(0)}k`)}
                            />
                            <Tooltip
                                formatter={(v) => [formatPesos(Number(v)), 'Total']}
                                contentStyle={{
                                    fontSize: 12,
                                    borderRadius: 8,
                                    background: '#0f1f14',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#fff',
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="#F97316"
                                strokeWidth={2.5}
                                fill="url(#colorTotal)"
                                dot={{ r: 3, fill: '#F97316' }}
                                activeDot={{ r: 5 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="rounded-2xl border border-green-500/10 bg-white/5 backdrop-blur-lg p-5 shadow-[0_4px_24px_rgba(0,0,0,0.40)]">
                    <h2 className="mb-4 font-bold text-white">Accesos rapidos</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {accesosRapidos.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex flex-col items-center justify-center gap-2 rounded-xl p-3 text-center transition-all duration-300 border border-green-500/5 hover:scale-105 hover:border-green-500/30 hover:bg-white/10 hover:shadow-[0_0_22px_rgba(74,222,128,0.18)] ${link.bg} ${link.hover}`}
                            >
                                <span className="text-2xl">{link.icon}</span>
                                <span className="text-xs font-medium leading-tight text-slate-300">{link.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom 3 cards */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Reservas hoy */}
                <div className="rounded-2xl border border-green-500/10 bg-white/5 backdrop-blur-lg p-5 shadow-[0_4px_24px_rgba(0,0,0,0.40)]">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 font-bold text-white">
                            <span className="h-[5px] w-[5px] rounded-full bg-violet-400 flex-shrink-0" />
                            Reservas de hoy
                        </h2>
                        {safeRoute('reservas.index') && (
                            <Link href={safeRoute('reservas.index')!} className="text-xs text-primary transition-colors hover:text-orange-300">
                                Ver todas →
                            </Link>
                        )}
                    </div>
                    {reservas_hoy.length === 0 ? (
                        <div className="py-8 text-center">
                            <p className="mb-2 text-3xl">🏟️</p>
                            <p className="text-sm text-slate-500">Sin reservas para hoy</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {reservas_hoy.map((r) => {
                                const reservaHref = safeRoute('reservas.show', r.id);

                                if (!reservaHref) {
                                    return null;
                                }

                                return (
                                    <Link
                                        key={r.id}
                                        href={reservaHref}
                                        className="group flex items-center justify-between rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-white/5"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-slate-200 transition-colors group-hover:text-primary">
                                                {r.espacio.nombre}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {r.rango_horario.hora_inicio}-{r.rango_horario.hora_fin}
                                                {' · '}
                                                {r.tipo_cliente === 'alumno' && r.alumno ? r.alumno.nombre : r.cliente_nombre ?? 'Externo'}
                                            </p>
                                        </div>
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ESTADO_BADGE[r.estado] ?? 'bg-slate-700/50 text-slate-400'}`}>
                                            {r.estado.charAt(0).toUpperCase() + r.estado.slice(1)}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Top productos / Talleres */}
                <div className="rounded-2xl border border-green-500/10 bg-white/5 backdrop-blur-lg p-5 shadow-[0_4px_24px_rgba(0,0,0,0.40)]">
                    {top_productos.length > 0 ? (
                        <>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="flex items-center gap-2 font-bold text-white">
                                <span className="h-[5px] w-[5px] rounded-full bg-primary flex-shrink-0" />
                                Top productos del mes
                            </h2>
                                {safeRoute('ventas.index') && (
                                    <Link href={safeRoute('ventas.index')!} className="text-xs text-primary transition-colors hover:text-orange-300">
                                        Ver ventas →
                                    </Link>
                                )}
                            </div>
                            <div className="space-y-3">
                                {top_productos.map((p, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="w-4 shrink-0 text-xs font-bold text-slate-500">{i + 1}</span>
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1 flex items-center justify-between">
                                                <span className="truncate text-xs font-medium text-slate-200">{p.nombre}</span>
                                                <div className="ml-2 flex shrink-0 gap-2">
                                                    <span className="text-[10px] text-slate-500">{p.total_cantidad} und.</span>
                                                    <span className="text-[10px] font-semibold text-white">{formatPesos(p.total_monto)}</span>
                                                </div>
                                            </div>
                                            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                                                <div
                                                    className="h-full rounded-full bg-primary"
                                                    style={{ width: `${Math.round((p.total_cantidad / maxVentas) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="flex items-center gap-2 font-bold text-white">
                                <span className="h-[5px] w-[5px] rounded-full bg-emerald-400 flex-shrink-0" />
                                Talleres activos
                            </h2>
                                {safeRoute('talleres.index') && (
                                    <Link href={safeRoute('talleres.index')!} className="text-xs text-primary transition-colors hover:text-orange-300">
                                        Ver todos →
                                    </Link>
                                )}
                            </div>
                            {talleres.length === 0 ? (
                                <div className="py-8 text-center">
                                    <p className="mb-2 text-3xl">🏋️</p>
                                    <p className="text-sm text-slate-500">Sin talleres activos</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {talleres.map((t) => {
                                        const { pct, color } = ocupacionBar(t.inscriptos, t.cupo_maximo);

                                        return (
                                            <div key={t.id} className="flex items-center gap-3">
                                                <span className="w-7 flex-shrink-0 text-center text-lg">{getSportIcon(t.disciplina.nombre)}</span>
                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-1 flex items-center justify-between">
                                                        <span className="truncate text-xs font-medium text-slate-200">{t.nombre}</span>
                                                        <div className="ml-2 flex shrink-0 items-center gap-1.5">
                                                            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${NIVEL_BADGE[t.nivel] ?? 'bg-slate-700/50 text-slate-400'}`}>
                                                                {NIVEL_LABEL[t.nivel] ?? t.nivel}
                                                            </span>
                                                            <span className="text-[10px] text-slate-500">{t.inscriptos}/{t.cupo_maximo}</span>
                                                        </div>
                                                    </div>
                                                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                                                        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Deudas pendientes */}
                <div className="rounded-2xl border border-green-500/10 bg-white/5 backdrop-blur-lg p-5 shadow-[0_4px_24px_rgba(0,0,0,0.40)]">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="flex items-center gap-2 font-bold text-white">
                            <span className="h-[5px] w-[5px] rounded-full bg-danger flex-shrink-0" />
                            Deudas pendientes
                        </h2>
                        {safeRoute('alumnos.index') && (
                            <Link href={safeRoute('alumnos.index')!} className="text-xs text-primary transition-colors hover:text-orange-300">
                                Ver todos →
                            </Link>
                        )}
                    </div>
                    {alumnos_con_deuda.length === 0 ? (
                        <div className="py-8 text-center">
                            <p className="mb-2 text-3xl">✅</p>
                            <p className="text-sm font-medium text-success">Todos al dia</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {alumnos_con_deuda.map((a) => {
                                const alumnoHref = safeRoute('alumnos.show', a.id);

                                if (!alumnoHref) {
                                    return null;
                                }

                                return (
                                    <Link
                                        key={a.id}
                                        href={alumnoHref}
                                        className="group -mx-2 flex items-center justify-between rounded-lg px-2 py-2 transition-all duration-200 hover:bg-white/5"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColor(a.nombre)}`}>
                                                {a.nombre.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="max-w-[110px] truncate text-sm text-slate-300 transition-colors group-hover:text-primary">
                                                {a.nombre}
                                            </span>
                                        </div>
                                        <span className="shrink-0 text-sm font-bold text-danger">{formatPesos(a.deuda)}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
