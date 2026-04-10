import { Link } from '@inertiajs/react';

interface Props {
    processing: boolean;
    submitLabel?: string;
    cancelHref: string;
    cancelLabel?: string;
    disabled?: boolean;
}

/**
 * Par de botones submit/cancelar estándar en formularios.
 */
export default function FormActions({
    processing,
    submitLabel = 'Guardar',
    cancelHref,
    cancelLabel = 'Cancelar',
    disabled = false,
}: Props) {
    return (
        <div className="flex gap-3 pt-2">
            <button
                type="submit"
                disabled={processing || disabled}
                className="flex-1 bg-primary hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-medium transition-colors"
            >
                {processing ? 'Guardando...' : submitLabel}
            </button>
            <Link
                href={cancelHref}
                className="flex-1 text-center border border-gray-300 hover:bg-gray-50 text-secondary py-2 rounded-lg text-sm font-medium transition-colors"
            >
                {cancelLabel}
            </Link>
        </div>
    );
}
