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
        Schema::create('analysis_runs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('generator_type')->default('random');  // 'random' or 'mixed'
            $table->integer('passwords_per_policy')->default(100);
            $table->integer('total_passwords');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analysis_runs');
    }
};
