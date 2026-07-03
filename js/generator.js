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

// Placeholder 
function validatePassword(password, policy) {
  return true; // accept everything for now
}