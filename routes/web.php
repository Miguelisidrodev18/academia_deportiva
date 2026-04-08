<?php

use App\Http\Controllers\AlumnoController;
use App\Http\Controllers\AsistenciaController;
use App\Http\Controllers\DisciplinaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InscripcionController;
use App\Http\Controllers\PagoController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TallerController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// ─── Rutas protegidas: requieren autenticación + academia asignada (tenant) ───
Route::middleware(['auth', 'tenant'])->group(function () {

    // Dashboard principal
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

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

    // Perfil del usuario autenticado
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
