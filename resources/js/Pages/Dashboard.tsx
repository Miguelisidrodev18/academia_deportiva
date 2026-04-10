import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import StatCard from '@/Components/StatCard';
import { avatarColor } from '@/utils/ui';
import { getSportIcon, NIVEL_BADGE, NIVEL_LABEL } from '@/utils/sportIcons';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Kpis {
    alumnos_activos: number;
    talleres_activos: number;
    reservas_hoy: number;
    deuda_total: number;
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

interface Props {
    kpis: Kpis;
    alumnos_con_deuda: AlumnoDeuda[];
    reservas_hoy: ReservaHoy[];
    talleres: Taller[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ESTADO_BADGE: Record<string, string> = {
    confirmada: 'bg-green-100 text-success',
    finalizada: 'bg-gray-100 text-muted',
    cancelada:  'bg-red-100 text-danger',
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function Dashboard({ kpis, alumnos_con_deuda, reservas_hoy, talleres }: Props) {
    const ocupacionBar = (inscriptos: number, max: number) => {
        const pct = max > 0 ? Math.round((inscriptos / max) * 100) : 0;
        const color = pct >= 100 ? 'bg-danger' : pct >= 80 ? 'bg-yellow-400' : 'bg-success';
        return { pct, color };
    };

    return (
        <AppLayout title="Dashboard">

            {/* ── KPIs ─────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon="👥" label="Alumnos activos" value={kpis.alumnos_activos} valueClass="text-secondary" />
                <StatCard icon="🏋️" label="Talleres activos" value={kpis.talleres_activos} valueClass="text-secondary" />
                <StatCard icon="🏟️" label="Reservas hoy" value={kpis.reservas_hoy} valueClass="text-secondary" />
                <StatCard
                    icon="💰"
                    label="Deuda pendiente"
                    value={`$${kpis.deuda_total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`}
                    valueClass={kpis.deuda_total > 0 ? 'text-danger' : 'text-success'}
                    sub={kpis.deuda_total > 0 ? 'requiere atención' : 'todo al día'}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── Columna principal ─────────────────────────────────── */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Reservas del día */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-secondary">Reservas de hoy</h2>
                            <Link href={route('reservas.index')} className="text-xs text-primary hover:underline">Ver todas →</Link>
                        </div>

                        {reservas_hoy.length === 0 ? (
                            <p className="text-sm text-muted text-center py-6">Sin reservas para hoy.</p>
                        ) : (
                            <div className="space-y-2">
                                {reservas_hoy.map(r => (
                                    <Link key={r.id} href={route('reservas.show', r.id)}
                                        className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <div className="text-xl">🏟️</div>
                                            <div>
                                                <p className="text-sm font-medium text-secondary group-hover:text-primary transition-colors">
                                                    {r.espacio.nombre}
                                                </p>
                                                <p className="text-xs text-muted">
                                                    {r.rango_horario.hora_inicio}–{r.rango_horario.hora_fin}
                                                    {' · '}
                                                    {r.tipo_cliente === 'alumno' && r.alumno
                                                        ? r.alumno.nombre
                                                        : r.cliente_nombre ?? 'Cliente externo'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_BADGE[r.estado] ?? 'bg-gray-100 text-muted'}`}>
                                            {r.estado.charAt(0).toUpperCase() + r.estado.slice(1)}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Talleres activos */}
                    {talleres.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold text-secondary">Talleres activos</h2>
                                <Link href={route('talleres.index')} className="text-xs text-primary hover:underline">Ver todos →</Link>
                            </div>
                            <div className="space-y-3">
                                {talleres.map(t => {
                                    const { pct, color } = ocupacionBar(t.inscriptos, t.cupo_maximo);
                                    return (
                                        <div key={t.id} className="flex items-center gap-3">
                                            <span className="text-xl w-7 text-center">{getSportIcon(t.disciplina.nombre)}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-secondary truncate">{t.nombre}</span>
                                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${NIVEL_BADGE[t.nivel] ?? 'bg-gray-100 text-muted'}`}>
                                                            {NIVEL_LABEL[t.nivel] ?? t.nivel}
                                                        </span>
                                                        <span className="text-xs text-muted">{t.inscriptos}/{t.cupo_maximo}</span>
                                                    </div>
                                                </div>
                                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Columna lateral ──────────────────────────────────── */}
                <div className="space-y-6">

                    {/* Alumnos con deuda */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-secondary">Deudas pendientes</h2>
                            <Link href={route('alumnos.index')} className="text-xs text-primary hover:underline">Ver todos →</Link>
                        </div>

                        {alumnos_con_deuda.length === 0 ? (
                            <div className="text-center py-4">
                                <p className="text-2xl mb-1">✓</p>
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
                                            <span className="text-sm text-secondary group-hover:text-primary transition-colors truncate max-w-[110px]">{a.nombre}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-danger shrink-0">
                                            ${a.deuda.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Accesos rápidos */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <h2 className="font-semibold text-secondary mb-3">Accesos rápidos</h2>
                        <div className="space-y-1">
                            {[
                                { href: route('alumnos.create'), icon: '👤', label: 'Nuevo alumno' },
                                { href: route('reservas.create'), icon: '🏟️', label: 'Nueva reserva' },
                                { href: route('asistencia.escanear'), icon: '📷', label: 'Escanear QR' },
                                { href: route('pagos.create'), icon: '💳', label: 'Registrar pago' },
                            ].map(link => (
                                <Link key={link.href} href={link.href}
                                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-orange-50 hover:text-primary transition-colors text-sm text-secondary">
                                    <span>{link.icon}</span>
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
