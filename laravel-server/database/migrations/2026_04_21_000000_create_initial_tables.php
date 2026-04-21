<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Users Table
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('avatar')->nullable();
            $table->string('banner')->nullable();
            $table->text('bio')->nullable();
            $table->string('website')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->enum('user_type', ['candidate', 'employer'])->default('candidate');
            $table->boolean('is_admin')->default(false);
            $table->text('address')->nullable();
            $table->string('employee_count')->nullable();
            $table->string('industry')->nullable();
            $table->string('founded_year')->nullable();
            $table->string('facebook_url')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('twitter_url')->nullable();
            $table->timestamps();
        });

        // Jobs Table
        Schema::create('jobs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->string('company_name');
            $table->string('company_logo')->nullable();
            $table->text('description');
            $table->text('requirements')->nullable();
            $table->decimal('salary_min', 12, 2)->nullable();
            $table->decimal('salary_max', 12, 2)->nullable();
            $table->enum('salary_type', ['fixed', 'range', 'negotiable', 'hourly'])->default('negotiable');
            $table->enum('job_type', ['full-time', 'part-time', 'freelance', 'contract'])->default('full-time');
            $table->string('category');
            $table->string('location');
            $table->uuid('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->timestamps();
        });

        // Favorites Table
        Schema::create('favorites', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('job_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('job_id')->references('id')->on('jobs')->onDelete('cascade');
            $table->unique(['user_id', 'job_id']);
            $table->timestamps();
        });

        // Messages Table
        Schema::create('messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->text('text');
            $table->boolean('is_read')->default(false);
            $table->uuid('sender_id');
            $table->uuid('receiver_id');
            $table->uuid('job_id')->nullable();
            $table->foreign('sender_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('receiver_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('job_id')->references('id')->on('jobs')->onDelete('set null');
            $table->timestamps();
        });

        // CVs Table
        Schema::create('cvs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->unique();
            $table->string('template')->default('professional');
            $table->string('brand_color')->default('#2563EB');
            $table->text('summary')->nullable();
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->text('address')->nullable();
            $table->decimal('expected_salary', 12, 2)->nullable();
            $table->boolean('is_public')->default(true);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->timestamps();
        });

        // CV Details (Education, Experience, Skills, Languages, Certificates)
        Schema::create('education', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('cv_id');
            $table->string('institution');
            $table->string('degree')->nullable();
            $table->string('field_of_study')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->text('description')->nullable();
            $table->foreign('cv_id')->references('id')->on('cvs')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('experience', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('cv_id');
            $table->string('company');
            $table->string('position');
            $table->string('location')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->text('description')->nullable();
            $table->foreign('cv_id')->references('id')->on('cvs')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('cv_skills', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('cv_id');
            $table->string('skill_name');
            $table->enum('level', ['beginner', 'intermediate', 'advanced', 'expert'])->nullable();
            $table->foreign('cv_id')->references('id')->on('cvs')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('cv_languages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('cv_id');
            $table->string('language_name');
            $table->enum('level', ['basic', 'intermediate', 'fluent', 'native'])->nullable();
            $table->foreign('cv_id')->references('id')->on('cvs')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('certificates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('cv_id');
            $table->string('name');
            $table->string('issuer')->nullable();
            $table->date('date')->nullable();
            $table->foreign('cv_id')->references('id')->on('cvs')->onDelete('cascade');
            $table->timestamps();
        });

        // Job Applications Table
        Schema::create('job_applications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('job_id');
            $table->uuid('candidate_id');
            $table->uuid('employer_id');
            $table->enum('status', ['pending', 'viewed', 'shortlisted', 'rejected', 'interview_scheduled'])->default('pending');
            $table->date('interview_date')->nullable();
            $table->string('interview_time')->nullable();
            $table->string('interview_type')->nullable();
            $table->string('interview_location')->nullable();
            $table->text('interview_notes')->nullable();
            $table->foreign('job_id')->references('id')->on('jobs')->onDelete('cascade');
            $table->foreign('candidate_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('employer_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['job_id', 'candidate_id']);
            $table->timestamps();
        });

        // Notifications Table
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('title');
            $table->text('message');
            $table->string('type');
            $table->string('link')->nullable();
            $table->boolean('is_read')->default(false);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->timestamps();
        });

        // Views and Analytics
        Schema::create('cv_views', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('cv_id');
            $table->uuid('viewer_id');
            $table->foreign('cv_id')->references('id')->on('cvs')->onDelete('cascade');
            $table->foreign('viewer_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['cv_id', 'viewer_id']);
            $table->timestamps();
        });

        Schema::create('job_views', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('job_id');
            $table->uuid('viewer_id')->nullable();
            $table->foreign('job_id')->references('id')->on('jobs')->onDelete('cascade');
            $table->foreign('viewer_id')->references('id')->on('users')->onDelete('set null');
            $table->unique(['job_id', 'viewer_id']);
            $table->timestamps();
        });

        // Followers Table
        Schema::create('followers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('employer_id');
            $table->uuid('follower_id');
            $table->foreign('employer_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('follower_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['employer_id', 'follower_id']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('followers');
        Schema::dropIfExists('job_views');
        Schema::dropIfExists('cv_views');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('job_applications');
        Schema::dropIfExists('certificates');
        Schema::dropIfExists('cv_languages');
        Schema::dropIfExists('cv_skills');
        Schema::dropIfExists('experience');
        Schema::dropIfExists('education');
        Schema::dropIfExists('cvs');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('favorites');
        Schema::dropIfExists('jobs');
        // Schema::dropIfExists('users');
    }
};
