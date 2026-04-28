<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\User;
use App\Models\Message;
use App\Models\AdminRequest;
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

    public function getPendingRequests()
    {
        $requests = AdminRequest::where('status', 'pending')
            ->orderBy('requested_at', 'desc')
            ->get();
        return response()->json($requests);
    }

    public function approveRequest($userId)
    {
        $request = AdminRequest::where('user_id', $userId)->firstOrFail();
        $request->update([
            'status' => 'approved',
            'approved_at' => now(),
        ]);

        $user = User::findOrFail($userId);
        $user->update(['is_admin' => true]);

        return response()->json(['message' => 'Request approved']);
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
