import { useState, useRef, FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import GuestLayout from '@/Layouts/GuestLayout';

/* ─── SVG Icons ─────────────────────────────────────────────────────────────── */

function IconEmail({ className = '' }: { className?: string }) {
    return (
        <svg className={`w-[18px] h-[18px] ${className}`} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75" />
        </svg>
    );
}

function IconLock({ className = '' }: { className?: string }) {
    return (
        <svg className={`w-[18px] h-[18px] ${className}`} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
    );
}

function IconEyeOpen() {
    return (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

function IconEyeClosed() {
    return (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
    );
}

/* ─── Custom animated checkbox ──────────────────────────────────────────────── */

function AnimatedCheckbox({
    checked,
    onChange,
    label,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
}) {
    return (
        <label className="login-checkbox-label">
            <div className="login-checkbox-wrapper" onClick={() => onChange(!checked)}>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {}}
                    className="sr-only"
                />
                <motion.div
                    className={`login-checkbox-box ${checked ? 'login-checkbox-checked' : ''}`}
                    animate={{
                        backgroundColor: checked ? '#f97316' : 'transparent',
                        borderColor: checked ? '#f97316' : '#cbd5e1',
                    }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        viewBox="0 0 24 24"
                        initial={false}
                        animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
                    >
                        <motion.path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: checked ? 1 : 0 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                        />
                    </motion.svg>
                </motion.div>
            </div>
            <span className="login-checkbox-text">{label}</span>
        </label>
    );
}

/* ─── Animated input wrapper ────────────────────────────────────────────────── */

function FloatingInput({
    id,
    type = 'text',
    label,
    value,
    onChange,
    error,
    icon,
    autoComplete,
    autoFocus,
    trailing,
    placeholder,
}: {
    id: string;
    type?: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    error?: string;
    icon: React.ReactNode;
    autoComplete?: string;
    autoFocus?: boolean;
    trailing?: React.ReactNode;
    placeholder?: string;
}) {
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const hasValue = value.length > 0;
    const isActive = focused || hasValue;

    return (
        <div>
            <label className="login-input-label" htmlFor={id}>
                {label}
            </label>

            <motion.div
                className={`login-input-wrapper ${focused ? 'login-input-focused' : ''} ${error ? 'login-input-error' : ''}`}
                animate={{
                    boxShadow: focused
                        ? '0 0 0 3px rgba(249,115,22,0.15), 0 1px 3px 0 rgba(0,0,0,0.06)'
                        : error
                            ? '0 0 0 3px rgba(239,68,68,0.12), 0 1px 3px 0 rgba(0,0,0,0.06)'
                            : '0 1px 3px 0 rgba(0,0,0,0.04)',
                }}
                transition={{ duration: 0.2 }}
                onClick={() => inputRef.current?.focus()}
            >
                <motion.span
                    className="login-input-icon"
                    animate={{
                        color: focused ? '#f97316' : error ? '#ef4444' : '#94a3b8',
                    }}
                    transition={{ duration: 0.2 }}
                >
                    {icon}
                </motion.span>
                <input
                    ref={inputRef}
                    id={id}
                    type={type}
                    value={value}
                    autoComplete={autoComplete}
                    autoFocus={autoFocus}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className="login-input-field"
                    placeholder={placeholder}
                />
                {trailing && <div className="login-input-trailing">{trailing}</div>}
            </motion.div>

            <AnimatePresence>
                {error && (
                    <motion.p
                        className="login-field-error"
                        initial={{ opacity: 0, y: -4, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -4, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ─── Main Login Component ──────────────────────────────────────────────────── */

export default function Login({ status }: { status?: string; canResetPassword?: boolean }) {
    const [verPassword, setVerPassword] = useState(false);
    const [shakeForm, setShakeForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
            onError: () => {
                setShakeForm(true);
                setTimeout(() => setShakeForm(false), 600);
            },
        });
    };

    return (
        <GuestLayout>
            <Head title="Iniciar sesión" />

            {/* Encabezado emocional */}
            <motion.div
                className="login-header"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <h2 className="login-title">Bienvenido de vuelta</h2>
                <p className="login-subtitle">
                    Sigue construyendo el progreso de tu academia
                </p>
            </motion.div>

            {/* Status message */}
            <AnimatePresence>
                {status && (
                    <motion.div
                        className="login-status"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {status}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Form with shake animation on error */}
            <motion.form
                onSubmit={submit}
                className="login-form"
                animate={shakeForm ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : {}}
                transition={{ duration: 0.5 }}
            >
                {/* Email */}
                <FloatingInput
                    id="login-email"
                    type="email"
                    label="Correo electrónico"
                    value={data.email}
                    onChange={(v) => setData('email', v)}
                    error={errors.email}
                    icon={<IconEmail />}
                    autoComplete="username"
                    autoFocus
                    placeholder="tu@academia.com"
                />

                {/* Password */}
                <FloatingInput
                    id="login-password"
                    type={verPassword ? 'text' : 'password'}
                    label="Contraseña"
                    value={data.password}
                    onChange={(v) => setData('password', v)}
                    error={errors.password}
                    icon={<IconLock />}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    trailing={
                        <motion.button
                            type="button"
                            onClick={() => setVerPassword(!verPassword)}
                            className="login-eye-btn"
                            tabIndex={-1}
                            whileTap={{ scale: 0.9 }}
                            aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={verPassword ? 'open' : 'closed'}
                                    initial={{ opacity: 0, rotateY: 90 }}
                                    animate={{ opacity: 1, rotateY: 0 }}
                                    exit={{ opacity: 0, rotateY: -90 }}
                                    transition={{ duration: 0.2 }}
                                    className="block"
                                >
                                    {verPassword ? <IconEyeOpen /> : <IconEyeClosed />}
                                </motion.span>
                            </AnimatePresence>
                        </motion.button>
                    }
                />

                {/* Remember + Forgot */}
                <div className="login-options-row">
                    <AnimatedCheckbox
                        checked={data.remember}
                        onChange={(v) => setData('remember', v as false)}
                        label="Recordarme"
                    />
                    <Link
                        href={route('password.request')}
                        className="login-forgot-link"
                    >
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>

                {/* Submit button */}
                <motion.button
                    type="submit"
                    disabled={processing}
                    className="login-submit-btn"
                    whileHover={!processing ? { scale: 1.015, y: -1 } : {}}
                    whileTap={!processing ? { scale: 0.985 } : {}}
                >
                    {/* Glow effect */}
                    <div className="login-btn-glow" />

                    <span className="relative z-10 flex items-center justify-center gap-2.5">
                        {processing ? (
                            <>
                                <motion.span
                                    className="login-spinner"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                />
                                Ingresando...
                            </>
                        ) : (
                            <>
                                Ingresar
                                <motion.svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2.2}
                                    viewBox="0 0 24 24"
                                    animate={{ x: [0, 3, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </motion.svg>
                            </>
                        )}
                    </span>
                </motion.button>
            </motion.form>

            {/* Separator */}
            <div className="login-separator">
                <div className="login-separator-line" />
                <span className="login-separator-text">¿Primera vez aquí?</span>
                <div className="login-separator-line" />
            </div>

            {/* Register link */}
            <div className="text-center">
                <Link
                    href={route('register')}
                    className="login-register-link"
                >
                    <span>Crear una nueva academia</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                </Link>
            </div>
        </GuestLayout>
    );
}
