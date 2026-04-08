<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Inventario de equipamiento de una academia.
     * Ejemplos: "Pelota talla 5", "Cono naranja", "Arco portátil".
     *
     * stock_total: cantidad total que tiene la academia
     * stock_disponible: cuántas unidades están disponibles en este momento
     * La diferencia (total - disponible) = unidades prestadas/en uso
     */
    public function up(): void
    {
        Schema::create('equipamientos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academia_id')->constrained('academias')->cascadeOnDelete();

            $table->string('nombre'); // Ej: "Pelota talla 5"
            $table->string('tipo')->nullable(); // Ej: "pelota", "cono", "arco"

            $table->unsignedSmallInteger('stock_total')->default(0);
            $table->unsignedSmallInteger('stock_disponible')->default(0);

            $table->timestamps();

            $table->index('academia_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipamientos');
    }
};
