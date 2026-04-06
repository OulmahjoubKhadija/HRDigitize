<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'type_document_id',
        'template_path',
        'roles_autorises',
        'variable_json',
    ];

    protected $casts = [
        'variable_json' => 'array',
        'roles_autorises' => 'array',
    ];

    // Relations

    public function typeDocument()
    {
        return $this->belongsTo(TypeDocument::class);
    }
}
