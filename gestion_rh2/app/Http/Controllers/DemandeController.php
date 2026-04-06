<?php

namespace App\Http\Controllers;

use App\Models\Demande;
use App\Models\User;
use App\Services\DocumentGenerationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Models\TypeDocument;
use App\Models\DocumentTemplate;

class DemandeController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Demande::with(['typeDocument', 'user'])->latest();

        if ($user->role !== 'RH') {
            $query->where('user_id', $user->id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request, DocumentGenerationService $service)
    {
        $generator = auth()->user();

        $validated = $request->validate([
            'type_document_id' => 'required|exists:type_documents,id',
            'variables' => 'nullable|array',
            'target_user_id' => 'nullable|exists:users,id',
        ]);

        // Determine target user
        if (!empty($validated['target_user_id'])) {

            if ($generator->role !== 'RH') {
                return response()->json([
                    'error' => 'Seul RH peut générer pour les autres'
                ], 403);
            }

            $targetUser = User::findOrFail($validated['target_user_id']);

        } else {
            $targetUser = $generator;
        }

        $type = TypeDocument::findOrFail($validated['type_document_id']);

        $template = DocumentTemplate::where('type_document_id', $type->id)->first();

        if (!$template) {
            return response()->json([
                'message' => 'Aucun modèle configuré'
            ], 400);
        }

        // CORRECT CHECK
        $canGenerate = in_array($generator->role, $template->roles_autorises);

        /*
        ---------------------------------------
        CASE 1: GENERATOR IS AUTHORIZED
        ---------------------------------------
        */
        if ($canGenerate) {

            $result = $service->generate(
                $targetUser, 
                $type->id,
                $validated['variables'] ?? []
            );

            $status = $canGenerate ? 'approuvee' : 'en_attente';

            $demande = Demande::create([
                'user_id' => $targetUser->id,
                'type_document_id' => $type->id,
                'variables_json' => $result['variables'],
                'file_path' => $result['file_path'],
                'status' => $status ,
                'date_demande' => now(),
            ]);

            return response()->json([
                'message' => 'Document généré avec succès',
                'data' => $demande
            ], 201);
        }

        /*
        ---------------------------------------
        CASE 2: GENERATOR NOT AUTHORIZED → CREATE REQUEST
        ---------------------------------------
        */

        $demande = Demande::create([
            'user_id' => $targetUser->id,
            'type_document_id' => $type->id,
            'variables_json' => $validated['variables'] ?? [],
            'file_path' => null,
            'status' => 'en_attente',
            'date_demande' => now(),
        ]);

        return response()->json([
            'message' => 'Votre demande a été envoyée à RH.',
            'data' => $demande
        ], 201);
    }



    public function update(Request $request, $id)
    {
        $demande = Demande::findOrFail($id);
        $user = $request->user();

        $data = [];

        /*
        RH: can update status + commentaire_rh
        */
        if ($user->role === 'RH') {

            $validated = $request->validate([
                'status' => 'required|in:approuvee,refusee',
                'commentaire_rh' => 'nullable|string',
            ]);

            $data['status'] = $validated['status'];
            $data['commentaire_rh'] = $validated['commentaire_rh'] ?? null;
            $data['date_validation'] = now();
        }

        /*
        Users: can update their own demande fields
        */
        if ($user->id === $demande->user_id) {

            $validated = $request->validate([
                'type_document_id' => 'sometimes|exists:type_documents,id',
                'demandeur_commentaire' => 'sometimes|nullable|string',
            ]);

            if (isset($validated['type_document_id'])) {
                $data['type_document_id'] = $validated['type_document_id'];
            }

            if (isset($validated['demandeur_commentaire'])) {
                $data['demandeur_commentaire'] = $validated['demandeur_commentaire'];
            }
        }

        /*
        If user cannot modify anything
        */
        if (empty($data)) {
            return response()->json([
                'message' => 'Non autorisé à modifier cette demande'
            ], 403);
        }

        if ($demande->status !== 'en_attente') {
            return response()->json([
                'message' => 'Impossible de modifier une demande déjà traitée.'
            ], 400);
        }

        $demande->update($data);

        return response()->json([
            'message' => 'Demande mise à jour avec succès',
            'data' => $demande
        ]);
    }

    public function download(Request $request, $id)
    {
        $demande = Demande::findOrFail($id);
        $user = $request->user();

        if (
            $user->role !== 'RH' &&
            $user->id !== $demande->user_id
        ) {
            return response()->json([
                'message' => 'Accès refusé'
            ], 403);
        }

        return response()->download(
            storage_path('app/public/' . $demande->file_path)
        );
    }
}
