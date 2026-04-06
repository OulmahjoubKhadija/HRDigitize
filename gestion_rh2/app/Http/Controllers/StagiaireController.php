<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use App\Models\Stagiaire;
use App\Http\Resources\StagiaireResource;
use App\Mail\ActivationCodeStagiaireMail;

class StagiaireController extends Controller
{
    /* =====================================================
     |  CREATE STAGIAIRE
     ===================================================== */
    public function store(Request $request)
    {
        $this->authorize('create', Stagiaire::class);

        return DB::transaction(function () use ($request) {

            $authUser = $request->user();

            /* ===============================
            | 1. Validation
            =============================== */
            $rules = [
                'cin' => 'required|string|max:20',
                'nom' => 'required|string',
                'prenom' => 'required|string',
                'email' => 'required|email|unique:users,email',
                'societe_id' => 'required|exists:societe,id',
                'service_id' => 'required|exists:service,id',
                'date_debut' => 'nullable|date',
                'date_fin' => 'nullable|date',
                'status' => 'nullable|in:En stage,Fin de stage,Interrompu,Archivé',
            ];

            // RH must explicitly choose encadrant
            if ($authUser->role === 'RH') {
                $rules['encadrant_id'] = 'required|exists:salarie,id';
            }

            $validated = $request->validate($rules);

            /* ===============================
            | 2. Encadrant logic
            =============================== */
            if ($authUser->role !== 'RH') {

                if (!$authUser->salarie_id) {
                    return response()->json([
                        'message' => 'Votre compte n’est pas lié à un profil salarié'
                    ], 403);
                }

                $validated['encadrant_id'] = $authUser->salarie_id;
            }

            /* ===============================
            | 3. Service ↔ Société integrity
            =============================== */
            $serviceBelongsToSociete = DB::table('service')
                ->where('id', $validated['service_id'])
                ->where('societe_id', $validated['societe_id'])
                ->exists();

            if (!$serviceBelongsToSociete) {
                return response()->json([
                    'message' => 'Le service sélectionné ne correspond pas à la société'
                ], 422);
            }

            /* ===============================
            | 4. Create USER (auth account)
            =============================== */
            $activationCode = random_int(100000, 999999);

            $stagiaireUser = User::create([
                'name' => $validated['nom'] . ' ' . $validated['prenom'],
                'email' => $validated['email'],
                'password' => Hash::make($activationCode),
                'role' => 'STAGIAIRE',
                'registration_code' => $activationCode,
                'activation_expires_at' => now()->addHours(72),
                'is_active' => false,
                'is_profile_completed' => false,
                'salarie_id' => $authUser->salarie_id, 
            ]);

            /* ===============================
            | 5. Create STAGIAIRE profile
            =============================== */
            $stagiaire = Stagiaire::create([
                'user_id' => $stagiaireUser->id,
                'cin'=> $validated['cin'],
                'nom' => $validated['nom'],
                'prenom' => $validated['prenom'],
                'email' => $validated['email'],

                'societe_id' => $validated['societe_id'],
                'service_id' => $validated['service_id'],
                'encadrant_id' => $validated['encadrant_id'],

                'date_debut' => $validated['date_debut'] ?? null,
                'date_fin' => $validated['date_fin'] ?? null,
                'status' => $validated['status'] ?? 'En stage',
            ]);



            /* ===============================
            | 6. Send activation email
            =============================== */
            try {
                Mail::to($stagiaireUser->email)
                    ->send(new ActivationCodeStagiaireMail(
                        $activationCode,
                        $stagiaireUser->email
                    ));
            } catch (\Throwable $e) {
                Log::warning('Activation email not sent', [
                    'email' => $stagiaireUser->email,
                    'error' => $e->getMessage(),
                ]);
            }

            return new StagiaireResource($stagiaire);
        });
    }



