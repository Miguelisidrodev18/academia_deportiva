<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Inscripciones de alumnos a talleres.
     * Una inscripción = un alumno en un taller específico.
     * Cada inscripción tiene un código QR único para tomar asistencia.
     *
     * Si el alumno cambia de taller:
     * - La inscripción vieja queda en estado 'egresado' (activo = false)
     * - Se crea una nueva inscripción con nuevo QR
     */
    public function up(): void
    {
        Schema::create('inscripciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumno_id')->constrained('alumnos')->cascadeOnDelete();
            $table->foreignId('taller_id')->constrained('talleres')->cascadeOnDelete();

            $table->date('fecha_alta'); // Cuándo se inscribió

            // activo = true mientras sigue en el taller
            $table->boolean('activo')->default(true);

            // qr_code: cadena aleatoria de 20 caracteres para el QR
            // No contiene información sensible, solo es un token para buscar la inscripción
            $table->string('qr_code', 20)->unique();

            $table->enum('estado', ['activo', 'egresado'])->default('activo');

            $table->timestamps();

            $table->index('alumno_id');
            $table->index('taller_id');
            $table->index('qr_code'); // Índice para búsquedas rápidas al escanear QR
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inscripciones');
    }
};
