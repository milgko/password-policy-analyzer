<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('policy_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('analysis_run_id')->constrained()->cascadeOnDelete();
            $table->string('policy_name');          // e.g. "P1 - Lenient"
            $table->integer('min_length');
            $table->boolean('require_uppercase');
            $table->boolean('require_digit');
            $table->boolean('require_symbol');
            $table->boolean('no_repeating');
            $table->float('avg_zxcvbn_score');      // 0-4
            $table->float('avg_shannon_entropy');   // bits
            $table->float('avg_generation_attempts');
            $table->float('score4_percentage');     // % of passwords scoring 4/4
            $table->integer('passwords_generated');
            $table->json('sample_passwords');       // 10 example passwords
            $table->json('score_distribution');     // {score0: N, score1: N, ...}
            $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('policy_results');
    }
};
