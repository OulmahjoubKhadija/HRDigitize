<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Salarie extends Model
{
    /**
    * @property \App\Models\User $user
    */
    use HasFactory; 

    protected $table = 'salarie';

    protected $fillable = [
        'user_id',
        'cin',
        'cnss',
        'nom',
        'prenom',
        'date_naissance',
        'gsm',
        'etat',
        'salaire',
        'situation_familiale',
        'nbre_enfants',
        'banque',
        'adresse_agence',
        'rib',        
        'sexe',
        'cv',
        'photo',
        'adresse',
        'email',
        'gsm',
        'profession',
        'date_embauche',
        'linkedin',
        'github',
        'role',
        'status',
        'societe_id',
        'service_id',
    ];

    
    public function societe(){
        return $this->belongsTo(Societe::class, 'societe_id')->withDefault();
    }

    public function service(){
        return $this->belongsTo(Service::class, 'service_id')->withDefault();
    }

    public function demandes(){
        return $this->morphMany(Demande::class, 'demandeur');
    }

    public function documentsConcernes()
    {
        return $this->morphMany(Demande::class, 'cible');
    }

    public function stagiairesEncadres()
    {
        return $this->hasMany(Stagiaire::class, 'encadrant_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

}
