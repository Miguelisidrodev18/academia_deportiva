import { LucideIcon } from 'lucide-react';

interface Props {
    icon: LucideIcon | string;
    iconColor?: string;
    label: string;
    value: string | number;
    valueClass?: string;
    iconBg?: string;
    iconGlow?: string;
    accent?: string;
    sub?: string;
    delta?: string;
}

export default function StatCard({
    icon,
    iconColor = 'text-white',
    label,
    value,
    valueClass = 'text-white',
    iconBg = 'bg-orange-500/10',
    iconGlow = 'shadow-orange-500/20',
    accent = 'border-l-primary',
    sub,
    delta,
}: Props) {
    const isComponent = typeof icon !== 'string';
    const Icon = isComponent ? (icon as LucideIcon) : null;

    return (
        <div className={`group relative overflow-hidden rounded-2xl border border-white/10 border-l-4 ${accent} bg-white/5 backdrop-blur-xl p-5 flex items-center justify-between gap-4 shadow-[0_0_20px_rgba(34,197,94,0.08)] transition-all duration-300 hover:scale-[1.02] hover:bg-white/[0.08] hover:border-green-400/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.55),0_0_28px_rgba(34,197,94,0.20)] cursor-default`}>
            <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">{label}</p>
                <p className={`text-2xl font-black leading-none ${valueClass}`}>{value}</p>
                {sub && <p className="text-xs text-gray-400 mt-2">{sub}</p>}
                {delta && <p className="text-xs font-semibold text-success mt-1">{delta}</p>}
            </div>
            <div className={`w-12 h-12 rounded-xl ${iconBg} shadow-lg ${iconGlow} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                {Icon
                    ? <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={1.75} />
                    : <span className="text-xl leading-none">{icon as string}</span>
                }
            </div>
        </div>
    );
}
