<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Demande extends Model
{
    use HasFactory;

    protected $table = 'demandes';

    protected $fillable = [
        'user_id',             
        'type_document_id',
        'variables_json',      
        'file_path',           
        'status',              
        'date_demande',
        'date_validation',
        'commentaire_rh',
    ];

    protected $casts = [
        'variables_json' => 'array',
        'date_demande' => 'date',
        'date_validation' => 'date',
    ];

    public function user(){
        return $this->belongsTo(User::class);
    }


    public function typeDocument(){
        return $this-> belongsTo(TypeDocument::class);
    }

}
