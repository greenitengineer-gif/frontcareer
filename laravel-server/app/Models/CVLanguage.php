<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class CVLanguage extends Model
{
    use HasFactory;

    protected $table = 'cv_languages';
    protected $keyType = 'string';
    public $incrementing = false;

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    protected $fillable = [
        'cv_id',
        'language_name',
        'level',
    ];

    public function cv()
    {
        return $this->belongsTo(CV::class, 'cv_id');
    }
}
