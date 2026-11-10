<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tariff extends Model
{
    protected $fillable = ['code', 'description', 'ga', 'iva', 'requirement'];

    protected $casts = ['ga' => 'float', 'iva' => 'float'];
}
