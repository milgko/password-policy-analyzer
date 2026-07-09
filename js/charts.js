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
  const padding = { top: 30, right: 30, bottom: 50, left: 60 };
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
    ctx.translate(x + barWidth / 2, height - padding.bottom + 10);
    ctx.rotate(-0.5);
    ctx.fillText(result.policyName, 0, 0);
    ctx.restore();
  });

  // Y-axis line
  ctx.strokeStyle = '#ccc';
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, height - padding.bottom);
  ctx.stroke();

  // Y-axis labels and grid lines
  ctx.fillStyle = '#666';
  ctx.font      = '11px sans-serif';
  ctx.textAlign = 'right';
  for (let i = 0; i <= maxScore; i++) {
    const y = height - padding.bottom - (i / maxScore) * chartHeight;
    ctx.fillText(i, padding.left - 10, y + 4);
    ctx.strokeStyle = '#eee';
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }

  // Title
  ctx.fillStyle = '#333';
  ctx.font      = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Average zxcvbn Score by Policy (0-4)', width / 2, padding.top - 10);
}