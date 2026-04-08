<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Log de acciones sensibles del sistema.
     * Registra quién hizo qué y cuándo en acciones importantes:
     * pagos, inscripciones, modificaciones de talleres, préstamos, etc.
     *
     * Solo el dueño puede ver estos logs desde el panel.
     * Es una capa adicional a spatie/activitylog para acciones del negocio.
     */
    public function up(): void
    {
        Schema::create('log_auditorias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academia_id')->constrained('academias')->cascadeOnDelete();
            $table->foreignId('usuario_id')->constrained('users')->cascadeOnDelete();

            // Acción realizada. Ejemplos:
            // 'registro_pago', 'modificacion_taller', 'inscripcion_alumno', 'prestamo_especial'
            $table->string('accion', 100);

            // Detalle legible de la acción (para mostrar en el log del dueño)
            $table->text('detalle');

            // Fecha y hora exacta de la acción
            $table->timestamp('fecha_hora')->useCurrent();

            // No usamos timestamps() sino solo fecha_hora ya que no necesitamos updated_at
            // pero lo agregamos igual para consistencia con el ORM
            $table->timestamps();

            $table->index('academia_id');
            $table->index(['academia_id', 'fecha_hora']); // Para listar logs cronológicos
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('log_auditorias');
    }
};
