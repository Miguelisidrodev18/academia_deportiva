import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

function resolveBuildBase(appUrl) {
    if (!appUrl) {
        return '/build/';
    }

    try {
        const pathname = new URL(appUrl).pathname.replace(/\/$/, '');

        return pathname ? `${pathname}/build/` : '/build/';
    } catch {
        const normalized = appUrl.startsWith('/') ? appUrl : `/${appUrl}`;
        const pathname = normalized.replace(/\/$/, '');

        return pathname ? `${pathname}/build/` : '/build/';
    }
}

export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        base: command === 'build' ? resolveBuildBase(env.APP_URL) : undefined,
        plugins: [
            laravel({
                input: 'resources/js/app.tsx',
                refresh: true,
            }),
            react(),
        ],
    };
});
