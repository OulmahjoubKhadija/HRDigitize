<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use Illuminate\Contracts\Auth\CanResetPassword;
use Illuminate\Auth\Passwords\CanResetPassword as CanResetPasswordTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements CanResetPassword
{
    /**
 * @property \App\Models\Salarie $salarie
 */
    use HasApiTokens, HasFactory, Notifiable, CanResetPasswordTrait;

    protected $fillable = [
        'salarie_id',
        'name',
        'email',
        'password',
        'registration_code',
        'activation_expires_at',
        'is_active',
        'is_archived',
        'role',
        'is_profile_completed',
        'archived_at',
    ];

    protected $casts = [
    'activation_expires_at' => 'datetime',
    'archived_at' => 'datetime',
    'is_profile_completed' => 'boolean',
    'is_active' => 'boolean',
    'is_archived' => 'boolean',
    ];
    

    protected $hidden = [
        'password',
        'registration_code',
    ];

    public function salarie()
    {
        return $this->hasOne(Salarie::class, 'user_id');
    }

    public function stagiaire()
    {
        return $this->hasOne(Stagiaire::class, 'user_id');
    }

}
