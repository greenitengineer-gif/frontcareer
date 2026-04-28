<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Job;
use App\Models\AdminRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create an Admin User
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@career.mn',
            'password' => Hash::make('password'),
            'user_type' => 'candidate',
            'is_admin' => true,
        ]);

        // 2. Create an Employer
        $employer = User::create([
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

        // 3. Create a Job for this employer
        Job::create([
            'title' => 'Software Engineer',
            'company_name' => $employer->name,
            'description' => 'Шилдэг инженер хайж байна.',
            'category' => 'Мэдээлэл технологи',
            'location' => 'Улаанбаатар',
            'user_id' => $employer->id,
            'salary_type' => 'negotiable',
            'job_type' => 'full-time',
        ]);

        // 4. Create a Candidate
        $candidate = User::create([
            'name' => 'Candidate User',
            'email' => 'candidate@example.com',
            'password' => Hash::make('password'),
            'user_type' => 'candidate',
        ]);

        // 5. Create a Pending Admin Request for the candidate
        AdminRequest::create([
            'user_id' => $candidate->id,
            'user_name' => $candidate->name,
            'user_email' => $candidate->email,
            'status' => 'pending',
            'requested_at' => now(),
        ]);
    }
}
