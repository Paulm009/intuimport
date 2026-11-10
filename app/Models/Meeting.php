<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Meeting extends Model
{
    protected $fillable = ['user_id', 'day', 'time', 'title', 'modality', 'scheduled_for'];

    protected $casts = ['scheduled_for' => 'date:Y-m-d'];
}
