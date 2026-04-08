import { useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Alumno { id: number; nombre: string; dni: string; }

interface InscripcionConDeuda {
    inscripcion_id: number;
    taller_nombre: string;
    disciplina: string;
    precio_base: number;
    descuento_tipo: string;
    descuento_pct: number;
    precio_final: number;
    deuda: number;
    mes_sugerido: number;
    anio_sugerido: number;
}

interface DeudaResponse {
    alumno: { id: number; nombre: string };
    inscripciones: InscripcionConDeuda[];
    deuda_total: number;
}

interface Props {
    alumnos: Alumno[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// ─── Componente ───────────────────────────────────────────────────────────────

export default function PagosCreate({ alumnos }: Props) {
    // Estado del formulario gestionado por Inertia
    const { data, setData, post, processing, errors } = useForm({
        inscripcion_id: '',
        monto:          '',
        metodo:         'efectivo',
        comprobante:    '',
        periodo_mes:    String(new Date().getMonth() + 1),
        periodo_anio:   String(new Date().getFullYear()),
    });

    // Estado local para la carga de deuda (no va al backend en este form)
    const [deudaData, setDeudaData] = useState<DeudaResponse | null>(null);
    const [cargandoDeuda, setCargandoDeuda] = useState(false);
    const [inscripcionSeleccionada, setInscripcionSeleccionada] = useState<InscripcionConDeuda | null>(null);

    /**
     * Al seleccionar un alumno, llamamos al endpoint /alumnos/{id}/deuda
     * que devuelve las inscripciones activas con la deuda calculada.
     */
    async function handleAlumnoChange(alumnoId: string) {
        setDeudaData(null);
        setInscripcionSeleccionada(null);
        setData('inscripcion_id', '');
        setData('monto', '');

        if (!alumnoId) return;

        setCargandoDeuda(true);
        try {
            const res = await fetch(route('alumnos.deuda', alumnoId), {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (res.ok) {
                const json: DeudaResponse = await res.json();
                setDeudaData(json);
            }
        } catch (e) {
            // Si falla la carga de deuda, el usuario puede ingresar el monto manualmente
            console.error('No se pudo cargar la deuda:', e);
        } finally {
            setCargandoDeuda(false);
        }
    }

    /** Al seleccionar una inscripción, pre-carga el monto con la deuda. */
    function handleInscripcionChange(inscripcionId: string) {
        setData('inscripcion_id', inscripcionId);
        const insc = deudaData?.inscripciones.find(i => String(i.inscripcion_id) === inscripcionId) ?? null;
        setInscripcionSeleccionada(insc);
        if (insc) {
            setData('monto', String(insc.deuda > 0 ? insc.deuda : insc.precio_final));
            setData('periodo_mes', String(insc.mes_sugerido));
            setData('periodo_anio', String(insc.anio_sugerido));
        }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('pagos.store'));
    }

    return (
        <AppLayout title="Registrar Pago">
            <div className="max-w-2xl mx-auto">

                <div className="mb-6">
                    <Link href={route('pagos.index')} className="text-muted text-sm hover:text-secondary">
                        ← Volver a Pagos
                    </Link>
                    <h1 className="text-2xl font-bold text-secondary mt-2">Registrar Pago</h1>
                </div>

                <div className="space-y-5">

                    {/* ── Paso 1: Seleccionar alumno ── */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-secondary mb-3 uppercase tracking-wide">1. Seleccionar alumno</h2>
                        <select
                            onChange={e => handleAlumnoChange(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">— Seleccioná un alumno —</option>
                            {alumnos.map(a => (
                                <option key={a.id} value={a.id}>{a.nombre} ({a.dni})</option>
                            ))}
                        </select>
                    </div>

                    {/* Cargando deuda */}
                    {cargandoDeuda && (
                        <div className="text-center py-4 text-muted text-sm">Cargando deuda del alumno...</div>
                    )}

                    {/* ── Paso 2: Inscripciones y deuda ── */}
                    {deudaData && (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-semibold text-secondary uppercase tracking-wide">
                                    2. Seleccionar taller a pagar
                                </h2>
                                <span className={`text-sm font-semibold ${deudaData.deuda_total > 0 ? 'text-danger' : 'text-success'}`}>
                                    Deuda total: ${deudaData.deuda_total.toLocaleString('es-AR')}
                                </span>
                            </div>

                            {deudaData.inscripciones.length === 0 ? (
                                <p className="text-muted text-sm">El alumno no tiene inscripciones activas.</p>
                            ) : (
                                <div className="space-y-2">
                                    {deudaData.inscripciones.map(insc => (
                                        <label
                                            key={insc.inscripcion_id}
                                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                                data.inscripcion_id === String(insc.inscripcion_id)
                                                    ? 'border-primary bg-orange-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="inscripcion_id"
                                                value={insc.inscripcion_id}
                                                checked={data.inscripcion_id === String(insc.inscripcion_id)}
                                                onChange={() => handleInscripcionChange(String(insc.inscripcion_id))}
                                                className="mt-1"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-secondary text-sm">
                                                    {insc.disciplina} · {insc.taller_nombre}
                                                </p>
                                                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-gray-600">
                                                    <span>Precio base: ${insc.precio_base.toLocaleString('es-AR')}</span>
                                                    {insc.descuento_pct > 0 && (
                                                        <span className="text-success font-medium">
                                                            Descuento {insc.descuento_tipo === 'hermanos' ? 'hermanos' : 'multi-taller'}: {insc.descuento_pct}%
                                                        </span>
                                                    )}
                                                    <span className="font-semibold text-secondary">
                                                        Precio final: ${insc.precio_final.toLocaleString('es-AR')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-bold ${insc.deuda > 0 ? 'text-danger' : 'text-success'}`}>
                                                    {insc.deuda > 0 ? `$${insc.deuda.toLocaleString('es-AR')}` : 'Al día ✓'}
                                                </p>
                                                <p className="text-xs text-muted">deuda</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                            {errors.inscripcion_id && (
                                <p className="text-danger text-xs mt-2">{errors.inscripcion_id}</p>
                            )}
                        </div>
                    )}

                    {/* ── Paso 3: Detalles del pago ── */}
                    {data.inscripcion_id && (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                            <h2 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4">3. Detalles del pago</h2>

                            <form onSubmit={handleSubmit} className="space-y-4">

                                {/* Período */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-secondary mb-1">
                                            Mes <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            value={data.periodo_mes}
                                            onChange={e => setData('periodo_mes', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            {MESES.map((m, i) => (
                                                <option key={i+1} value={i+1}>{m}</option>
                                            ))}
                                        </select>
                                        {errors.periodo_mes && <p className="text-danger text-xs mt-1">{errors.periodo_mes}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-secondary mb-1">
                                            Año <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={data.periodo_anio}
                                            onChange={e => setData('periodo_anio', e.target.value)}
                                            min={2020} max={2100}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                        {errors.periodo_anio && <p className="text-danger text-xs mt-1">{errors.periodo_anio}</p>}
                                    </div>
                                </div>

                                {/* Monto */}
                                <div>
                                    <label className="block text-xs font-medium text-secondary mb-1">
                                        Monto a pagar (ARS) <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={data.monto}
                                        onChange={e => setData('monto', e.target.value)}
                                        min={0.01} step={0.01}
                                        placeholder="Puede ser pago parcial"
                                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.monto ? 'border-danger' : 'border-gray-300'}`}
                                    />
                                    {inscripcionSeleccionada && (
                                        <p className="text-xs text-muted mt-1">
                                            Cuota mensual: <span className="font-medium">${inscripcionSeleccionada.precio_final.toLocaleString('es-AR')}</span>
                                            {inscripcionSeleccionada.deuda > 0 && (
                                                <> · Deuda total: <span className="text-danger font-medium">${inscripcionSeleccionada.deuda.toLocaleString('es-AR')}</span></>
                                            )}
                                        </p>
                                    )}
                                    {errors.monto && <p className="text-danger text-xs mt-1">{errors.monto}</p>}
                                </div>

                                {/* Método de pago */}
                                <div>
                                    <label className="block text-xs font-medium text-secondary mb-2">
                                        Método de pago <span className="text-danger">*</span>
                                    </label>
                                    <div className="flex gap-4">
                                        {['efectivo', 'yape'].map(m => (
                                            <label key={m} className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                                                data.metodo === m ? 'border-primary bg-orange-50 text-primary font-medium' : 'border-gray-300 text-gray-600'
                                            }`}>
                                                <input
                                                    type="radio"
                                                    name="metodo"
                                                    value={m}
                                                    checked={data.metodo === m}
                                                    onChange={() => setData('metodo', m)}
                                                    className="sr-only"
                                                />
                                                {m === 'efectivo' ? '💵 Efectivo' : '📱 Yape'}
                                            </label>
                                        ))}
                                    </div>
                                    {errors.metodo && <p className="text-danger text-xs mt-1">{errors.metodo}</p>}
                                </div>

                                {/* Comprobante (opcional) */}
                                <div>
                                    <label className="block text-xs font-medium text-secondary mb-1">
                                        Comprobante / Referencia (opcional)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.comprobante}
                                        onChange={e => setData('comprobante', e.target.value)}
                                        placeholder="Ej: Número de operación Yape, recibo #123..."
                                        maxLength={500}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    {errors.comprobante && <p className="text-danger text-xs mt-1">{errors.comprobante}</p>}
                                </div>

                                {/* Botón */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 bg-primary hover:bg-orange-600 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        {processing ? 'Registrando...' : '✓ Registrar pago'}
                                    </button>
                                    <Link
                                        href={route('pagos.index')}
                                        className="flex-1 text-center border border-gray-300 hover:bg-gray-50 text-secondary py-2.5 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Cancelar
                                    </Link>
                                </div>

                            </form>
                        </div>
                    )}

                </div>
            </div>
        </AppLayout>
    );
}
