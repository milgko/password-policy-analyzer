// generator.js — Password generation engine

/**
 * Generate a single password that satisfies the given policy.
 * Uses rejection sampling: generates random passwords until one passes.
 * @param {Object} policy — one of the POLICIES objects
 * @returns {Object} { password, attempts } — the password + how many tries it took
 */
function generatePassword(policy) {
  let password = '';
  let attempts = 0;

  do {
    password = '';
    attempts++;

  
    const length = randomInt(policy.minLength, policy.maxLength);

    
    let pool = CHARSETS.lowercase; 

    if (policy.requireUppercase) pool += CHARSETS.uppercase;
    if (policy.requireDigit)     pool += CHARSETS.digits;
    if (policy.requireSymbol)    pool += CHARSETS.symbols;

   
    for (let i = 0; i < length; i++) {
      password += pool[randomInt(0, pool.length - 1)];
    }

  } while (!validatePassword(password, policy));

  return { password, attempts };
}

/**
 * Generate a batch of passwords for a policy.
 * @param {Object} policy
 * @param {number} count — how many passwords to generate (default 100)
 * @returns {Array} array of { password, attempts }
 */
function generateBatch(policy, count = 100) {
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push(generatePassword(policy));
  }
  return results;
}

/**
 * Generate a random integer between min and max (inclusive).
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Validate that a password satisfies all rules of a policy.
 * @param {string} password
 * @param {Object} policy
 * @returns {boolean} true if password complies with all rules
 */
function validatePassword(password, policy) {
  // Rule 1: Minimum length
  if (password.length < policy.minLength) {
    return false;
  }
  // Rule 2: Maximum length
  if (password.length > policy.maxLength) {
    return false;
  }
  // Rule 3: Must contain at least one uppercase letter
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    return false;
  }
  // Rule 4: Must contain at least one lowercase letter
  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    return false;
  }
  // Rule 5: Must contain at least one digit
  if (policy.requireDigit && !/[0-9]/.test(password)) {
    return false;
  }
  // Rule 6: Must contain at least one symbol
  if (policy.requireSymbol && !/[!@#$%^&*()\-_=+\[\]{}|;:,.<>?]/.test(password)) {
    return false;
  }
  // Rule 7: No consecutive repeating characters
  if (policy.noRepeating && /(.)\1/.test(password)) {
    return false;
  }
  return true;
}