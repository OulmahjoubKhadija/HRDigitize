<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stagiaire extends Model
{
    /**
    * @property \App\Models\User $user
    */

    use HasFactory;

    protected $table = 'stagiaire';

    protected $fillable = [
        'user_id',
        'cin',
        'nom',
        'prenom',
        'sexe',
        'photo',
        'email',
        'telephone',
        'filiere',
        'cv',
        'demande_stage',
        'fiche_reussite',
        'accord_stage',
        'entreprise_accueil',
        'date_debut',
        'date_fin',
        'status',
        'societe_id',
        'service_id',
        'encadrant_id',
    ];

    public function stagiaireUser()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function societe()
    {
        return $this->belongsTo(Societe::class, 'societe_id')->withDefault();
    }

    public function service()
    {
        return $this->belongsTo(Service::class, 'service_id')->withDefault();
    }

    public function encadrant()
    {
        return $this->belongsTo(Salarie::class, 'encadrant_id')->withDefault();
    }

    public function demandes()
    {
        return $this->morphMany(Demande::class, 'demandeur');
    }

    public function documentsConcernes()
    {
        return $this->morphMany(Demande::class, 'cible');
    }
}


