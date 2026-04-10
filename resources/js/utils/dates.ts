/**
 * Calcula la edad en años a partir de una fecha de nacimiento (YYYY-MM-DD).
 */
export function calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
}

/**
 * Formatea una fecha ISO (YYYY-MM-DD) en español, evitando el offset UTC.
 * @param f  fecha en formato YYYY-MM-DD
 * @param opts opciones de formato — por defecto: día numérico, mes corto, año
 */
export function formatFecha(
    f: string,
    opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' },
): string {
    return new Date(f + 'T00:00:00').toLocaleDateString('es-AR', opts);
}

/**
 * Formatea una fecha con día de semana largo (para detalles de reserva/show).
 */
export function formatFechaLarga(f: string): string {
    return formatFecha(f, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}
