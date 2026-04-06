<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use League\CommonMark\Reference\Reference;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salarie', function (Blueprint $table) {
            $table->id();

            // Relations avec l'utilisateur
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Informations personnelles
            $table->string('cin')->nullable()->unique();
            $table->string('cnss')->nullable();
            $table->string('nom');
            $table->string('prenom');
            $table->string('email')->unique();
            $table->enum('sexe', ['Monsieur', 'Madame'])->nullable()->default('Monsieur');
            $table->date('date_naissance')->nullable();
            $table->string('adresse')->nullable();
            $table->string('gsm')->nullable();
            $table->string('photo')->nullable();
            $table->string('cv')->nullable();

            // Profession / poste / contrat
            $table->string('profession')->nullable(); 
            $table->enum('etat', ['CDI', 'ANAPEC'])->nullable(); 
            $table->date('date_embauche')->nullable();
            $table->decimal('salaire', 10, 2)->nullable();

            // Situation familiale
            $table->enum('situation_familiale', ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf/Veuve'])->nullable();
            $table->unsignedTinyInteger('nbre_enfants')->nullable()->default(0);

            // Banque
            $table->string('banque')->nullable();
            $table->string('adresse_agence')->nullable();
            $table->string('rib')->nullable();

            // Réseaux / role / status
            $table->string('linkedin')->nullable();
            $table->string('github')->nullable();
            $table->enum('role', ['RH', 'SALARIE', 'CHEF_SERVICE'])->default('SALARIE');
            $table->enum('status', ['Actif', 'En congé', 'Démissionné', 'Archivé', 'Suspendu', 'Licencié'])->nullable()->default('Actif');

            // Relations avec société et service
            $table->foreignId('societe_id')
                ->constrained('societe')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->foreignId('service_id')
                ->constrained('service')
                ->cascadeOnDelete()
                ->cascadeOnUpdate();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salarie');
    }
};
