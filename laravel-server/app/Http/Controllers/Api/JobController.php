<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\JobView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JobController extends Controller
{
    public function index(Request $request)
    {
        $query = Job::with(['user:id,name,avatar,is_verified'])->withCount(['applications', 'views']);

        if (Auth::check()) {
            $query->with(['applications' => function($q) {
                $q->select('id', 'job_id', 'candidate_id', 'status');
                $q->where('candidate_id', Auth::id());
            }]);
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('job_type')) {
            $query->where('job_type', $request->job_type);
        }

        if ($request->has('location')) {
            $query->where('location', 'like', '%' . $request->location . '%');
        }

        $jobs = $query->latest()->paginate(15)->through(function ($job) {
            return $this->formatJob($job);
        });

        return response()->json($jobs);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'companyName' => 'required_without:company_name|string',
            'description' => 'required|string',
            'category' => 'required|string',
            'location' => 'required|string',
        ]);

        if (Auth::user()->user_type !== 'employer') {
            return response()->json(['message' => 'Зөвхөн ажил олгогч зар оруулах эрхтэй.'], 403);
        }

        $job = Job::create([
            'title' => $request->title,
            'company_name' => $request->companyName ?? $request->company_name,
            'company_logo' => $request->companyLogo ?? $request->company_logo,
            'description' => $request->description,
            'requirements' => $request->requirements,
            'salary_min' => $request->salaryMin ?? $request->salary_min,
            'salary_max' => $request->salaryMax ?? $request->salary_max,
            'salary_type' => $request->salaryType ?? $request->salary_type ?? 'negotiable',
            'job_type' => $request->jobType ?? $request->job_type ?? 'full-time',
            'category' => $request->category,
            'location' => $request->location,
            'user_id' => Auth::id(),
        ]);

        return response()->json($this->formatJob($job), 201);
    }

    public function show($id)
    {
        $query = Job::with('user')->withCount(['applications', 'views']);

        if (Auth::check()) {
            $query->with(['applications' => function($q) {
                $q->where('candidate_id', Auth::id());
            }]);
        }

        $job = $query->findOrFail($id);

        // Record view
        if (Auth::check() && Auth::id() !== $job->user_id) {
            JobView::updateOrCreate(
                ['job_id' => $job->id, 'viewer_id' => Auth::id()],
                ['updated_at' => now()]
            );
        }

        return response()->json($this->formatJob($job));
    }

    public function update(Request $request, $id)
    {
        $job = Job::findOrFail($id);

        if ($job->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->all();
        // Map camelCase to snake_case if present
        if ($request->has('companyName')) $data['company_name'] = $request->companyName;
        if ($request->has('companyLogo')) $data['company_logo'] = $request->companyLogo;
        if ($request->has('salaryMin')) $data['salary_min'] = $request->salaryMin;
        if ($request->has('salaryMax')) $data['salary_max'] = $request->salaryMax;
        if ($request->has('salaryType')) $data['salary_type'] = $request->salaryType;
        if ($request->has('jobType')) $data['job_type'] = $request->jobType;

        $job->update($data);

        return response()->json($this->formatJob($job));
    }

    public function destroy($id)
    {
        $job = Job::findOrFail($id);

        if ($job->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $job->delete();

        return response()->json(['message' => 'Job deleted successfully']);
    }

    public function myJobs()
    {
        $jobs = Job::where('user_id', Auth::id())
            ->withCount(['applications', 'views'])
            ->latest()
            ->get();

        return response()->json($jobs->map(fn($j) => $this->formatJob($j)));
    }

    public function recommendations(Request $request)
    {
        // Simple recommendation logic: latest jobs
        $query = Job::with(['user:id,name,avatar,is_verified'])->withCount(['applications', 'views']);
        
        if (Auth::check()) {
            $query->with(['applications' => function($q) {
                $q->select('id', 'job_id', 'candidate_id', 'status');
                $q->where('candidate_id', Auth::id());
            }]);
        }

        $limit = $request->get('limit', 10);
        $jobs = $query->latest()->limit($limit)->get();

        return response()->json($jobs->map(fn($j) => $this->formatJob($j)));
    }

    public function similar($id)
    {
        $job = Job::findOrFail($id);
        
        $query = Job::with(['user:id,name,avatar,is_verified'])
            ->withCount(['applications', 'views'])
            ->where('id', '!=', $id)
            ->where(function($q) use ($job) {
                $q->where('category', $job->category)
                  ->orWhere('location', 'like', '%' . $job->location . '%');
            });

        $jobs = $query->latest()->limit(4)->get();

        return response()->json($jobs->map(fn($j) => $this->formatJob($j)));
    }


    private function formatJob($job)
    {
        if (!$job) return null;

        return [
            'id' => $job->id,
            'title' => $job->title,
            'companyName' => $job->company_name,
            'companyLogo' => $job->company_logo,
            'description' => $job->description,
            'requirements' => $job->requirements,
            'salaryMin' => $job->salary_min,
            'salaryMax' => $job->salary_max,
            'salaryType' => $job->salary_type,
            'jobType' => $job->job_type,
            'category' => $job->category,
            'location' => $job->location,
            'userId' => $job->user_id,
            'createdAt' => $job->created_at,
            'updatedAt' => $job->updated_at,
            'user' => $job->user,
            'applicationsCount' => $job->applications_count ?? 0,
            'viewsCount' => $job->views_count ?? 0,
            'myApplication' => $job->relationLoaded('applications') ? $job->applications->first() : null,
        ];
    }
}
