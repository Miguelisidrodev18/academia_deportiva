<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Agrega la columna equipamiento_base (JSON) a espacios.
     * Almacena lista de items disponibles: [{nombre, cantidad}]
     */
    public function up(): void
    {
        Schema::table('espacios', function (Blueprint $table) {
            $table->json('equipamiento_base')->nullable()->default('[]')->after('descripcion');
        });
    }

    public function down(): void
    {
        Schema::table('espacios', function (Blueprint $table) {
            $table->dropColumn('equipamiento_base');
        });
    }
};
