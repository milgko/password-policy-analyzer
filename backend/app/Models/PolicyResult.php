<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PolicyResult extends Model
{
    protected $fillable = [
        'analysis_run_id', 'policy_name', 'min_length',
        'require_uppercase', 'require_digit', 'require_symbol', 'no_repeating',
        'avg_zxcvbn_score', 'avg_shannon_entropy', 'avg_generation_attempts',
        'score4_percentage', 'passwords_generated',
        'sample_passwords', 'score_distribution',
    ];
    protected $casts = [
        'require_uppercase' => 'boolean',
        'require_digit' => 'boolean',
        'require_symbol' => 'boolean',
        'no_repeating' => 'boolean',
        'sample_passwords' => 'array',
        'score_distribution' => 'array',
    ];

    public function analysisRun(): BelongsTo
    {
        return $this->belongsTo(AnalysisRun::class);
    }
}
