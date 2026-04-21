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

export default function StatCard({
    icon,
    label,
    value,
    valueClass = 'text-white',
    iconBg = 'bg-orange-500/20',
    accent = 'border-l-primary',
    sub,
    delta,
}: Props) {
    return (
        <div className={`group relative overflow-hidden rounded-2xl border border-green-500/10 border-l-4 ${accent} bg-white/5 backdrop-blur-lg p-5 flex items-center justify-between gap-4 shadow-[0_4px_24px_rgba(0,0,0,0.40)] transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.08] hover:border-green-500/25 hover:shadow-[0_12px_40px_rgba(0,0,0,0.55),0_0_32px_rgba(74,222,128,0.16)] cursor-default`}>
            <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">{label}</p>
                <p className={`text-2xl font-black leading-none ${valueClass}`}>{value}</p>
                {sub && <p className="text-xs text-slate-400 mt-2">{sub}</p>}
                {delta && <p className="text-xs font-semibold text-success mt-1">{delta}</p>}
            </div>
            <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center text-xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                {icon}
            </div>
        </div>
    );
}
