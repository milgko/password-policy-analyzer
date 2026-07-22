<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AnalysisRun extends Model
{
    protected $fillable = [
        'name', 'generator_type', 'passwords_per_policy',
        'total_passwords', 'completed_at',
    ];
    protected $casts = ['completed_at' => 'datetime'];

    public function policyResults(): HasMany
    {
        return $this->hasMany(PolicyResult::class);
    }
}
