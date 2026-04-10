import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { DIAS, DIA_LABEL } from '@/utils/talleres';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Disciplina { id: number; nombre: string; }
interface Entrenador { id: number; name: string; }

interface Props {
    disciplinas: Disciplina[];
    entrenadores: Entrenador[];
}

// ─── Formulario ───────────────────────────────────────────────────────────────

export default function TalleresCreate({ disciplinas, entrenadores }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        disciplina_id:  '',
        nombre:         '',
        rango_edad_min: '',
        rango_edad_max: '',
        nivel:          'inicial',
        precio_base:    '',
        dias_semana:    [] as string[],
        hora_inicio:    '',
        hora_fin:       '',
        entrenador_id:  '',
        cupo_maximo:    '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('talleres.store'));
    }

    function toggleDia(dia: string) {
        setData('dias_semana',
            data.dias_semana.includes(dia)
                ? data.dias_semana.filter(d => d !== dia)
                : [...data.dias_semana, dia]
        );
    }

    // Guardia: si no hay disciplinas, mostrar callout
    if (disciplinas.length === 0) {
        return (
            <AppLayout title="Nuevo Taller">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-6">
                        <Link href={route('talleres.index')} className="text-muted text-sm hover:text-secondary">
                            ← Volver a Talleres
                        </Link>
                        <h1 className="text-2xl font-bold text-secondary mt-2">Nuevo Taller</h1>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-8 text-center">
                        <p className="text-4xl mb-3">⚠️</p>
                        <h3 className="font-semibold text-secondary text-lg mb-2">
                            No hay disciplinas creadas
                        </h3>
                        <p className="text-sm text-muted mb-5">
                            Necesitás al menos una disciplina antes de crear un taller.
                        </p>
                        <Link
                            href={route('disciplinas.create')}
                            className="inline-block bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                        >
                            Crear primera disciplina →
                        </Link>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title="Nuevo Taller">
            <div className="max-w-2xl mx-auto">

                <div className="mb-6">
                    <Link href={route('talleres.index')} className="text-muted text-sm hover:text-secondary">
                        ← Volver a Talleres
                    </Link>
                    <h1 className="text-2xl font-bold text-secondary mt-2">Nuevo Taller</h1>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Disciplina */}
                        <Field label="Disciplina" error={errors.disciplina_id} required>
                            <select
                                value={data.disciplina_id}
                                onChange={e => setData('disciplina_id', e.target.value)}
                                className={selectCls(!!errors.disciplina_id)}
                            >
                                <option value="">— Seleccioná una disciplina —</option>
                                {disciplinas.map(d => (
                                    <option key={d.id} value={d.id}>{d.nombre}</option>
                                ))}
                            </select>
                        </Field>

                        {/* Nombre */}
                        <Field label="Nombre del taller" error={errors.nombre} required>
                            <input
                                type="text"
                                value={data.nombre}
                                onChange={e => setData('nombre', e.target.value)}
                                placeholder="Ej: Fútbol Sub-12 Avanzado"
                                maxLength={100}
                                className={inputCls(!!errors.nombre)}
                            />
                        </Field>

                        {/* Rango de edad */}
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Edad mínima" error={errors.rango_edad_min} required>
                                <input
                                    type="number" min={1} max={99}
                                    value={data.rango_edad_min}
                                    onChange={e => setData('rango_edad_min', e.target.value)}
                                    className={inputCls(!!errors.rango_edad_min)}
                                />
                            </Field>
                            <Field label="Edad máxima" error={errors.rango_edad_max} required>
                                <input
                                    type="number" min={1} max={99}
                                    value={data.rango_edad_max}
                                    onChange={e => setData('rango_edad_max', e.target.value)}
                                    className={inputCls(!!errors.rango_edad_max)}
                                />
                            </Field>
                        </div>

                        {/* Nivel y Precio */}
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Nivel" error={errors.nivel} required>
                                <select
                                    value={data.nivel}
                                    onChange={e => setData('nivel', e.target.value)}
                                    className={selectCls(!!errors.nivel)}
                                >
                                    <option value="inicial">Inicial</option>
                                    <option value="intermedio">Intermedio</option>
                                    <option value="avanzado">Avanzado</option>
                                </select>
                            </Field>
                            <Field label="Precio base (ARS)" error={errors.precio_base} required>
                                <input
                                    type="number" min={0} step={0.01}
                                    value={data.precio_base}
                                    onChange={e => setData('precio_base', e.target.value)}
                                    placeholder="0.00"
                                    className={inputCls(!!errors.precio_base)}
                                />
                            </Field>
                        </div>

                        {/* Días de clase – multi-select pills */}
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-2">
                                Días de clase <span className="text-danger">*</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {DIAS.map(dia => {
                                    const activo = data.dias_semana.includes(dia);
                                    return (
                                        <button
                                            key={dia}
                                            type="button"
                                            onClick={() => toggleDia(dia)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                                activo
                                                    ? 'bg-primary text-white border-primary shadow-sm'
                                                    : 'bg-white text-secondary border-gray-300 hover:border-primary hover:text-primary'
                                            }`}
                                        >
                                            {DIA_LABEL[dia]}
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.dias_semana && (
                                <p className="text-danger text-xs mt-1">{errors.dias_semana}</p>
                            )}
                            {data.dias_semana.length === 0 && !errors.dias_semana && (
                                <p className="text-xs text-muted mt-1">Seleccioná al menos un día.</p>
                            )}
                            {data.dias_semana.length > 0 && (
                                <p className="text-xs text-muted mt-1">
                                    Seleccionados: {data.dias_semana.map(d => DIA_LABEL[d]).join(', ')}
                                </p>
                            )}
                        </div>

                        {/* Horario */}
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Hora inicio" error={errors.hora_inicio} required>
                                <input
                                    type="time"
                                    value={data.hora_inicio}
                                    onChange={e => setData('hora_inicio', e.target.value)}
                                    className={inputCls(!!errors.hora_inicio)}
                                />
                            </Field>
                            <Field label="Hora fin" error={errors.hora_fin} required>
                                <input
                                    type="time"
                                    value={data.hora_fin}
                                    onChange={e => setData('hora_fin', e.target.value)}
                                    className={inputCls(!!errors.hora_fin)}
                                />
                            </Field>
                        </div>

                        {/* Entrenador y cupo */}
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Entrenador" error={errors.entrenador_id}>
                                <select
                                    value={data.entrenador_id}
                                    onChange={e => setData('entrenador_id', e.target.value)}
                                    className={selectCls(!!errors.entrenador_id)}
                                >
                                    <option value="">— Sin asignar —</option>
                                    {entrenadores.map(e => (
                                        <option key={e.id} value={e.id}>{e.name}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Cupo máximo" error={errors.cupo_maximo} required>
                                <input
                                    type="number" min={1}
                                    value={data.cupo_maximo}
                                    onChange={e => setData('cupo_maximo', e.target.value)}
                                    placeholder="20"
                                    className={inputCls(!!errors.cupo_maximo)}
                                />
                            </Field>
                        </div>

                        {/* Botones */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-primary hover:bg-orange-600 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                {processing ? 'Guardando...' : 'Crear taller'}
                            </button>
                            <Link
                                href={route('talleres.index')}
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

// ─── Sub-componentes locales ──────────────────────────────────────────────────

function Field({ label, error, required, children }: {
    label: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-secondary mb-1">
                {label} {required && <span className="text-danger">*</span>}
            </label>
            {children}
            {error && <p className="text-danger text-xs mt-1">{error}</p>}
        </div>
    );
}

function inputCls(hasError: boolean) {
    return `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition ${
        hasError ? 'border-danger' : 'border-gray-300'
    }`;
}

function selectCls(hasError: boolean) {
    return `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition bg-white ${
        hasError ? 'border-danger' : 'border-gray-300'
    }`;
}
