<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\User;
use App\Models\Message;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function getStats()
    {
        return response()->json([
            'listingsCount' => Job::count(),
            'usersCount' => User::count(),
            'verifiedSellersCount' => User::where('is_verified', true)->count(),
            'messagesCount' => Message::count(),
        ]);
    }

    public function getListings(Request $request)
    {
        $limit = min((int) ($request->query('limit', 20)), 100);

        $listings = Job::with('user')
            ->latest()
            ->limit($limit)
            ->get();

        return response()->json($listings);
    }

    public function deleteListing($id)
    {
        $job = Job::findOrFail($id);
        $job->delete();

        return response()->json(['message' => 'Listing deleted']);
    }
}
