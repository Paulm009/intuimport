<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Recording extends Model
{
    protected $fillable = ['title', 'category', 'duration', 'recorded_on', 'summary'];

    protected $casts = ['recorded_on' => 'date:Y-m-d'];
}
