import { Link, usePage, router } from '@inertiajs/react';
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
    tipo_cliente: 'alumno' | 'externo';
    cliente_nombre: string | null;
    cliente_dni: string | null;
    cliente_telefono: string | null;
    monto_pagado: string;
    estado: 'confirmada' | 'finalizada' | 'cancelada';
    espacio: { id: number; nombre: string; equipamiento_base: any[] };
    rango_horario: { id: number; dia_semana: number; hora_inicio: string; hora_fin: string; precio: string };
    alumno: { id: number; nombre: string; dni: string } | null;
    equipamientos: Equipamiento[];
}

interface Props { reserva: Reserva }

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ESTADO_BADGE: Record<string, string> = {
    confirmada: 'bg-green-100 text-success border-success',
    finalizada: 'bg-blue-100 text-blue-700 border-blue-200',
    cancelada:  'bg-gray-100 text-muted border-gray-200',
};

const DIA_LABEL: Record<number, string> = { 1:'Lunes', 2:'Martes', 3:'Miércoles', 4:'Jueves', 5:'Viernes', 6:'Sábado', 7:'Domingo' };

function formatFecha(f: string) {
    return new Date(f + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ReservasShow({ reserva }: Props) {
    const { flash } = usePage().props as any;

    const clienteNombre = reserva.tipo_cliente === 'alumno' && reserva.alumno
        ? reserva.alumno.nombre
        : reserva.cliente_nombre ?? '—';

    const clienteDni = reserva.tipo_cliente === 'alumno' && reserva.alumno
        ? reserva.alumno.dni
        : reserva.cliente_dni ?? '—';

    const hayEquipamiento = reserva.equipamientos.length > 0;
    const todoDevuelto = hayEquipamiento && reserva.equipamientos.every(
        eq => eq.pivot.cantidad_devuelta >= eq.pivot.cantidad_reservada
    );

    function handleCancelar() {
        if (!confirm('¿Cancelar esta reserva?')) return;
        router.delete(route('reservas.destroy', reserva.id));
    }

    return (
        <AppLayout title={`Reserva #${reserva.id}`}>
            <div className="max-w-lg mx-auto">

                {/* Breadcrumb */}
                <div className="mb-6">
                    <Link href={route('reservas.index')} className="text-muted text-sm hover:text-secondary">← Volver a Reservas</Link>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="bg-green-50 border border-success text-success rounded-lg px-4 py-3 mb-4 text-sm">{flash.success}</div>
                )}

                {/* Card principal */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
                    {/* Header con estado */}
                    <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-5 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wide">Reserva #{reserva.id}</p>
                                <h1 className="text-white font-bold text-xl mt-0.5">{reserva.espacio.nombre}</h1>
                            </div>
                            <span className={`text-xs px-3 py-1 rounded-full font-medium border ${ESTADO_BADGE[reserva.estado] ?? 'bg-gray-100 text-muted'}`}>
                                {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                            </span>
                        </div>
                    </div>

                    <div className="p-5 space-y-4">
                        {/* Fecha y horario */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-muted uppercase tracking-wide mb-1">Fecha</p>
                                <p className="text-sm font-medium text-secondary capitalize">{formatFecha(reserva.fecha_reserva)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted uppercase tracking-wide mb-1">Horario</p>
                                <p className="text-sm font-medium text-secondary">
                                    {reserva.rango_horario.hora_inicio} – {reserva.rango_horario.hora_fin}
                                </p>
                            </div>
                        </div>

                        {/* Cliente */}
                        <div>
                            <p className="text-xs text-muted uppercase tracking-wide mb-1">Cliente</p>
                            <p className="text-sm font-medium text-secondary">{clienteNombre}</p>
                            <p className="text-xs text-muted">DNI: {clienteDni}</p>
                            {reserva.cliente_telefono && (
                                <p className="text-xs text-muted">Tel: {reserva.cliente_telefono}</p>
                            )}
                            {reserva.tipo_cliente === 'alumno' && reserva.alumno && (
                                <Link href={route('alumnos.show', reserva.alumno.id)} className="text-xs text-primary hover:underline mt-1 block">
                                    Ver perfil del alumno →
                                </Link>
                            )}
                        </div>

                        {/* Monto */}
                        <div className="bg-orange-50 rounded-lg px-4 py-3 flex items-center justify-between">
                            <span className="text-sm text-secondary font-medium">Monto pagado</span>
                            <span className="text-xl font-bold text-primary">
                                ${parseFloat(reserva.monto_pagado).toLocaleString('es-AR')}
                            </span>
                        </div>

                        {/* Equipamiento */}
                        {hayEquipamiento && (
                            <div>
                                <p className="text-xs text-muted uppercase tracking-wide mb-2">Equipamiento</p>
                                <div className="space-y-1.5">
                                    {reserva.equipamientos.map(eq => {
                                        const devuelto = eq.pivot.cantidad_devuelta >= eq.pivot.cantidad_reservada;
                                        return (
                                            <div key={eq.id} className="flex items-center justify-between text-sm">
                                                <span className="text-secondary">{eq.nombre}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted">
                                                        Devuelto: {eq.pivot.cantidad_devuelta}/{eq.pivot.cantidad_reservada}
                                                    </span>
                                                    <span className={`text-xs px-1.5 py-0.5 rounded ${devuelto ? 'bg-green-100 text-success' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {devuelto ? '✓' : 'Pendiente'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-3">
                    {hayEquipamiento && !todoDevuelto && reserva.estado === 'confirmada' && (
                        <Link href={route('reservas.devolucion', reserva.id)}
                            className="flex-1 text-center bg-secondary hover:bg-slate-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                            📦 Registrar devolución
                        </Link>
                    )}
                    {reserva.estado === 'confirmada' && (
                        <button onClick={handleCancelar}
                            className="flex-1 border border-danger text-danger hover:bg-red-50 py-2 rounded-lg text-sm font-medium transition-colors">
                            ✕ Cancelar reserva
                        </button>
                    )}
                    <Link href={route('reservas.index')}
                        className="flex-1 text-center border border-gray-300 hover:bg-gray-50 text-secondary py-2 rounded-lg text-sm font-medium transition-colors">
                        ← Lista de reservas
                    </Link>
                </div>

            </div>
        </AppLayout>
    );
}
