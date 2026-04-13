<?php

use App\Http\Controllers\AlumnoController;
use App\Http\Controllers\AsistenciaController;
use App\Http\Controllers\DisciplinaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EspacioController;
use App\Http\Controllers\InscripcionController;
use App\Http\Controllers\PagoController;
use App\Http\Controllers\PrestamoEspecialController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReservaController;
use App\Http\Controllers\VentaProductoController;
use App\Http\Controllers\TallerController;
use App\Http\Controllers\UsuarioController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return auth()->check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
});

// ─── Rutas protegidas: requieren autenticación + academia asignada (tenant) ───
Route::middleware(['auth', 'tenant'])->group(function () {

    // Dashboard principal
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // CRUD de disciplinas deportivas
    Route::resource('disciplinas', DisciplinaController::class);

    // CRUD de talleres — forzamos el parámetro a "taller" porque Laravel pluraliza mal en español
    Route::resource('talleres', TallerController::class)->parameters(['talleres' => 'taller']);

    // CRUD de alumnos
    Route::resource('alumnos', AlumnoController::class);

    // Inscripciones: solo index, create, store, show y destroy (no edit/update)
    Route::resource('inscripciones', InscripcionController::class)
        ->only(['index', 'create', 'store', 'show', 'destroy'])
        ->parameters(['inscripciones' => 'inscripcion']);

    // Pagos de cuotas
    Route::resource('pagos', PagoController::class)->only(['index', 'create', 'store', 'show']);

    // Endpoint API: deuda del alumno (llamado por el frontend de pagos vía fetch)
    Route::get('alumnos/{alumno}/deuda', [PagoController::class, 'deuda'])->name('alumnos.deuda');

    // ── Asistencia QR ──────────────────────────────────────────────────────────
    // Vista del escáner QR (solo entrenadores y dueño)
    Route::get('asistencia/escanear', [AsistenciaController::class, 'escanear'])->name('asistencia.escanear');
    // Endpoint POST: recibe el QR escaneado y registra la asistencia (retorna JSON)
    Route::post('asistencia/qr', [AsistenciaController::class, 'registrarQR'])->name('asistencia.registrar');
    // Listado de asistencias del día con filtros
    Route::get('asistencias', [AsistenciaController::class, 'index'])->name('asistencias.index');
    // Marcar falta manualmente (JSON endpoint)
    Route::post('asistencias/falta', [AsistenciaController::class, 'marcarFalta'])->name('asistencias.falta');
    // Justificar una falta existente
    Route::patch('asistencias/{asistencia}/justificar', [AsistenciaController::class, 'justificar'])->name('asistencias.justificar');

    // ── Alquileres de espacios ─────────────────────────────────────────────────
    // Espacios (canchas, salones) — solo dueño puede gestionar
    Route::resource('espacios', EspacioController::class);

    // Reservas de espacios — dueño y admin_alquiler
    Route::resource('reservas', ReservaController::class)
        ->only(['index', 'create', 'store', 'show', 'destroy']);
    // Devolución de equipamiento (vista + actualizar)
    Route::get('reservas/{reserva}/devolucion', [ReservaController::class, 'devolucion'])->name('reservas.devolucion');
    Route::patch('reservas/{reserva}/devolucion', [ReservaController::class, 'updateDevolucion'])->name('reservas.devolucion.update');
    // API: horarios disponibles para un espacio en una fecha
    Route::get('reservas/horarios-disponibles', [ReservaController::class, 'horariosDisponibles'])->name('reservas.horarios');
    // Autocomplete de alumnos (para el form de reservas)
    Route::get('alumnos/buscar', [AlumnoController::class, 'buscar'])->name('alumnos.buscar');

    // ── Préstamos especiales de equipamiento ──────────────────────────────────
    // Listado, nuevo préstamo y detalle
    Route::resource('prestamos', PrestamoEspecialController::class)
        ->only(['index', 'create', 'store', 'show'])
        ->parameters(['prestamos' => 'prestamo']);
    // Devolución parcial o total de ítems prestados
    Route::get('prestamos/{prestamo}/devolucion', [PrestamoEspecialController::class, 'devolucion'])->name('prestamos.devolucion');
    Route::patch('prestamos/{prestamo}/devolucion', [PrestamoEspecialController::class, 'updateDevolucion'])->name('prestamos.devolucion.update');

    // ── Ventas de productos (kiosco/cantina) ──────────────────────────────────
    // Catálogo de productos (solo dueño puede crear/editar/eliminar)
    Route::resource('productos', ProductoController::class)
        ->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
    // Historial y registro de ventas (dueño + admin_caja)
    Route::resource('ventas', VentaProductoController::class)
        ->only(['index', 'create', 'store']);

    // Gestión de usuarios y roles (solo dueño)
    Route::resource('usuarios', UsuarioController::class)
        ->only(['index', 'create', 'store', 'edit', 'update']);

    // Perfil del usuario autenticado
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
