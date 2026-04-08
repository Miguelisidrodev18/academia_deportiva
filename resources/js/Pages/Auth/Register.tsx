import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Register() {
    // useForm de Inertia maneja el estado del formulario, errores y el envío.
    // Agregamos academia_nombre como campo nuevo requerido para el registro.
    const { data, setData, post, processing, errors, reset } = useForm({
        academia_nombre: '',
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Registrar Academia" />

            <div className="mb-4 text-center">
                <h1 className="text-xl font-bold text-gray-800">Crear Academia</h1>
                <p className="text-sm text-gray-500">Registra tu academia y empieza a gestionar todo en un solo lugar.</p>
            </div>

            <form onSubmit={submit}>
                {/* Campo: Nombre de la Academia */}
                <div>
                    <InputLabel htmlFor="academia_nombre" value="Nombre de la Academia *" />
                    <TextInput
                        id="academia_nombre"
                        name="academia_nombre"
                        value={data.academia_nombre}
                        className="mt-1 block w-full"
                        autoComplete="organization"
                        isFocused={true}
                        placeholder="Ej: Academia de Fútbol San Martín"
                        onChange={(e) => setData('academia_nombre', e.target.value)}
                        required
                    />
                    <InputError message={errors.academia_nombre} className="mt-2" />
                </div>

                {/* Separador visual */}
                <div className="mt-4 mb-2 border-t pt-4">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Datos del responsable (dueño)</p>
                </div>

                {/* Campo: Nombre completo */}
                <div>
                    <InputLabel htmlFor="name" value="Nombre completo *" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        placeholder="Ej: Juan Pérez"
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                {/* Campo: Email */}
                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email *" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        placeholder="Ej: juan@academia.com"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* Campo: Contraseña */}
                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Contraseña *" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Campo: Confirmar contraseña */}
                <div className="mt-4">
                    <InputLabel htmlFor="password_confirmation" value="Confirmar contraseña *" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        ¿Ya tienes cuenta?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Crear Academia
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
