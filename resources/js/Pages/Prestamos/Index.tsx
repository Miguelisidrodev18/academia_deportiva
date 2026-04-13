import { Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Equipamiento { id: number; nombre: string }

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

interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    prestamos: Paginator<Prestamo>;
    filters: { estado?: string };
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

function formatFecha(f: string) {
    return new Date(f + 'T00:00:00').toLocaleDateString('es-PE', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function PrestamosIndex({ prestamos, filters }: Props) {
    const { flash } = usePage().props as any;

    function filtrar(campo: string, valor: string) {
        router.get(route('prestamos.index'), { ...filters, [campo]: valor }, {
            preserveState: true, replace: true,
        });
    }

    return (
        <AppLayout title="Préstamos especiales">
            <div className="max-w-5xl mx-auto">

                {/* Encabezado */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary">Préstamos especiales</h1>
                        <p className="text-muted text-sm mt-1">
                            Equipamiento prestado fuera de talleres y alquileres.
                        </p>
                    </div>
                    <Link
                        href={route('prestamos.create')}
                        className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        + Nuevo préstamo
                    </Link>
                </div>

                {/* Flash de éxito */}
                {flash?.success && (
                    <div className="bg-green-50 border border-green-300 text-green-700 rounded-lg px-4 py-3 mb-5 text-sm">
                        {flash.success}
                    </div>
                )}

                {/* Filtro por estado */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5 flex flex-wrap gap-3 items-center">
                    <span className="text-xs font-semibold text-muted uppercase">Estado:</span>
                    {['', 'activo', 'atrasado', 'completado'].map(estado => (
                        <button
                            key={estado}
                            onClick={() => filtrar('estado', estado)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                                (filters.estado ?? '') === estado
                                    ? 'bg-primary text-white border-primary'
                                    : 'border-gray-200 text-secondary hover:bg-gray-50'
                            }`}
                        >
                            {estado === '' ? 'Todos' : ESTADO_LABEL[estado]}
                        </button>
                    ))}
                </div>

                {/* Tabla / vacío */}
                {prestamos.data.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-muted">
                        <p className="text-4xl mb-3">📦</p>
                        <p className="font-medium text-secondary mb-1">No hay préstamos registrados</p>
                        <Link
                            href={route('prestamos.create')}
                            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium mt-3 inline-block"
                        >
                            Crear primer préstamo
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Solicitante</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Ítems</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Préstamo</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase">Dev. esperada</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted uppercase">Estado</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {prestamos.data.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-secondary">{p.solicitante_nombre}</p>
                                            <p className="text-xs text-muted capitalize">{p.solicitante_tipo}</p>
                                        </td>
                                        <td className="px-4 py-3 text-muted">
                                            {/* Resumen de ítems: "2x Pelota, 5x Cono" */}
                                            {p.detalles.map(d => (
                                                <span key={d.id} className="inline-block mr-2">
                                                    {d.cantidad}× {d.equipamiento.nombre}
                                                    {d.devuelto_parcial > 0 && d.devuelto_parcial < d.cantidad && (
                                                        <span className="text-xs text-orange-500 ml-1">
                                                            ({d.devuelto_parcial} dev.)
                                                        </span>
                                                    )}
                                                </span>
                                            ))}
                                        </td>
                                        <td className="px-4 py-3 text-muted">{formatFecha(p.fecha_prestamo)}</td>
                                        <td className="px-4 py-3 text-muted">{formatFecha(p.fecha_devolucion_esperada)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_BADGE[p.estado] ?? 'bg-gray-100 text-muted'}`}>
                                                {ESTADO_LABEL[p.estado] ?? p.estado}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link
                                                href={route('prestamos.show', p.id)}
                                                className="text-xs text-primary hover:underline"
                                            >
                                                Ver →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Paginación */}
                        {prestamos.last_page > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                                <p className="text-xs text-muted">Total: {prestamos.total} préstamos</p>
                                <div className="flex gap-1">
                                    {prestamos.links.map((link, i) => (
                                        link.url ? (
                                            <Link
                                                key={i} href={link.url}
                                                className={`text-xs px-2 py-1 rounded ${link.active ? 'bg-primary text-white' : 'text-secondary hover:bg-gray-100'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
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
