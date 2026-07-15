// charts.js — Canvas-based visualizations

/**
 * Draw a bar chart comparing zxcvbn scores across policies.
 * @param {Array} results — output from runFullAnalysis()
 * @param {string} canvasId — id of the canvas element
 */
function drawScoreBarChart(results, canvasId) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');

  const width  = canvas.width;
  const height = canvas.height;
  const padding = { top: 50, right: 30, bottom: 100, left: 60 };
  const chartWidth  = width  - padding.left - padding.right;
  const chartHeight = height - padding.top  - padding.bottom;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Colors per policy:
  // P1 Lenient       → sky blue
  // P2 Length-Only   → lime green
  // P3 Complex-Only  → peach/orange
  // P4 Standard      → yellow
  // P5 Paranoid      → pink
  const colors = ['#70D6FF', '#E9FF70', '#FF9770', '#FFD670', '#FF70A6'];

  // zxcvbn max score is 4
  const maxScore = 4;

  const barWidth = chartWidth / results.length * 0.7;
  const barGap   = chartWidth / results.length * 0.3;

  // Draw bars
  results.forEach((result, i) => {
    const x         = padding.left + i * (barWidth + barGap);
    const barHeight = (result.avgScore / maxScore) * chartHeight;
    const y         = height - padding.bottom - barHeight;

    // Bar
    ctx.fillStyle = colors[i];
    ctx.fillRect(x, y, barWidth, barHeight);

    // Value label on top of bar
    ctx.fillStyle   = '#333';
    ctx.font        = '12px sans-serif';
    ctx.textAlign   = 'center';
    ctx.fillText(result.avgScore.toFixed(2), x + barWidth / 2, y - 5);

    // Policy name below bar
    ctx.save();
    ctx.translate(x + barWidth / 2, height - padding.bottom + 20);
    ctx.rotate(-0.4);
    ctx.fillText(result.policyName, 0, 0);
    ctx.restore();
  });

  // Y-axis line
  ctx.strokeStyle = '#ccc';
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, height - padding.bottom);
  ctx.stroke();

  // Y-axis labels
  ctx.fillStyle = '#666';
  ctx.font      = '12px sans-serif';
  ctx.textAlign = 'right';
  for (let i = 0; i <= maxScore; i++) {
    const y = height - padding.bottom - (i / maxScore) * chartHeight;
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(i, padding.left - 10, y + 4);
  }

  // Title
  ctx.fillStyle = '#333';
ctx.font = '12px sans-serif';
ctx.textAlign = 'center';
ctx.fillText('Average zxcvbn Score by Policy (0-4)', width / 2, 15);
}

/**
 * Draw a bar chart for average generation attempts per policy.
 * More attempts = harder to create a compliant password = H2 evidence.
 */
function drawAttemptsChart(results, canvasId) {
  const canvas = document.getElementById(canvasId);
  const ctx    = canvas.getContext('2d');

  const width  = canvas.width;
  const height = canvas.height;
  const padding = { top: 50, right: 30, bottom: 80, left: 70 };
  const chartWidth  = width  - padding.left - padding.right;
  const chartHeight = height - padding.top  - padding.bottom;

  ctx.clearRect(0, 0, width, height);

  const colors     = ['#70D6FF', '#E9FF70', '#FF9770', '#FFD670', '#FF70A6'];
  const maxAttempts = Math.max(...results.map(r => r.avgAttempts)) * 1.2;
  const barWidth   = chartWidth / results.length * 0.7;
  const barGap     = chartWidth / results.length * 0.3;

  results.forEach((result, i) => {
    const x         = padding.left + i * (barWidth + barGap);
    const barHeight = (result.avgAttempts / maxAttempts) * chartHeight;
    const y         = height - padding.bottom - barHeight;

    ctx.fillStyle = colors[i];
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = '#333';
    ctx.font      = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(result.avgAttempts.toFixed(1), x + barWidth / 2, y - 5);

    ctx.save();
    ctx.translate(x + barWidth / 2, height - padding.bottom + 20);
    ctx.rotate(-0.4);
    ctx.fillText(result.policyName, 0, 0);
    ctx.restore();
  });

  drawAxes(ctx, width, height, padding,
    'Average Generation Attempts (lower = easier to comply)', maxAttempts);
}

/**
 * Draw a bar chart for Shannon entropy.
 * Higher entropy = more random = stronger password (mathematically).
 * Directly tests H1: does length contribute more than complexity?
 */
function drawEntropyChart(results, canvasId) {
  const canvas = document.getElementById(canvasId);
  const ctx    = canvas.getContext('2d');

  const width  = canvas.width;
  const height = canvas.height;
const padding = { top: 50, right: 30, bottom: 80, left: 70 };
  const chartWidth  = width  - padding.left - padding.right;
  const chartHeight = height - padding.top  - padding.bottom;

  ctx.clearRect(0, 0, width, height);

  const colors     = ['#70D6FF', '#E9FF70', '#FF9770', '#FFD670', '#FF70A6'];
  const maxEntropy = Math.max(...results.map(r => r.avgEntropy)) * 1.1;
  const barWidth   = chartWidth / results.length * 0.7;
  const barGap     = chartWidth / results.length * 0.3;

  results.forEach((result, i) => {
    const x         = padding.left + i * (barWidth + barGap);
    const barHeight = (result.avgEntropy / maxEntropy) * chartHeight;
    const y         = height - padding.bottom - barHeight;

    ctx.fillStyle = colors[i];
    ctx.fillRect(x, y, barWidth, barHeight);

    ctx.fillStyle = '#333';
    ctx.font      = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(result.avgEntropy.toFixed(0) + ' bits', x + barWidth / 2, y - 5);

    ctx.save();
    ctx.translate(x + barWidth / 2, height - padding.bottom + 20);
    ctx.rotate(-0.4);
    ctx.fillText(result.policyName, 0, 0);
    ctx.restore();
  });

  drawAxes(ctx, width, height, padding,
    'Average Shannon Entropy (bits) \u2014 higher = stronger', maxEntropy, ' bits');
}

// Shared axis drawing helper
function drawAxes(ctx, width, height, padding, title, maxValue, unit = '') {
  // Y-axis line
  ctx.strokeStyle = '#ccc';
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, height - padding.bottom);
  ctx.stroke();

  // Y-axis labels (5 intervals)
  const chartHeight = height - padding.top - padding.bottom;
  ctx.fillStyle = '#666';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 5; i++) {
    const y = height - padding.bottom - (i / 5) * chartHeight;
    const value = ((i / 5) * maxValue).toFixed(1);
    ctx.fillText(value + unit, padding.left - 8, y + 4);
  }

  // Title
  ctx.fillStyle = '#333';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, width / 2, 15);
}