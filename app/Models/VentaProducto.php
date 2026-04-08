<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VentaProducto extends Model
{
    protected $fillable = [
        'producto_id', 'cantidad', 'total', 'fecha', 'registrado_por_usuario_id',
    ];

    protected $casts = [
        'fecha' => 'date',
        'total' => 'decimal:2',
    ];

    /** El producto vendido. */
    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }

    /** Quién registró la venta. */
    public function registradoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registrado_por_usuario_id');
    }
}
