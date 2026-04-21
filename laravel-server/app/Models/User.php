<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

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
        'name',
        'email',
        'password',
        'phone',
        'avatar',
        'banner',
        'bio',
        'website',
        'is_verified',
        'user_type',
        'is_admin',
        'address',
        'employee_count',
        'industry',
        'founded_year',
        'facebook_url',
        'linkedin_url',
        'twitter_url',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_verified' => 'boolean',
        'is_admin' => 'boolean',
    ];

    public function jobs()
    {
        return $this->hasMany(Job::class);
    }

    public function cv()
    {
        return $this->hasOne(CV::class);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function applications()
    {
        return $this->hasMany(JobApplication::class, 'candidate_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function followers()
    {
        return $this->hasMany(Follower::class, 'employer_id');
    }

    public function following()
    {
        return $this->hasMany(Follower::class, 'follower_id');
    }
}
