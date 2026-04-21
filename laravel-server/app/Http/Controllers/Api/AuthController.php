<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'user_type' => $request->user_type ?? 'candidate',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid email or password'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function getEmployer($id)
    {
        $employer = User::where('id', $id)
            ->where('user_type', 'employer')
            ->withCount(['jobs', 'followers'])
            ->first();

        if (!$employer) {
            return response()->json(['message' => 'Employer not found'], 404);
        }

        $isFollowing = false;
        if (auth('sanctum')->check()) {
            $isFollowing = \App\Models\Follower::where('employer_id', $id)
                ->where('follower_id', auth('sanctum')->id())
                ->exists();
        }

        $jobs = \App\Models\Job::where('user_id', $id)
            ->latest()
            ->get();

        return response()->json([
            'id' => $employer->id,
            'name' => $employer->name,
            'email' => $employer->email,
            'phone' => $employer->phone,
            'avatar' => $employer->avatar,
            'banner' => $employer->banner,
            'bio' => $employer->bio,
            'website' => $employer->website,
            'isVerified' => (bool)$employer->is_verified,
            'createdAt' => $employer->created_at,
            'address' => $employer->address,
            'employeeCount' => $employer->employee_count,
            'industry' => $employer->industry,
            'foundedYear' => $employer->founded_year,
            'facebookUrl' => $employer->facebook_url,
            'linkedinUrl' => $employer->linkedin_url,
            'twitterUrl' => $employer->twitter_url,
            'jobs' => $jobs,
            'followersCount' => $employer->followers_count,
            'isFollowing' => $isFollowing,
        ]);
    }

    public function followEmployer($id)
    {
        $user = auth()->user();
        if ($user->id === $id) {
            return response()->json(['message' => 'Өөрийгөө дагах боломжгүй'], 400);
        }

        \App\Models\Follower::firstOrCreate([
            'employer_id' => $id,
            'follower_id' => $user->id
        ]);

        return response()->json(['message' => 'Амжилттай дагалаа']);
    }

    public function unfollowEmployer($id)
    {
        \App\Models\Follower::where('employer_id', $id)
            ->where('follower_id', auth()->id())
            ->delete();

        return response()->json(['message' => 'Дагахаа болилоо']);
    }

    public function getEmployers()
    {
        $employers = User::where('user_type', 'employer')
            ->withCount(['jobs'])
            ->get()
            ->map(function ($employer) {
                return [
                    'id' => $employer->id,
                    'name' => $employer->name,
                    'avatar' => $employer->avatar,
                    'industry' => $employer->industry,
                    'followersCount' => 0, // Placeholder
                    'jobCount' => $employer->jobs_count,
                ];
            });

        return response()->json($employers);
    }
}
