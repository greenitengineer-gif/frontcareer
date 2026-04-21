<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Experience extends Model
{
    use HasFactory;

    protected $table = 'experience';
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
        'company',
        'position',
        'location',
        'start_date',
        'end_date',
        'description',
    ];

    public function cv()
    {
        return $this->belongsTo(CV::class, 'cv_id');
    }
}
