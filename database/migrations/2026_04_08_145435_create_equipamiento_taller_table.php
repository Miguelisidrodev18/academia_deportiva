<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tabla pivote: equipamiento asignado a talleres.
     * Define qué equipamiento se usa por defecto en cada taller.
     * Ejemplo: "Taller Fútbol Sub-10" usa 5 pelotas talla 4 y 10 conos.
     */
    public function up(): void
    {
        Schema::create('equipamiento_taller', function (Blueprint $table) {
            $table->id();
            $table->foreignId('taller_id')->constrained('talleres')->cascadeOnDelete();
            $table->foreignId('equipamiento_id')->constrained('equipamientos')->cascadeOnDelete();

            // Cuántas unidades de este equipamiento se usan en este taller
            $table->unsignedSmallInteger('cantidad_asignada')->default(1);

            $table->timestamps();

            $table->unique(['taller_id', 'equipamiento_id']); // No duplicar la asignación
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipamiento_taller');
    }
};
