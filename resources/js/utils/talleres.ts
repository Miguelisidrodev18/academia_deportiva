export const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'] as const;
export type Dia = (typeof DIAS)[number];

export const DIA_LABEL: Record<string, string> = {
    lunes:     'Lun',
    martes:    'Mar',
    miercoles: 'Mié',
    jueves:    'Jue',
    viernes:   'Vie',
    sabado:    'Sáb',
    domingo:   'Dom',
};

export const DIA_LABEL_FULL: Record<string, string> = {
    lunes:     'Lunes',
    martes:    'Martes',
    miercoles: 'Miércoles',
    jueves:    'Jueves',
    viernes:   'Viernes',
    sabado:    'Sábado',
    domingo:   'Domingo',
};
