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
    confirmada: 'bg-green-100 text-success',
    finalizada: 'bg-gray-100 text-muted',
    cancelada: 'bg-red-100 text-danger',
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
        { href: safeRoute('alumnos.create'), icon: '👤', label: 'Nuevo alumno', bg: 'bg-blue-50', hover: 'hover:bg-blue-100' },
        { href: safeRoute('reservas.create'), icon: '🏟️', label: 'Nueva reserva', bg: 'bg-violet-50', hover: 'hover:bg-violet-100' },
        { href: safeRoute('ventas.create'), icon: '🛒', label: 'Registrar venta', bg: 'bg-orange-50', hover: 'hover:bg-orange-100' },
        { href: safeRoute('prestamos.create'), icon: '📦', label: 'Nuevo prestamo', bg: 'bg-yellow-50', hover: 'hover:bg-yellow-100' },
        { href: safeRoute('asistencia.escanear'), icon: '📷', label: 'Escanear QR', bg: 'bg-emerald-50', hover: 'hover:bg-emerald-100' },
        { href: safeRoute('pagos.create'), icon: '💳', label: 'Registrar pago', bg: 'bg-slate-50', hover: 'hover:bg-slate-100' },
    ].filter((link): link is typeof link & { href: string } => Boolean(link.href));

    return (
        <AppLayout title="Dashboard">
            <div className="mb-5">
                <h1 className="text-2xl font-bold text-secondary">Bienvenido al panel</h1>
                <p className="mt-0.5 text-sm capitalize text-muted">
                    {new Date().toLocaleDateString('es-PE', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                    })}
                </p>
            </div>

            {alertas.length > 0 && (
                <div className="mb-5 space-y-2">
                    {alertas.map((alerta, i) => (
                        <div
                            key={i}
                            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
                                alerta.tipo === 'danger'
                                    ? 'border-red-200 bg-red-50 text-red-700'
                                    : 'border-yellow-200 bg-yellow-50 text-yellow-800'
                            }`}
                        >
                            <span>{alerta.mensaje}</span>
                            <Link
                                href={alerta.href}
                                className={`ml-4 shrink-0 text-xs font-semibold underline ${
                                    alerta.tipo === 'danger' ? 'text-red-700' : 'text-yellow-800'
                                }`}
                            >
                                {alerta.label} →
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                <StatCard icon="👥" label="Alumnos activos" value={kpis.alumnos_activos} accent="border-l-blue-500" iconBg="bg-blue-100" />
                <StatCard icon="🏋️" label="Talleres" value={kpis.talleres_activos} accent="border-l-emerald-500" iconBg="bg-emerald-100" />
                <StatCard icon="🏟️" label="Reservas hoy" value={kpis.reservas_hoy} accent="border-l-violet-500" iconBg="bg-violet-100" />
                <StatCard
                    icon="💰"
                    label="Deuda pendiente"
                    value={formatPesos(kpis.deuda_total)}
                    valueClass={kpis.deuda_total > 0 ? 'text-danger' : 'text-success'}
                    accent={kpis.deuda_total > 0 ? 'border-l-danger' : 'border-l-success'}
                    iconBg={kpis.deuda_total > 0 ? 'bg-red-100' : 'bg-green-100'}
                    sub={kpis.deuda_total > 0 ? 'requiere atencion' : 'todo al dia'}
                />
                <StatCard
                    icon="🛒"
                    label="Ventas del mes"
                    value={formatPesos(kpis.ventas_mes)}
                    accent="border-l-orange-400"
                    iconBg="bg-orange-100"
                    sub={kpis.ventas_mes > 0 ? 'kiosco / cantina' : 'sin ventas aun'}
                />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2">
                    <div className="mb-4 flex items-start justify-between">
                        <div>
                            <h2 className="font-semibold text-secondary">Ingresos por cuotas</h2>
                            <p className="mt-0.5 text-xs text-muted">Ultimos 6 meses</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-secondary">{formatPesos(totalMesActual)}</p>
                            {deltaLabel && (
                                <p className={`text-xs font-medium ${totalMesActual >= totalMesAnterior ? 'text-success' : 'text-danger'}`}>
                                    {deltaLabel}
                                </p>
                            )}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={pagos_mensuales} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                            <YAxis
                                tick={{ fontSize: 11, fill: '#94A3B8' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => (v === 0 ? '0' : `S/ ${(v / 1000).toFixed(0)}k`)}
                            />
                            <Tooltip
                                formatter={(v) => [formatPesos(Number(v)), 'Total']}
                                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
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

                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <h2 className="mb-4 font-semibold text-secondary">Accesos rapidos</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {accesosRapidos.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex flex-col items-center justify-center gap-2 rounded-xl p-3 text-center transition-colors ${link.bg} ${link.hover}`}
                            >
                                <span className="text-xl">{link.icon}</span>
                                <span className="text-xs font-medium leading-tight text-secondary">{link.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-semibold text-secondary">Reservas de hoy</h2>
                        {safeRoute('reservas.index') && (
                            <Link href={safeRoute('reservas.index')!} className="text-xs text-primary hover:underline">
                                Ver todas →
                            </Link>
                        )}
                    </div>
                    {reservas_hoy.length === 0 ? (
                        <div className="py-8 text-center">
                            <p className="mb-2 text-3xl">🏟️</p>
                            <p className="text-sm text-muted">Sin reservas para hoy</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {reservas_hoy.map((r) => {
                                const reservaHref = safeRoute('reservas.show', r.id);

                                if (!reservaHref) {
                                    return null;
                                }

                                return (
                                    <Link
                                        key={r.id}
                                        href={reservaHref}
                                        className="group flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-secondary transition-colors group-hover:text-primary">
                                                {r.espacio.nombre}
                                            </p>
                                            <p className="text-xs text-muted">
                                                {r.rango_horario.hora_inicio}-{r.rango_horario.hora_fin}
                                                {' · '}
                                                {r.tipo_cliente === 'alumno' && r.alumno ? r.alumno.nombre : r.cliente_nombre ?? 'Externo'}
                                            </p>
                                        </div>
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ESTADO_BADGE[r.estado] ?? 'bg-gray-100 text-muted'}`}>
                                            {r.estado.charAt(0).toUpperCase() + r.estado.slice(1)}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    {top_productos.length > 0 ? (
                        <>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="font-semibold text-secondary">Top productos del mes</h2>
                                {safeRoute('ventas.index') && (
                                    <Link href={safeRoute('ventas.index')!} className="text-xs text-primary hover:underline">
                                        Ver ventas →
                                    </Link>
                                )}
                            </div>
                            <div className="space-y-3">
                                {top_productos.map((p, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="w-4 shrink-0 text-xs font-bold text-muted">{i + 1}</span>
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-1 flex items-center justify-between">
                                                <span className="truncate text-xs font-medium text-secondary">{p.nombre}</span>
                                                <div className="ml-2 flex shrink-0 gap-2">
                                                    <span className="text-[10px] text-muted">{p.total_cantidad} und.</span>
                                                    <span className="text-[10px] font-semibold text-secondary">{formatPesos(p.total_monto)}</span>
                                                </div>
                                            </div>
                                            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
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
                                <h2 className="font-semibold text-secondary">Talleres activos</h2>
                                {safeRoute('talleres.index') && (
                                    <Link href={safeRoute('talleres.index')!} className="text-xs text-primary hover:underline">
                                        Ver todos →
                                    </Link>
                                )}
                            </div>
                            {talleres.length === 0 ? (
                                <div className="py-8 text-center">
                                    <p className="mb-2 text-3xl">🏋️</p>
                                    <p className="text-sm text-muted">Sin talleres activos</p>
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
                                                        <span className="truncate text-xs font-medium text-secondary">{t.nombre}</span>
                                                        <div className="ml-2 flex shrink-0 items-center gap-1.5">
                                                            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${NIVEL_BADGE[t.nivel] ?? 'bg-gray-100 text-muted'}`}>
                                                                {NIVEL_LABEL[t.nivel] ?? t.nivel}
                                                            </span>
                                                            <span className="text-[10px] text-muted">{t.inscriptos}/{t.cupo_maximo}</span>
                                                        </div>
                                                    </div>
                                                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
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

                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-semibold text-secondary">Deudas pendientes</h2>
                        {safeRoute('alumnos.index') && (
                            <Link href={safeRoute('alumnos.index')!} className="text-xs text-primary hover:underline">
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
                        <div className="space-y-2">
                            {alumnos_con_deuda.map((a) => {
                                const alumnoHref = safeRoute('alumnos.show', a.id);

                                if (!alumnoHref) {
                                    return null;
                                }

                                return (
                                    <Link
                                        key={a.id}
                                        href={alumnoHref}
                                        className="group -mx-2 flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColor(a.nombre)}`}>
                                                {a.nombre.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="max-w-[110px] truncate text-sm text-secondary transition-colors group-hover:text-primary">
                                                {a.nombre}
                                            </span>
                                        </div>
                                        <span className="shrink-0 text-sm font-semibold text-danger">{formatPesos(a.deuda)}</span>
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
