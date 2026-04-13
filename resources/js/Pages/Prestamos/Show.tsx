import { Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Equipamiento {
    id: number;
    nombre: string;
    tipo: string;
    stock_disponible: number;
}

interface Detalle {
    id: number;
    cantidad: number;
    devuelto_parcial: number;
    equipamiento: Equipamiento;
}

interface Prestamo {
    id: number;
    solicitante_nombre: string;
    solicitante_tipo: 'alumno' | 'externo';
    fecha_prestamo: string;
    fecha_devolucion_esperada: string;
    fecha_devolucion_real: string | null;
    estado: 'activo' | 'completado' | 'atrasado';
    detalles: Detalle[];
}

interface Props {
    prestamo: Prestamo;
}

// ─── Helpers visuales ─────────────────────────────────────────────────────────

const ESTADO_BADGE: Record<string, string> = {
    activo:     'bg-blue-100 text-blue-700',
    completado: 'bg-green-100 text-green-700',
    atrasado:   'bg-red-100 text-red-700',
};

const ESTADO_LABEL: Record<string, string> = {
    activo: 'Activo', completado: 'Completado', atrasado: 'Atrasado',
};

function formatFecha(f: string | null) {
    if (!f) return '—';
    return new Date(f + 'T00:00:00').toLocaleDateString('es-PE', {
        day: '2-digit', month: 'long', year: 'numeric',
    });
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function PrestamosShow({ prestamo }: Props) {
    const { flash } = usePage().props as any;

    // Calcula cuántas unidades faltan devolver (total)
    const totalPendiente = prestamo.detalles.reduce(
        (acc, d) => acc + (d.cantidad - d.devuelto_parcial), 0
    );

    return (
        <AppLayout title={`Préstamo #${prestamo.id}`}>
            <div className="max-w-2xl mx-auto">

                {/* Breadcrumb */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href={route('prestamos.index')} className="text-muted hover:text-secondary text-sm">
                        ← Préstamos
                    </Link>
                    <span className="text-muted">/</span>
                    <h1 className="text-xl font-bold text-secondary">Préstamo #{prestamo.id}</h1>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="bg-green-50 border border-green-300 text-green-700 rounded-lg px-4 py-3 mb-5 text-sm">
                        {flash.success}
                    </div>
                )}
                {flash?.info && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-4 py-3 mb-5 text-sm">
                        {flash.info}
                    </div>
                )}

                {/* Encabezado del préstamo */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
                    <div className="flex items-start justify-between mb-5">
                        <div>
                            <p className="text-lg font-bold text-secondary">{prestamo.solicitante_nombre}</p>
                            <p className="text-sm text-muted capitalize">{prestamo.solicitante_tipo}</p>
                        </div>
                        <span className={`text-sm px-3 py-1 rounded-full font-medium ${ESTADO_BADGE[prestamo.estado]}`}>
                            {ESTADO_LABEL[prestamo.estado]}
                        </span>
                    </div>

                    {/* Grid de fechas */}
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-xs text-muted uppercase font-medium mb-0.5">Fecha préstamo</p>
                            <p className="font-medium text-secondary">{formatFecha(prestamo.fecha_prestamo)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted uppercase font-medium mb-0.5">Dev. esperada</p>
                            <p className={`font-medium ${prestamo.estado === 'atrasado' ? 'text-red-600' : 'text-secondary'}`}>
                                {formatFecha(prestamo.fecha_devolucion_esperada)}
                                {prestamo.estado === 'atrasado' && <span className="ml-1 text-xs">⚠️</span>}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted uppercase font-medium mb-0.5">Dev. real</p>
                            <p className="font-medium text-secondary">{formatFecha(prestamo.fecha_devolucion_real)}</p>
                        </div>
                    </div>
                </div>

                {/* Tabla de ítems */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-5">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-secondary">Ítems del préstamo</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase">Equipamiento</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-muted uppercase">Prestado</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-muted uppercase">Devuelto</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-muted uppercase">Pendiente</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {prestamo.detalles.map(d => {
                                const pendiente = d.cantidad - d.devuelto_parcial;
                                return (
                                    <tr key={d.id} className={pendiente > 0 && prestamo.estado !== 'completado' ? 'bg-orange-50/40' : ''}>
                                        <td className="px-5 py-3">
                                            <p className="font-medium text-secondary">{d.equipamiento.nombre}</p>
                                            <p className="text-xs text-muted capitalize">{d.equipamiento.tipo}</p>
                                        </td>
                                        <td className="px-4 py-3 text-center font-medium text-secondary">{d.cantidad}</td>
                                        <td className="px-4 py-3 text-center text-green-600 font-medium">{d.devuelto_parcial}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`font-semibold ${pendiente > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                                {pendiente > 0 ? pendiente : '✓'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Resumen al pie */}
                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <p className="text-sm text-secondary">
                            {totalPendiente > 0
                                ? <span className="font-medium text-orange-600">{totalPendiente} unidad(es) pendiente(s) de devolución</span>
                                : <span className="font-medium text-green-600">Todo devuelto ✓</span>
                            }
                        </p>
                    </div>
                </div>

                {/* Botón de devolución (solo si no está completado) */}
                {prestamo.estado !== 'completado' && (
                    <div className="flex justify-end">
                        <Link
                            href={route('prestamos.devolucion', prestamo.id)}
                            className="bg-primary hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Registrar devolución →
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
