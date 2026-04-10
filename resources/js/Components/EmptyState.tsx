import { Link } from '@inertiajs/react';

interface Props {
    icon?: string;
    title: string;
    description?: string;
    ctaHref?: string;
    ctaLabel?: string;
}

/**
 * Estado vacío estándar: ícono grande + título + descripción + CTA opcional.
 */
export default function EmptyState({ icon = '📋', title, description, ctaHref, ctaLabel }: Props) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <p className="text-5xl mb-4">{icon}</p>
            <p className="font-semibold text-secondary text-lg mb-1">{title}</p>
            {description && <p className="text-muted text-sm mb-5">{description}</p>}
            {ctaHref && ctaLabel && (
                <Link
                    href={ctaHref}
                    className="inline-block bg-primary hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    {ctaLabel}
                </Link>
            )}
        </div>
    );
}
