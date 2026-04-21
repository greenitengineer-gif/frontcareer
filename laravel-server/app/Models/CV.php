<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class CV extends Model
{
    use HasFactory;

    protected $table = 'cvs';
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
        'user_id',
        'template',
        'brand_color',
        'summary',
        'birth_date',
        'gender',
        'address',
        'expected_salary',
        'is_public',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function education()
    {
        return $this->hasMany(Education::class, 'cv_id');
    }

    public function experience()
    {
        return $this->hasMany(Experience::class, 'cv_id');
    }

    public function skills()
    {
        return $this->hasMany(CVSkill::class, 'cv_id');
    }

    public function languages()
    {
        return $this->hasMany(CVLanguage::class, 'cv_id');
    }

    public function certificates()
    {
        return $this->hasMany(Certificate::class, 'cv_id');
    }

    public function views()
    {
        return $this->hasMany(CVView::class, 'cv_id');
    }
}
