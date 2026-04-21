import { PropsWithChildren, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/* ─── Floating geometric shapes ─────────────────────────────────────────────── */

function FloatingShapes() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Large blurred circle */}
            <motion.div
                className="absolute -top-20 -left-20 w-80 h-80 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)' }}
                animate={{ y: [0, 30, 0], x: [0, 15, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Rotating diamond */}
            <motion.div
                className="absolute top-1/4 right-10 w-16 h-16 border border-white/10 rounded-sm"
                animate={{ rotate: [0, 90, 180, 270, 360], y: [0, -20, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
            {/* Small floating squares */}
            <motion.div
                className="absolute bottom-1/4 left-1/4 w-8 h-8 bg-white/5 rounded-md backdrop-blur-sm"
                animate={{ y: [0, -40, 0], rotate: [0, 45, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="absolute top-1/3 left-1/3 w-6 h-6 bg-white/[0.04] rounded-full"
                animate={{ y: [0, 25, 0], x: [0, -15, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />
            {/* Accent ring */}
            <motion.div
                className="absolute bottom-20 right-1/4 w-24 h-24 rounded-full border border-white/[0.06]"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />
            {/* Glowing orb */}
            <motion.div
                className="absolute top-2/3 right-1/3 w-40 h-40 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.12) 0%, transparent 70%)' }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            />
        </div>
    );
}

/* ─── Particle canvas ───────────────────────────────────────────────────────── */

function ParticleField() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        const particles: { x: number; y: number; vx: number; vy: number; r: number; o: number }[] = [];

        const resize = () => {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };
        resize();
        window.addEventListener('resize', resize);

        // Create particles
        for (let i = 0; i < 40; i++) {
            particles.push({
                x: Math.random() * canvas.offsetWidth,
                y: Math.random() * canvas.offsetHeight,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                r: Math.random() * 2 + 0.5,
                o: Math.random() * 0.3 + 0.05,
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > canvas.offsetWidth) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.offsetHeight) p.vy *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${p.o})`;
                ctx.fill();
            }
            animationId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

/* ─── Feature item with icon ────────────────────────────────────────────────── */

const featureItems = [
    {
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
        ),
        title: 'Gestión de alumnos',
        desc: 'Inscripciones y perfiles',
    },
    {
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" />
            </svg>
        ),
        title: 'Asistencia QR',
        desc: 'Registro automático',
    },
    {
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
        ),
        title: 'Control de pagos',
        desc: 'Cuotas y facturación',
    },
    {
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
        ),
        title: 'Reportes',
        desc: 'Estadísticas en tiempo real',
    },
];

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const fadeSlideUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

/**
 * Layout de pantalla dividida para páginas de autenticación.
 * - Panel izquierdo (solo desktop): gradiente dinámico con shapes, partículas y glassmorphism.
 * - Panel derecho: fondo sutil, card glassmorphism premium.
 */
export default function GuestLayout({ children }: PropsWithChildren) {
    return (
        <>
            {/* Google Fonts */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            <link
                href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap"
                rel="stylesheet"
            />

            <div className="login-shell">
                {/* ── Panel de marca (solo visible en lg+) ─────────────────────── */}
                <div className="login-brand-panel">
                    {/* Animated gradient background */}
                    <div className="login-gradient-bg" />

                    {/* Noise texture overlay */}
                    <div className="login-noise-overlay" />

                    {/* Particles */}
                    <ParticleField />

                    {/* Floating shapes */}
                    <FloatingShapes />

                    {/* Content */}
                    <motion.div
                        className="relative z-10 flex flex-col items-center text-center px-10"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Logo mark */}
                        <motion.div variants={fadeSlideUp} className="login-logo-mark">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.016 6.016 0 01-2.27.903m0 0a17.957 17.957 0 01-6 0m6 0c.21-.696.334-1.434.369-2.197M9.51 10.631c-.21-.696-.334-1.434-.369-2.197" />
                            </svg>
                        </motion.div>

                        {/* Brand name */}
                        <motion.h1 variants={fadeSlideUp} className="login-brand-title">
                            Academia<span className="login-brand-accent">Deportiva</span>
                        </motion.h1>

                        {/* Tagline */}
                        <motion.p variants={fadeSlideUp} className="login-brand-tagline">
                            Gestión integral para tu academia: alumnos, talleres, pagos y asistencia en un solo lugar.
                        </motion.p>

                        {/* Divider */}
                        <motion.div variants={fadeSlideUp} className="login-brand-divider">
                            <div className="login-brand-divider-line" />
                            <div className="login-brand-divider-dot" />
                            <div className="login-brand-divider-line" />
                        </motion.div>

                        {/* Feature cards */}
                        <motion.div variants={fadeSlideUp} className="login-features-grid">
                            {featureItems.map((f, i) => (
                                <motion.div
                                    key={i}
                                    className="login-feature-card"
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                >
                                    <div className="login-feature-icon">{f.icon}</div>
                                    <div>
                                        <div className="login-feature-title">{f.title}</div>
                                        <div className="login-feature-desc">{f.desc}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>

                {/* ── Panel de formulario ───────────────────────────────────────── */}
                <div className="login-form-panel">
                    {/* Subtle mesh background */}
                    <div className="login-form-bg-mesh" />

                    {/* Logo pequeño en mobile */}
                    <motion.div
                        className="login-mobile-logo"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="login-mobile-logo-icon">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.016 6.016 0 01-2.27.903m0 0a17.957 17.957 0 01-6 0m6 0c.21-.696.334-1.434.369-2.197M9.51 10.631c-.21-.696-.334-1.434-.369-2.197" />
                            </svg>
                        </div>
                        <span className="login-mobile-logo-text">
                            Academia<span className="login-brand-accent">Deportiva</span>
                        </span>
                    </motion.div>

                    {/* Contenido (formulario) */}
                    <motion.div
                        className="login-form-container"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.15 }}
                    >
                        <div className="login-form-card">
                            {children}
                        </div>
                    </motion.div>

                    {/* Footer */}
                    <motion.p
                        className="login-footer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        &copy; {new Date().getFullYear()} AcademiaDeportiva — Todos los derechos reservados.
                    </motion.p>
                </div>
            </div>
        </>
    );
}
