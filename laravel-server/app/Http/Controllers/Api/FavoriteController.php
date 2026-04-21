<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FavoriteController extends Controller
{
    public function index()
    {
        $favorites = Favorite::with(['job', 'job.user'])
            ->where('user_id', Auth::id())
            ->latest()
            ->get()
            ->pluck('job');

        return response()->json($favorites);
    }

    public function store(Request $request)
    {
        $request->validate([
            'job_id' => 'required|string|exists:jobs,id',
        ]);

        $favorite = Favorite::firstOrCreate([
            'user_id' => Auth::id(),
            'job_id' => $request->job_id,
        ]);

        return response()->json(['message' => 'Ажлын байр хадгалагдлаа', 'favorite' => $favorite]);
    }

    public function destroy($jobId)
    {
        Favorite::where('user_id', Auth::id())
            ->where('job_id', $jobId)
            ->delete();

        return response()->json(['message' => 'Ажлын байр хадгаламжаас хасагдлаа']);
    }
}
