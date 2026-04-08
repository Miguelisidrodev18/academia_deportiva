<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Rangos horarios disponibles para alquilar un espacio.
     * Ejemplo: "Cancha A - Sábados de 10:00 a 11:30 - $800"
     *
     * El dueño define qué franjas horarias están disponibles para cada espacio.
     * Luego el encargado de alquileres crea reservas para estas franjas.
     */
    public function up(): void
    {
        Schema::create('rangos_horarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('espacio_id')->constrained('espacios')->cascadeOnDelete();

            // 1=Lunes, 2=Martes, ..., 7=Domingo
            $table->unsignedTinyInteger('dia_semana');
            $table->time('hora_inicio');
            $table->time('hora_fin');

            $table->decimal('precio', 8, 2); // Precio por esta franja horaria

            // Si está disponible para reservar o fue deshabilitada temporalmente
            $table->boolean('disponible')->default(true);

            $table->timestamps();

            $table->index('espacio_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rangos_horarios');
    }
};
