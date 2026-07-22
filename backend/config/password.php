<?php
return [
    'policies' => [
        [
            'name' => 'P1 - Lenient',
            'min_length' => 6,
            'require_uppercase' => false,
            'require_digit' => false,
            'require_symbol' => false,
            'no_repeating' => false,
        ],
        [
            'name' => 'P2 - Moderate',
            'min_length' => 8,
            'require_uppercase' => true,
            'require_digit' => true,
            'require_symbol' => false,
            'no_repeating' => false,
        ],
        [
            'name' => 'P3 - Strict (NIST-like)',
            'min_length' => 12,
            'require_uppercase' => false,
            'require_digit' => false,
            'require_symbol' => false,
            'no_repeating' => false,
        ],
        [
            'name' => 'P4 - Corporate',
            'min_length' => 10,
            'require_uppercase' => true,
            'require_digit' => true,
            'require_symbol' => true,
            'no_repeating' => false,
        ],
        [
            'name' => 'P5 - Paranoid',
            'min_length' => 14,
            'require_uppercase' => true,
            'require_digit' => true,
            'require_symbol' => true,
            'no_repeating' => true,
        ],
    ],
];