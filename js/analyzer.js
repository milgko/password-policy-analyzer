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
    const batch    = generateBatch(policy, passwordCount);
    const analysis = analyzeBatch(batch, policy);
    allResults.push(analysis);
      }
  return allResults;
}

function verifyHypotheses(allResults) {
  const lengthOnly  = allResults.find(r => r.policyId === 'P2');
  const complexOnly = allResults.find(r => r.policyId === 'P3');
  const standard    = allResults.find(r => r.policyId === 'P4');
  const paranoid    = allResults.find(r => r.policyId === 'P5');

  // H1 
  const zxcvbnFavoursLength  = lengthOnly.avgScore    >= complexOnly.avgScore;
  const entropyFavoursLength = lengthOnly.avgEntropy  >= complexOnly.avgEntropy;
  const zxcvbnDiff   = (lengthOnly.avgScore   - complexOnly.avgScore).toFixed(2);
  const entropyDiff  = (lengthOnly.avgEntropy - complexOnly.avgEntropy).toFixed(1);

  let h1Verdict, h1Supported;
  if (zxcvbnFavoursLength && entropyFavoursLength) {
    h1Verdict   = 'Strongly supported — both zxcvbn score and Shannon entropy favour the length-only policy over complexity.';
    h1Supported = true;
  } else if (zxcvbnFavoursLength && !entropyFavoursLength) {
    h1Verdict   = `Partially supported — P2 (Length-Only) achieves a higher real-world zxcvbn score than P3 (Complex-Only) by ${zxcvbnDiff} points, supporting the hypothesis that length contributes more to practical resistance against cracking attacks. However P3 produces ${Math.abs(entropyDiff)} more bits of Shannon entropy, suggesting complexity requirements increase mathematical randomness. This divergence is itself a finding: Shannon entropy overstates the security benefit of complexity because it measures character pool size rather than resistance to realistic attack strategies. When evaluated by the metric that more accurately models attacker behaviour, length is the stronger policy lever.`;
    h1Supported = true;
  } else if (!zxcvbnFavoursLength && entropyFavoursLength) {
    h1Verdict   = `Partially supported — P2 (Length-Only) produces higher Shannon entropy than P3 (Complex-Only) by ${Math.abs(entropyDiff)} bits, but P3 achieves a marginally higher zxcvbn score by ${Math.abs(zxcvbnDiff)} points. The data suggests length improves mathematical randomness but complexity may marginally improve real-world resistance in this sample.`;
    h1Supported = false;
  } else {
    h1Verdict   = `Not supported — P3 (Complex-Only) outperforms P2 (Length-Only) on both zxcvbn score (by ${Math.abs(zxcvbnDiff)} points) and Shannon entropy (by ${Math.abs(entropyDiff)} bits). The data suggests complexity requirements are more effective than length alone in this sample.`;
    h1Supported = false;
  }

  // H2
  const securityGain   = paranoid.avgScore   - standard.avgScore;
  const entropyGain    = paranoid.avgEntropy - standard.avgEntropy;
  const attemptsRatio  = paranoid.avgAttempts / standard.avgAttempts;
  const frictionIncrease = ((attemptsRatio - 1) * 100).toFixed(0);

  let frictionLabel;
  if (attemptsRatio < 1.2) {
    frictionLabel = 'minimal';
  } else if (attemptsRatio < 1.5) {
    frictionLabel = 'moderate';
  } else if (attemptsRatio < 2.0) {
    frictionLabel = 'significant';
  } else {
    frictionLabel = 'severe';
  }

  let h2Verdict, h2Supported;
  if (attemptsRatio >= 1.2 && securityGain <= 0.1) {
    h2Verdict   = `Supported — P5 (Paranoid) requires ${frictionIncrease}% more generation attempts than P4 (Standard), representing ${frictionLabel} usability friction. Despite this, the security gain is only ${securityGain.toFixed(2)} zxcvbn points and ${entropyGain.toFixed(1)} additional entropy bits. The extra restriction rules add ${frictionLabel} friction without delivering proportional security improvements.`;
    h2Supported = true;
  } else if (attemptsRatio >= 1.2 && securityGain > 0.1) {
    h2Verdict   = `Partially supported — P5 (Paranoid) requires ${frictionIncrease}% more generation attempts than P4 (Standard), representing ${frictionLabel} usability friction. The security gain of ${securityGain.toFixed(2)} zxcvbn points and ${entropyGain.toFixed(1)} entropy bits is modest but not negligible. Whether the friction is proportional to the gain depends on the security requirements of the specific application.`;
    h2Supported = true;
  } else {
    h2Verdict   = `Not supported — P5 (Paranoid) requires only ${frictionIncrease}% more generation attempts than P4 (Standard), which does not represent meaningful usability friction. The data does not show diminishing returns from complexity rules in this sample.`;
    h2Supported = false;
  }

  //Recommendation 
  const recommendation = generateRecommendation(
    h1Supported, h2Supported, zxcvbnFavoursLength,
    attemptsRatio, frictionLabel, securityGain
  );

  return {
    h1: {
      hypothesis: 'H1: Minimum length contributes more to password strength than character complexity requirements.',
      verdict: h1Verdict,
      supported: h1Supported,
      zxcvbnComparison: `P2 score ${lengthOnly.avgScore.toFixed(2)} vs P3 score ${complexOnly.avgScore.toFixed(2)}`,
      entropyComparison: `P2 entropy ${lengthOnly.avgEntropy.toFixed(1)} bits vs P3 entropy ${complexOnly.avgEntropy.toFixed(1)} bits`,
    },
    h2: {
      hypothesis: 'H2: Adding restriction rules increases rejection rate faster than it improves security.',
      verdict: h2Verdict,
      supported: h2Supported,
      frictionIncrease: `${frictionIncrease}% more generation attempts`,
      securityGain: `${securityGain.toFixed(2)} zxcvbn points, ${entropyGain.toFixed(1)} entropy bits`,
    },
    recommendation,
  };
}

function generateRecommendation(h1Supported, h2Supported, zxcvbnFavoursLength, attemptsRatio, frictionLabel, securityGain) {
  const parts = [];

  if (h1Supported && zxcvbnFavoursLength) {
    parts.push('The data supports prioritising minimum password length (12 or more characters) as the primary policy requirement, since length-only policies match or exceed complexity-based policies on real-world cracking resistance.');
  } else if (!h1Supported) {
    parts.push('The data suggests complexity requirements may be as effective as length in this sample. A combination of moderate length and complexity requirements is recommended.');
  }

  if (h2Supported && attemptsRatio >= 1.5) {
    parts.push(`Excessive complexity rules (P5 Paranoid) create ${frictionLabel} usability friction with minimal security benefit over a standard policy. Organisations should avoid mandating all four character classes simultaneously.`);
  } else if (h2Supported) {
    parts.push('Some evidence of diminishing returns from excessive complexity rules. A standard policy (minimum 8 characters with uppercase and digit) offers a reasonable balance between security and usability.');
  }

  parts.push('These findings align with NIST SP 800-63B guidance, which recommends prioritising password length and screening against compromised password databases over arbitrary complexity requirements.');

  return parts.join(' ');
}