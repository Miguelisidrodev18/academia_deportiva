<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Espacios físicos disponibles para alquiler.
     * Ejemplos: "Cancha A (Fútbol 5)", "Cancha B (Básquet)", "Sala de Pesas".
     * Cada espacio pertenece a una academia.
     */
    public function up(): void
    {
        Schema::create('espacios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academia_id')->constrained('academias')->cascadeOnDelete();

            $table->string('nombre'); // Ej: "Cancha A", "Cancha B"
            $table->text('descripcion')->nullable(); // Capacidad, equipamiento incluido, etc.

            $table->timestamps();

            $table->index('academia_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('espacios');
    }
};
