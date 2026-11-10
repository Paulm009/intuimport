<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    protected $fillable = ['user_id', 'name', 'location', 'is_current', 'last_active_at'];

    protected $casts = ['is_current' => 'boolean', 'last_active_at' => 'datetime'];
}
