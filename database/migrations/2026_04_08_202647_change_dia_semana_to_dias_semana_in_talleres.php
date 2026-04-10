<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Reemplaza la columna dia_semana (unsignedTinyInteger, con bug: guardaba 0 para strings)
 * por dias_semana (JSON), que admite múltiples días por taller, ej: ["lunes","miercoles"].
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('talleres', function (Blueprint $table) {
            // Agregamos la nueva columna JSON después de precio_base
            $table->json('dias_semana')->default('[]')->after('precio_base');
        });

        // Todos los talleres existentes quedan con array vacío (la columna vieja tenía datos corruptos)
        DB::statement("UPDATE talleres SET dias_semana = '[]'");

        Schema::table('talleres', function (Blueprint $table) {
            $table->dropColumn('dia_semana');
        });
    }

    public function down(): void
    {
        Schema::table('talleres', function (Blueprint $table) {
            $table->unsignedTinyInteger('dia_semana')->default(0)->after('precio_base');
        });

        Schema::table('talleres', function (Blueprint $table) {
            $table->dropColumn('dias_semana');
        });
    }
};
