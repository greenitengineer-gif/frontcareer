<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JobApplicationController extends Controller
{
    public function index(Request $request)
    {
        $query = JobApplication::with(['job', 'candidate']);

        if ($request->has('job_id')) {
            $query->where('job_id', $request->job_id);
        }

        if ($request->has('candidate_id')) {
            $query->where('candidate_id', $request->candidate_id);
        }

        if ($request->has('employer_id')) {
            $query->where('employer_id', $request->employer_id);
        }

        $applications = $query->latest()->paginate(20);

        return response()->json($applications);
    }

    public function show($id)
    {
        $application = JobApplication::with(['job', 'candidate'])->findOrFail($id);
        return response()->json($application);
    }

    public function scheduleInterview(Request $request, $id)
    {
        $request->validate([
            'date' => 'required|date',
            'time' => 'required',
            'type' => 'required',
        ]);

        $application = JobApplication::with('job')->findOrFail($id);

        if ($application->employer_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $application->update([
            'status' => 'interview_scheduled',
            'interview_date' => $request->date,
            'interview_time' => $request->time,
            'interview_type' => $request->type,
            'interview_location' => $request->location,
            'interview_notes' => $request->notes,
        ]);

        Notification::create([
            'user_id' => $application->candidate_id,
            'title' => 'Ярилцлага товлогдлоо',
            'message' => "Таны \"{$application->job->title}\" ажлын байранд илгээсэн анкетын ярилцлага {$request->date}-ны {$request->time} цагт товлогдлоо.",
            'type' => 'interview_scheduled',
            'link' => '/dashboard/activity'
        ]);

        return response()->json(['message' => 'Ярилцлага амжилттай товлогдлоо']);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string',
        ]);

        $application = JobApplication::with('job')->findOrFail($id);

        if ($application->employer_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $application->update(['status' => $request->status]);

        $title = '';
        $message = '';
        $type = '';

        if ($request->status === 'viewed') {
            $title = 'Анкет үзсэн';
            $message = "Таны \"{$application->job->title}\" ажлын байранд илгээсэн анкетыг байгууллага үзсэн байна.";
            $type = 'application_viewed';
        } else if ($request->status === 'shortlisted') {
            $title = 'Анкет тэнцсэн';
            $message = "Баяр хүргэе! Та \"{$application->job->title}\" ажлын байрны эхний шатанд тэнцлээ.";
            $type = 'application_shortlisted';
        }

        if ($title) {
            Notification::create([
                'user_id' => $application->candidate_id,
                'title' => $title,
                'message' => $message,
                'type' => $type,
                'link' => '/dashboard/activity'
            ]);
        }

        return response()->json(['message' => 'Анкетын статус амжилттай шинэчлэгдлээ', 'application' => $application]);
    }
}
