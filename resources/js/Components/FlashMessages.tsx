import { usePage } from '@inertiajs/react';

interface Flash { success?: string; error?: string; warning?: string }

/**
 * Lee flash.success / flash.error / flash.warning de las props de Inertia
 * y renderiza los banners correspondientes.
 */
export default function FlashMessages() {
    const { flash } = usePage().props as { flash?: Flash };
    if (!flash?.success && !flash?.error && !flash?.warning) return null;

    return (
        <div className="space-y-2 mb-5">
            {flash.success && (
                <div className="flex items-center gap-2 bg-green-50 border border-success text-success rounded-lg px-4 py-3 text-sm">
                    <span className="text-base">✓</span>
                    <span>{flash.success}</span>
                </div>
            )}
            {flash.warning && (
                <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-300 text-yellow-700 rounded-lg px-4 py-3 text-sm">
                    <span className="text-base">⚠️</span>
                    <span>{flash.warning}</span>
                </div>
            )}
            {flash.error && (
                <div className="flex items-center gap-2 bg-red-50 border border-danger text-danger rounded-lg px-4 py-3 text-sm">
                    <span className="text-base">✕</span>
                    <span>{flash.error}</span>
                </div>
            )}
        </div>
    );
}
