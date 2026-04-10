<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Agrega alumno_id nullable a reservas.
     * Permite vincular una reserva a un alumno registrado (tipo_cliente = 'alumno').
     */
    public function up(): void
    {
        Schema::table('reservas', function (Blueprint $table) {
            $table->foreignId('alumno_id')
                ->nullable()
                ->after('rango_horario_id')
                ->constrained('alumnos')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('reservas', function (Blueprint $table) {
            $table->dropForeign(['alumno_id']);
            $table->dropColumn('alumno_id');
        });
    }
};
