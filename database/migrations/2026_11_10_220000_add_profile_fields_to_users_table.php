<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('ci')->nullable()->after('email');
            $table->string('phone')->nullable()->after('ci');
            $table->string('job_role')->nullable()->after('phone');
            $table->string('city')->nullable()->after('job_role');
            $table->string('interests')->nullable()->after('city');
            $table->string('membership_plan')->default('Plan Importador Anual')->after('interests');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['ci', 'phone', 'job_role', 'city', 'interests', 'membership_plan']);
        });
    }
};
