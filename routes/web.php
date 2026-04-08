<?php

use App\Http\Controllers\AlumnoController;
use App\Http\Controllers\DisciplinaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InscripcionController;
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

    // Perfil del usuario autenticado
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
