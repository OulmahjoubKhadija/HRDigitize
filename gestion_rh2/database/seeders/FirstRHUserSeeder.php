<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Salarie;
use App\Models\Societe;
use App\Models\Service;

class FirstRHUserSeeder extends Seeder
{
    public function run(): void
    {
        //  Société
        $societe = Societe::factory()->create([
            'nom' => 'Société Principale',
            'adresse'=>'RABAT AGDALE',
            'telephone'=>'0811334422',
            'email' => 'contact@societe-principale.com',
            'activite'=>'Informatique',
            'if'=>'12213443',
            'cnss'=>'23443256',
            'rc'=>'110094563',
            'ice' => '001234567890123',
        ]);

        //  Service
        $service = Service::factory()->create([
            'nom' => 'Ressources Humaines',
            'societe_id' => $societe->id,
        ]);

        //  Salarié RH
        $salarie = Salarie::create([
            'user_id' => null,

            'cin' => 'RH0001',
            'cnss'=> '12332456',
            'nom' => 'RH',
            'prenom' => 'Admin',

            'date_naissance' => '1990-01-01',
            'sexe' => 'Monsieur',

            'email' => 'admin.rh@example.com',
            'gsm' => '0600000000',
            'adresse' => 'Siège social',

            'etat' => 'CDI',
            'profession' => 'Responsable RH',
            'date_embauche' => '2015-02-03',
            'salaire' => 15000.00,

            'situation_familiale' => 'Célibataire',
            'nbre_enfants' => 0,

            'banque' => 'Attijariwafa Bank',
            'adresse_agence' => 'Agence Centre Ville',
            'rib' => 'MA6401151900000123456789012',

            'cv' => null,
            'photo' => null,
            'linkedin' => null,
            'github' => null,

            'role' => 'RH',
            'status' => 'Actif',

            'societe_id' => $societe->id,
            'service_id' => $service->id,
        ]);

        //  User RH lié
        $user = User::create([
            'name' => $salarie->prenom . ' ' . $salarie->nom,
            'email' => $salarie->email,
            'password' => Hash::make('password123'),
            'salarie_id' => $salarie->id,
            'registration_code' => null,
            'activation_expires_at' => null,
            'is_active' => 1,
            'role' => 'RH',
        ]);

         // Link user to salarie
        $salarie->user_id = $user->id;
        $salarie->save();
    }
    
}
