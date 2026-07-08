/**
 * Analyze a single password and return strength metrics.
 * @param {string} password
 * @returns {Object} strength metrics
 */
function analyzePassword(password) {
  const zx = zxcvbn(password);

  return {
    password: password,
    length: password.length,
    // Shannon entropy (bits) — mathematical measure of randomness
    shannonEntropy: calculateShannonEntropy(password),
    // zxcvbn score: 0 = too guessable, 4 = very unguessable
    zxcvbnScore: zx.score,
    // Crack time estimate (human-readable)
    crackTimeDisplay: zx.crack_times_display.offline_slow_hashing_1e4_per_second,
    // Crack time in seconds (for numerical comparison)
    crackTimeSeconds: zx.crack_times_seconds.offline_slow_hashing_1e4_per_second,
    // zxcvbn feedback
    feedback: zx.feedback
  };
}

/**
 * Calculate Shannon entropy for a password.
 * Higher = more random = harder to guess.
 * Formula: H = L × log₂(N)
 *   L = password length
 *   N = size of character pool used
 *
 * @param {string} password
 * @returns {number} entropy in bits
 */
function calculateShannonEntropy(password) {
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;  // lowercase
  if (/[A-Z]/.test(password)) poolSize += 26;  // uppercase
  if (/[0-9]/.test(password)) poolSize += 10;  // digits
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;  // symbols

  if (poolSize === 0) return 0;

  // H = L × log₂(N)
  return password.length * Math.log2(poolSize);
}

/**
 * Analyze a batch of generated passwords and return summary statistics.
 * @param {Array} batch — array of { password, attempts } from generator
 * @param {Object} policy — the policy used
 * @returns {Object} summary statistics
 */
function analyzeBatch(batch, policy) {
  const results = batch.map(item => {
    const analysis = analyzePassword(item.password);
    return { ...analysis, attempts: item.attempts };
  });

  const scores       = results.map(r => r.zxcvbnScore);
  const entropies    = results.map(r => r.shannonEntropy);
  const attemptCounts = results.map(r => r.attempts);
  const crackTimes   = results.map(r => r.crackTimeSeconds);

  return {
    policyId:   policy.id,
    policyName: policy.name,
    totalPasswords: results.length,

    // Average metrics
    avgScore:           average(scores),
    avgEntropy:         average(entropies),
    avgAttempts:        average(attemptCounts),
    avgCrackTimeSeconds: average(crackTimes),

    // Median metrics (less affected by outliers)
    medianScore:    median(scores),
    medianEntropy:  median(entropies),
    medianAttempts: median(attemptCounts),

    // Distribution: how many passwords scored 0, 1, 2, 3, 4
    scoreDistribution: {
      score0: scores.filter(s => s === 0).length,
      score1: scores.filter(s => s === 1).length,
      score2: scores.filter(s => s === 2).length,
      score3: scores.filter(s => s === 3).length,
      score4: scores.filter(s => s === 4).length
    },

    // Raw data for charts
    rawResults: results
  };
}

// Helper: arithmetic mean
function average(arr) {
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

// Helper: median
function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Run the full analysis across all 5 policies.
 * @returns {Array} analysis results for each policy
 */
function runFullAnalysis(passwordCount = 100) {
  const allResults = [];
  for (const policy of POLICIES) {
    console.log(`Generating ${passwordCount} passwords for ${policy.name}...`);
    const batch    = generateBatch(policy, passwordCount);
    const analysis = analyzeBatch(batch, policy);
    allResults.push(analysis);
    console.log(`  Done. Avg attempts: ${analysis.avgAttempts.toFixed(1)}, ` +
                `Avg score: ${analysis.avgScore.toFixed(2)}, ` +
                `Avg entropy: ${analysis.avgEntropy.toFixed(1)} bits`);
  }
  console.log('Full analysis complete.');
  return allResults;
}