<?php
namespace App\Services;

class HypothesisVerifier
{
    /**
    * Verify H1: "Minimum length is more effective than character class complexity."
    * Compares P2 - Length-Only (12 chars, no complexity) vs P3 - Complex-Only (6 chars, uppercase+digit+symbol).
    */
    public function verifyH1(array $results): array
    {
        $p2 = $results[1]; // P2 - Length-Only (12 chars, no complexity)
        $p3 = $results[2]; // P3 - Complex-Only (6 chars, uppercase+digit+symbol)

        $lengthWins = $p2['avg_zxcvbn_score'] > $p3['avg_zxcvbn_score'];
        $difference = round($p2['avg_zxcvbn_score'] - $p3['avg_zxcvbn_score'], 2);

        return [
            'hypothesis' => 'H1: Minimum length is more effective than character class complexity',
            'verdict' => $lengthWins ? 'SUPPORTED' : 'REJECTED',
            'p2_score' => $p2['avg_zxcvbn_score'],
            'p3_score' => $p3['avg_zxcvbn_score'],
            'difference' => $difference,
            'evidence' => $lengthWins
                ? "P2 (12 chars, no complexity) scored {$p2['avg_zxcvbn_score']} vs P3 (6 chars, uppercase+digit+symbol) scored {$p3['avg_zxcvbn_score']}. Length alone outperformed complexity requirements by {$difference} points."
                : "P2 (12 chars, no complexity) scored {$p2['avg_zxcvbn_score']} vs P3 (6 chars, uppercase+digit+symbol) scored {$p3['avg_zxcvbn_score']}. Length did not outperform complexity in this run.",
            'recommendation' => 'Policies should prioritise minimum length over character class requirements.',
        ];
    }

    /**
     * Verify H2: "Excessive policy rules reduce compliance — rejection rate rises with complexity."
     * Compares P5 (most complex) vs P4 (less complex).
     */
    public function verifyH2(array $results, array $attemptsData): array
    {
        $p4 = $results[3]; // P4 - Corporate
        $p5 = $results[4]; // P5 - Paranoid

        $p4Attempts = $attemptsData[3]['avg_attempts'];
        $p5Attempts = $attemptsData[4]['avg_attempts'];
        $moreAttemptsNeeded = $p5Attempts > $p4Attempts;

        return [
            'hypothesis' => 'H2: Excessive rules increase rejection rate',
            'verdict' => $moreAttemptsNeeded ? 'SUPPORTED' : 'REJECTED',
            'p4_avg_attempts' => round($p4Attempts, 1),
            'p5_avg_attempts' => round($p5Attempts, 1),
            'difference' => round($p5Attempts - $p4Attempts, 1),
            'evidence' => $moreAttemptsNeeded
                ? "P5 required " . round($p5Attempts, 1) . " avg attempts vs P4's " . round($p4Attempts, 1) . ". Paranoid rules cause more generation rejections."
                : 'No measurable rejection rate increase.',
            'recommendation' => 'Avoid excessive rules that frustrate users without measurable security gain.',
        ];
    }
}