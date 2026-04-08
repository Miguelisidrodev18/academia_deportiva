<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Crea la tabla de usuarios.
     * Cada usuario pertenece a una academia (multitenencia).
     * El rol determina qué puede hacer cada usuario en el sistema.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');

            // Multitenencia: todos los usuarios pertenecen a una academia.
            // Nullable para admins del SaaS (super-admin) que no pertenecen a ninguna academia.
            $table->foreignId('academia_id')
                  ->nullable()
                  ->constrained('academias')
                  ->nullOnDelete();

            // Rol del usuario dentro de su academia.
            // dueno: acceso total a su academia
            // entrenador: gestiona asistencia de sus talleres
            // admin_caja: registra pagos, ventas, inscripciones
            // admin_alquiler: gestiona reservas de espacios
            // alumno: solo lectura de sus datos
            $table->enum('rol', ['dueno', 'entrenador', 'admin_caja', 'admin_alquiler', 'alumno'])
                  ->default('alumno');

            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Revierte la migración.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
