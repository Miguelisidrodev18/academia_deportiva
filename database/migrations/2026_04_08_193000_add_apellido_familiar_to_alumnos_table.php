<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Agrega el campo apellido_familiar para agrupar hermanos.
     * Se usa en CuotaService para detectar cuántos hermanos están inscriptos
     * en la misma academia y aplicar el descuento correspondiente.
     *
     * Ejemplo: si "García" tiene 3 hermanos, cada uno obtiene 15% de descuento.
     */
    public function up(): void
    {
        Schema::table('alumnos', function (Blueprint $table) {
            // Apellido del grupo familiar (ej: "García", "López Pereyra")
            // Nullable para no romper registros existentes
            $table->string('apellido_familiar', 80)->nullable()->after('nombre');
        });
    }

    public function down(): void
    {
        Schema::table('alumnos', function (Blueprint $table) {
            $table->dropColumn('apellido_familiar');
        });
    }
};
