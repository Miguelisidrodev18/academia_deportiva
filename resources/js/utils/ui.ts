/**
 * Genera un color de avatar determinístico basado en el primer carácter del nombre.
 * Retorna una clase Tailwind de fondo.
 */
const AVATAR_COLORS = [
    'bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-rose-500',
    'bg-amber-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-pink-500',
] as const;

export function avatarColor(nombre: string): string {
    return AVATAR_COLORS[(nombre.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];
}

/**
 * Capitaliza la primera letra de un string.
 */
export function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Lee el CSRF token del meta tag (para fetch manual). */
export function csrfToken(): string {
    return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
}
