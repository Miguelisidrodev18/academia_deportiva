import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

/**
 * Tarjeta de métrica del dashboard.
 * En esta versión las métricas son estáticas (placeholders).
 * En la Sesión 11 las conectaremos con datos reales de la base de datos.
 */
function MetricCard({
    label,
    value,
    icon,
    color = 'text-gray-800',
}: {
    label: string;
    value: string | number;
    icon: string;
    color?: string;
}) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 border border-gray-100">
            <div className="text-3xl">{icon}</div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
        </div>
    );
}

/**
 * Dashboard principal – vista del dueño.
 *
 * Muestra:
 * - 4 tarjetas de métricas clave
 * - Sección de alertas activas (estática por ahora)
 *
 * En la Sesión 11 estas tarjetas recibirán datos reales via props de Inertia.
 */
export default function Dashboard() {
    return (
        <AppLayout title="Dashboard">
            <Head title="Dashboard" />

            {/* ── Tarjetas de métricas (4 columnas en desktop, 2 en tablet, 1 en mobile) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <MetricCard
                    label="Alumnos activos"
                    value="—"
                    icon="👥"
                    color="text-gray-800"
                />
                <MetricCard
                    label="Deuda total pendiente"
                    value="—"
                    icon="💰"
                    color="text-danger"
                />
                <MetricCard
                    label="Equipamiento no devuelto"
                    value="—"
                    icon="🎽"
                    color="text-orange-500"
                />
                <MetricCard
                    label="Reservas de hoy"
                    value="—"
                    icon="🏟️"
                    color="text-gray-800"
                />
            </div>

            {/* ── Alertas activas ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                {/* Alumnos con 3+ faltas sin justificar */}
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-danger inline-block"></span>
                        Alumnos con faltas reiteradas
                    </h3>
                    <p className="text-sm text-gray-400 italic">No hay alertas activas</p>
                </div>

                {/* Préstamos vencidos */}
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span>
                        Préstamos vencidos
                    </h3>
                    <p className="text-sm text-gray-400 italic">No hay préstamos vencidos</p>
                </div>

                {/* Stock bajo */}
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>
                        Stock bajo (&lt; 5 unidades)
                    </h3>
                    <p className="text-sm text-gray-400 italic">Todos los productos tienen stock suficiente</p>
                </div>
            </div>

            {/* ── Últimos pagos (tabla vacía por ahora) ── */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Últimos pagos registrados</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-400 uppercase border-b border-gray-100">
                            <tr>
                                <th className="pb-3 pr-4">Alumno</th>
                                <th className="pb-3 pr-4">Taller</th>
                                <th className="pb-3 pr-4">Monto</th>
                                <th className="pb-3 pr-4">Método</th>
                                <th className="pb-3">Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-gray-300 italic">
                                    Aún no hay pagos registrados
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
