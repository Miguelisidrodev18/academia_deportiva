interface Props {
    icon: string;
    label: string;
    value: string | number;
    valueClass?: string;
    sub?: string;
}

/**
 * Tarjeta KPI estándar: ícono + valor grande + etiqueta.
 * Usada en dashboards, show pages e índices con KPIs.
 */
export default function StatCard({ icon, label, value, valueClass = 'text-secondary', sub }: Props) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
            <p className="text-3xl mb-1">{icon}</p>
            <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
            <p className="text-xs text-muted mt-1">{label}</p>
            {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
        </div>
    );
}
