<?php

namespace App\Http\Controllers;

use App\Models\TypeDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TypeDocumentController extends Controller
{
    // GET /api/type-documents
    public function index()
    {
        $typeDocuments = TypeDocument::all(); 
        return response()->json([
            'data' => $typeDocuments
        ]);
    }

    // POST /api/type-documents
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'cible' => 'required|in:salarie,stagiaire',
        ]);

        $type = TypeDocument::create([
            'nom' => $validated['nom'],
            'description' => $validated['description'] ?? null,
            'cible' => $validated['cible'],
            'cree_par' => $request->user()->role,
        ]);

        return response()->json([
            'message' => 'Type de document créé avec succès',
            'data' => $type
        ], 201);
    }

    // GET /api/type-documents/{id}
    public function show($id)
    {
        $type = TypeDocument::with(['templates', 'demandes'])->find($id);

        if (!$type) {
            return response()->json([
                'message' => 'Type de document introuvable'
            ], 404);
        }

        return response()->json($type);
    }

    // PUT /api/type-documents/{id}
    public function update(Request $request, $id)
    {
        $type = TypeDocument::find($id);

        if (!$type) {
            return response()->json([
                'message' => 'Type de document introuvable'
            ], 404);
        }

        $validated = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'cible' => 'sometimes|required|in:salarie,stagiaire',
        ]);

        $type->update($validated);

        return response()->json([
            'message' => 'Type document mis à jour avec succès',
            'data' => $type
        ]);
    }

    // DELETE /api/type-documents/{id}
    public function destroy($id)
    {
        $type = TypeDocument::find($id);

        if (!$type) {
            return response()->json([
                'message' => 'Type document mis à jour avec succès'
            ], 404);
        }

        $type->delete();

        return response()->json([
            'message' => 'Type document supprimé avec succès'
        ]);
    }
}
