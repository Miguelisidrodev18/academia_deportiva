import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

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
        dia_semana:     'lunes',
        hora_inicio:    '',
        hora_fin:       '',
        entrenador_id:  '',
        cupo_maximo:    '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(route('talleres.store'));
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

                        {/* Día y horario */}
                        <div className="grid grid-cols-3 gap-4">
                            <Field label="Día de la semana" error={errors.dia_semana} required>
                                <select
                                    value={data.dia_semana}
                                    onChange={e => setData('dia_semana', e.target.value)}
                                    className={selectCls(!!errors.dia_semana)}
                                >
                                    {['lunes','martes','miercoles','jueves','viernes','sabado','domingo'].map(d => (
                                        <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                                    ))}
                                </select>
                            </Field>
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
