<?php

namespace App\Http\Controllers;

use App\Models\DocumentTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

use PhpOffice\PhpWord\IOFactory;

class DocumentTemplateController extends Controller
{
    // GET /api/document-templates
    public function index()
    {
        $templates = DocumentTemplate::with(['typeDocument'])
            ->paginate(10);

        return response()->json($templates);
    }

    // POST /api/document-templates
    public function store(Request $request)
    {
        if ($request->user()->role !== 'RH') {
            return response()->json(['message'=>'Seul RH peut gérer les modèles.'],403);
        }

        $validated = $request->validate([
            'type_document_id' => 'required|exists:type_documents,id',
            'template_path' => 'required|file|mimes:docx',
            'variable_json' => 'nullable|array',
            'roles_autorises' => 'required|array',
            'roles_autorises.*' => 'in:RH,SALARIE,CHEF_SERVICE,STAGIAIRE',
        ]);

        $user = $request->user();


        $filePath = $request->file('template_path')->store('document_templates','public');

        // Extract variables from docx
        $docVariables = $this->extractVariablesFromDocx($request->file('template_path'));

        $allVariables = array_unique(array_merge($validated['variable_json'] ?? [], $docVariables));

        $template = DocumentTemplate::create([
            'type_document_id' => $validated['type_document_id'],
            'template_path' => $filePath,
            'variable_json' => $allVariables,
            'roles_autorises' => $validated['roles_autorises'],
        ]);

        return response()->json($template,201);
    }

    // GET /api/document-templates/{id}
    public function show($id)
    {
        $template = DocumentTemplate::with(['typeDocument'])->find($id);

        if (!$template) {
            return response()->json(['message' => 'Modèle introuvable'], 404);
        }

        return response()->json($template);
    }

    // PUT /api/document-templates/{id}
    public function update(Request $request, $id)
    {
        $template = DocumentTemplate::find($id);

        if (!$template) {
            return response()->json(['message' => 'Modèle introuvable'], 404);
        }

        $validated = $request->validate([
            'variable_json' => 'nullable|array',
            'variable_json.*' => 'string',
            'roles_autorises' => 'nullable|array',
            'roles_autorises.*' => 'in:RH,SALARIE,CHEF_SERVICE,STAGIAIRE',
            'template_path' => 'sometimes|file|mimes:doc,docx|max:2048',
            'type_document_id' => 'sometimes|exists:type_documents,id',
        ]);

        // Validate variables against config
        if (isset($validated['variable_json'])) {
            $allowedVariables = collect(config('document_variables.common'))
                ->merge(config('document_variables.stagiaire'))
                ->merge(config('document_variables.salarie'))
                ->merge(config('document_variables.mission'))
                ->merge(config('document_variables.materiel'))
                ->merge(config('document_variables.conge'))
                ->toArray();

            foreach ($validated['variable_json'] as $variable) {
                if (!in_array($variable, $allowedVariables)) {
                    return response()->json([
                        'message' => "La variable '{$variable}' n'est pas autorisée par le système."
                    ], 422);
                }
            }
        }

        if ($request->has('variable_json') && is_string($request->variable_json)) {
            $validated['variable_json'] = json_decode($request->variable_json, true) ?? [];
        }

        if ($request->has('roles_autorises') && is_string($request->roles_autorises)) {
            $validated['roles_autorises'] = json_decode($request->roles_autorises, true) ?? [];
        }

        // Handle file replacement
        if ($request->hasFile('template_path')) {
            if ($template->template_path) {
                Storage::disk('public')->delete($template->template_path);
            }

            $filePath = $request->file('template_path')->store('document_templates', 'public');
            $validated['template_path'] = $filePath;

            // Merge variables from docx with existing or frontend
            $docVariables = $this->extractVariablesFromDocx($request->file('template_path'));
            $validated['variable_json'] = array_unique(array_merge(
                $template->variable_json ?? [],
                $validated['variable_json'] ?? [],
                $docVariables
            ));
        }

        // Update using array_key_exists so empty arrays are respected
        $template->update([
            'type_document_id' => array_key_exists('type_document_id', $validated) ? $validated['type_document_id'] : $template->type_document_id,
            'roles_autorises' => array_key_exists('roles_autorises', $validated) ? $validated['roles_autorises'] : $template->roles_autorises,
            'variable_json' => array_key_exists('variable_json', $validated) ? $validated['variable_json'] : $template->variable_json,
            'template_path' => array_key_exists('template_path', $validated) ? $validated['template_path'] : $template->template_path,
        ]);

        return response()->json([
            'message' => 'Modèle mis à jour avec succès',
            'data' => $template->fresh()
        ]);
    }

    // DELETE /api/document-templates/{id}
    public function destroy($id)
    {
        $template = DocumentTemplate::find($id);

        if (!$template) {
            return response()->json(['message' => 'Modèle introuvable'], 404);
        }

        if ($template->template_path) {
            Storage::disk('public')->delete($template->template_path);
        }

        $template->delete();

        return response()->json(['message' => 'Modèle supprimé avec succès']);
    }

    // Extract variables from docx
    private function extractVariablesFromDocx($file)
    {
        $phpWord = IOFactory::load($file);
        $content = '';

        foreach ($phpWord->getSections() as $section) {
            foreach ($section->getElements() as $element) {
                if (method_exists($element, 'getText')) {
                    $content .= $element->getText() . ' ';
                }
            }
        }

        preg_match_all('/\$\{(\w+)\}/', $content, $matches);

        return $matches[1] ?? [];
    }
}
