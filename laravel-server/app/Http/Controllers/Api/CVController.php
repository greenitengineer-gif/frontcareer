<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CV;
use App\Models\Education;
use App\Models\Experience;
use App\Models\CVSkill;
use App\Models\CVLanguage;
use App\Models\Certificate;
use App\Models\CVView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CVController extends Controller
{
    public function show(Request $request, $id = null)
    {
        if ($id === 'my') {
            $id = null;
        }

        $query = CV::with(['user', 'education', 'experience', 'skills', 'languages', 'certificates']);

        if (!$id) {
            $cv = $query->where('user_id', Auth::id())->first();
        } else {
            // Try finding by CV ID first, then by User ID
            $cv = $query->where('id', $id)->first() ?: $query->where('user_id', $id)->first();
        }

        if (!$cv) {
            if ($id) {
                return response()->json(['message' => 'CV not found'], 404);
            }
            return response()->json(null);
        }

        // Record view if viewer is not the owner
        if ($id && Auth::check() && Auth::id() !== $cv->user_id) {
            \App\Models\CVView::updateOrCreate(
                ['cv_id' => $cv->id, 'viewer_id' => Auth::id()],
                ['updated_at' => now()]
            );
        }

        return response()->json($this->formatCV($cv));
    }

    public function store(Request $request)
    {
        return DB::transaction(function () use ($request) {
            $data = [
                'template' => $request->template ?? 'professional',
                'brand_color' => $request->brandColor ?? $request->brand_color ?? '#2563EB',
                'summary' => $request->summary,
                'birth_date' => $request->birthDate ?? $request->birth_date,
                'gender' => $request->gender,
                'address' => $request->address,
                'expected_salary' => $request->expectedSalary ?? $request->expected_salary,
                'is_public' => $request->isPublic ?? $request->is_public ?? true,
            ];

            $cv = CV::updateOrCreate(
                ['user_id' => Auth::id()],
                $data
            );

            if ($request->has('education')) {
                $cv->education()->delete();
                foreach ($request->education as $edu) {
                    $cv->education()->create([
                        'institution' => $edu['institution'],
                        'degree' => $edu['degree'] ?? null,
                        'field_of_study' => $edu['fieldOfStudy'] ?? $edu['field_of_study'] ?? null,
                        'start_date' => $edu['startDate'] ?? $edu['start_date'] ?? null,
                        'end_date' => $edu['endDate'] ?? $edu['end_date'] ?? null,
                        'description' => $edu['description'] ?? null,
                    ]);
                }
            }

            if ($request->has('experience')) {
                $cv->experience()->delete();
                foreach ($request->experience as $exp) {
                    $cv->experience()->create([
                        'company' => $exp['company'],
                        'position' => $exp['position'],
                        'location' => $exp['location'] ?? null,
                        'start_date' => $exp['startDate'] ?? $exp['start_date'] ?? null,
                        'end_date' => $exp['endDate'] ?? $exp['end_date'] ?? null,
                        'description' => $exp['description'] ?? null,
                    ]);
                }
            }

            if ($request->has('skills')) {
                $cv->skills()->delete();
                foreach ($request->skills as $skill) {
                    $cv->skills()->create([
                        'skill_name' => $skill['name'] ?? $skill['skill_name'],
                        'level' => $skill['level'] ?? null,
                    ]);
                }
            }

            if ($request->has('languages')) {
                $cv->languages()->delete();
                foreach ($request->languages as $lang) {
                    $cv->languages()->create([
                        'language_name' => $lang['name'] ?? $lang['language_name'],
                        'level' => $lang['level'] ?? null,
                    ]);
                }
            }

            if ($request->has('certificates')) {
                $cv->certificates()->delete();
                foreach ($request->certificates as $cert) {
                    $cv->certificates()->create([
                        'name' => $cert['name'],
                        'issuer' => $cert['issuer'] ?? null,
                        'date' => $cert['date'] ?? null,
                    ]);
                }
            }

            return response()->json($this->formatCV($cv->load(['user', 'education', 'experience', 'skills', 'languages', 'certificates'])));
        });
    }

    public function getPublicCVs(Request $request)
    {
        // For list view, we don't need all relationships
        $query = CV::where('is_public', true)->with(['user']);

        if ($request->has('skill')) {
            $query->whereHas('skills', function($q) use ($request) {
                $q->where('skill_name', 'like', '%' . $request->skill . '%');
            });
        }

        $cvs = $query->latest()->paginate(12)->through(function ($cv) {
            return $this->formatCV($cv, false); // Pass false to skip relationships
        });

        return response()->json($cvs);
    }

    private function formatCV($cv, $includeRelations = true)
    {
        if (!$cv) return null;

        $user = $cv->user;
        $nameParts = explode(' ', $user->name ?? '');
        $lastName = $nameParts[0] ?? '';
        $firstName = count($nameParts) > 1 ? implode(' ', array_slice($nameParts, 1)) : ($nameParts[0] ?? '');

        $data = [
            'id' => $cv->id,
            'userId' => $cv->user_id,
            'template' => $cv->template,
            'brandColor' => $cv->brand_color,
            'summary' => $cv->summary,
            'birthDate' => $cv->birth_date,
            'gender' => $cv->gender,
            'address' => $cv->address,
            'expectedSalary' => $cv->expected_salary,
            'isPublic' => (bool)$cv->is_public,
            'firstName' => $firstName,
            'lastName' => $lastName,
            'email' => $user->email ?? '',
            'phone' => $user->phone ?? '',
            'avatar' => $user->avatar ?? '',
            'jobTitle' => $cv->job_title ?? ($cv->experience->first()->position ?? ''),
            'createdAt' => $cv->created_at,
            'updatedAt' => $cv->updated_at,
            'completionPercentage' => 0, 
        ];

        if ($includeRelations) {
            $data['education'] = $cv->education->map(fn($e) => [
                'id' => $e->id,
                'institution' => $e->institution,
                'degree' => $e->degree,
                'fieldOfStudy' => $e->field_of_study,
                'startDate' => $e->start_date,
                'endDate' => $e->end_date,
                'description' => $e->description,
            ]);
            $data['experience'] = $cv->experience->map(fn($e) => [
                'id' => $e->id,
                'company' => $e->company,
                'position' => $e->position,
                'location' => $e->location,
                'startDate' => $e->start_date,
                'endDate' => $e->end_date,
                'description' => $e->description,
            ]);
            $data['skills'] = $cv->skills->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->skill_name,
                'level' => $s->level,
            ]);
            $data['languages'] = $cv->languages->map(fn($l) => [
                'id' => $l->id,
                'name' => $l->language_name,
                'level' => $l->level,
            ]);
            $data['certificates'] = $cv->certificates->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'issuer' => $c->issuer,
                'date' => $c->date,
            ]);
        }

        return $data;
    }
}
