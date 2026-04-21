<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Job;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create an Employer
        $employer = User::create([
            'id' => (string) Str::uuid(),
            'name' => 'Tech Solutions LLC',
            'email' => 'employer@example.com',
            'password' => Hash::make('password'),
            'user_type' => 'employer',
            'industry' => 'Мэдээлэл технологи',
            'is_verified' => true,
            'bio' => 'Бид шилдэг технологийн шийдлүүдийг санал болгодог.',
            'website' => 'https://example.com',
            'address' => 'Улаанбаатар, Сүхбаатар дүүрэг',
            'employee_count' => '50-100',
        ]);

        // Create a Job for this employer
        Job::create([
            'id' => (string) Str::uuid(),
            'title' => 'Software Engineer',
            'company_name' => $employer->name,
            'description' => 'Шилдэг инженер хайж байна.',
            'category' => 'Мэдээлэл технологи',
            'location' => 'Улаанбаатар',
            'user_id' => $employer->id,
            'salary_type' => 'negotiable',
            'job_type' => 'full-time',
        ]);

        // Create a Candidate
        User::create([
            'id' => (string) Str::uuid(),
            'name' => 'Candidate User',
            'email' => 'candidate@example.com',
            'password' => Hash::make('password'),
            'user_type' => 'candidate',
        ]);
    }
}
