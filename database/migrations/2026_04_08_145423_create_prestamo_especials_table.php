<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Préstamos especiales de equipamiento fuera de talleres o alquileres.
     * Ejemplo: un alumno pide prestado 2 pelotas para practicar el fin de semana.
     *
     * Soporta devolución parcial: el alumno puede devolver 1 pelota hoy y la otra mañana.
     * El estado cambia a 'completado' cuando todo fue devuelto.
     * Genera alerta diaria si fecha_devolucion_esperada pasó y está en 'activo'.
     */
    public function up(): void
    {
        Schema::create('prestamo_especiales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academia_id')->constrained('academias')->cascadeOnDelete();

            $table->string('solicitante_nombre');
            $table->enum('solicitante_tipo', ['alumno', 'externo'])->default('alumno');

            $table->date('fecha_prestamo');
            $table->date('fecha_devolucion_esperada');
            $table->date('fecha_devolucion_real')->nullable(); // Se llena cuando se completa

            // activo = en préstamo, completado = devuelto todo, atrasado = pasó la fecha esperada
            $table->enum('estado', ['activo', 'completado', 'atrasado'])->default('activo');

            $table->timestamps();

            $table->index('academia_id');
            $table->index(['estado', 'fecha_devolucion_esperada']); // Para alertas diarias
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prestamo_especiales');
    }
};
