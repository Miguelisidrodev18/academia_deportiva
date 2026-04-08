<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Productos para venta en la academia (kiosco/cantina).
     * Ejemplos: "Gaseosa 500ml", "Agua mineral", "Alfajor", "Barrita de cereal".
     *
     * Cuando stock <= 5 → se genera alerta en el dashboard.
     */
    public function up(): void
    {
        Schema::create('productos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academia_id')->constrained('academias')->cascadeOnDelete();

            $table->string('nombre'); // Ej: "Gaseosa 500ml"
            $table->decimal('precio', 8, 2);
            $table->unsignedSmallInteger('stock')->default(0);

            $table->timestamps();

            $table->index('academia_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};
