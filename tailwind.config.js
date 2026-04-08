import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                // Usamos Inter para un look moderno y limpio
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // Paleta del sistema de academias deportivas
                primary: {
                    DEFAULT: '#F97316', // naranja – botones, hover, enlaces activos
                    50:  '#fff7ed',
                    100: '#ffedd5',
                    500: '#f97316',
                    600: '#ea6a00',
                    700: '#c2550a',
                },
                secondary: {
                    DEFAULT: '#1E293B', // slate oscuro – sidebar, header, tarjetas
                    700: '#0f172a',
                    800: '#0d1526',
                },
                // Estados del negocio
                success: '#10B981', // verde esmeralda – pagos al día, activo
                danger:  '#EF4444', // rojo – deudas, faltas, alertas
                muted:   '#94A3B8', // gris pizarra – módulos deshabilitados, "Pronto"
            },
        },
    },

    plugins: [forms],
};
