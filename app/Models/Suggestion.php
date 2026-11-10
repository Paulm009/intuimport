<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Suggestion extends Model
{
    protected $fillable = ['name', 'fob', 'ga', 'moq', 'description'];

    protected $casts = ['fob' => 'float', 'ga' => 'float', 'moq' => 'integer'];
}
