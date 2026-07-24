<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Policy Analyzer — Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
</head>
<body class="bg-gray-900 text-gray-100 min-h-screen p-6">
    <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold mb-2">🔐 Password Policy Analyzer</h1>
        <p class="text-gray-400 mb-8">Server-side analysis runs with persistence and export</p>

        @php $latest = $runs->first(); @endphp
        @if ($latest)
        <div class="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 class="text-xl font-semibold mb-4">
                Latest Run: {{ $latest->name }}
                <span class="text-sm text-gray-400">
                    ({{ $latest->passwords_per_policy }} passwords × 5 policies = {{ $latest->total_passwords }} total)
                </span>
            </h2>

            <canvas id="scoreChart" height="120" class="mb-6"></canvas>

            <table class="w-full text-sm">
                <thead>
                    <tr class="bg-gray-700 text-left">
                        <th class="p-2">Policy</th>
                        <th class="p-2">Min Len</th>
                        <th class="p-2">Rules</th>
                        <th class="p-2">Avg zxcvbn</th>
                        <th class="p-2">Avg Entropy</th>
                        <th class="p-2">Avg Attempts</th>
                        <th class="p-2">Score 4 %</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($latest->policyResults as $r)
                    <tr class="border-t border-gray-700">
                        <td class="p-2 font-medium">{{ $r->policy_name }}</td>
                        <td class="p-2">{{ $r->min_length }}</td>
                        <td class="p-2 text-xs text-gray-400">
                            @if (!$r->require_uppercase && !$r->require_digit && !$r->require_symbol && !$r->no_repeating)
                                None (length only)
                            @else
                                {{ $r->require_uppercase ? 'A-Z ' : '' }}
                                {{ $r->require_digit ? '0-9 ' : '' }}
                                {{ $r->require_symbol ? '#!@ ' : '' }}
                                {{ $r->no_repeating ? 'noRP' : '' }}
                            @endif
</td>
                        <td class="p-2" style="color: {{ $r->avg_zxcvbn_score >= 3.5 ? '#2ecc71' : ($r->avg_zxcvbn_score >= 2 ? '#f39c12' : '#e74c3c') }};">
                            {{ $r->avg_zxcvbn_score }}
                        </td>
                        <td class="p-2">{{ $r->avg_shannon_entropy }}</td>
                        <td class="p-2">{{ $r->avg_generation_attempts }}</td>
                        <td class="p-2">{{ $r->score4_percentage }}%</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>

            <div class="mt-4">
                <a href="/api/analyze/{{ $latest->id }}/export"
                   class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm">
                    📥 Download CSV
                </a>
            </div>
        </div>
        @endif

        <h2 class="text-xl font-semibold mb-4">Analysis Run History</h2>
        <div class="bg-gray-800 rounded-lg overflow-hidden">
            <table class="w-full text-sm">
                <thead>
                    <tr class="bg-gray-700 text-left">
                        <th class="p-3">Run</th>
                        <th class="p-3">Generator</th>
                        <th class="p-3">Passwords</th>
                        <th class="p-3">Completed</th>
                        <th class="p-3">Export</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($runs as $run)
                    <tr class="border-t border-gray-700">
                        <td class="p-3">{{ $run->name }}</td>
                        <td class="p-3">{{ $run->generator_type }}</td>
                        <td class="p-3">×{{ $run->passwords_per_policy }}</td>
                        <td class="p-3 text-gray-400">{{ $run->completed_at?->format('Y-m-d H:i') ?? 'Running...' }}</td>
                        <td class="p-3">
                            <a href="/api/analyze/{{ $run->id }}/export"
                               class="text-blue-400 hover:underline">CSV</a>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>

    @if ($latest)
    <script>
    const ctx = document.getElementById('scoreChart');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [
                @foreach ($latest->policyResults as $r) '{{ $r->policy_name }}', @endforeach
            ],
            datasets: [{
                label: 'Avg zxcvbn Score (0-4)',
                data: [
                    @foreach ($latest->policyResults as $r) {{ $r->avg_zxcvbn_score }}, @endforeach
                ],
                backgroundColor: ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'],
                borderColor: '#1f2937',
                borderWidth: 1,
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, max: 4, grid: { color: '#374151' } },
                x: { ticks: { color: '#9ca3af' }, grid: { display: false } },
            }
        }
    });
    </script>
    @endif
</body>
</html>