<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\User;
use App\Models\CV;
use App\Models\JobApplication;
use App\Models\Favorite;
use App\Models\CVView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function getPublicStats()
    {
        return response()->json([
            'jobCount' => Job::count(),
            'companyCount' => User::where('user_type', 'employer')->count(),
            'cvCount' => CV::count(),
        ]);
    }

    public function getCategoryStats()
    {
        $stats = Job::select('category', DB::raw('count(*) as total'))
            ->groupBy('category')
            ->pluck('total', 'category');

        return response()->json($stats);
    }

    public function getCandidateStats()
    {
        $userId = Auth::id();
        
        $stats = DB::table('users')
            ->where('users.id', $userId)
            ->leftJoin('cvs', 'users.id', '=', 'cvs.user_id')
            ->select([
                DB::raw('(SELECT count(*) FROM cv_views WHERE cv_id = cvs.id) as cvViews'),
                DB::raw('(SELECT count(*) FROM job_applications WHERE candidate_id = users.id) as applications'),
                DB::raw('(SELECT count(*) FROM favorites WHERE user_id = users.id) as favorites'),
            ])
            ->first();

        return response()->json([
            'cvViews' => (int)($stats->cvViews ?? 0),
            'applications' => (int)($stats->applications ?? 0),
            'favorites' => (int)($stats->favorites ?? 0),
            'offers' => 0,
            'follows' => 0,
        ]);
    }

    public function getEmployerStats()
    {
        $userId = Auth::id();
        
        $stats = DB::table('jobs')
            ->where('user_id', $userId)
            ->select([
                DB::raw('count(*) as jobCount'),
                DB::raw('(SELECT count(*) FROM job_views WHERE job_id IN (SELECT id FROM jobs WHERE user_id = ?)) as totalViews'),
                DB::raw('(SELECT count(*) FROM job_applications WHERE job_id IN (SELECT id FROM jobs WHERE user_id = ?)) as applications'),
            ])
            ->setBindings([$userId, $userId], 'select')
            ->first();

        return response()->json([
            'totalViews' => (int)($stats->totalViews ?? 0),
            'applications' => (int)($stats->applications ?? 0),
            'jobCount' => (int)($stats->jobCount ?? 0),
            'savedCVs' => 0,
            'followers' => 0,
        ]);
    }
}
