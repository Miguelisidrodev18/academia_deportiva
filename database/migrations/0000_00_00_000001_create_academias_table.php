<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Crea la tabla de academias.
     * Cada academia es un "tenant" independiente en el sistema multitenant.
     * Todos los datos del sistema están aislados por academia_id.
     */
    public function up(): void
    {
        Schema::create('academias', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('direccion')->nullable();
            $table->string('telefono', 20)->nullable();
            // Plan de suscripción (en MVP solo "basico", se amplía post-MVP)
            $table->enum('plan', ['basico'])->default('basico');
            $table->timestamp('fecha_registro')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::dropIfExists('academias');
    }
};
