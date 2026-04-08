<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Registro de asistencia de alumnos a clases.
     * Se registra por inscripción (no por alumno directo) para saber a qué taller.
     *
     * El entrenador escanea el QR del alumno → se crea un registro de asistencia.
     * Si acumula 3 'falta' sin justificar → se genera alerta para el dueño.
     */
    public function up(): void
    {
        Schema::create('asistencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inscripcion_id')->constrained('inscripciones')->cascadeOnDelete();

            $table->date('fecha');
            $table->time('hora'); // Hora exacta del escaneo QR

            // Estado de la asistencia:
            // 'presente' = escaneó QR correctamente
            // 'falta' = no se presentó
            // 'justificada' = falta marcada como justificada por el entrenador
            $table->enum('estado', ['presente', 'falta', 'justificada'])->default('presente');

            // Quién registró (generalmente el entrenador que escaneó el QR)
            $table->foreignId('registrado_por_entrenador_id')->constrained('users');

            $table->timestamps();

            $table->index('inscripcion_id');
            $table->index(['inscripcion_id', 'fecha']); // Para contar faltas rápido
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asistencias');
    }
};
