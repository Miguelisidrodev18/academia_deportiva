<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Reservas de espacios (canchas).
     * Una reserva ocupa un espacio en una franja horaria en una fecha específica.
     * El pago es 100% adelantado al momento de confirmar la reserva.
     *
     * El encargado verifica que no haya otra reserva en ese espacio/horario/fecha antes de confirmar.
     */
    public function up(): void
    {
        Schema::create('reservas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('espacio_id')->constrained('espacios')->cascadeOnDelete();
            $table->foreignId('rango_horario_id')->constrained('rangos_horarios')->cascadeOnDelete();

            $table->date('fecha_reserva'); // La fecha puntual de la reserva

            // El cliente puede ser un alumno de la academia o una persona externa
            $table->enum('tipo_cliente', ['alumno', 'externo'])->default('externo');

            // Datos del cliente (para externos o cuando no hay alumno_id)
            $table->string('cliente_nombre');
            $table->string('cliente_dni', 20)->nullable();
            $table->string('cliente_telefono', 20)->nullable();

            // Monto pagado (siempre 100% adelantado)
            $table->decimal('monto_pagado', 8, 2);

            $table->enum('estado', ['confirmada', 'finalizada', 'cancelada'])->default('confirmada');

            $table->timestamps();

            $table->index('espacio_id');
            $table->index(['espacio_id', 'fecha_reserva', 'rango_horario_id']); // Para detectar doble reserva
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservas');
    }
};
