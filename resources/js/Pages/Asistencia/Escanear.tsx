import { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import toast, { Toaster } from 'react-hot-toast';
import AppLayout from '@/Layouts/AppLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Taller {
    id: number;
    nombre: string;
    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
    disciplina: { nombre: string };
}

interface Props {
    talleres: Taller[];
}

interface ResultadoScan {
    tipo: 'exito' | 'error' | 'duplicado';
    alumno?: string;
    taller?: string;
    disciplina?: string;
    hora?: string;
    mensaje: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AsistenciaEscanear({ talleres }: Props) {
    const [escaneando, setEscaneando]         = useState(false);
    const [procesando, setProcesando]         = useState(false);
    const [resultado, setResultado]           = useState<ResultadoScan | null>(null);
    const [camaraId, setCamaraId]             = useState<string>('');
    const [camarasDisponibles, setCamaras]    = useState<{ id: string; label: string }[]>([]);
    const [omitirHorario, setOmitirHorario]   = useState(false);

    // La instancia de html5-qrcode vive en una ref para poder detenerla al desmontar
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const contenedorId = 'lector-qr';

    // ── Al montar: detectar cámaras disponibles ────────────────────────────────
    useEffect(() => {
        Html5Qrcode.getCameras()
            .then(devices => {
                if (devices.length > 0) {
                    setCamaras(devices.map(d => ({ id: d.id, label: d.label || `Cámara ${d.id}` })));
                    // Preferir cámara trasera (environment) por defecto
                    const trasera = devices.find(d =>
                        d.label.toLowerCase().includes('back') ||
                        d.label.toLowerCase().includes('trasera') ||
                        d.label.toLowerCase().includes('environment')
                    );
                    setCamaraId((trasera ?? devices[0]).id);
                }
            })
            .catch(() => {
                toast.error('No se pudo acceder a la cámara. Verificá los permisos del navegador.');
            });

        // Limpiar al desmontar el componente
        return () => {
            if (scannerRef.current && escaneando) {
                scannerRef.current.stop().catch(() => {});
            }
        };
    }, []);

    // ── Iniciar escáner ────────────────────────────────────────────────────────
    async function iniciarEscaneo() {
        if (!camaraId) {
            toast.error('No hay cámara disponible.');
            return;
        }

        // Crear instancia si no existe
        if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode(contenedorId, {
                formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
                verbose: false,
            });
        }

        try {
            await scannerRef.current.start(
                camaraId,
                {
                    fps: 10,           // fotogramas por segundo del análisis
                    qrbox: { width: 250, height: 250 }, // área de detección
                    aspectRatio: 1.0,
                },
                onScanExitoso,
                // onError: silenciamos los errores intermedios (frames sin QR)
                () => {}
            );
            setEscaneando(true);
            setResultado(null);
        } catch (err) {
            toast.error('No se pudo iniciar la cámara.');
            console.error(err);
        }
    }

    // ── Detener escáner ────────────────────────────────────────────────────────
    async function detenerEscaneo() {
        if (scannerRef.current && escaneando) {
            await scannerRef.current.stop().catch(() => {});
            setEscaneando(false);
        }
    }

