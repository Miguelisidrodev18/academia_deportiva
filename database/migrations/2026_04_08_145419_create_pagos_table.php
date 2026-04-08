<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Pagos de cuotas de inscripción.
     * El monto guardado es el que realmente se cobró (después de descuentos).
     * Los descuentos se calculan en CuotaService antes de guardar el pago.
     *
     * periodo_mes + periodo_anio identifican a qué mes corresponde el pago.
     * Esto permite detectar cuotas adeudadas comparando con las cuotas esperadas.
     */
    public function up(): void
    {
        Schema::create('pagos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inscripcion_id')->constrained('inscripciones')->cascadeOnDelete();

            // Monto real cobrado (con descuentos ya aplicados)
            $table->decimal('monto', 8, 2);

            $table->date('fecha_pago');

            // Método de pago disponible en el MVP
            $table->enum('metodo', ['efectivo', 'yape'])->default('efectivo');

            // Ruta al archivo de comprobante (foto de voucher Yape, recibo, etc.)
            $table->string('comprobante')->nullable();

            // Quién registró el pago (para auditoría)
            $table->foreignId('registrado_por_usuario_id')->constrained('users');

            // Período al que corresponde el pago (mes y año)
            $table->unsignedTinyInteger('periodo_mes');   // 1-12
            $table->unsignedSmallInteger('periodo_anio'); // Ej: 2026

            $table->timestamps();

            $table->index('inscripcion_id');
            $table->index(['periodo_mes', 'periodo_anio']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagos');
    }
};
