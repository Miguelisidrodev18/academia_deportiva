const SPORT_ICONS: [string[], string][] = [
    [['futbol', 'football', 'soccer'],                        '⚽'],
    [['voley', 'volleyball', 'voleibol', 'vóley'],            '🏐'],
    [['basket', 'basketball', 'basquet', 'básquet'],          '🏀'],
    [['tenis', 'tennis'],                                     '🎾'],
    [['natacion', 'natación', 'swimming', 'pileta'],          '🏊'],
    [['boxeo', 'box', 'boxing'],                              '🥊'],
    [['artes marciales', 'judo', 'karate', 'taekwondo'],      '🥋'],
    [['atletismo', 'running', 'pista'],                       '🏃'],
    [['gimnasia', 'gym', 'fitness'],                          '🤸'],
    [['yoga', 'meditacion', 'meditación'],                    '🧘'],
    [['ciclismo', 'bici', 'cycling'],                         '🚴'],
    [['rugby'],                                               '🏉'],
    [['handball'],                                            '🤾'],
    [['hockey'],                                              '🏑'],
    [['beisbol', 'béisbol', 'baseball'],                      '⚾'],
    [['golf'],                                                '⛳'],
    [['arco', 'tiro con arco'],                               '🏹'],
    [['esgrima'],                                             '🤺'],
    [['lucha'],                                               '🤼'],
    [['escalada', 'climbing'],                                '🧗'],
];

export function getSportIcon(nombre: string): string {
    const lower = nombre.toLowerCase();
    for (const [keywords, icon] of SPORT_ICONS) {
        if (keywords.some(k => lower.includes(k))) return icon;
    }
    return '🏅';
}

export const NIVEL_GRADIENT: Record<string, string> = {
    inicial:     'from-emerald-400 to-teal-500',
    intermedio:  'from-amber-400 to-orange-500',
    avanzado:    'from-rose-500 to-red-600',
};

export const NIVEL_LABEL: Record<string, string> = {
    inicial:    'Inicial',
    intermedio: 'Intermedio',
    avanzado:   'Avanzado',
};

export const NIVEL_BADGE: Record<string, string> = {
    inicial:    'bg-emerald-100 text-emerald-700',
    intermedio: 'bg-amber-100 text-amber-700',
    avanzado:   'bg-red-100 text-red-700',
};
