<?php
namespace App\Services;

class PasswordGenerator
{
    private const CHARSETS = [
        'lowercase' => 'abcdefghijklmnopqrstuvwxyz',
        'uppercase' => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        'digits' => '0123456789',
        'symbols' => '!@#$%^&*()_+-=[]{}|;:,.<>?',
    ];

    private array $policies = [];

    public function __construct()
    {
        $this->policies = config('password.policies');
    }

    public function generate(array $policy): string
    {
        $charset = self::CHARSETS['lowercase'];
        if ($policy['require_uppercase']) $charset .= self::CHARSETS['uppercase'];
        if ($policy['require_digit'])     $charset .= self::CHARSETS['digits'];
        if ($policy['require_symbol'])    $charset .= self::CHARSETS['symbols'];

        $password = '';
        for ($i = 0; $i < $policy['min_length']; $i++) {
            $password .= $charset[random_int(0, strlen($charset) - 1)];
        }

        return $password;
    }

    public function generateBatch(array $policy, int $count): array
    {
        $passwords = [];
        $totalAttempts = 0;

        for ($i = 0; $i < $count; $i++) {
            $attempts = 0;
            do {
                $attempts++;
                $password = $this->generate($policy);
            } while (!$this->validate($password, $policy) && $attempts < 100);

            $passwords[] = $password;
            $totalAttempts += $attempts;
        }

        return [
            'passwords' => $passwords,
            'total_attempts' => $totalAttempts,
            'avg_attempts' => $totalAttempts / $count,
        ];
    }

    public function validate(string $password, array $policy): bool
    {
        if (strlen($password) < $policy['min_length']) return false;
        if ($policy['require_uppercase'] && !preg_match('/[A-Z]/', $password)) return false;
        if ($policy['require_digit']     && !preg_match('/\d/', $password)) return false;
        if ($policy['require_symbol']    && !preg_match('/[^a-zA-Z\d]/', $password)) return false;
        if ($policy['no_repeating']      && preg_match('/(.)\1/', $password)) return false;
        return true;
    }

    public function getPolicies(): array { return $this->policies; }
}