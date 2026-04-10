import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { DIAS, DIA_LABEL } from '@/utils/talleres';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Disciplina { id: number; nombre: string; }
interface Entrenador { id: number; name: string; }

interface Taller {
    id: number;
    disciplina_id: number;
    nombre: string;
    rango_edad_min: number;
    rango_edad_max: number;
    nivel: string;
    precio_base: string;
    dias_semana: string[];
    hora_inicio: string;
    hora_fin: string;
    entrenador_id: number | null;
    cupo_maximo: number;
}

interface Props {
    taller: Taller;
    disciplinas: Disciplina[];
    entrenadores: Entrenador[];
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function TalleresEdit({ taller, disciplinas, entrenadores }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        disciplina_id:  String(taller.disciplina_id),
        nombre:         taller.nombre,
        rango_edad_min: String(taller.rango_edad_min),
        rango_edad_max: String(taller.rango_edad_max),
        nivel:          taller.nivel,
        precio_base:    taller.precio_base,
        dias_semana:    Array.isArray(taller.dias_semana) ? taller.dias_semana : [] as string[],
        hora_inicio:    taller.hora_inicio,
        hora_fin:       taller.hora_fin,
        entrenador_id:  taller.entrenador_id ? String(taller.entrenador_id) : '',
        cupo_maximo:    String(taller.cupo_maximo),
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(route('talleres.update', taller.id));
    }

    function toggleDia(dia: string) {
        setData('dias_semana',
            data.dias_semana.includes(dia)
                ? data.dias_semana.filter(d => d !== dia)
                : [...data.dias_semana, dia]
        );
    }

    return (
        <AppLayout title="Editar Taller">
            <div className="max-w-2xl mx-auto">

                <div className="mb-6">
                    <Link href={route('talleres.index')} className="text-muted text-sm hover:text-secondary">
                        ← Volver a Talleres
                    </Link>
                    <h1 className="text-2xl font-bold text-secondary mt-2">Editar Taller</h1>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        <Field label="Disciplina" error={errors.disciplina_id} required>
                            <select value={data.disciplina_id} onChange={e => setData('disciplina_id', e.target.value)} className={selectCls(!!errors.disciplina_id)}>
                                <option value="">— Seleccioná una disciplina —</option>
                                {disciplinas.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                            </select>
                        </Field>

                        <Field label="Nombre del taller" error={errors.nombre} required>
                            <input type="text" value={data.nombre} onChange={e => setData('nombre', e.target.value)} maxLength={100} className={inputCls(!!errors.nombre)} />
                        </Field>

                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Edad mínima" error={errors.rango_edad_min} required>
                                <input type="number" min={1} max={99} value={data.rango_edad_min} onChange={e => setData('rango_edad_min', e.target.value)} className={inputCls(!!errors.rango_edad_min)} />
                            </Field>
                            <Field label="Edad máxima" error={errors.rango_edad_max} required>
                                <input type="number" min={1} max={99} value={data.rango_edad_max} onChange={e => setData('rango_edad_max', e.target.value)} className={inputCls(!!errors.rango_edad_max)} />
                            </Field>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Nivel" error={errors.nivel} required>
                                <select value={data.nivel} onChange={e => setData('nivel', e.target.value)} className={selectCls(!!errors.nivel)}>
                                    <option value="inicial">Inicial</option>
                                    <option value="intermedio">Intermedio</option>
                                    <option value="avanzado">Avanzado</option>
                                </select>
                            </Field>
                            <Field label="Precio base (ARS)" error={errors.precio_base} required>
                                <input type="number" min={0} step={0.01} value={data.precio_base} onChange={e => setData('precio_base', e.target.value)} className={inputCls(!!errors.precio_base)} />
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

                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Hora inicio" error={errors.hora_inicio} required>
                                <input type="time" value={data.hora_inicio} onChange={e => setData('hora_inicio', e.target.value)} className={inputCls(!!errors.hora_inicio)} />
                            </Field>
                            <Field label="Hora fin" error={errors.hora_fin} required>
                                <input type="time" value={data.hora_fin} onChange={e => setData('hora_fin', e.target.value)} className={inputCls(!!errors.hora_fin)} />
                            </Field>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Entrenador" error={errors.entrenador_id}>
                                <select value={data.entrenador_id} onChange={e => setData('entrenador_id', e.target.value)} className={selectCls(!!errors.entrenador_id)}>
                                    <option value="">— Sin asignar —</option>
                                    {entrenadores.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                            </Field>
                            <Field label="Cupo máximo" error={errors.cupo_maximo} required>
                                <input type="number" min={1} value={data.cupo_maximo} onChange={e => setData('cupo_maximo', e.target.value)} className={inputCls(!!errors.cupo_maximo)} />
                            </Field>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-primary hover:bg-orange-600 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                {processing ? 'Guardando...' : 'Guardar cambios'}
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

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Field({ label, error, required, children }: {
    label: string; error?: string; required?: boolean; children: React.ReactNode;
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
    return `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition ${hasError ? 'border-danger' : 'border-gray-300'}`;
}
function selectCls(hasError: boolean) {
    return `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition bg-white ${hasError ? 'border-danger' : 'border-gray-300'}`;
}
