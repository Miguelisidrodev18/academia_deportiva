<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Talleres deportivos dentro de una disciplina.
     * Un taller tiene horario, rango de edad, nivel, precio base y un entrenador asignado.
     * Ejemplo: "Fútbol Sub-10 Inicial" - Lunes/Miércoles 16:00-17:30 - $50/mes
     */
    public function up(): void
    {
        // Usamos 'talleres' como nombre real de la tabla (el archivo se llama "tallers" por el inflector de Laravel)
        Schema::create('talleres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('disciplina_id')->constrained('disciplinas')->cascadeOnDelete();

            $table->string('nombre'); // Ej: "Fútbol Sub-10 Inicial"

            // Rango de edad para filtrar qué alumnos pueden inscribirse
            $table->unsignedTinyInteger('rango_edad_min')->default(0);  // Ej: 8
            $table->unsignedTinyInteger('rango_edad_max')->default(99); // Ej: 10

            // Nivel del taller
            $table->enum('nivel', ['inicial', 'intermedio', 'avanzado'])->default('inicial');

            // Precio base ANTES de descuentos (los descuentos se calculan en CuotaService)
            $table->decimal('precio_base', 8, 2);

            // Horario: día de la semana y horas de inicio/fin
            // dia_semana: 1=Lunes, 2=Martes, ..., 7=Domingo
            $table->unsignedTinyInteger('dia_semana'); // 1-7
            $table->time('hora_inicio');
            $table->time('hora_fin');

            // Entrenador asignado (debe tener rol = 'entrenador')
            $table->foreignId('entrenador_id')->nullable()->constrained('users')->nullOnDelete();

            // Límite de alumnos que puede tener el taller
            $table->unsignedSmallInteger('cupo_maximo')->default(20);

            $table->timestamps();

            $table->index('disciplina_id');
            $table->index('entrenador_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('talleres');
    }
};
