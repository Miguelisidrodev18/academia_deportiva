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

// Mapa numérico (1=Lun…7=Dom) para RangoHorario.dia_semana
export const DIA_NUM_LABEL: Record<number, string> = {
    1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb', 7: 'Dom',
};
export const DIA_NUM_LABEL_FULL: Record<number, string> = {
    1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo',
};

// Array ordenado para selectores de rango (Espacios/Create, Edit)
export const DIAS_NUM = [
    { value: 1, label: 'Lun' }, { value: 2, label: 'Mar' }, { value: 3, label: 'Mié' },
    { value: 4, label: 'Jue' }, { value: 5, label: 'Vie' }, { value: 6, label: 'Sáb' }, { value: 7, label: 'Dom' },
];
