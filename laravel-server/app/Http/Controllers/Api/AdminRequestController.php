<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdminRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminRequestController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();
        $adminRequest = AdminRequest::where('user_id', $user->id)->first();

        return response()->json($adminRequest);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        
        $adminRequest = AdminRequest::updateOrCreate(
            ['user_id' => $user->id],
            [
                'user_name' => $user->name,
                'user_email' => $user->email,
                'user_phone' => $user->phone,
                'user_avatar' => $user->avatar,
                'status' => 'pending',
                'requested_at' => now(),
            ]
        );

        return response()->json($adminRequest);
    }
}
