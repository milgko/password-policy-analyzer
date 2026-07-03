// policies.js — Password policy definitions
const POLICIES = [
  {
    id: 'P1',
    name: 'Lenient',
    description: 'Min 6 chars, no complexity requirements',
    minLength: 6,
    maxLength: 64,
    requireUppercase: false,
    requireLowercase: false,
    requireDigit: false,
    requireSymbol: false,
    noRepeating: false,
    testsHypothesis: 'baseline'
  },
  {
    id: 'P2',
    name: 'Length-Only',
    description: 'Min 12 chars, no complexity requirements',
    minLength: 12,
    maxLength: 64,
    requireUppercase: false,
    requireLowercase: false,
    requireDigit: false,
    requireSymbol: false,
    noRepeating: false,
    testsHypothesis: 'H1'
  },
  {
    id: 'P3',
    name: 'Complex-Only',
    description: 'Min 6 chars, must have uppercase + digit + symbol',
    minLength: 6,
    maxLength: 64,
    requireUppercase: true,
    requireLowercase: false,
    requireDigit: true,
    requireSymbol: true,
    noRepeating: false,
    testsHypothesis: 'H1'
  },
  {
    id: 'P4',
    name: 'Standard',
    description: 'Min 8 chars, uppercase + lowercase + digit',
    minLength: 8,
    maxLength: 64,
    requireUppercase: true,
    requireLowercase: true,
    requireDigit: true,
    requireSymbol: false,
    noRepeating: false,
    testsHypothesis: 'reference'
  },
  {
    id: 'P5',
    name: 'Paranoid',
    description: 'Min 12 chars, all char types, no repeating chars',
    minLength: 12,
    maxLength: 64,
    requireUppercase: true,
    requireLowercase: true,
    requireDigit: true,
    requireSymbol: true,
    noRepeating: true,
    testsHypothesis: 'H2'
  }
];

// Character sets used by the generator
const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?'
};