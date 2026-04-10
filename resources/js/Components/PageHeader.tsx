import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

interface Props {
    title: string;
    subtitle?: string;
    /** Href del botón primario */
    ctaHref?: string;
    /** Texto del botón primario */
    ctaLabel?: string;
    /** Nodo extra derecho (reemplaza el CTA por defecto) */
    actions?: ReactNode;
}

/**
 * Encabezado de página estándar: título + subtítulo + botón CTA.
 * Reemplaza el patrón flex justify-between repetido en cada Index.
 */
export default function PageHeader({ title, subtitle, ctaHref, ctaLabel, actions }: Props) {
    return (
        <div className="flex items-start justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold text-secondary">{title}</h1>
                {subtitle && <p className="text-muted text-sm mt-1">{subtitle}</p>}
            </div>
            {actions ?? (ctaHref && ctaLabel && (
                <Link
                    href={ctaHref}
                    className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                >
                    {ctaLabel}
                </Link>
            ))}
        </div>
    );
}
