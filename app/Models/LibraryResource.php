<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LibraryResource extends Model
{
    protected $fillable = ['title', 'category', 'content'];
}
