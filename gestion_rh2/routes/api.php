<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RH\SalarieController;
use App\Http\Controllers\Auth\ActivationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SocieteController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\StagiaireController;
use App\Http\Controllers\TypeDocumentController;
use App\Http\Controllers\DocumentTemplateController;
use App\Http\Controllers\DemandeController;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Log;
// Public
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::post('/activate-account', [ActivationController::class, 'activate']);
Route::post('/resend-activation-code', [ActivationController::class, 'resendActivationCode']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);

Route::post('/reset-password', function (Request $request) {

    $request->validate([
        'token' => 'required',
        'email' => 'required|email',
        'password' => 'required|min:8|confirmed',
    ]);

    $status = Password::reset(
        $request->only(
            'email',
            'password',
            'password_confirmation',
            'token'
        ),
        function ($user, $password) {
            $user->password = Hash::make($password);
            $user->save();
        }
    );

    if ($status !== Password::PASSWORD_RESET) {
        return response()->json([
            'message' => __($status)
        ], 400);
    }

    return response()->json([
        'message' => 'Mot de passe réinitialisé avec succès'
    ]);
});

Route::middleware('auth:sanctum')->group(function () {

    // Profile & logout
    Route::post('/complete-profile', [SalarieController::class, 'completeProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/stagiaire/complete-profile', [StagiaireController::class, 'completeProfile']);
    Route::post('/stagiaire/logout', [AuthController::class, 'logout']);

    Route::middleware('is.profile.completed')->group(function () {

        // Me routes
        Route::get('/me/employee', [SalarieController::class, 'me']);
        Route::put('/me/employee', [SalarieController::class, 'updateMe']);
        Route::post('/me/employee/delete', [SalarieController::class, 'deleteMe']);

        // Salaries routes
        Route::prefix('salaries')->group(function () {
            Route::get('/', [SalarieController::class, 'index']);
            Route::post('/', [SalarieController::class, 'store']);
            Route::get('archives', [SalarieController::class, 'archives']);
            Route::patch('{salarie}/restore', [SalarieController::class, 'restore']);
            Route::patch('{salarie}/status', [SalarieController::class, 'updateStatus']);

            Route::delete('{salarie}/force', [SalarieController::class, 'forceDelete']);
            Route::get('{salarie}', [SalarieController::class, 'show']);
            Route::put('{salarie}', [SalarieController::class, 'update']);
            Route::delete('{salarie}', [SalarieController::class, 'destroy']);
        });

        // Stagiaires routes
        Route::post('/stgiaires', [StagiaireController::class, 'store']);
        Route::get('stagiaires/archives', [StagiaireController::class, 'archives']);
        Route::patch('stagiaires/{stagiaire}/restore', [StagiaireController::class, 'restore']);
        Route::delete('stagiaires/{stagiaire}/force', [StagiaireController::class, 'forceDelete']);
        Route::patch('stagiaires/{stagiaire}/status', [StagiaireController::class, 'updateStatus']);

        Route::apiResource('stagiaires', StagiaireController::class);
        Route::get('/me/stagiaire', [StagiaireController::class, 'showMe']);
        Route::put('/me/stagiaire', [StagiaireController::class, 'updateMe']);
        Route::post('/me/stagiaire/delete', [StagiaireController::class, 'deleteMe']);

        // Societe & Service routes (not stagiaires)
        Route::middleware('is.not.stagiaire')->group(function () {
            
            // Societe
            Route::get('/societe', [SocieteController::class, 'index']);
            Route::get('/societe/archives', [SocieteController::class, 'archives']);
            Route::get('/societe/{id}', [SocieteController::class, 'show']);

            // Service
            Route::get('/service', [ServiceController::class, 'index']);
            Route::get('/service/archives', [ServiceController::class, 'archives']);
            Route::get('/service/{id}', [ServiceController::class, 'show']);
            Route::get('/service/societe/{societe_id}', [ServiceController::class, 'getBySociete']);
        });
    });

    // Routes requiring RH role
    Route::middleware('role:RH')->group(function () {
        // Societe CRUD
        Route::post('/societe', [SocieteController::class, 'store']);
        Route::put('/societe/{societe}', [SocieteController::class, 'update']);
        Route::delete('/societe/{societe}', [SocieteController::class, 'destroy']);
        Route::patch('/societe/{societe}/restore', [SocieteController::class, 'restore']);
        Route::patch('/service/{service}/restore', [ServiceController::class, 'restore']);

        // Service CRUD
        Route::post('/service', [ServiceController::class, 'store']);
        Route::put('/service/{id}', [ServiceController::class, 'update']);
        Route::delete('/service/{service}', [ServiceController::class, 'destroy']);
    });

    /*
    |--------------------------------------------------------------------------
    | DEMANDES
    |--------------------------------------------------------------------------
    */

    // List my demandes
    Route::get('/demandes', [DemandeController::class, 'index']);

    // Create demande (generate document)
    Route::post('/demandes', [DemandeController::class, 'store']);

    // Download generated document
    Route::get('/demandes/{id}/download', [DemandeController::class, 'download']);

    // RH validates demande
    Route::patch('/demandes/{id}', 
        [DemandeController::class, 'update']
    )->middleware('role:RH');


    /*
    |--------------------------------------------------------------------------
    | DOCUMENT TEMPLATES
    |--------------------------------------------------------------------------
    */

    // List templates
    Route::get('/document-templates', 
        [DocumentTemplateController::class, 'index']
    );

    // Store templates
    Route::post('/document-templates', 
    [DocumentTemplateController::class, 'store']
    )->middleware('role:RH');

    // Update template (only RH)
    Route::put('/document-templates/{id}', 
        [DocumentTemplateController::class, 'update']
    )->middleware('role:RH');

    // Delete template (only RH)
    Route::delete('/document-templates/{id}', 
        [DocumentTemplateController::class, 'destroy']
    )->middleware('role:RH');
    
    /*
    |--------------------------------------------------------------------------
    | TYPE DOCUMENTS
    |--------------------------------------------------------------------------
    */

    // List document types
    Route::get('/type-documents', 
        [TypeDocumentController::class, 'index']
    );

    // Create document type (only RH)
    Route::post('/type-documents', 
        [TypeDocumentController::class, 'store']
    )->middleware('role:RH');

    // Update type document
    Route::put('/type-documents/{id}', [TypeDocumentController::class, 'update'])
     ->middleware('role:RH');

    // Delete
    Route::delete('/type-documents/{id}', [TypeDocumentController::class, 'destroy'])
     ->middleware('role:RH');
});