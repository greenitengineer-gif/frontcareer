<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Education extends Model
{
    use HasFactory;

    protected $table = 'education';
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
        'institution',
        'degree',
        'field_of_study',
        'start_date',
        'end_date',
        'description',
    ];

    public function cv()
    {
        return $this->belongsTo(CV::class, 'cv_id');
    }
}
