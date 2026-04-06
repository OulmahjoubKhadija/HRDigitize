
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('demandes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('type_document_id')->constrained('type_documents')->cascadeOnDelete();
            
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            $table->json('variables_json');

            $table->string('file_path')->nullable();

            $table->enum('status', ['en_attente', 'approuvee', 'refusee'])->default('en_attente');

            $table->date('date_demande');
            $table->date('date_validation')->nullable();
            $table->text('commentaire_rh')->nullable();

            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('demandes');
    }
};
