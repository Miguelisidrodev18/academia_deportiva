import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import FlashMessages from '@/Components/FlashMessages';
import PageHeader from '@/Components/PageHeader';
import StatCard from '@/Components/StatCard';
import EmptyState from '@/Components/EmptyState';
import { avatarColor } from '@/utils/ui';
import { calcularEdad } from '@/utils/dates';
import { MagnifyingGlassIcon, TrashIcon, PencilSquareIcon, EyeIcon } from '@heroicons/react/24/outline';

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

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AlumnosIndex({ alumnos }: Props) {
    const [search, setSearch] = useState('');

    const filtered = alumnos.filter(a =>
        a.nombre.toLowerCase().includes(search.toLowerCase()) ||
        a.dni.includes(search)
    );

    function handleEliminar(id: number, nombre: string) {
        if (!confirm(`¿Eliminar al alumno "${nombre}"? Esta acción no se puede deshacer.`)) return;
        router.delete(route('alumnos.destroy', id));
    }

    const totalDeuda = alumnos.reduce((acc, a) => acc + (a.deuda_total ?? 0), 0);
    const conDeuda   = alumnos.filter(a => a.deuda_total > 0).length;

    return (
        <AppLayout title="Alumnos">
            <div className="max-w-6xl mx-auto">

                <PageHeader
                    title="Alumnos"
                    subtitle={`${alumnos.length} ${alumnos.length === 1 ? 'alumno registrado' : 'alumnos registrados'}`}
                    ctaHref={route('alumnos.create')}
                    ctaLabel="+ Nuevo alumno"
                />

                {alumnos.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <StatCard icon="👥" label="Total alumnos"        value={alumnos.length} />
                        <StatCard icon="⚠️" label="Con deuda pendiente"  value={conDeuda}       valueClass={conDeuda > 0 ? 'text-danger' : 'text-success'} />
                        <StatCard icon="💰" label="Deuda total academia" value={`S/ ${totalDeuda.toLocaleString('es-PE')}`} valueClass={totalDeuda > 0 ? 'text-danger' : 'text-success'} />
                    </div>
                )}

                <FlashMessages />

                {alumnos.length === 0 ? (
                    <EmptyState
                        icon="👤"
                        title="Todavía no hay alumnos registrados"
                        description="Registrá el primero para comenzar a gestionar inscripciones."
                        ctaHref={route('alumnos.create')}
                        ctaLabel="+ Registrar primer alumno"
                    />
                ) : (
                    <>
                        {/* Búsqueda */}
                        <div className="mb-4 relative w-full md:w-72">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                            <input
                                type="search"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Buscar por nombre o DNI..."
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
                            />
                        </div>

                        {filtered.length === 0 ? (
                            <EmptyState icon="🔍" title={`Sin resultados para "${search}"`} />
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-muted uppercase text-xs tracking-wide">
                                        <tr>
                                            <th className="px-5 py-3.5 text-left">Alumno</th>
                                            <th className="px-5 py-3.5 text-left">DNI</th>
                                            <th className="px-5 py-3.5 text-center">Edad</th>
                                            <th className="px-5 py-3.5 text-center">Talleres</th>
                                            <th className="px-5 py-3.5 text-right">Deuda</th>
                                            <th className="px-5 py-3.5 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filtered.map(a => (
                                            <tr key={a.id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${avatarColor(a.nombre)}`}>
                                                            {a.nombre.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <Link href={route('alumnos.show', a.id)} className="font-medium text-secondary hover:text-primary transition-colors">
                                                                {a.nombre}
                                                            </Link>
                                                            {a.telefono && <p className="text-xs text-muted">{a.telefono}</p>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 text-muted font-mono text-xs">{a.dni}</td>
                                                <td className="px-5 py-3.5 text-center text-muted text-xs">
                                                    {calcularEdad(a.fecha_nacimiento)} años
                                                </td>
                                                <td className="px-5 py-3.5 text-center">
                                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                                        a.inscripciones_activas_count > 0 ? 'bg-orange-100 text-primary' : 'bg-gray-100 text-muted'
                                                    }`}>
                                                        {a.inscripciones_activas_count}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-right">
                                                    {a.deuda_total > 0 ? (
                                                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-danger">
                                                            S/ {a.deuda_total.toLocaleString('es-PE')}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-success">
                                                            Al día
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link href={route('alumnos.show', a.id)}
                                                            className="p-1.5 rounded-md text-muted hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                            title="Ver detalle">
                                                            <EyeIcon className="w-4 h-4" />
                                                        </Link>
                                                        <Link href={route('alumnos.edit', a.id)}
                                                            className="p-1.5 rounded-md text-muted hover:text-secondary hover:bg-gray-100 transition-colors"
                                                            title="Editar">
                                                            <PencilSquareIcon className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleEliminar(a.id, a.nombre)}
                                                            disabled={a.inscripciones_activas_count > 0}
                                                            title={a.inscripciones_activas_count > 0 ? 'Tiene inscripciones activas' : 'Eliminar'}
                                                            className="p-1.5 rounded-md text-muted hover:text-danger hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
