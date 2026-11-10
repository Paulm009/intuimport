<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavedQuote extends Model
{
    protected $fillable = [
        'user_id', 'name', 'mode', 'quote_date', 'cif_usd', 'total_usd',
        'total_bob', 'payload',
    ];

    protected $casts = [
        'quote_date' => 'date:Y-m-d',
        'cif_usd' => 'float',
        'total_usd' => 'float',
        'total_bob' => 'float',
        'payload' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
