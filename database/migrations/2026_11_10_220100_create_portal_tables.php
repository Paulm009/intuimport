<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('city')->nullable();
            $table->string('sells')->nullable();
            $table->string('port')->nullable();
            $table->string('contact')->nullable();
            $table->unsignedTinyInteger('rating')->default(5);
            $table->timestamps();
        });

        Schema::create('imports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('code')->nullable();
            $table->date('operation_date')->nullable();
            $table->string('name');
            $table->string('supplier')->nullable();
            $table->string('ports')->nullable();
            $table->string('load_type')->default('LCL');
            $table->string('incoterm')->default('FOB');
            $table->string('status')->default('Cotizando');
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('import_id')->nullable()->constrained('imports')->nullOnDelete();
            $table->string('name');
            $table->string('import_ref')->nullable();
            $table->string('supplier')->nullable();
            $table->string('brand')->nullable();
            $table->decimal('qty', 12, 2)->default(1);
            $table->decimal('price', 12, 2)->default(0);
            $table->string('state')->default('importados');
            $table->timestamps();
        });

        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('role')->default('Agente de carga');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('location')->nullable();
            $table->timestamps();
        });

        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('icon')->default('🎓');
            $table->string('badge')->default('Incluido');
            $table->unsignedInteger('modules')->default(1);
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('lesson_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lesson_id')->constrained()->cascadeOnDelete();
            $table->boolean('completed')->default(false);
            $table->timestamps();
            $table->unique(['user_id', 'lesson_id']);
        });

        Schema::create('recordings', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('category')->default('CLASES');
            $table->string('duration')->default('60 min');
            $table->date('recorded_on')->nullable();
            $table->text('summary')->nullable();
            $table->timestamps();
        });

        Schema::create('tariffs', function (Blueprint $table) {
            $table->id();
            $table->string('code');
            $table->string('description');
            $table->decimal('ga', 6, 2)->default(10);
            $table->decimal('iva', 6, 2)->default(14.94);
            $table->string('requirement')->nullable();
            $table->timestamps();
        });

        Schema::create('library_resources', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('category')->default('Guía');
            $table->longText('content');
            $table->timestamps();
        });

        Schema::create('suggestions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('fob', 12, 2)->default(0);
            $table->decimal('ga', 6, 2)->default(10);
            $table->unsignedInteger('moq')->default(1);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('body');
            $table->unsignedInteger('likes')->default(0);
            $table->timestamps();
        });

        Schema::create('post_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'post_id']);
        });

        Schema::create('replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('body');
            $table->timestamps();
        });

        Schema::create('meetings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('day');
            $table->string('time');
            $table->string('title');
            $table->string('modality')->default('Sesión Programada');
            $table->date('scheduled_for')->nullable();
            $table->timestamps();
        });

        Schema::create('saved_quotes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('mode')->default('Marítima');
            $table->date('quote_date')->nullable();
            $table->decimal('cif_usd', 14, 2)->default(0);
            $table->decimal('total_usd', 14, 2)->default(0);
            $table->decimal('total_bob', 14, 2)->default(0);
            $table->json('payload')->nullable();
            $table->timestamps();
        });

        Schema::create('service_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->string('status')->default('Solicitud recibida');
            $table->timestamps();
        });

        Schema::create('devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('location')->nullable();
            $table->boolean('is_current')->default(false);
            $table->timestamp('last_active_at')->nullable();
            $table->timestamps();
        });

        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('folio');
            $table->date('issued_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificates');
        Schema::dropIfExists('devices');
        Schema::dropIfExists('service_requests');
        Schema::dropIfExists('saved_quotes');
        Schema::dropIfExists('meetings');
        Schema::dropIfExists('replies');
        Schema::dropIfExists('post_likes');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('suggestions');
        Schema::dropIfExists('library_resources');
        Schema::dropIfExists('tariffs');
        Schema::dropIfExists('recordings');
        Schema::dropIfExists('lesson_progress');
        Schema::dropIfExists('lessons');
        Schema::dropIfExists('courses');
        Schema::dropIfExists('contacts');
        Schema::dropIfExists('products');
        Schema::dropIfExists('imports');
        Schema::dropIfExists('suppliers');
    }
};
