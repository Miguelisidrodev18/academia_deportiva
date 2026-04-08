<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Detalle de ítems de un préstamo especial.
     * Un préstamo puede incluir múltiples tipos de equipamiento.
     * Ejemplo: 2 pelotas + 5 conos en el mismo préstamo.
     *
     * devuelto_parcial se actualiza con cada devolución parcial.
     */
    public function up(): void
    {
        Schema::create('prestamo_detalles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prestamo_id')
                  ->constrained('prestamo_especiales')
                  ->cascadeOnDelete();
            $table->foreignId('equipamiento_id')->constrained('equipamientos')->cascadeOnDelete();

            $table->unsignedSmallInteger('cantidad'); // Cuántas unidades se prestaron
            $table->unsignedSmallInteger('devuelto_parcial')->default(0); // Cuántas ya volvieron

            $table->timestamps();

            $table->index('prestamo_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prestamo_detalles');
    }
};
