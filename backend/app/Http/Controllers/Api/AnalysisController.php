<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AnalysisRun;
use App\Models\PolicyResult;
use App\Services\PasswordAnalyzer;
use App\Services\PasswordGenerator;
use App\Services\HypothesisVerifier;
use Illuminate\Http\Request;

class AnalysisController extends Controller
{
    /**
     * POST /api/analyze — Run full analysis across all 5 policies.
     */
    public function store(
        Request $request,
        PasswordGenerator $generator,
        PasswordAnalyzer $analyzer,
        HypothesisVerifier $verifier
    ) {
        $validated = $request->validate([
            'password_count' => 'integer|min:10|max:1000',
            'generator_type' => 'in:random,mixed',
        ]);

        $count = $validated['password_count'] ?? 100;
        $type = $validated['generator_type'] ?? 'random';

        $run = AnalysisRun::create([
            'name' => "Analysis Run — " . $type . " — " . now()->format('Y-m-d H:i'),
            'generator_type' => $type,
            'passwords_per_policy' => $count,
            'total_passwords' => $count * 5,
        ]);

        $policies = $generator->getPolicies();
        $allResults = [];
        $attemptsData = [];

        foreach ($policies as $policy) {
            $batch = $generator->generateBatch($policy, $count);
            $analysis = $analyzer->analyzeBatch($batch['passwords']);

            PolicyResult::create([
                'analysis_run_id' => $run->id,
                'policy_name' => $policy['name'],
                'min_length' => $policy['min_length'],
                'require_uppercase' => $policy['require_uppercase'],
                'require_digit' => $policy['require_digit'],
                'require_symbol' => $policy['require_symbol'],
                'no_repeating' => $policy['no_repeating'],
                'avg_zxcvbn_score' => $analysis['avg_zxcvbn_score'],
                'avg_shannon_entropy' => $analysis['avg_shannon_entropy'],
                'avg_generation_attempts' => round($batch['avg_attempts'], 1),
                'score4_percentage' => $analysis['score4_percentage'],
                'passwords_generated' => $count,
                'sample_passwords' => $analysis['sample_passwords'],
                'score_distribution' => $analysis['score_distribution'],
            ]);

            $allResults[] = $analysis;
            $attemptsData[] = $batch;
        }

        $h1 = $verifier->verifyH1($allResults);
        $h2 = $verifier->verifyH2($allResults, $attemptsData);

        $run->update(['completed_at' => now()]);

        return response()->json([
            'run_id' => $run->id,
            'generator_type' => $type,
            'passwords_per_policy' => $count,
            'hypotheses' => [
                'H1' => $h1,
                'H2' => $h2,
            ],
            'policy_results' => $run->policyResults->map(fn($r) => [
                'policy' => $r->policy_name,
                'avg_zxcvbn' => $r->avg_zxcvbn_score,
                'avg_entropy' => $r->avg_shannon_entropy . ' bits',
                'avg_attempts' => $r->avg_generation_attempts,
                'score4_percent' => $r->score4_percentage . '%',
            ]),
        ]);
    }

    /**
     * GET /api/analyze/{id} — Get a specific analysis run.
     */
    public function show(int $id)
    {
        $run = AnalysisRun::with('policyResults')->findOrFail($id);
        return response()->json($run);
    }

    /**
     * GET /api/analyze — List all runs.
     */
    public function index()
    {
        return AnalysisRun::with('policyResults')->latest()->take(20)->get();
    }

    /**
     * GET /api/analyze/{id}/export — CSV export.
     */
    public function export(int $id)
    {
        $run = AnalysisRun::with('policyResults')->findOrFail($id);

        $csv = "Policy,Min Length,Avg zxcvbn,Avg Entropy (bits),Avg Attempts,Score 4/4 %,Passwords\n";
        foreach ($run->policyResults as $r) {
            $csv .= implode(',', [
                $r->policy_name,
                $r->min_length,
                $r->avg_zxcvbn_score,
                $r->avg_shannon_entropy,
                $r->avg_generation_attempts,
                $r->score4_percentage,
                $r->passwords_generated,
            ]) . "\n";
        }

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="analysis-run-'.$id.'.csv"',
        ]);
    }
}