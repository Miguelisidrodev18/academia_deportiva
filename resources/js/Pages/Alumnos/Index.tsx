import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Alumno {
    id: number;
    nombre: string;
    dni: string;
    telefono: string | null;
    fecha_nacimiento: string;
    inscripciones_activas_count: number;
    deuda_total: number;
}

interface Props { alumnos: Alumno[]; }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
}

const AVATAR_COLORS = [
    'bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-rose-500',
    'bg-amber-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-pink-500',
];

function avatarColor(nombre: string): string {
    return AVATAR_COLORS[nombre.charCodeAt(0) % AVATAR_COLORS.length];
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AlumnosIndex({ alumnos }: Props) {
    const { flash } = usePage().props as any;
    const [search, setSearch] = useState('');

    const filtered = alumnos.filter(a =>
        a.nombre.toLowerCase().includes(search.toLowerCase()) ||
        a.dni.includes(search)
    );

    function handleEliminar(id: number, nombre: string) {
        if (!confirm(`¿Eliminar al alumno "${nombre}"? Esta acción no se puede deshacer.`)) return;
        router.delete(route('alumnos.destroy', id));
    }

    // Indicadores rápidos
    const totalDeuda = alumnos.reduce((acc, a) => acc + (a.deuda_total ?? 0), 0);
    const conDeuda = alumnos.filter(a => a.deuda_total > 0).length;

    return (
        <AppLayout title="Alumnos">
            <div className="max-w-6xl mx-auto">

                {/* Encabezado */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-secondary">Alumnos</h1>
                        <p className="text-muted text-sm mt-1">
                            {alumnos.length} {alumnos.length === 1 ? 'alumno registrado' : 'alumnos registrados'}
                        </p>
                    </div>
                    <Link
                        href={route('alumnos.create')}
                        className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        + Nuevo alumno
                    </Link>
                </div>

                {/* KPIs rápidos */}
                {alumnos.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                            <p className="text-2xl font-bold text-secondary">{alumnos.length}</p>
                            <p className="text-xs text-muted mt-0.5">Total alumnos</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                            <p className={`text-2xl font-bold ${conDeuda > 0 ? 'text-danger' : 'text-success'}`}>{conDeuda}</p>
                            <p className="text-xs text-muted mt-0.5">Con deuda pendiente</p>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                            <p className={`text-2xl font-bold ${totalDeuda > 0 ? 'text-danger' : 'text-success'}`}>
                                ${totalDeuda.toLocaleString('es-AR')}
                            </p>
                            <p className="text-xs text-muted mt-0.5">Deuda total academia</p>
                        </div>
                    </div>
                )}

                {/* Flash */}
                {flash?.success && (
                    <div className="bg-green-50 border border-success text-success rounded-lg px-4 py-3 mb-4 text-sm">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-red-50 border border-danger text-danger rounded-lg px-4 py-3 mb-4 text-sm">
                        {flash.error}
                    </div>
                )}

                {/* Barra de búsqueda */}
                {alumnos.length > 0 && (
                    <div className="mb-4">
                        <input
                            type="search"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por nombre o DNI..."
                            className="w-full md:w-72 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
                        />
                    </div>
                )}

                {/* Tabla */}
                {alumnos.length === 0 ? (
                    <div className="text-center py-20 text-muted">
                        <p className="text-5xl mb-4">👤</p>
                        <p className="text-lg font-medium">Todavía no hay alumnos registrados.</p>
                        <p className="text-sm mt-1">Registrá el primero para comenzar a gestionar inscripciones.</p>
                        <Link
                            href={route('alumnos.create')}
                            className="inline-block mt-5 bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                        >
                            + Registrar primer alumno
                        </Link>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 text-muted bg-white rounded-xl border border-gray-100">
                        <p className="text-3xl mb-2">🔍</p>
                        <p>No se encontraron alumnos con "{search}".</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-muted uppercase text-xs tracking-wide">
                                <tr>
                                    <th className="px-5 py-3 text-left">Alumno</th>
                                    <th className="px-5 py-3 text-left">DNI</th>
                                    <th className="px-5 py-3 text-center">Edad</th>
                                    <th className="px-5 py-3 text-center">Talleres</th>
                                    <th className="px-5 py-3 text-right">Deuda</th>
                                    <th className="px-5 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.map((a) => (
                                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                                        {/* Avatar + nombre */}
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColor(a.nombre)}`}>
                                                    {a.nombre.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <Link
                                                        href={route('alumnos.show', a.id)}
                                                        className="font-medium text-secondary hover:text-primary"
                                                    >
                                                        {a.nombre}
                                                    </Link>
                                                    {a.telefono && (
                                                        <p className="text-xs text-muted">{a.telefono}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-gray-600 font-mono text-xs">{a.dni}</td>
                                        <td className="px-5 py-3 text-center text-gray-600 text-xs">
                                            {calcularEdad(a.fecha_nacimiento)} años
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                                a.inscripciones_activas_count > 0
                                                    ? 'bg-orange-100 text-primary'
                                                    : 'bg-gray-100 text-muted'
                                            }`}>
                                                {a.inscripciones_activas_count}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            {a.deuda_total > 0 ? (
                                                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-danger">
                                                    ${a.deuda_total.toLocaleString('es-AR')}
                                                </span>
                                            ) : (
                                                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-success">
                                                    Al día
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-right space-x-3">
                                            <Link
                                                href={route('alumnos.show', a.id)}
                                                className="text-blue-600 hover:underline text-xs"
                                            >
                                                Ver
                                            </Link>
                                            <Link
                                                href={route('alumnos.edit', a.id)}
                                                className="text-gray-600 hover:underline text-xs"
                                            >
                                                Editar
                                            </Link>
                                            <button
                                                onClick={() => handleEliminar(a.id, a.nombre)}
                                                disabled={a.inscripciones_activas_count > 0}
                                                title={a.inscripciones_activas_count > 0 ? 'Tiene inscripciones activas' : ''}
                                                className="text-danger hover:underline text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