    /* =====================================================
     |  UPDATE STAGIAIRE
     ===================================================== */
    public function update(Request $request, $id)
    {
        $stagiaire = Stagiaire::find($id);

        if (!$stagiaire) {
            return response()->json([
                'message' => 'Stagiaire introuvable'
            ], 404);
        }

        $this->authorize('update', $stagiaire);

        $authUser = $request->user();

        $rules = [
            'cin'   => 'sometimes|nullable|string|max:20',
            'date_debut' => 'sometimes|nullable|date',
            'date_fin' => 'sometimes|nullable|date',
            'status' => 'sometimes|nullable|in:En stage,Fin de stage,Interrompu,Archivé',
            'societe_id' => 'sometimes|nullable|exists:societe,id',
            'service_id' => 'sometimes|nullable|exists:service,id',
        ];

        if ($authUser->role === 'RH') {
            $rules['encadrant_id'] = 'nullable|exists:salarie,id';
        }

        $validated = $request->validate($rules);

        if ($authUser->role !== 'RH') {
            unset($validated['encadrant_id']);
        }

        $stagiaire->update($validated);

        return new StagiaireResource($stagiaire->fresh());
    }

    /* =====================================================
     |  LIST STAGIAIRES
     ===================================================== */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Stagiaire::class);

        $search = $request->query('search');
        $perPage = $request->query('per_page', 10);

        $query = Stagiaire::with(['societe', 'service', 'stagiaireUser', 'encadrant'])
            ->whereHas('stagiaireUser', function ($q) {
                $q->where('is_active', true)
                ->where('is_profile_completed', true);
            });

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                ->orWhere('prenom', 'like', "%{$search}%")
                ->orWhere('cin', 'like', "%{$search}%")
                ->orWhereHas('societe', fn ($q2) =>
                    $q2->where('nom', 'like', "%{$search}%")
                )
                ->orWhereHas('service', fn ($q3) =>
                    $q3->where('nom', 'like', "%{$search}%")
                )
                ->orWhereHas('encadrant', fn ($q4) =>
                    $q4->where('nom', 'like', "%{$search}%")
                        ->orWhere('prenom', 'like', "%{$search}%")
                        ->orWhere('cin', 'like', "%{$search}%")
                );
            });
        }

        return StagiaireResource::collection(
            $query->paginate($perPage)
        );
    }


    /* =====================================================
     |  SHOW STAGIAIRE
     ===================================================== */
    public function show(Stagiaire $stagiaire)
    {
        $this->authorize('view', $stagiaire);

        $user = auth()->user();

        if ($user->role !== 'RH' && $stagiaire->encadrant_id !== $user->salarie?->id && $user->id !== $stagiaire->user_id) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        return new StagiaireResource($stagiaire);
    }

    /* ==============================================================
     | SOFT DELETE (deactivate the STAGIAIRE account BY THE RH ONLY)
     ================================================================ */
    public function destroy(Stagiaire $stagiaire)
    {
        $this->authorize('delete', $stagiaire);

        $user = $stagiaire->stagiaireUser;

        if (!$user) {
            return response()->json([
                'message' => 'Aucun compte utilisateur associé à ce stagiaire.'
            ], 404);
        }

        if ($user->is_archived) {
            return response()->json([
                'message' => 'Ce stagiaire est déjà archivé.',
                'debug' => [
                    'user_id' => $user->id,
                    'is_active' => $user->is_active,
                ]
            ], 400);
        }


        $user->update([
            'is_archived' => true,
            'archived_at' => now(),
            'is_active' => false
        ]);

        return response()->json([
            'message' => 'Stagiaire archivé avec succès.'
        ]);
    }

     /* ============================
       ARCHIVE THE DELETED STAGIARE
    ================================ */
    public function archives(Request $request)
    {
        $search = $request->query('search');
        $perPage = $request->query('per_page', 1);

        $query = Stagiaire::with(['societe', 'service', 'stagiaireUser'])
            ->whereHas('stagiaireUser', function($q) {
                $q->where('is_active', false)
                  ->where('is_archived', true)
                  ->where('is_profile_completed', true);
            });
            if ($search) {
            $query->where(fn($q) =>
                $q->where('nom', 'like', "%{$search}%")
                ->orWhere('prenom', 'like', "%{$search}%")
                ->orWhere('cin', 'like', "%{$search}%")
            );
        }

        $stagiaires = $query->orderByDesc('id')->paginate($perPage);

        $stagiaires->getCollection()->transform(function ($stagiaire) {
            $stagiaire->archived_at = $stagiaire->stagiaireUser->archived_at ?? null;
            return $stagiaire;
        });

        return StagiaireResource::collection($stagiaires);
    }

    /* ===============================
       RESTORE THE ARCHIVED STAGIARE
    ================================== */
    public function restore(Stagiaire $stagiaire)
    {
        $this->authorize('update', $stagiaire);

        $user = $stagiaire->stagiaireUser;

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur introuvable.'
            ], 404);
        }

        if ($user->is_active) {
            return response()->json([
                'message' => 'Le stagiaire est déjà actif.'
            ], 400);
        }

        $user->update([
                'is_archived' => false,
                'archived_at' => null,
                'is_active' => true
            ]);

        return response()->json([
            'message' => 'Le stagiaire a été réactivé avec succès.',
            'stagiaire_id'=> $stagiaire->id
        ]);
    }

    /* =================================
       PREMANENTLY DELETE THE STAGIAIRE
    ==================================== */
    public function forceDelete(Stagiaire $stagiaire)
    {
        $this->authorize('delete', $stagiaire);

        $user = $stagiaire->stagiaireUser;

        if ($user && $user->is_active) {
            return response()->json([
                'message' => 'Vous devez d’abord archiver le stagiaire avant de le supprimer définitivement.'
            ], 400);
        }

        if ($user) {
            $user->delete();
        }

        $stagiaire->delete();

        return response()->json([
            'message' => 'Le stagiaire a été supprimé définitivement.'
        ]);
    }


    public function updateStatus(Request $request, Stagiaire $stagiaire)
    {
        $this->authorize('update', $stagiaire);

        $request->validate([
            'status' => 'required|in:Fin de stage,Interrompu,Archivé',
        ]);

        $stagiaire->update([
            'status' => $request->status,
        ]);

        return response()->json([
            'message' => 'Statut mis à jour.',
            'status' => $stagiaire->status,
        ]);
    }

    

    /* =====================================================
     |  COMPLETE PROFILE (STAGIAIRE)
     ===================================================== */
    public function completeProfile(Request $request)
    { 
        $user = $request->user(); 
        if ($user->role !== 'STAGIAIRE') { 
            return response()->json(['message' => 'Accès refusé'], 403); 
            } 

            $stagiaire = Stagiaire::where('user_id', $user->id)->firstOrFail(); 

            $this->authorize('update', $stagiaire);

            $validated = $request->validate([
                //  'cin' => 'required|string|unique:stagiaire,cin,' . $stagiaire->id, 
                 'sexe' => 'required|in:Monsieur,Madame', 
                 'telephone' => 'required|string', 
                 'filiere' => 'required|string', 
                 'cv' => 'nullable|file|mimes:pdf,doc,docx|max:2048', 
                 'demande_stage' => 'nullable|file|mimes:pdf,doc,docx|max:2048', 
                 'fiche_reussite' => 'nullable|file|mimes:pdf,doc,docx|max:2048', 
                 'accord_stage' => 'nullable|file|mimes:pdf,doc,docx|max:2048', 
                 'entreprise_accueil' => 'nullable|file|mimes:pdf,doc,docx|max:2048', 
                 'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:1024', ]); 
                 
                 $fileFields = ['cv', 'demande_stage', 'fiche_reussite', 'accord_stage', 'entreprise_accueil', 'photo']; 
                 foreach ($fileFields as $field) { 
                    if ($request->hasFile($field)) { $validated[$field] = $request->file($field)->store('stagiaires/' . $user->id, 'public'); } 
                    } $stagiaire->update($validated); 
                    $user->update(['is_profile_completed' => true]); 
                    return new StagiaireResource($stagiaire); 
    }

    /* =====================================================
     |  SHOW AUTHENTICATED STAGIAIRE PROFILE
     ===================================================== */
    public function showMe()
    {
        $user = auth()->user();

        if ($user->role !== 'STAGIAIRE') {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $stagiaire = Stagiaire::with(['societe','service','encadrant'])
            ->where('user_id', $user->id)
            ->firstOrFail();

        $this->authorize('view', $stagiaire);

        return new StagiaireResource($stagiaire);
    }

    /* =====================================================
     |  UPDATE AUTHENTICATED STAGIAIRE PROFILE
     ===================================================== */
    public function updateMe(Request $request)
    {
        $user = auth()->user();

        if ($user->role !== 'STAGIAIRE') {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $stagiaire = Stagiaire::where('user_id', $user->id)->firstOrFail();
        
        $this->authorize('update', $stagiaire);

        $validated = $request->validate([
            // 'cin' => 'sometimes|nullable|string|unique:stagiaire,cin,' . $stagiaire->id,
            'sexe' => 'sometimes|nullable|in:Monsieur,Madame',
            'nom' => 'sometimes|nullable|string',
            'prenom' => 'sometimes|nullable|string',
            'email' => 'sometimes|nullable|email|unique:users,email,' . $user->id,
            'telephone' => 'sometimes|nullable|string',
            'filiere' => 'sometimes|nullable|string',
            'cv' => 'sometimes|nullable|file|mimes:pdf,doc,docx|max:2048',
            'demande_stage' => 'sometimes|nullable|file|mimes:pdf,doc,docx|max:2048',
            'fiche_reussite' => 'sometimes|nullable|file|mimes:pdf,doc,docx|max:2048',
            'accord_stage' => 'sometimes|nullable|file|mimes:pdf,doc,docx|max:2048',
            'entreprise_accueil' => 'sometimes|nullable|file|mimes:pdf,doc,docx|max:2048',
            'photo' => 'sometimes|nullable|image|mimes:jpeg,png,jpg|max:1024',
        ]);

        $fileFields = ['cv','demande_stage','fiche_reussite','accord_stage','entreprise_accueil','photo'];
        foreach ($fileFields as $field) {
            if ($request->hasFile($field)) {
                $validated[$field] = $request->file($field)->store('stagiaire/' . $user->id, 'public');
            }
        }

        // Email sync
          if(isset($validated['email'])){
              $user->update(['email' => $validated['email']]);
              $stagiaire->update(['email' => $validated['email']]);
              unset($validated['email']);
           }

        if (count($validated)) {
            $stagiaire->update($validated); 
        }

        // resync users.name if nom OR prenom changed
        if (
            array_key_exists('nom', $validated) ||
            array_key_exists('prenom', $validated)
        ) {
            $stagiaire->refresh(); // get latest values

            $user->update([
                'name' => trim($stagiaire->nom . ' ' . $stagiaire->prenom),
            ]);
        }

        return new StagiaireResource($stagiaire->fresh(['societe','service','encadrant']));
    }

    /* =====================================================
     |  DELETE FILES FROM AUTHENTICATED STAGIAIRE PROFILE
     ===================================================== */
    public function deleteMe(Request $request)
    {
        $user = auth()->user();

        if ($user->role !== 'STAGIAIRE') {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $stagiaire = Stagiaire::where('user_id', $user->id)->firstOrFail();

        $this->authorize('update', $stagiaire);

        foreach ($request->all() as $key => $value) {
            if ($value && str_starts_with($key, 'delete_')) {
                $field = str_replace('delete_', '', $key);
                if (in_array($field, ['cv','demande_stage','fiche_reussite','accord_stage','entreprise_accueil','photo'])) {
                    if ($stagiaire->$field) {
                        Storage::disk('public')->delete($stagiaire->$field);
                        $stagiaire->$field = null;
                    }
                }
            }
        }

        $stagiaire->save();

        return new StagiaireResource($stagiaire->fresh(['societe','service','encadrant']));
    }
}
