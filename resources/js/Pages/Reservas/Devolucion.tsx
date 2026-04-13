import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Equipamiento {
    id: number;
    nombre: string;
    pivot: { cantidad_reservada: number; cantidad_devuelta: number };
}

interface Reserva {
    id: number;
    fecha_reserva: string;
    espacio: { id: number; nombre: string };
    rango_horario: { hora_inicio: string; hora_fin: string };
    alumno: { nombre: string; dni: string } | null;
    cliente_nombre: string | null;
    tipo_cliente: 'alumno' | 'externo';
    equipamientos: Equipamiento[];
}

interface Props { reserva: Reserva }

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ReservasDevolucion({ reserva }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        equipamiento: reserva.equipamientos.map(eq => ({
            id: eq.id,
            nombre: eq.nombre,
            cantidad_reservada: eq.pivot.cantidad_reservada,
            cantidad_devuelta:  eq.pivot.cantidad_devuelta,
        })),
    });

    const clienteNombre = reserva.tipo_cliente === 'alumno' && reserva.alumno
        ? reserva.alumno.nombre
        : reserva.cliente_nombre ?? '—';

    function actualizar(idx: number, val: number) {
        const u = [...data.equipamiento];
        u[idx] = { ...u[idx], cantidad_devuelta: Math.min(Math.max(0, val), u[idx].cantidad_reservada) };
        setData('equipamiento', u);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        patch(route('reservas.devolucion.update', reserva.id));
    }

    return (
        <AppLayout title={`Devolución – Reserva #${reserva.id}`}>
            <div className="max-w-lg mx-auto">

                <div className="mb-6">
                    <Link href={route('reservas.show', reserva.id)} className="text-muted text-sm hover:text-secondary">
                        ← Volver a la reserva
                    </Link>
                    <h1 className="text-2xl font-bold text-secondary mt-2">Registrar devolución</h1>
                    <p className="text-muted text-sm mt-1">Indicá qué equipamiento fue devuelto por el cliente.</p>
                </div>

                {/* Resumen */}
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-5 text-sm text-orange-800">
                    <p className="font-semibold">{reserva.espacio.nombre}</p>
                    <p className="text-xs mt-0.5">
                        {new Date(reserva.fecha_reserva + 'T00:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'long' })}
                        {' · '}{reserva.rango_horario.hora_inicio}–{reserva.rango_horario.hora_fin}
                        {' · '}{clienteNombre}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
                        <h2 className="font-semibold text-secondary text-sm uppercase tracking-wide">Equipamiento prestado</h2>

                        {data.equipamiento.map((eq, i) => {
                            const completo = eq.cantidad_devuelta >= eq.cantidad_reservada;
                            return (
                                <div key={eq.id} className={`rounded-lg border p-4 ${completo ? 'border-success bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-secondary">{eq.nombre}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${completo ? 'bg-green-100 text-success' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {completo ? '✓ Completo' : 'Pendiente'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-xs text-muted">
                                            Prestado: <span className="font-medium text-secondary">{eq.cantidad_reservada}</span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-1">
                                            <span className="text-xs text-muted">Devuelto:</span>
                                            <input
                                                type="number"
                                                min={0}
                                                max={eq.cantidad_reservada}
                                                value={eq.cantidad_devuelta}
                                                onChange={e => actualizar(i, parseInt(e.target.value) || 0)}
                                                className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                            <span className="text-xs text-muted">/ {eq.cantidad_reservada}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex gap-3 mt-5">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 bg-primary hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            {processing ? 'Guardando...' : '✓ Guardar devolución'}
                        </button>
                        <Link
                            href={route('reservas.show', reserva.id)}
                            className="flex-1 text-center border border-gray-300 hover:bg-gray-50 text-secondary py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Cancelar
                        </Link>
                    </div>
                </form>

            </div>
        </AppLayout>
    );
}
