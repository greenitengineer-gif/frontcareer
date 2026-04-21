<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Job extends Model
{
    use HasFactory;

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
        'title',
        'company_name',
        'company_logo',
        'description',
        'requirements',
        'salary_min',
        'salary_max',
        'salary_type',
        'job_type',
        'category',
        'location',
        'user_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function applications()
    {
        return $this->hasMany(JobApplication::class);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function views()
    {
        return $this->hasMany(JobView::class);
    }
}
