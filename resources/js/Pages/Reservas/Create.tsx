import { useForm, Link, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/Layouts/AppLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Espacio {
    id: number;
    nombre: string;
    descripcion: string | null;
    equipamiento_base: { nombre: string; cantidad: number }[];
    rangos_horarios: RangoHorario[];
}

interface RangoHorario {
    id: number;
    dia_semana: number;
    hora_inicio: string;
    hora_fin: string;
    precio: string;
    disponible: boolean; // true = libre ese día
}

interface Alumno {
    id: number;
    nombre: string;
    dni: string;
}

interface Props {
    espacios: Espacio[];
    rangoDisponibles: RangoHorario[];
    fecha: string;
    espacioId: number | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DIA_LABEL: Record<number, string> = { 1:'Lun', 2:'Mar', 3:'Mié', 4:'Jue', 5:'Vie', 6:'Sáb', 7:'Dom' };

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ReservasCreate({ espacios, rangoDisponibles, fecha, espacioId }: Props) {
    // Paso actual del wizard (1=espacio+fecha, 2=horario, 3=cliente+pago)
    const [paso, setPaso] = useState(espacioId ? 2 : 1);

    const [rangos, setRangos] = useState<RangoHorario[]>(rangoDisponibles);
    const [cargandoRangos, setCargandoRangos] = useState(false);

    // Autocomplete de alumnos
    const [busqueda, setBusqueda] = useState('');
    const [sugerencias, setSugerencias] = useState<Alumno[]>([]);
    const [alumnoSel, setAlumnoSel] = useState<Alumno | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        espacio_id:       espacioId ? String(espacioId) : '',
        rango_horario_id: '',
        alumno_id:        '',
        fecha_reserva:    fecha,
        tipo_cliente:     'externo' as 'alumno' | 'externo',
        cliente_nombre:   '',
        cliente_dni:      '',
        cliente_telefono: '',
        monto_pagado:     '',
        equipamiento:     [] as { id: number; nombre: string; cantidad_reservada: number; max: number }[],
    });

    // Espacio seleccionado actualmente
    const espacioActual = espacios.find(e => String(e.id) === data.espacio_id) ?? null;

    // Cuando cambia espacio o fecha → cargar rangos disponibles vía fetch
    async function cargarRangos(espacioId: string, fecha: string) {
        if (!espacioId) return;
        setCargandoRangos(true);
        try {
            const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
            const res = await fetch(route('reservas.horarios') + `?espacio_id=${espacioId}&fecha=${fecha}`, {
                headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': csrf },
            });
            if (res.ok) setRangos(await res.json());
        } finally {
            setCargandoRangos(false);
        }
    }

    useEffect(() => {
        if (data.espacio_id && data.fecha_reserva) {
            cargarRangos(data.espacio_id, data.fecha_reserva);
        }
    }, [data.espacio_id, data.fecha_reserva]);

    // Inicializar equipamiento cuando se selecciona el rango y espacio
    function seleccionarRango(rangoId: string) {
        setData(d => ({
            ...d,
            rango_horario_id: rangoId,
            monto_pagado: rangos.find(r => String(r.id) === rangoId)?.precio ?? d.monto_pagado,
            equipamiento: (espacioActual?.equipamiento_base ?? []).map((eq, i) => ({
                id: i, // no tiene ID real de BD, es del JSON
                nombre: eq.nombre,
                cantidad_reservada: 0,
                max: eq.cantidad,
            })),
        }));
    }

    // Buscar alumnos con debounce
    useEffect(() => {
        if (data.tipo_cliente !== 'alumno') return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (busqueda.length < 2) { setSugerencias([]); return; }
        debounceRef.current = setTimeout(async () => {
            const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
            const res = await fetch(route('alumnos.buscar') + `?q=${encodeURIComponent(busqueda)}`, {
                headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': csrf },
            });
            if (res.ok) setSugerencias(await res.json());
        }, 300);
    }, [busqueda, data.tipo_cliente]);

    function seleccionarAlumno(alumno: Alumno) {
        setAlumnoSel(alumno);
        setData('alumno_id', String(alumno.id));
        setBusqueda(alumno.nombre);
        setSugerencias([]);
    }

    function actualizarCantEquip(idx: number, val: number) {
        const u = [...data.equipamiento];
        u[idx] = { ...u[idx], cantidad_reservada: Math.min(Math.max(0, val), u[idx].max) };
        setData('equipamiento', u);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        // Filtrar equipamiento con cantidad > 0 y usar índice como ID (se interpreta en backend por nombre)
        const equipFiltrado = data.equipamiento
            .filter(eq => eq.cantidad_reservada > 0)
            .map(eq => ({ id: eq.id, cantidad_reservada: eq.cantidad_reservada }));
        post(route('reservas.store'));
    }

    const rangoSel = rangos.find(r => String(r.id) === data.rango_horario_id) ?? null;

    return (
        <AppLayout title="Nueva Reserva">
            <div className="max-w-2xl mx-auto">

                <div className="mb-6">
                    <Link href={route('reservas.index')} className="text-muted text-sm hover:text-secondary">← Volver a Reservas</Link>
                    <h1 className="text-2xl font-bold text-secondary mt-2">Nueva reserva</h1>
                    <p className="text-muted text-sm mt-1">Completá los 3 pasos para confirmar la reserva.</p>
                </div>

                {/* Progress steps */}
                <div className="flex items-center gap-2 mb-6">
                    {[1, 2, 3].map(n => (
                        <div key={n} className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                paso > n ? 'bg-success text-white' : paso === n ? 'bg-primary text-white' : 'bg-gray-200 text-muted'
                            }`}>
                                {paso > n ? '✓' : n}
                            </div>
                            <span className={`text-xs ${paso === n ? 'text-secondary font-medium' : 'text-muted'}`}>
                                {n === 1 ? 'Espacio y fecha' : n === 2 ? 'Horario' : 'Cliente y pago'}
                            </span>
                            {n < 3 && <div className="w-6 h-px bg-gray-200 mx-1" />}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* ── PASO 1: Espacio y fecha ──────────────────────────── */}
                    {paso === 1 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
                            <h2 className="font-semibold text-secondary text-sm uppercase tracking-wide">1. Elegí espacio y fecha</h2>

                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1">Espacio <span className="text-danger">*</span></label>
                                <select value={data.espacio_id} onChange={e => setData('espacio_id', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="">— Seleccioná un espacio —</option>
                                    {espacios.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary mb-1">Fecha <span className="text-danger">*</span></label>
                                <input type="date" value={data.fecha_reserva}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={e => setData('fecha_reserva', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>

                            {espacioActual && (
                                <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 text-xs text-orange-800">
                                    <p className="font-medium mb-1">{espacioActual.nombre}</p>
                                    {espacioActual.descripcion && <p className="text-orange-700">{espacioActual.descripcion}</p>}
                                </div>
                            )}

                            <button type="button" disabled={!data.espacio_id || !data.fecha_reserva}
                                onClick={() => setPaso(2)}
                                className="w-full bg-primary hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-medium transition-colors">
                                Siguiente →
                            </button>
                        </div>
                    )}

                    {/* ── PASO 2: Horario ─────────────────────────────────── */}
                    {paso === 2 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold text-secondary text-sm uppercase tracking-wide">2. Elegí el horario</h2>
                                <button type="button" onClick={() => setPaso(1)} className="text-xs text-muted hover:text-secondary">← Volver</button>
                            </div>

                            <div className="bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-700">
                                <span className="font-medium">{espacioActual?.nombre}</span>
                                {' · '}{new Date(data.fecha_reserva + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long' })}
                            </div>

                            {cargandoRangos ? (
                                <p className="text-sm text-muted text-center py-4">Cargando horarios...</p>
                            ) : rangos.length === 0 ? (
                                <div className="text-center py-4">
                                    <p className="text-sm text-muted">Sin horarios disponibles para ese día.</p>
                                    <p className="text-xs text-muted mt-1">Probá con otra fecha o revisá los rangos del espacio.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {rangos.map(rango => (
                                        <button
                                            key={rango.id}
                                            type="button"
                                            disabled={!rango.disponible}
                                            onClick={() => seleccionarRango(String(rango.id))}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-colors ${
                                                String(rango.id) === data.rango_horario_id
                                                    ? 'border-primary bg-orange-50 text-primary font-medium'
                                                    : rango.disponible
                                                        ? 'border-gray-200 hover:border-primary hover:bg-orange-50 text-secondary'
                                                        : 'border-gray-100 bg-gray-50 text-muted cursor-not-allowed opacity-60'
                                            }`}
                                        >
                                            <span>{DIA_LABEL[rango.dia_semana]} {rango.hora_inicio} – {rango.hora_fin}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold">${parseFloat(rango.precio).toLocaleString('es-AR')}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${rango.disponible ? 'bg-green-100 text-success' : 'bg-red-100 text-danger'}`}>
                                                    {rango.disponible ? 'Libre' : 'Ocupado'}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <button type="button" disabled={!data.rango_horario_id}
                                onClick={() => setPaso(3)}
                                className="w-full bg-primary hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-medium transition-colors">
                                Siguiente →
                            </button>
                        </div>
                    )}

                    {/* ── PASO 3: Cliente y pago ──────────────────────────── */}
                    {paso === 3 && (
                        <div className="space-y-4">
                            {/* Resumen */}
                            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-sm text-orange-800">
                                <p className="font-semibold mb-1">{espacioActual?.nombre}</p>
                                <p className="text-xs">
                                    {new Date(data.fecha_reserva + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                                    {' · '}{rangoSel?.hora_inicio}–{rangoSel?.hora_fin}
                                </p>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-semibold text-secondary text-sm uppercase tracking-wide">3. Cliente y pago</h2>
                                    <button type="button" onClick={() => setPaso(2)} className="text-xs text-muted hover:text-secondary">← Volver</button>
                                </div>

                                {/* Tipo de cliente */}
                                <div className="flex gap-3">
                                    {(['externo', 'alumno'] as const).map(tipo => (
                                        <button key={tipo} type="button"
                                            onClick={() => { setData('tipo_cliente', tipo); setAlumnoSel(null); setBusqueda(''); setData('alumno_id', ''); }}
                                            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                                data.tipo_cliente === tipo
                                                    ? 'border-primary bg-orange-50 text-primary'
                                                    : 'border-gray-200 text-secondary hover:bg-gray-50'
                                            }`}>
                                            {tipo === 'externo' ? '👤 Cliente externo' : '🎓 Alumno de la academia'}
                                        </button>
                                    ))}
                                </div>

                                {data.tipo_cliente === 'alumno' ? (
                                    /* Autocomplete de alumnos */
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-secondary mb-1">Buscar alumno</label>
                                        <input type="text" value={busqueda}
                                            onChange={e => { setBusqueda(e.target.value); setAlumnoSel(null); setData('alumno_id', ''); }}
                                            placeholder="Nombre o DNI del alumno..."
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                        {sugerencias.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                {sugerencias.map(a => (
                                                    <button key={a.id} type="button" onClick={() => seleccionarAlumno(a)}
                                                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors">
                                                        <span className="font-medium">{a.nombre}</span>
                                                        <span className="text-muted ml-2">{a.dni}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {alumnoSel && (
                                            <div className="mt-2 bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-700">
                                                ✓ Seleccionado: <span className="font-medium">{alumnoSel.nombre}</span> · {alumnoSel.dni}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* Cliente externo */
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-secondary mb-1">Nombre <span className="text-danger">*</span></label>
                                            <input type="text" value={data.cliente_nombre} onChange={e => setData('cliente_nombre', e.target.value)}
                                                placeholder="Nombre completo"
                                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.cliente_nombre ? 'border-danger' : 'border-gray-300'}`} />
                                            {errors.cliente_nombre && <p className="text-danger text-xs mt-1">{errors.cliente_nombre}</p>}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-secondary mb-1">DNI</label>
                                                <input type="text" value={data.cliente_dni} onChange={e => setData('cliente_dni', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-secondary mb-1">Teléfono</label>
                                                <input type="text" value={data.cliente_telefono} onChange={e => setData('cliente_telefono', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Monto pagado */}
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-1">Monto pagado <span className="text-danger">*</span></label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-sm text-muted">$</span>
                                        <input type="number" min={0} value={data.monto_pagado}
                                            onChange={e => setData('monto_pagado', e.target.value)}
                                            placeholder={rangoSel ? parseFloat(rangoSel.precio).toFixed(0) : '0'}
                                            className={`w-full border rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.monto_pagado ? 'border-danger' : 'border-gray-300'}`} />
                                    </div>
                                    {errors.monto_pagado && <p className="text-danger text-xs mt-1">{errors.monto_pagado}</p>}
                                    {rangoSel && (
                                        <p className="text-xs text-muted mt-1">Precio del rango: ${parseFloat(rangoSel.precio).toLocaleString('es-AR')}</p>
                                    )}
                                </div>

                                {/* Equipamiento a reservar */}
                                {data.equipamiento.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-secondary mb-2">Equipamiento a usar</label>
                                        <div className="space-y-2">
                                            {data.equipamiento.map((eq, i) => (
                                                <div key={i} className="flex items-center justify-between text-sm">
                                                    <span className="text-secondary">{eq.nombre}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted">máx {eq.max}</span>
                                                        <input type="number" min={0} max={eq.max}
                                                            value={eq.cantidad_reservada}
                                                            onChange={e => actualizarCantEquip(i, parseInt(e.target.value) || 0)}
                                                            className="w-14 border border-gray-300 rounded px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-primary" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Botón confirmar */}
                            <div className="flex gap-3">
                                <button type="submit"
                                    disabled={processing || (data.tipo_cliente === 'externo' && !data.cliente_nombre) || !data.monto_pagado}
                                    className="flex-1 bg-primary hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                                    {processing ? 'Confirmando...' : '✓ Confirmar reserva'}
                                </button>
                                <Link href={route('reservas.index')}
                                    className="flex-1 text-center border border-gray-300 hover:bg-gray-50 text-secondary py-2.5 rounded-lg text-sm font-medium transition-colors">
                                    Cancelar
                                </Link>
                            </div>
                        </div>
                    )}

                </form>
            </div>
        </AppLayout>
    );
}
