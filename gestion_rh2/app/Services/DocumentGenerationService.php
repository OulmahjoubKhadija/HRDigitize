<?php

namespace App\Services;

use App\Models\User;
use App\Models\DocumentTemplate;
use App\Models\TypeDocument;
use Carbon\Carbon;
use PhpOffice\PhpWord\TemplateProcessor;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;


class DocumentGenerationService
{
    public function generate(
        User $targetUser,
        int $typeDocumentId,
        array $overrideVariables = []
    ): array {

        // 1 Get TypeDocument
        $type = TypeDocument::findOrFail($typeDocumentId);

        // 2 Validate cible (salarie / stagiaire)
        if (!$this->isTargetValidForType($targetUser, $type->cible)) {
            throw new \Exception("Ce type de document n'est pas autorisé pour cet utilisateur.");
        }

        // 3 Get Societe ID from profile table
        $societeId = $this->getSocieteId($targetUser);

        if (!$societeId) {
            throw new \Exception("L'utilisateur n'appartient à aucune société.");
        }

        // 4 Find template
        $template = DocumentTemplate::where('type_document_id', $typeDocumentId)
            ->first();

        if (!$template->template_path) {
            throw new \Exception("Ce document ne prend pas en charge la génération de systèmes.");
        }

        // 5 Build variables from profile
        $profileVariables = $this->getProfileVariables($targetUser);

        // Merge override variables
        $allVariables = array_merge(
            $profileVariables,
            $overrideVariables
        );

        // 6 Auto Date Handling
        $allVariables['date'] =
            $overrideVariables['date'] ?? now()->format('d/m/Y');

        $dateCarbon = Carbon::parse(
            $overrideVariables['date'] ?? now()
        );


        // French month name
        $dateCarbon = Carbon::parse($overrideVariables['date'] ?? now())->locale('fr');

        $allVariables['date_lettres'] = $dateCarbon->translatedFormat('d F Y');


        // Calculate the total travel expenses (le total des frais de deplacement)
        if($type->nom === 'Note de déplacement'){

            $transport     = (float) ($overrideVariables['frais_transport'] ?? 0);
            $hebergement   = (float) ($overrideVariables['frais_hebergement'] ?? 0);
            $restauration  = (float) ($overrideVariables['frais_restauration'] ?? 0);
            $autres        = (float) ($overrideVariables['autres_frais'] ?? 0);

            $total = $transport + $hebergement + $restauration + $autres;

            $overrideVariables['total_general'] = number_format($total, 2, ',', ' ');
        }

        // 

        // 7 Validate required variables (optional)
        foreach ($template->variable_json ?? [] as $required) {
            if (!array_key_exists($required, $allVariables)) {
                throw new \Exception("Missing variable: {$required}");
            }
        }

        // 8 Prepare template path
        if (!Storage::disk('public')->exists($template->template_path)) {
            throw new \Exception("Fichier modèle introuvable.");
        }

        // 9 Get template full path safely
        $fullTemplatePath = Storage::disk('public')
            ->path($template->template_path);


        // 10 Ensure generated directory exists
        if (!Storage::disk('public')->exists('generated')) {
            Storage::disk('public')->makeDirectory('generated');
        }

        // 11 Generate Word file
        $processor = new TemplateProcessor($fullTemplatePath);

        foreach ($this->flatten($allVariables) as $key => $value) {
            $processor->setValue($key, $value ?? '');
        }

        $fileName = 'document_' . $targetUser->id . '_' . time() . '.docx';
        $filePath = 'generated/' . $fileName;

        $processor->saveAs(
            storage_path('app/public/' . $filePath)
        );

        return [
            'file_path' => $filePath,
            'variables' => $allVariables
        ];
    }

    //  Validate cible
    private function isTargetValidForType(User $user, string $cible): bool
    {
        if ($cible === 'stagiaire' && $user->role !== 'STAGIAIRE') {
            return false;
        }

        if ($cible === 'salarie' && $user->role === 'STAGIAIRE') {
            return false;
        }

        return true;
    }

    //  Get Societe ID dynamically
    private function getSocieteId(User $user): ?int
    {
        if ($user->role === 'STAGIAIRE') {
            return $user->stagiaire->societe_id ?? null;
        }

        return $user->salarie->societe_id ?? null;
    }

    //  Build profile variables
    private function getProfileVariables(User $user): array
    {
        if ($user->role === 'STAGIAIRE') {

            $p = $user->stagiaire;

            return [
                'nom' => $p->nom,
                'prenom' => $p->prenom,
                'cin' => $p->cin,
                'civilite' => $p->sexe,
                'date_debut' => $p->date_debut,
                'date_fin' => $p->date_fin,
                'service_nom' => $p->service->nom ?? '',
                'societe_nom' => $p->societe->nom ?? '',
                'societe_adresse' => $p->societe->adresse ?? '',
            ];
        }

        $p = $user->salarie;

        return [
            'nom' => $p->nom,
            'prenom' => $p->prenom,
            'cnss' => $p->cnss,
            'cin' => $p->cin,
            'telephone' => $p->gsm,
            'email' => $p->email,
            'civilite' => $p->sexe,
            'profession' => $p->profession,
            'date_embauche' => $p->date_embauche,
            'service_nom' => $p->service->nom ?? '',
            'societe_nom' => $p->societe->nom ?? '',
            'societe_adresse' => $p->societe->adresse ?? '',
            'societe_cnss' => $p->societe->cnss ?? '',

        ];
    }

    //  Flatten nested arrays
    private function flatten(array $array, $prefix = '')
    {
        $result = [];

        foreach ($array as $key => $value) {
            if (is_array($value)) {
                $result = array_merge(
                    $result,
                    $this->flatten($value, $prefix . $key . '_')
                );
            } else {
                $result[$prefix . $key] = $value;
            }
        }

        return $result;
    }
    
}
