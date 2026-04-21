import { Link } from '@inertiajs/react';

interface Props {
    icon?: string;
    title: string;
    description?: string;
    ctaHref?: string;
    ctaLabel?: string;
}

export default function EmptyState({ icon = '📋', title, description, ctaHref, ctaLabel }: Props) {
    return (
        <div className="rounded-2xl border border-white/[0.08] bg-slate-800/50 p-12 text-center">
            <p className="mb-4 text-5xl">{icon}</p>
            <p className="mb-1 text-lg font-semibold text-white">{title}</p>
            {description && <p className="mb-5 text-sm text-slate-400">{description}</p>}
            {ctaHref && ctaLabel && (
                <Link
                    href={ctaHref}
                    className="inline-block rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                >
                    {ctaLabel}
                </Link>
            )}
        </div>
    );
}
