<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Producto extends Model
{
    protected $fillable = ['academia_id', 'nombre', 'precio', 'stock'];

    protected $casts = [
        'precio' => 'decimal:2',
    ];

    /** Pertenece a una academia. */
    public function academia(): BelongsTo
    {
        return $this->belongsTo(Academia::class);
    }

    /** Historial de ventas de este producto. */
    public function ventas(): HasMany
    {
        return $this->hasMany(VentaProducto::class);
    }

    /**
     * El stock es bajo si hay menos de 5 unidades.
     * Se usa para generar alertas en el dashboard.
     */
    public function stockBajo(): bool
    {
        return $this->stock < 5;
    }
}
