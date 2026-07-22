// realistic-passwords.js — Simulates human password-choosing behaviour
// Mixed approach: 70% random (policy-compliant), 30% human-like patterns

const COMMON_HUMAN_PASSWORDS = [
  'password', 'password1', 'Password1', 'Password1!',
  'qwerty', 'qwerty123', 'Qwerty123!',
  'iloveyou', 'Iloveyou1!',
  'monkey', 'Monkey123!',
  'dragon', 'Dragon1!',
  'master', 'Master123!',
  'shadow', 'Shadow1!',
  'sunshine', 'Sunshine1!',
  'princess', 'Princess1!',
  'football', 'Football1!',
  'baseball', 'Baseball1!',
  'welcome', 'Welcome1!',
  'admin', 'Admin123!',
  'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
  '1qaz2wsx', 'qazwsxedc',
  '123456', '123456789', '12345678',
  'abc123', 'Abc123!',
  'michael', 'Michael1!',
  'jennifer', 'Jennifer1!',
  'jessica', 'Jessica1!',
  'daniel', 'Daniel1!',
  'ashley', 'Ashley1!',
  'summer2024', 'Summer2024!',
  'winter2024', 'Winter2024!',
  'letmein', 'Letmein1!',
  'trustno1', 'Trustno1!',
];

const KEYBOARD_ROWS = [
  '1234567890',
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm'
];

/**
 * Generate a password that mimics real user behaviour.
 * Uses 3 strategies with weighted probability.
 */
function generateHumanLikePassword(policy) {
  const strategy = Math.random();
  if (strategy < 0.4) {
    return mutateCommonPassword(policy);
  } else if (strategy < 0.7) {
    return generateKeyboardPattern(policy);
  } else {
    return generateWordNumberSymbol(policy);
  }
}

/**
 * Strategy 1: Take a common password and mutate it to satisfy the policy.
 */
function mutateCommonPassword(policy) {
  const base = COMMON_HUMAN_PASSWORDS[
    Math.floor(Math.random() * COMMON_HUMAN_PASSWORDS.length)
  ];

  let attempt = base;

  if (policy.requireUppercase && !/[A-Z]/.test(attempt)) {
    attempt = attempt.charAt(0).toUpperCase() + attempt.slice(1);
  }
  if (policy.requireDigit && !/\d/.test(attempt)) {
    attempt = attempt + '1';
  }
  if (policy.requireSymbol && !/[^a-zA-Z0-9]/.test(attempt)) {
    attempt = attempt + '!';
  }
  while (attempt.length < policy.minLength) {
    attempt = attempt + 'a';
  }

  return attempt;
}

/**
 * Strategy 2: Generate a keyboard walk pattern.
 */
function generateKeyboardPattern(policy) {
  const row = KEYBOARD_ROWS[Math.floor(Math.random() * KEYBOARD_ROWS.length)];
  const start = Math.floor(Math.random() * (row.length - 4));
  const length = Math.max(policy.minLength, 6 + Math.floor(Math.random() * 4));

  let pattern = '';
  for (let i = 0; i < length; i++) {
    pattern += row[(start + i) % row.length];
  }

  if (policy.requireUppercase) {
    pattern = pattern.charAt(0).toUpperCase() + pattern.slice(1);
  }
  if (policy.requireDigit && !/\d/.test(pattern)) {
    pattern = pattern.slice(0, -1) + '1';
  }
  if (policy.requireSymbol && !/[^a-zA-Z0-9]/.test(pattern)) {
    pattern = pattern + '!';
  }

  return pattern;
}

/**
 * Strategy 3: Word + separator + number + symbol.
 */
function generateWordNumberSymbol(policy) {
  const words = ['summer', 'winter', 'happy', 'sunny', 'dark', 'blue',
                 'love', 'star', 'moon', 'fire', 'storm', 'ocean'];
  const separators = ['', '-', '_', '.'];

  const word      = words[Math.floor(Math.random() * words.length)];
  const sep       = separators[Math.floor(Math.random() * separators.length)];
  const number    = 1 + Math.floor(Math.random() * 999);
  const symbol    = '!@#$%^&*'[Math.floor(Math.random() * 8)];

  let attempt = word + sep + number + symbol;

  if (policy.requireUppercase && !/[A-Z]/.test(attempt)) {
    attempt = word.charAt(0).toUpperCase() + word.slice(1) + sep + number + symbol;
  }
  while (attempt.length < policy.minLength) {
    attempt = 'a' + attempt;
  }

  return attempt;
}

/**
 * Generate a mixed batch: some human-like, some purely random.
 */
function generateMixedBatch(policy, count, humanRatio = 0.3) {
  const batch = [];
  const humanCount  = Math.floor(count * humanRatio);
  const randomCount = count - humanCount;

  for (let i = 0; i < humanCount; i++) {
    let attempts = 0;
    while (attempts < 50) {
      attempts++;
      const pwd = generateHumanLikePassword(policy);
      if (validatePassword(pwd, policy)) {
        batch.push(pwd);
        break;
      }
    }
  }

  for (let i = 0; i < randomCount; i++) {
    batch.push(generatePassword(policy).password);
  }

  // Shuffle
  for (let i = batch.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [batch[i], batch[j]] = [batch[j], batch[i]];
  }

  return batch;
}