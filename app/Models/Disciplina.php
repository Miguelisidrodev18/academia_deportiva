<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Disciplina extends Model
{
    protected $fillable = ['academia_id', 'nombre'];

    /** La disciplina pertenece a una academia. */
    public function academia(): BelongsTo
    {
        return $this->belongsTo(Academia::class);
    }

    /** Una disciplina tiene muchos talleres (Sub-10, Sub-12, etc.). */
    public function talleres(): HasMany
    {
        return $this->hasMany(Taller::class);
    }
}
