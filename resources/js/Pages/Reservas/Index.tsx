import { Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Reserva {
    id: number;
    fecha_reserva: string;
    tipo_cliente: 'alumno' | 'externo';
    cliente_nombre: string | null;
    monto_pagado: string;
    estado: 'confirmada' | 'finalizada' | 'cancelada';
    espacio: { id: number; nombre: string };
    rango_horario: { id: number; hora_inicio: string; hora_fin: string; precio: string };
    alumno: { id: number; nombre: string; dni: string } | null;
}

interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Espacio { id: number; nombre: string }

interface Props {
    reservas: Paginator<Reserva>;
    espacios: Espacio[];
    filters: { fecha: string; espacio_id?: string | null };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ESTADO_BADGE: Record<string, string> = {
    confirmada:  'bg-green-100 text-success',
    finalizada:  'bg-blue-100 text-blue-700',
    cancelada:   'bg-gray-100 text-muted',
};

const ESTADO_LABEL: Record<string, string> = {
    confirmada: 'Confirmada', finalizada: 'Finalizada', cancelada: 'Cancelada',
};

function formatFecha(f: string) {
    return new Date(f + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ReservasIndex({ reservas, espacios, filters }: Props) {
    const { flash } = usePage().props as any;

    function filtrar(campo: string, valor: string) {
        router.get(route('reservas.index'), { ...filters, [campo]: valor }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout title="Reservas">
            <div className="max-w-5xl mx-auto">

                {/* Encabezado */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary">Reservas de espacios</h1>
                        <p className="text-muted text-sm mt-1">Historial de alquileres de canchas y salones.</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('espacios.index')} className="border border-gray-300 hover:bg-gray-50 text-secondary px-3 py-2 rounded-lg text-sm transition-colors">
                            🏟️ Espacios
                        </Link>
                        <Link href={route('reservas.create')} className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            + Nueva reserva
                        </Link>
                    </div>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="bg-green-50 border border-success text-success rounded-lg px-4 py-3 mb-5 text-sm">{flash.success}</div>
                )}

                {/* Filtros */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5 flex flex-wrap gap-3">
                    <div>
                        <label className="block text-xs text-muted mb-1">Fecha</label>
                        <input
                            type="date"
                            value={filters.fecha}
                            onChange={e => filtrar('fecha', e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1">Espacio</label>
                        <select
                            value={filters.espacio_id ?? ''}
                            onChange={e => filtrar('espacio_id', e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Todos</option>
                            {espacios.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                        </select>
                    </div>
                </div>

                {/* Tabla */}
                {reservas.data.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-muted">
                        <p className="text-4xl mb-3">📅</p>
                        <p className="font-medium text-secondary mb-1">Sin reservas para los filtros seleccionados</p>
                        <Link href={route('reservas.create')} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium mt-3 inline-block">
                            Crear primera reserva
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Espacio</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Cliente</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Fecha</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Horario</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase">Monto</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted uppercase">Estado</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {reservas.data.map(r => (
                                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-secondary">{r.espacio.nombre}</td>
                                        <td className="px-4 py-3 text-secondary">
                                            {r.tipo_cliente === 'alumno' && r.alumno
                                                ? <span>{r.alumno.nombre} <span className="text-xs text-muted">({r.alumno.dni})</span></span>
                                                : <span>{r.cliente_nombre}</span>
                                            }
                                        </td>
                                        <td className="px-4 py-3 text-muted">{formatFecha(r.fecha_reserva)}</td>
                                        <td className="px-4 py-3 text-muted">{r.rango_horario.hora_inicio}–{r.rango_horario.hora_fin}</td>
                                        <td className="px-4 py-3 text-right font-medium text-secondary">
                                            ${parseFloat(r.monto_pagado).toLocaleString('es-AR')}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_BADGE[r.estado] ?? 'bg-gray-100 text-muted'}`}>
                                                {ESTADO_LABEL[r.estado] ?? r.estado}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link href={route('reservas.show', r.id)} className="text-xs text-primary hover:underline">
                                                Ver →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Paginación */}
                        {reservas.last_page > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                                <p className="text-xs text-muted">Total: {reservas.total} reservas</p>
                                <div className="flex gap-1">
                                    {reservas.links.map((link, i) => (
                                        link.url ? (
                                            <Link key={i} href={link.url}
                                                className={`text-xs px-2 py-1 rounded ${link.active ? 'bg-primary text-white' : 'text-secondary hover:bg-gray-100'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }} />
                                        ) : (
                                            <span key={i} className="text-xs px-2 py-1 text-muted" dangerouslySetInnerHTML={{ __html: link.label }} />
                                        )
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
