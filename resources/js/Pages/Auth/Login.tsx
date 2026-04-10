import { useState, FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';

// ─── Íconos SVG inline ────────────────────────────────────────────────────────

function IconEmail() {
    return (
        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75" />
        </svg>
    );
}

function IconLock() {
    return (
        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
    );
}

function IconEyeOpen() {
    return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

function IconEyeClosed() {
    return (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
    );
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function Login({ status }: { status?: string; canResetPassword?: boolean }) {
    const [verPassword, setVerPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <GuestLayout>
            <Head title="Iniciar sesión" />

            {/* Encabezado */}
            <div className="mb-7 text-center">
                <h2 className="text-2xl font-bold text-secondary">Bienvenido de vuelta</h2>
                <p className="text-sm text-muted mt-1">Ingresá tus credenciales para continuar</p>
            </div>

            {status && (
                <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-secondary mb-1.5">
                        Correo electrónico
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">
                            <IconEmail />
                        </span>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            autoComplete="username"
                            autoFocus
                            onChange={e => setData('email', e.target.value)}
                            className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2.5
                                       text-sm text-secondary placeholder-gray-400
                                       focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                                       transition"
                            placeholder="tu@academia.com"
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium text-secondary mb-1.5">
                        Contraseña
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">
                            <IconLock />
                        </span>
                        <input
                            id="password"
                            type={verPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            autoComplete="current-password"
                            onChange={e => setData('password', e.target.value)}
                            className="w-full rounded-lg border border-gray-200 pl-10 pr-11 py-2.5
                                       text-sm text-secondary placeholder-gray-400
                                       focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                                       transition"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setVerPassword(!verPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition-colors"
                            tabIndex={-1}
                        >
                            {verPassword ? <IconEyeOpen /> : <IconEyeClosed />}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                {/* Recuérdame */}
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        name="remember"
                        checked={data.remember}
                        onChange={e => setData('remember', e.target.checked as false)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-600">Recordarme</span>
                </label>

                {/* Botón */}
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full flex items-center justify-center gap-2
                               bg-primary hover:bg-orange-600 disabled:opacity-60
                               text-white font-semibold py-2.5 rounded-lg
                               transition-colors text-sm"
                >
                    {processing ? (
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : null}
                    {processing ? 'Ingresando...' : 'Ingresar →'}
                </button>
            </form>

            {/* Separador */}
            <div className="my-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-muted">¿Primera vez aquí?</span>
                <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Link registro */}
            <div className="text-center">
                <Link
                    href={route('register')}
                    className="text-sm font-medium text-primary hover:text-orange-600 transition-colors"
                >
                    Crear una nueva academia
                </Link>
            </div>
        </GuestLayout>
    );
}
