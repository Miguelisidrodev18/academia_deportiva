<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Registro de ventas de productos (kiosco/cantina).
     * Cada venta descuenta el stock del producto automáticamente.
     * Si después de la venta el stock queda <= 5 → se muestra alerta.
     */
    public function up(): void
    {
        Schema::create('venta_productos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();

            $table->unsignedSmallInteger('cantidad');
            $table->decimal('total', 8, 2); // precio * cantidad al momento de la venta

            $table->date('fecha');

            // Quién procesó la venta (admin de caja)
            $table->foreignId('registrado_por_usuario_id')->constrained('users');

            $table->timestamps();

            $table->index('producto_id');
            $table->index('fecha');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('venta_productos');
    }
};
