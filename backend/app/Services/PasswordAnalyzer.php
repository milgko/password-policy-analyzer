<?php
namespace App\Services;

use ZxcvbnPhp\Zxcvbn;

class PasswordAnalyzer
{
    private Zxcvbn $zxcvbn;

    public function __construct()
    {
        $this->zxcvbn = new Zxcvbn();
    }

    /**
     * Analyze a single password.
     */
    public function analyze(string $password): array
    {
        $zxResult = $this->zxcvbn->passwordStrength($password);

        return [
            'password' => $password,
            'length' => strlen($password),
            'zxcvbn_score' => $zxResult['score'],          // 0-4
            'shannon_entropy' => self::shannonEntropy($password),
            'crack_time' => $zxResult['crack_times_seconds']['offline_slow_hashing_1e4_per_second'] ?? 0,
            'feedback' => $zxResult['feedback']['suggestions'] ?? [],
        ];
    }

    /**
     * Analyze a batch and return aggregate statistics.
     */
    public function analyzeBatch(array $passwords): array
    {
        $scores = [];
        $entropies = [];
        $scoreDistribution = [0 => 0, 1 => 0, 2 => 0, 3 => 0, 4 => 0];
        $samplePasswords = [];

        foreach ($passwords as $i => $pwd) {
            $result = $this->analyze($pwd);
            $scores[] = $result['zxcvbn_score'];
            $entropies[] = $result['shannon_entropy'];
            $scoreDistribution[$result['zxcvbn_score']]++;

            if ($i < 10) {
                $samplePasswords[] = $pwd;
            }
        }

        $count = count($passwords);

        return [
            'avg_zxcvbn_score' => round(array_sum($scores) / $count, 2),
            'avg_shannon_entropy' => round(array_sum($entropies) / $count, 1),
            'score4_percentage' => round(($scoreDistribution[4] / $count) * 100, 1),
            'score_distribution' => $scoreDistribution,
            'sample_passwords' => $samplePasswords,
        ];
    }

    /**
     * Shannon entropy: H = sum(-p_i * log2(p_i)) for each character.
     * Approximation: H = L * log2(R) where L = length, R = unique chars used.
     */
    public static function shannonEntropy(string $password): float
    {
        $length = strlen($password);
        if ($length === 0) return 0;

        $uniqueChars = count(array_unique(str_split($password)));

        $poolSize = 0;
        if (preg_match('/[a-z]/', $password)) $poolSize += 26;
        if (preg_match('/[A-Z]/', $password)) $poolSize += 26;
        if (preg_match('/\d/', $password)) $poolSize += 10;
        if (preg_match('/[^a-zA-Z\d]/', $password)) $poolSize += 33;

        $poolSize = max($poolSize, $uniqueChars);

        return $length * log($poolSize, 2);
    }
}