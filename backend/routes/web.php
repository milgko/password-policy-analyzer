<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/dashboard', function () {
    $runs = App\Models\AnalysisRun::with('policyResults')
        ->latest()
        ->take(10)
        ->get();

    return view('dashboard', compact('runs'));
});