<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pago extends Model
{
    protected $fillable = [
        'inscripcion_id', 'monto', 'fecha_pago', 'metodo',
        'comprobante', 'registrado_por_usuario_id', 'periodo_mes', 'periodo_anio',
    ];

    protected $casts = [
        'fecha_pago' => 'date',
        'monto'      => 'decimal:2',
    ];

    /** La inscripción a la que corresponde este pago. */
    public function inscripcion(): BelongsTo
    {
        return $this->belongsTo(Inscripcion::class);
    }

    /** Quién registró el pago (admin de caja). */
    public function registradoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registrado_por_usuario_id');
    }
}
