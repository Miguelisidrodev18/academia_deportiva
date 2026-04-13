import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import StatCard from '@/Components/StatCard';
import { avatarColor } from '@/utils/ui';
import { getSportIcon, NIVEL_BADGE, NIVEL_LABEL } from '@/utils/sportIcons';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── Tipos ────────────────────────────────────────────────────────────────────

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

interface AlumnoDeuda { id: number; nombre: string; deuda: number; }

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

interface PagoMensual { mes: string; total: number; }

interface Props {
    kpis: Kpis;
    alertas: Alerta[];
    alumnos_con_deuda: AlumnoDeuda[];
    reservas_hoy: ReservaHoy[];
    talleres: Taller[];
    top_productos: TopProducto[];
    pagos_mensuales: PagoMensual[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ESTADO_BADGE: Record<string, string> = {
    confirmada: 'bg-green-100 text-success',
    finalizada: 'bg-gray-100 text-muted',
    cancelada:  'bg-red-100 text-danger',
};

function formatPesos(n: number) {
    return 'S/ ' + n.toLocaleString('es-PE', { maximumFractionDigits: 0 });
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function Dashboard({
    kpis, alertas, alumnos_con_deuda, reservas_hoy, talleres, top_productos, pagos_mensuales,
}: Props) {

    const ocupacionBar = (inscriptos: number, max: number) => {
        const pct = max > 0 ? Math.round((inscriptos / max) * 100) : 0;
        const color = pct >= 100 ? 'bg-danger' : pct >= 80 ? 'bg-yellow-400' : 'bg-success';
        return { pct, color };
    };

    const totalMesActual  = pagos_mensuales[pagos_mensuales.length - 1]?.total ?? 0;
    const totalMesAnterior = pagos_mensuales[pagos_mensuales.length - 2]?.total ?? 0;
    const deltaLabel = totalMesAnterior > 0
        ? `${totalMesActual >= totalMesAnterior ? '+' : ''}${Math.round(((totalMesActual - totalMesAnterior) / totalMesAnterior) * 100)}% vs mes anterior`
        : undefined;

    // Máximo de ventas para la barra de proporción en top productos
    const maxVentas = top_productos[0]?.total_cantidad ?? 1;

    return (
        <AppLayout title="Dashboard">

            {/* ── Saludo ───────────────────────────────────────────────────── */}
            <div className="mb-5">
                <h1 className="text-2xl font-bold text-secondary">
                    ¡Bienvenido al panel! 👋
                </h1>
                <p className="text-muted text-sm mt-0.5 capitalize">
                    {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>

            {/* ── Alertas (solo si hay alguna) ─────────────────────────────── */}
            {alertas.length > 0 && (
                <div className="space-y-2 mb-5">
                    {alertas.map((alerta, i) => (
                        <div
                            key={i}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm border ${
                                alerta.tipo === 'danger'
                                    ? 'bg-red-50 border-red-200 text-red-700'
                                    : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                            }`}
                        >
                            <span>
                                {alerta.tipo === 'danger' ? '🚨' : '⚠️'}{' '}
                                {alerta.mensaje}
                            </span>
                            <Link
                                href={alerta.href}
                                className={`text-xs font-semibold underline ml-4 shrink-0 ${
                                    alerta.tipo === 'danger' ? 'text-red-700' : 'text-yellow-800'
                                }`}
                            >
                                {alerta.label} →
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* ── KPIs (5 cards) ───────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                <StatCard
                    icon="👥" label="Alumnos activos" value={kpis.alumnos_activos}
                    accent="border-l-blue-500" iconBg="bg-blue-100"
                />
                <StatCard
                    icon="🏋️" label="Talleres" value={kpis.talleres_activos}
                    accent="border-l-emerald-500" iconBg="bg-emerald-100"
                />
                <StatCard
                    icon="🏟️" label="Reservas hoy" value={kpis.reservas_hoy}
                    accent="border-l-violet-500" iconBg="bg-violet-100"
                />
                <StatCard
                    icon="💰" label="Deuda pendiente"
                    value={formatPesos(kpis.deuda_total)}
                    valueClass={kpis.deuda_total > 0 ? 'text-danger' : 'text-success'}
                    accent={kpis.deuda_total > 0 ? 'border-l-danger' : 'border-l-success'}
                    iconBg={kpis.deuda_total > 0 ? 'bg-red-100' : 'bg-green-100'}
                    sub={kpis.deuda_total > 0 ? 'requiere atención' : 'todo al día'}
                />
                <StatCard
                    icon="🛒" label="Ventas del mes"
                    value={formatPesos(kpis.ventas_mes)}
                    accent="border-l-orange-400" iconBg="bg-orange-100"
                    sub={kpis.ventas_mes > 0 ? 'kiosco / cantina' : 'sin ventas aún'}
                />
            </div>

            {/* ── Gráfico + accesos rápidos ─────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

                {/* Gráfico de ingresos por cuotas (últimos 6 meses) */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="font-semibold text-secondary">Ingresos por cuotas</h2>
                            <p className="text-xs text-muted mt-0.5">Últimos 6 meses</p>
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
                            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
                                tickFormatter={v => v === 0 ? '0' : `S/ ${(v / 1000).toFixed(0)}k`} />
                            <Tooltip
                                formatter={(v) => [formatPesos(Number(v)), 'Total']}
                                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                            />
                            <Area type="monotone" dataKey="total" stroke="#F97316" strokeWidth={2.5}
                                fill="url(#colorTotal)" dot={{ r: 3, fill: '#F97316' }} activeDot={{ r: 5 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Accesos rápidos */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h2 className="font-semibold text-secondary mb-4">Accesos rápidos</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { href: route('alumnos.create'),       icon: '👤', label: 'Nuevo alumno',    bg: 'bg-blue-50',    hover: 'hover:bg-blue-100' },
                            { href: route('reservas.create'),      icon: '🏟️', label: 'Nueva reserva',   bg: 'bg-violet-50',  hover: 'hover:bg-violet-100' },
                            { href: route('ventas.create'),        icon: '🛒', label: 'Registrar venta', bg: 'bg-orange-50',  hover: 'hover:bg-orange-100' },
                            { href: route('prestamos.create'),     icon: '📦', label: 'Nuevo préstamo',  bg: 'bg-yellow-50',  hover: 'hover:bg-yellow-100' },
                            { href: route('asistencia.escanear'),  icon: '📷', label: 'Escanear QR',     bg: 'bg-emerald-50', hover: 'hover:bg-emerald-100' },
                            { href: route('pagos.create'),         icon: '💳', label: 'Registrar pago',  bg: 'bg-slate-50',   hover: 'hover:bg-slate-100' },
                        ].map(link => (
                            <Link key={link.href} href={link.href}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl ${link.bg} ${link.hover} transition-colors text-center`}>
                                <span className="text-xl">{link.icon}</span>
                                <span className="text-xs font-medium text-secondary leading-tight">{link.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Fila inferior ────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Reservas del día */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-secondary">Reservas de hoy</h2>
                        <Link href={route('reservas.index')} className="text-xs text-primary hover:underline">Ver todas →</Link>
                    </div>
                    {reservas_hoy.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-3xl mb-2">🏟️</p>
                            <p className="text-sm text-muted">Sin reservas para hoy</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {reservas_hoy.map(r => (
                                <Link key={r.id} href={route('reservas.show', r.id)}
                                    className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
                                    <div>
                                        <p className="text-sm font-medium text-secondary group-hover:text-primary transition-colors">
                                            {r.espacio.nombre}
                                        </p>
                                        <p className="text-xs text-muted">
                                            {r.rango_horario.hora_inicio}–{r.rango_horario.hora_fin}
                                            {' · '}
                                            {r.tipo_cliente === 'alumno' && r.alumno ? r.alumno.nombre : r.cliente_nombre ?? 'Externo'}
                                        </p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_BADGE[r.estado] ?? 'bg-gray-100 text-muted'}`}>
                                        {r.estado.charAt(0).toUpperCase() + r.estado.slice(1)}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top productos del mes / Talleres activos */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    {top_productos.length > 0 ? (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold text-secondary">Top productos del mes</h2>
                                <Link href={route('ventas.index')} className="text-xs text-primary hover:underline">Ver ventas →</Link>
                            </div>
                            <div className="space-y-3">
                                {top_productos.map((p, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        {/* Posición */}
                                        <span className="text-xs font-bold text-muted w-4 shrink-0">{i + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-medium text-secondary truncate">{p.nombre}</span>
                                                <div className="flex gap-2 shrink-0 ml-2">
                                                    <span className="text-[10px] text-muted">{p.total_cantidad} und.</span>
                                                    <span className="text-[10px] font-semibold text-secondary">{formatPesos(p.total_monto)}</span>
                                                </div>
                                            </div>
                                            {/* Barra de proporción relativa al más vendido */}
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
                            {/* Si no hay ventas del mes, mostramos talleres activos */}
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold text-secondary">Talleres activos</h2>
                                <Link href={route('talleres.index')} className="text-xs text-primary hover:underline">Ver todos →</Link>
                            </div>
                            {talleres.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-3xl mb-2">🏋️</p>
                                    <p className="text-sm text-muted">Sin talleres activos</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {talleres.map(t => {
                                        const { pct, color } = ocupacionBar(t.inscriptos, t.cupo_maximo);
                                        return (
                                            <div key={t.id} className="flex items-center gap-3">
                                                <span className="text-lg w-7 text-center flex-shrink-0">{getSportIcon(t.disciplina.nombre)}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-medium text-secondary truncate">{t.nombre}</span>
                                                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${NIVEL_BADGE[t.nivel] ?? 'bg-gray-100 text-muted'}`}>
                                                                {NIVEL_LABEL[t.nivel] ?? t.nivel}
                                                            </span>
                                                            <span className="text-[10px] text-muted">{t.inscriptos}/{t.cupo_maximo}</span>
                                                        </div>
                                                    </div>
                                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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

                {/* Alumnos con deuda */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-secondary">Deudas pendientes</h2>
                        <Link href={route('alumnos.index')} className="text-xs text-primary hover:underline">Ver todos →</Link>
                    </div>
                    {alumnos_con_deuda.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-3xl mb-2">✅</p>
                            <p className="text-sm text-success font-medium">Todos al día</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {alumnos_con_deuda.map(a => (
                                <Link key={a.id} href={route('alumnos.show', a.id)}
                                    className="flex items-center justify-between group hover:bg-gray-50 rounded-lg px-2 py-1.5 -mx-2 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-7 h-7 rounded-full ${avatarColor(a.nombre)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                                            {a.nombre.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm text-secondary group-hover:text-primary transition-colors truncate max-w-[110px]">
                                            {a.nombre}
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold text-danger shrink-0">
                                        {formatPesos(a.deuda)}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
