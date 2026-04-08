<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LogAuditoria extends Model
{
    protected $fillable = [
        'academia_id', 'usuario_id', 'accion', 'detalle', 'fecha_hora',
    ];

    protected $casts = [
        'fecha_hora' => 'datetime',
    ];

    /** La academia a la que pertenece este log. */
    public function academia(): BelongsTo
    {
        return $this->belongsTo(Academia::class);
    }

    /** El usuario que realizó la acción. */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    /**
     * Helper estático para registrar una acción de auditoría fácilmente.
     *
     * Uso: LogAuditoria::registrar('registro_pago', 'Se registró pago de $500 de Juan Pérez');
     */
    public static function registrar(string $accion, string $detalle): void
    {
        static::create([
            'academia_id' => auth()->user()->academia_id,
            'usuario_id'  => auth()->id(),
            'accion'      => $accion,
            'detalle'     => $detalle,
            'fecha_hora'  => now(),
        ]);
    }
}
