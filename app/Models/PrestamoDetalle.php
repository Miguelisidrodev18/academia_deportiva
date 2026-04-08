<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrestamoDetalle extends Model
{
    protected $fillable = [
        'prestamo_id', 'equipamiento_id', 'cantidad', 'devuelto_parcial',
    ];

    /** El préstamo al que pertenece este ítem. */
    public function prestamo(): BelongsTo
    {
        return $this->belongsTo(PrestamoEspecial::class, 'prestamo_id');
    }

    /** El equipamiento prestado. */
    public function equipamiento(): BelongsTo
    {
        return $this->belongsTo(Equipamiento::class);
    }

    /** Cuántas unidades faltan devolver. */
    public function pendiente(): int
    {
        return $this->cantidad - $this->devuelto_parcial;
    }
}
