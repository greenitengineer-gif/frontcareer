<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class JobView extends Model
{
    use HasFactory;

    protected $table = 'job_views';
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
        'job_id',
        'viewer_id',
    ];

    public function job()
    {
        return $this->belongsTo(Job::class, 'job_id');
    }

    public function viewer()
    {
        return $this->belongsTo(User::class, 'viewer_id');
    }
}