    // ── Callback cuando se detecta un QR ──────────────────────────────────────
    async function onScanExitoso(codigoQR: string) {
        // Evitar procesar mientras ya estamos enviando al servidor
        if (procesando) return;

        // Pausar el escáner brevemente para no spamear el endpoint
        await detenerEscaneo();
        setProcesando(true);

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

            const res = await fetch(route('asistencia.registrar'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ qr_code: codigoQR, omitir_horario: omitirHorario }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // ✅ Éxito
                setResultado({
                    tipo: 'exito',
                    alumno: data.alumno.nombre,
                    taller: data.taller,
                    disciplina: data.disciplina,
                    hora: data.hora,
                    mensaje: data.mensaje,
                });
                toast.success(`${data.alumno.nombre} — ${data.taller}`, { duration: 4000 });
            } else if (res.status === 409) {
                // ⚠️ Duplicado (ya registrado hoy)
                setResultado({ tipo: 'duplicado', mensaje: data.error, alumno: data.alumno });
                toast(`Ya registrado hoy: ${data.alumno ?? ''}`, { icon: '⚠️', duration: 4000 });
            } else {
                // ❌ Error
                setResultado({ tipo: 'error', mensaje: data.error ?? 'Error desconocido.' });
                toast.error(data.error ?? 'Error al registrar asistencia.', { duration: 5000 });
            }
        } catch (e) {
            setResultado({ tipo: 'error', mensaje: 'Error de red. Verificá tu conexión.' });
            toast.error('Error de red.');
        } finally {
            setProcesando(false);
        }
    }

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <AppLayout title="Escáner QR de Asistencia">
            <Toaster position="top-center" />

            <div className="max-w-lg mx-auto">

                {/* Encabezado */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary">Asistencia QR</h1>
                        <p className="text-muted text-sm mt-1">
                            Apuntá la cámara al código QR del carnet del alumno.
                        </p>
                    </div>
                    <Link href={route('asistencias.index')} className="text-sm text-blue-600 hover:underline">
                        Ver listado →
                    </Link>
                </div>

                {/* Talleres activos hoy (info para el entrenador) */}
                {talleres.length > 0 && (
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-5">
                        <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                            {talleres.length === 1 ? 'Tu taller de hoy' : 'Tus talleres'}
                        </p>
                        <div className="space-y-1">
                            {talleres.map(t => (
                                <p key={t.id} className="text-sm text-secondary">
                                    <span className="font-medium">{t.nombre}</span>
                                    <span className="text-muted ml-2">
                                        {capitalize(t.dia_semana)} {t.hora_inicio}–{t.hora_fin}
                                    </span>
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                {/* Contenedor del video del escáner */}
                <div className="bg-black rounded-xl overflow-hidden mb-4 aspect-square relative">
                    <div id={contenedorId} className="w-full h-full" />
                    {!escaneando && !procesando && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                            <span className="text-5xl mb-3">📷</span>
                            <p className="text-sm opacity-75">Presioná "Iniciar" para activar la cámara</p>
                        </div>
                    )}
                    {procesando && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
                            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mb-3" />
                            <p className="text-sm">Registrando asistencia...</p>
                        </div>
                    )}
                </div>

                {/* Controles */}
                <div className="space-y-3">

                    {/* Selector de cámara */}
                    {camarasDisponibles.length > 1 && (
                        <div>
                            <label className="block text-xs text-muted mb-1">Cámara</label>
                            <select
                                value={camaraId}
                                onChange={e => { detenerEscaneo(); setCamaraId(e.target.value); }}
                                disabled={escaneando}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                            >
                                {camarasDisponibles.map(c => (
                                    <option key={c.id} value={c.id}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Botones iniciar / detener */}
                    <div className="flex gap-3">
                        {!escaneando ? (
                            <button
                                onClick={iniciarEscaneo}
                                disabled={procesando || camarasDisponibles.length === 0}
                                className="flex-1 bg-primary hover:bg-orange-600 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
                            >
                                ▶ Iniciar escáner
                            </button>
                        ) : (
                            <button
                                onClick={detenerEscaneo}
                                className="flex-1 bg-secondary hover:bg-slate-700 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
                            >
                                ■ Detener escáner
                            </button>
                        )}

                        {/* Botón "Escanear de nuevo" después de un resultado */}
                        {resultado && !escaneando && (
                            <button
                                onClick={() => { setResultado(null); iniciarEscaneo(); }}
                                className="flex-1 border border-primary text-primary hover:bg-orange-50 py-3 rounded-xl text-sm font-semibold transition-colors"
                            >
                                ↺ Siguiente alumno
                            </button>
                        )}
                    </div>

                    {/* Opción para dueños: omitir validación de horario */}
                    <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
                        <input
                            type="checkbox"
                            checked={omitirHorario}
                            onChange={e => setOmitirHorario(e.target.checked)}
                            className="rounded"
                        />
                        Omitir validación de horario (solo para dueños)
                    </label>
                </div>

                {/* Panel de resultado del último escaneo */}
                {resultado && (
                    <div className={`mt-5 rounded-xl border p-5 ${
                        resultado.tipo === 'exito'
                            ? 'bg-green-50 border-success'
                            : resultado.tipo === 'duplicado'
                                ? 'bg-yellow-50 border-yellow-300'
                                : 'bg-red-50 border-danger'
                    }`}>
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">
                                {resultado.tipo === 'exito' ? '✅' : resultado.tipo === 'duplicado' ? '⚠️' : '❌'}
                            </span>
                            <div>
                                {resultado.tipo === 'exito' ? (
                                    <>
                                        <p className="font-bold text-success">{resultado.alumno}</p>
                                        <p className="text-sm text-gray-600">{resultado.disciplina} · {resultado.taller}</p>
                                        <p className="text-xs text-muted">Registrado a las {resultado.hora}</p>
                                    </>
                                ) : (
                                    <p className="font-medium text-sm text-gray-800">{resultado.mensaje}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AppLayout>
    );
}
