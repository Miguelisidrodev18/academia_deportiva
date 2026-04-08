<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Alumnos de una academia.
     * Un alumno puede estar inscripto en uno o más talleres.
     * El campo user_id es opcional: si el alumno tiene acceso al sistema, se crea un User para él.
     * Si es menor de edad y solo el padre accede, puede no tener User propio.
     */
    public function up(): void
    {
        Schema::create('alumnos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academia_id')->constrained('academias')->cascadeOnDelete();

            // Opcional: si el alumno (o padre) tiene acceso al sistema
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->string('nombre');
            $table->date('fecha_nacimiento'); // Necesaria para calcular descuentos por edad
            $table->string('dni', 20)->nullable();
            $table->string('direccion')->nullable();
            $table->string('telefono', 20)->nullable();
            $table->string('foto')->nullable(); // Ruta del archivo de imagen

            $table->timestamps();

            $table->index('academia_id');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alumnos');
    }
};
