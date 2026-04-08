<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabla pivote: equipamiento reservado para un alquiler de cancha.
     * Al reservar una cancha, se reserva automáticamente el equipamiento base del espacio.
     *
     * cantidad_devuelta se actualiza cuando el encargado registra la devolución.
     * Si cantidad_devuelta < cantidad_reservada → equipamiento pendiente de devolver.
     */
    public function up(): void
    {
        Schema::create('equipamiento_reserva', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reserva_id')->constrained('reservas')->cascadeOnDelete();
            $table->foreignId('equipamiento_id')->constrained('equipamientos')->cascadeOnDelete();

            $table->unsignedSmallInteger('cantidad_reservada');
            // Cuánto ya fue devuelto (devolución parcial posible)
            $table->unsignedSmallInteger('cantidad_devuelta')->default(0);

            $table->timestamps();

            $table->index('reserva_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipamiento_reserva');
    }
};
