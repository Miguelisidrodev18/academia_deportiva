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
    return new Date().toLocaleDateString('es-AR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
}

function timeLabel(): string {
    return new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Encabezado de módulo con borde izquierdo naranja, título + subtítulo + CTA + fecha opcional.
 */
export default function PageHeader({ title, subtitle, ctaHref, ctaLabel, actions, showDate = true }: Props) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-primary px-6 py-4 mb-6 flex items-center justify-between gap-4">
            <div>
                <h1 className="text-xl font-bold text-secondary leading-tight">{title}</h1>
                {subtitle && <p className="text-muted text-sm mt-0.5">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-4 flex-shrink-0">
                {showDate && (
                    <div className="hidden md:block text-right">
                        <p className="text-xs text-muted capitalize">{todayLabel()}</p>
                        <p className="text-xs font-semibold text-secondary">{timeLabel()}</p>
                    </div>
                )}
                {actions ?? (ctaHref && ctaLabel && (
                    <Link
                        href={ctaHref}
                        className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shadow-sm"
                    >
                        {ctaLabel}
                    </Link>
                ))}
            </div>
        </div>
    );
}
