import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import FlashMessages from '@/Components/FlashMessages';
import PageHeader from '@/Components/PageHeader';
import EmptyState from '@/Components/EmptyState';
import StatCard from '@/Components/StatCard';
import { formatFecha } from '@/utils/dates';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Alumno { id: number; nombre: string; }

interface Pago {
    id: number;
    monto: string;
    fecha_pago: string;
    metodo: 'efectivo' | 'yape';
    periodo_mes: number;
    periodo_anio: number;
    comprobante: string | null;
    inscripcion: {
        alumno: { id: number; nombre: string; dni: string };
        taller: { id: number; nombre: string };
    };
    registrado_por: { name: string } | null;
}

interface Props {
    pagos: Pago[];
    alumnos: Alumno[];
    filtros: { alumno_id?: string; desde?: string; hasta?: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const METODO_BADGE: Record<string, string> = {
    yape:      'bg-purple-100 text-purple-700',
    efectivo:  'bg-gray-100 text-gray-600',
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function PagosIndex({ pagos, alumnos, filtros }: Props) {
    const [alumnoId, setAlumnoId] = useState(filtros.alumno_id ?? '');
    const [desde,    setDesde]    = useState(filtros.desde ?? '');
    const [hasta,    setHasta]    = useState(filtros.hasta ?? '');

    const hayFiltros = alumnoId || desde || hasta;

    function aplicarFiltros(e: React.FormEvent) {
        e.preventDefault();
        router.get(route('pagos.index'), { alumno_id: alumnoId, desde, hasta }, { preserveState: true });
    }

    function limpiarFiltros() {
        setAlumnoId(''); setDesde(''); setHasta('');
        router.get(route('pagos.index'));
    }

    const totalMonto = pagos.reduce((acc, p) => acc + parseFloat(p.monto), 0);

    return (
        <AppLayout title="Pagos">
            <div className="max-w-6xl mx-auto">

                <PageHeader
                    title="Pagos"
                    subtitle={`${pagos.length} ${pagos.length === 1 ? 'pago' : 'pagos'} en la selección actual`}
                    ctaHref={route('pagos.create')}
                    ctaLabel="+ Registrar pago"
                />

                {pagos.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <StatCard icon="💳" label="Pagos registrados" value={pagos.length} />
                        <StatCard icon="✅" label="Total cobrado" value={`S/ ${totalMonto.toLocaleString('es-PE')}`} valueClass="text-success" />
                    </div>
                )}

                <FlashMessages />

                {/* Filtros */}
                <form onSubmit={aplicarFiltros}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="block text-xs text-muted mb-1 font-medium">Alumno</label>
                        <select value={alumnoId} onChange={e => setAlumnoId(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary min-w-[160px]">
                            <option value="">Todos</option>
                            {alumnos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1 font-medium">Desde</label>
                        <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1 font-medium">Hasta</label>
                        <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <button type="submit"
                        className="flex items-center gap-1.5 bg-secondary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
                        <FunnelIcon className="w-4 h-4" />
                        Filtrar
                    </button>
                    {hayFiltros && (
                        <button type="button" onClick={limpiarFiltros}
                            className="flex items-center gap-1 text-sm text-muted hover:text-secondary transition-colors">
                            <XMarkIcon className="w-4 h-4" />
                            Limpiar
                        </button>
                    )}
                </form>

                {pagos.length === 0 ? (
                    <EmptyState icon="💳" title="No hay pagos registrados" description="Registrá el primer pago para comenzar el historial." />
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-muted uppercase text-xs tracking-wide">
                                <tr>
                                    <th className="px-5 py-3.5 text-left">Alumno</th>
                                    <th className="px-5 py-3.5 text-left hidden sm:table-cell">Taller</th>
                                    <th className="px-5 py-3.5 text-center hidden md:table-cell">Período</th>
                                    <th className="px-5 py-3.5 text-center">Método</th>
                                    <th className="px-5 py-3.5 text-right">Monto</th>
                                    <th className="px-5 py-3.5 text-center hidden lg:table-cell">Fecha</th>
                                    <th className="px-5 py-3.5 text-right">Detalle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pagos.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <p className="font-medium text-secondary">{p.inscripcion.alumno.nombre}</p>
                                            <p className="text-xs text-muted font-mono">{p.inscripcion.alumno.dni}</p>
                                        </td>
                                        <td className="px-5 py-3.5 text-muted hidden sm:table-cell">{p.inscripcion.taller.nombre}</td>
                                        <td className="px-5 py-3.5 text-center text-xs text-muted hidden md:table-cell">
                                            {MESES[p.periodo_mes - 1]} {p.periodo_anio}
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${METODO_BADGE[p.metodo] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {p.metodo}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-semibold text-success">
                                            S/ {parseFloat(p.monto).toLocaleString('es-PE')}
                                        </td>
                                        <td className="px-5 py-3.5 text-center text-xs text-muted hidden lg:table-cell">
                                            {formatFecha(p.fecha_pago)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <Link href={route('pagos.show', p.id)}
                                                className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline">
                                                Ver →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
