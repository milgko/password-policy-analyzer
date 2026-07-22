<?php
use App\Http\Controllers\Api\AnalysisController;

Route::post('/analyze', [AnalysisController::class, 'store']);
Route::get('/analyze', [AnalysisController::class, 'index']);
Route::get('/analyze/{id}', [AnalysisController::class, 'show']);
Route::get('/analyze/{id}/export', [AnalysisController::class, 'export']);