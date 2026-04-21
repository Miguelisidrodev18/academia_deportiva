import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

interface Props {
    title: string;
    subtitle?: string;
    ctaHref?: string;
    ctaLabel?: string;
    actions?: ReactNode;
    showDate?: boolean;
}

function todayLabel(): string {
    return new Date().toLocaleDateString('es-PE', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
}

function timeLabel(): string {
    return new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

export default function PageHeader({ title, subtitle, ctaHref, ctaLabel, actions, showDate = true }: Props) {
    return (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-white/[0.08] border-l-4 border-l-primary bg-slate-800/50 px-6 py-4">
            <div>
                <h1 className="text-xl font-bold leading-tight text-white">{title}</h1>
                {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
            </div>

            <div className="flex flex-shrink-0 items-center gap-4">
                {showDate && (
                    <div className="hidden text-right md:block">
                        <p className="text-xs capitalize text-slate-500">{todayLabel()}</p>
                        <p className="text-xs font-semibold text-slate-300">{timeLabel()}</p>
                    </div>
                )}
                {actions ?? (ctaHref && ctaLabel && (
                    <Link
                        href={ctaHref}
                        className="whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-600"
                    >
                        {ctaLabel}
                    </Link>
                ))}
            </div>
        </div>
    );
}
