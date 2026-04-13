import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageHeader from '@/Components/PageHeader';
import { MagnifyingGlassIcon, FunnelIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Usuario {
    id: number;
    name: string;
}

interface LogItem {
    id: number;
    accion: string;
    detalle: string;
    fecha_hora: string;
    usuario: Usuario | null;
}

interface Pagination<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Filters {
    fecha: string | null;
    accion: string | null;
    usuario_id: string | null;
}

interface Props {
    logs: Pagination<LogItem>;
    usuarios: Usuario[];
    acciones: string[];
    filters: Filters;
}

// ─── Colores por tipo de acción ───────────────────────────────────────────────

const accionColor: Record<string, string> = {
    inscripcion_alumno:  'bg-blue-100 text-blue-700',
    baja_inscripcion:    'bg-gray-100 text-gray-600',
    registro_pago:       'bg-green-100 text-green-700',
    registro_venta:      'bg-teal-100 text-teal-700',
    prestamo_especial:   'bg-orange-100 text-orange-700',
    devolucion_prestamo: 'bg-purple-100 text-purple-700',
};

function badgeClass(accion: string) {
    return accionColor[accion] ?? 'bg-slate-100 text-slate-600';
}

function accionLabel(accion: string) {
    const labels: Record<string, string> = {
        inscripcion_alumno:  'Inscripción',
        baja_inscripcion:    'Baja',
        registro_pago:       'Pago',
        registro_venta:      'Venta',
        prestamo_especial:   'Préstamo',
        devolucion_prestamo: 'Devolución',
    };
    return labels[accion] ?? accion.replace(/_/g, ' ');
}

function formatFechaHora(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString('es-PE', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function LogsIndex({ logs, usuarios, acciones, filters }: Props) {
    const [fecha, setFecha]         = useState(filters.fecha ?? '');
    const [accion, setAccion]       = useState(filters.accion ?? '');
    const [usuarioId, setUsuarioId] = useState(filters.usuario_id ?? '');

    function aplicarFiltros(e: React.FormEvent) {
        e.preventDefault();
        router.get(route('logs.index'), {
            ...(fecha     ? { fecha }          : {}),
            ...(accion    ? { accion }         : {}),
            ...(usuarioId ? { usuario_id: usuarioId } : {}),
        }, { preserveState: true, replace: true });
    }

    function limpiarFiltros() {
        setFecha('');
        setAccion('');
        setUsuarioId('');
        router.get(route('logs.index'), {}, { preserveState: false });
    }

    const hayFiltros = fecha || accion || usuarioId;

    return (
        <AppLayout title="Logs de Auditoría">
            <PageHeader
                title="Logs de Auditoría"
                subtitle={`${logs.total} registros en total`}
            />

            {/* ── Filtros ── */}
            <form onSubmit={aplicarFiltros}
                className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex flex-wrap gap-3 items-end shadow-sm">

                {/* Fecha */}
                <div className="flex-1 min-w-[140px]">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
                    <input
                        type="date"
                        value={fecha}
                        onChange={e => setFecha(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                    />
                </div>

                {/* Tipo de acción */}
                <div className="flex-1 min-w-[160px]">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de acción</label>
                    <select
                        value={accion}
                        onChange={e => setAccion(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none bg-white"
                    >
                        <option value="">Todas</option>
                        {acciones.map(a => (
                            <option key={a} value={a}>{accionLabel(a)}</option>
                        ))}
                    </select>
                </div>

                {/* Usuario */}
                <div className="flex-1 min-w-[160px]">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Usuario</label>
                    <select
                        value={usuarioId}
                        onChange={e => setUsuarioId(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none bg-white"
                    >
                        <option value="">Todos</option>
                        {usuarios.map(u => (
                            <option key={u.id} value={String(u.id)}>{u.name}</option>
                        ))}
                    </select>
                </div>

                {/* Botones */}
                <div className="flex gap-2">
                    <button type="submit"
                        className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                        <MagnifyingGlassIcon className="w-4 h-4" />
                        Filtrar
                    </button>
                    {hayFiltros && (
                        <button type="button" onClick={limpiarFiltros}
                            className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
                            Limpiar
                        </button>
                    )}
                </div>
            </form>

            {/* ── Tabla ── */}
            {logs.data.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 shadow-sm">
                    <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No hay registros con los filtros aplicados</p>
                    {hayFiltros && (
                        <button onClick={limpiarFiltros}
                            className="mt-3 text-sm text-primary hover:underline">
                            Limpiar filtros
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50 text-left">
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha y hora</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acción</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Detalle</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuario</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {logs.data.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap font-mono text-xs">
                                            {formatFechaHora(log.fecha_hora)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${badgeClass(log.accion)}`}>
                                                {accionLabel(log.accion)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700 max-w-md">
                                            {log.detalle}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                            {log.usuario?.name ?? <span className="italic text-gray-400">Sistema</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Paginación ── */}
                    {logs.last_page > 1 && (
                        <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                                Página {logs.current_page} de {logs.last_page} — {logs.total} registros
                            </span>
                            <div className="flex gap-1">
                                {logs.links.map((link, i) => (
                                    link.url ? (
                                        <button key={i}
                                            onClick={() => router.get(link.url!)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                                link.active
                                                    ? 'bg-primary text-white'
                                                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span key={i}
                                            className="px-3 py-1.5 rounded-lg text-xs text-gray-300 border border-gray-100"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </AppLayout>
    );
}
