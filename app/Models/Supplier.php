<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Supplier extends Model
{
    protected $fillable = ['user_id', 'name', 'city', 'sells', 'port', 'contact', 'rating'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
