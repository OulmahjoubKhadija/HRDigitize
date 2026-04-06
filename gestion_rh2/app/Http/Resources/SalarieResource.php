<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SalarieResource extends JsonResource
{
    public function toArray($request)
    {
         $user = $request->user();
         $isAuthenticated = auth()->check();
         $isRH = $isAuthenticated && $user->role === 'RH';
        //  $isOwner = $isAuthenticated && $this->user_id === $user->id;
        $isOwner = $isAuthenticated && $user->salarie_id === $this->id;

        // $user = auth()->user();

        // $isAuthenticated = $user !== null;
        // $isRH = $isAuthenticated && $user->role === 'RH';
        // $isOwner = $isAuthenticated && $this->user_id === $user->id;


        return [
            'id'     => $this->id,
            'photo'  => $this->photo ? asset('storage/' . ltrim($this->photo, '/')) : null,
            'prenom' => $this->prenom,
            'nom'    => $this->nom,
            'profession'  => $this->profession,
            'role'   => $this->role,

            'societe' => $this->societe ? [
                'id' => $this->societe->id,
                'nom' => $this->societe->nom,
            ] : null,

            'service' => $this->service ? [
                'id' => $this->service->id,
                'nom' => $this->service->nom,
            ] : null,

            // Authenticated users
            'email'    => $this->when($isAuthenticated, $this->email),
            'linkedin' => $this->when($isAuthenticated && $this->linkedin, $this->linkedin),
            'github'   => $this->when($isAuthenticated && $this->github, $this->github),

            // Owner OR RH
            'gsm'       => $this->when($isOwner || $isRH, $this->gsm),
            'adresse'   => $this->when($isOwner || $isRH, $this->adresse),
            'cin'       => $this->when($isOwner || $isRH, $this->cin),
            'salaire'   => $this->when($isOwner || $isRH, $this->salaire),
            'cnss'      => $this->when($isOwner || $isRH, $this->cnss),
            'cv'        => $this->when($isOwner || $isRH, $this->cv ?
                asset('storage/' . ltrim($this->cv, '/')) : null
            ),

            // RH only
            'date_embauche' => $this->when($isRH, $this->date_embauche),
            'status'        => $this->when($isRH, $this->status),
            'etat'          => $this->when($isRH, $this->etat),
            'banque'        => $this->when($isRH, $this->banque),
            'adresse_agence'        => $this->when($isRH, $this->adresse_agence),
            'rib'        => $this->when($isRH, $this->rib),
            'situation_familiale'        => $this->when($isRH, $this->situation_familiale),
            'nbre_enfants'        => $this->when($isRH, $this->nbre_enfants),
            'user' => $this->whenLoaded('user', [
                'id'        => $this->user->id,
                'is_active' => $this->user->is_active,
                'email'     => $this->user->email,
                'photo'     => $this->user->photo ? asset('storage/' . ltrim($this->user->photo, '/')) : null,
                'cin'       => $this->user->cin ?? null,
            ]),
            'archived_at' => $this->user->archived_at ?? null,
            
        ];
    }

}
