<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Disciplinas deportivas de una academia.
     * Ejemplos: Fútbol, Vóley, Basket.
     * Cada disciplina pertenece a una academia (multitenencia).
     */
    public function up(): void
    {
        Schema::create('disciplinas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academia_id')->constrained('academias')->cascadeOnDelete();
            $table->string('nombre'); // Ej: "Fútbol", "Vóley", "Basket"
            $table->timestamps();

            $table->index('academia_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disciplinas');
    }
};
