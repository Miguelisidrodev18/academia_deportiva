interface Props {
    icon: string;
    label: string;
    value: string | number;
    valueClass?: string;
    iconBg?: string;
    accent?: string;
    sub?: string;
    delta?: string;
}

/**
 * Tarjeta KPI con borde izquierdo de color, valor grande e ícono en círculo.
 */
export default function StatCard({
    icon,
    label,
    value,
    valueClass = 'text-secondary',
    iconBg = 'bg-orange-100',
    accent = 'border-l-primary',
    sub,
    delta,
}: Props) {
    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${accent} p-5 flex items-center justify-between gap-4`}>
            <div className="min-w-0">
                <p className="text-xs font-medium text-muted uppercase tracking-wide mb-1">{label}</p>
                <p className={`text-2xl font-bold leading-none ${valueClass}`}>{value}</p>
                {sub && <p className="text-xs text-muted mt-1.5">{sub}</p>}
                {delta && <p className="text-xs text-success mt-1">{delta}</p>}
            </div>
            <div className={`w-11 h-11 rounded-full ${iconBg} flex items-center justify-center text-xl flex-shrink-0`}>
                {icon}
            </div>
        </div>
    );
}
