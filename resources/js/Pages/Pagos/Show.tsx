import { Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Pago {
    id: number;
    monto: string;
    fecha_pago: string;
    metodo: 'efectivo' | 'yape';
    comprobante: string | null;
    periodo_mes: number;
    periodo_anio: number;
    inscripcion: {
        id: number;
        alumno: { id: number; nombre: string; dni: string };
        taller: {
            nombre: string;
            precio_base: string;
            disciplina: { nombre: string };
        };
    };
    registrado_por: { name: string } | null;
}

interface Props {
    pago: Pago;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function formatFecha(f: string) {
    return new Date(f).toLocaleDateString('es-AR', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    });
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function PagosShow({ pago }: Props) {
    const { flash } = usePage().props as any;

    return (
        <AppLayout title={`Pago #${pago.id}`}>
            <div className="max-w-lg mx-auto">

                <div className="mb-6">
                    <Link href={route('pagos.index')} className="text-muted text-sm hover:text-secondary">
                        ← Volver a Pagos
                    </Link>
                </div>

                {flash?.success && (
                    <div className="bg-green-50 border border-success text-success rounded-lg px-4 py-3 mb-4 text-sm">
                        {flash.success}
                    </div>
                )}

                {/* Tarjeta de recibo */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 print:shadow-none">

                    {/* Encabezado tipo recibo */}
                    <div className="text-center border-b border-gray-100 pb-5 mb-5">
                        <p className="text-xs text-muted uppercase tracking-widest mb-1">Recibo de Pago</p>
                        <p className="text-3xl font-bold text-success">
                            ${parseFloat(pago.monto).toLocaleString('es-AR')}
                        </p>
                        <p className="text-muted text-sm mt-1">{formatFecha(pago.fecha_pago)}</p>
                    </div>

                    {/* Detalle */}
                    <dl className="space-y-3 text-sm">
                        <Row label="Alumno">
                            <Link
                                href={route('alumnos.show', pago.inscripcion.alumno.id)}
                                className="font-medium text-secondary hover:text-primary"
                            >
                                {pago.inscripcion.alumno.nombre}
                            </Link>
                            <span className="text-muted font-mono ml-2">({pago.inscripcion.alumno.dni})</span>
                        </Row>

                        <Row label="Disciplina / Taller">
                            {pago.inscripcion.taller.disciplina.nombre} · {pago.inscripcion.taller.nombre}
                        </Row>

                        <Row label="Período">
                            {MESES[pago.periodo_mes - 1]} {pago.periodo_anio}
                        </Row>

                        <Row label="Método de pago">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                pago.metodo === 'yape'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-gray-100 text-gray-700'
                            }`}>
                                {pago.metodo === 'yape' ? '📱 Yape' : '💵 Efectivo'}
                            </span>
                        </Row>

                        {pago.comprobante && (
                            <Row label="Comprobante">
                                <span className="font-mono text-xs bg-gray-50 px-2 py-1 rounded">
                                    {pago.comprobante}
                                </span>
                            </Row>
                        )}

                        <Row label="Registrado por">
                            {pago.registrado_por?.name ?? 'Sistema'}
                        </Row>
                    </dl>

                </div>

                {/* Acciones */}
                <div className="flex gap-3 mt-5 print:hidden">
                    <button
                        onClick={() => window.print()}
                        className="flex-1 bg-secondary hover:bg-slate-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        🖨 Imprimir recibo
                    </button>
                    <Link
                        href={route('pagos.create')}
                        className="flex-1 text-center border border-gray-300 hover:bg-gray-50 text-secondary py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        + Otro pago
                    </Link>
                </div>

            </div>
        </AppLayout>
    );
}

// ─── Sub-componente fila del recibo ──────────────────────────────────────────

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
            <dt className="text-muted shrink-0">{label}</dt>
            <dd className="text-secondary text-right">{children}</dd>
        </div>
    );
}
