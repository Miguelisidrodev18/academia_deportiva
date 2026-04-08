import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';

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

function formatFecha(f: string) {
    return new Date(f).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function PagosIndex({ pagos, alumnos, filtros }: Props) {
    const { flash } = usePage().props as any;

    const [alumnoId, setAlumnoId] = useState(filtros.alumno_id ?? '');
    const [desde,    setDesde]    = useState(filtros.desde ?? '');
    const [hasta,    setHasta]    = useState(filtros.hasta ?? '');

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

                {/* Encabezado */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary">Pagos</h1>
                        <p className="text-muted text-sm mt-1">
                            {pagos.length} {pagos.length === 1 ? 'pago' : 'pagos'} · Total: <span className="text-success font-semibold">${totalMonto.toLocaleString('es-AR')}</span>
                        </p>
                    </div>
                    <Link
                        href={route('pagos.create')}
                        className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        + Registrar pago
                    </Link>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="bg-green-50 border border-success text-success rounded-lg px-4 py-3 mb-4 text-sm">{flash.success}</div>
                )}

                {/* Filtros */}
                <form onSubmit={aplicarFiltros} className="bg-white rounded-xl border border-gray-100 p-4 mb-5 flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="block text-xs text-muted mb-1">Alumno</label>
                        <select
                            value={alumnoId}
                            onChange={e => setAlumnoId(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Todos</option>
                            {alumnos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1">Desde</label>
                        <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                        <label className="block text-xs text-muted mb-1">Hasta</label>
                        <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <button type="submit" className="bg-secondary text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
                        Filtrar
                    </button>
                    <button type="button" onClick={limpiarFiltros} className="text-muted text-sm hover:text-secondary">
                        Limpiar
                    </button>
                </form>

                {/* Tabla */}
                {pagos.length === 0 ? (
                    <div className="text-center py-16 text-muted bg-white rounded-xl border border-gray-100">
                        <p className="text-4xl mb-3">💳</p>
                        <p className="text-lg font-medium">No hay pagos registrados.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-muted uppercase text-xs tracking-wide">
                                <tr>
                                    <th className="px-5 py-3 text-left">Alumno</th>
                                    <th className="px-5 py-3 text-left">Taller</th>
                                    <th className="px-5 py-3 text-center">Período</th>
                                    <th className="px-5 py-3 text-center">Método</th>
                                    <th className="px-5 py-3 text-right">Monto</th>
                                    <th className="px-5 py-3 text-center">Fecha</th>
                                    <th className="px-5 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pagos.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3">
                                            <span className="font-medium text-secondary">{p.inscripcion.alumno.nombre}</span>
                                            <span className="block text-xs text-muted font-mono">{p.inscripcion.alumno.dni}</span>
                                        </td>
                                        <td className="px-5 py-3 text-gray-600">{p.inscripcion.taller.nombre}</td>
                                        <td className="px-5 py-3 text-center text-xs text-gray-600">
                                            {MESES[p.periodo_mes - 1]} {p.periodo_anio}
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                p.metodo === 'yape'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {p.metodo.charAt(0).toUpperCase() + p.metodo.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right font-semibold text-success">
                                            ${parseFloat(p.monto).toLocaleString('es-AR')}
                                        </td>
                                        <td className="px-5 py-3 text-center text-xs text-gray-500">
                                            {formatFecha(p.fecha_pago)}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <Link href={route('pagos.show', p.id)} className="text-blue-600 hover:underline text-xs">
                                                Ver detalle
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
