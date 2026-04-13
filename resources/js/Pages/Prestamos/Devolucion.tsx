import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Equipamiento {
    id: number;
    nombre: string;
    tipo: string;
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
    fecha_devolucion_esperada: string;
    estado: 'activo' | 'atrasado';
    detalles: Detalle[];
}

interface Props {
    prestamo: Prestamo;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function PrestamosDevolucion({ prestamo }: Props) {
    // Inicializamos los contadores con el valor ya devuelto (devoluciones parciales anteriores)
    const [valores, setValores] = useState<Record<number, number>>(
        Object.fromEntries(prestamo.detalles.map(d => [d.id, d.devuelto_parcial]))
    );

    const [procesando, setProcesando] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function updateValor(detalleId: number, valor: number) {
        setValores(prev => ({ ...prev, [detalleId]: valor }));
    }

    // "Devolver todo" rellena todos los campos con la cantidad máxima pendiente
    function devolverTodo() {
        setValores(Object.fromEntries(
            prestamo.detalles.map(d => [d.id, d.cantidad])
        ));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrors({});
        setProcesando(true);

        // Construimos el array de detalles para enviar al backend
        const detalles = prestamo.detalles.map(d => ({
            id:               d.id,
            devuelto_parcial: valores[d.id] ?? d.devuelto_parcial,
        }));

        router.patch(route('prestamos.devolucion.update', prestamo.id), { detalles }, {
            onError: (err) => {
                setErrors(err);
                setProcesando(false);
            },
        });
    }

    // Calcula si hay algo nuevo para devolver (algún valor mayor al devuelto_parcial actual)
    const hayNuevaDevolucion = prestamo.detalles.some(
        d => (valores[d.id] ?? d.devuelto_parcial) > d.devuelto_parcial
    );

    return (
        <AppLayout title="Registrar devolución">
            <div className="max-w-xl mx-auto">

                {/* Breadcrumb */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href={route('prestamos.show', prestamo.id)} className="text-muted hover:text-secondary text-sm">
                        ← Préstamo #{prestamo.id}
                    </Link>
                    <span className="text-muted">/</span>
                    <h1 className="text-xl font-bold text-secondary">Registrar devolución</h1>
                </div>

                {/* Info del solicitante */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 mb-5 text-sm">
                    <p className="font-medium text-secondary">{prestamo.solicitante_nombre}</p>
                    <p className="text-muted capitalize">{prestamo.solicitante_tipo}</p>
                    {prestamo.estado === 'atrasado' && (
                        <p className="text-red-600 font-medium mt-1">
                            ⚠️ Préstamo atrasado — fecha esperada: {new Date(prestamo.fecha_devolucion_esperada + 'T00:00:00').toLocaleDateString('es-PE')}
                        </p>
                    )}
                </div>

                {/* Error general */}
                {errors.prestamo && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-5 text-sm">
                        {errors.prestamo}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-5">

                        {/* Cabecera de la tabla */}
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-secondary">Cantidades a devolver</h2>
                            <button
                                type="button"
                                onClick={devolverTodo}
                                className="text-xs text-primary hover:underline"
                            >
                                Devolver todo
                            </button>
                        </div>

                        {/* Filas de ítems */}
                        <div className="divide-y divide-gray-50">
                            {prestamo.detalles.map(d => {
                                const pendiente  = d.cantidad - d.devuelto_parcial;
                                const valorActual = valores[d.id] ?? d.devuelto_parcial;

                                return (
                                    <div key={d.id} className="px-5 py-4 flex items-center gap-4">

                                        {/* Nombre del equipamiento */}
                                        <div className="flex-1">
                                            <p className="font-medium text-secondary text-sm">{d.equipamiento.nombre}</p>
                                            <p className="text-xs text-muted capitalize">{d.equipamiento.tipo}</p>
                                            <p className="text-xs text-muted mt-0.5">
                                                Prestado: {d.cantidad} — Ya devuelto: {d.devuelto_parcial}
                                                {pendiente > 0
                                                    ? <span className="text-orange-500"> — Pendiente: {pendiente}</span>
                                                    : <span className="text-green-600"> — Completo ✓</span>
                                                }
                                            </p>
                                        </div>

                                        {/* Input de cantidad devuelta */}
                                        <div className="w-28">
                                            <label className="block text-xs text-muted mb-1 text-center">Devuelto total</label>
                                            <input
                                                type="number"
                                                min={d.devuelto_parcial} // No puede bajar de lo ya devuelto
                                                max={d.cantidad}
                                                value={valorActual}
                                                onChange={e => updateValor(d.id, Math.min(d.cantidad, Math.max(d.devuelto_parcial, Number(e.target.value))))}
                                                disabled={pendiente === 0} // Si ya está todo devuelto, deshabilitar
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 disabled:text-muted"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Nota explicativa */}
                    <p className="text-xs text-muted mb-5 px-1">
                        Podés registrar devoluciones parciales. Si hoy se devuelven algunas unidades y el resto mañana,
                        ingresá el total acumulado devuelto hasta ahora. El stock se actualizará automáticamente.
                    </p>

                    {/* Acciones */}
                    <div className="flex justify-end gap-3">
                        <Link
                            href={route('prestamos.show', prestamo.id)}
                            className="border border-gray-300 hover:bg-gray-50 text-secondary px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={procesando || !hayNuevaDevolucion}
                            className="bg-primary hover:bg-orange-600 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            {procesando ? 'Guardando…' : 'Confirmar devolución'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
