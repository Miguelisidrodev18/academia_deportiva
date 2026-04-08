import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function DisciplinasCreate() {
    // useForm gestiona el estado del formulario, errores y el submit
    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('disciplinas.store'));
    }

    return (
        <AppLayout title="Nueva Disciplina">
            <div className="max-w-lg mx-auto">

                {/* Encabezado con breadcrumb */}
                <div className="mb-6">
                    <Link href={route('disciplinas.index')} className="text-muted text-sm hover:text-secondary">
                        ← Volver a Disciplinas
                    </Link>
                    <h1 className="text-2xl font-bold text-secondary mt-2">Nueva Disciplina</h1>
                </div>

                {/* Formulario */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Nombre */}
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-1">
                                Nombre de la disciplina <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.nombre}
                                onChange={e => setData('nombre', e.target.value)}
                                placeholder="Ej: Fútbol, Básquet, Vóley..."
                                maxLength={100}
                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition ${
                                    errors.nombre ? 'border-danger' : 'border-gray-300'
                                }`}
                            />
                            {errors.nombre && (
                                <p className="text-danger text-xs mt-1">{errors.nombre}</p>
                            )}
                        </div>

                        {/* Botones */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-primary hover:bg-orange-600 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                {processing ? 'Guardando...' : 'Crear disciplina'}
                            </button>
                            <Link
                                href={route('disciplinas.index')}
                                className="flex-1 text-center border border-gray-300 hover:bg-gray-50 text-secondary py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Cancelar
                            </Link>
                        </div>

                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
