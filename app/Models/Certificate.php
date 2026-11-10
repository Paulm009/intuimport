<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
    protected $fillable = ['user_id', 'title', 'folio', 'issued_at'];

    protected $casts = ['issued_at' => 'date:Y-m-d'];
}
