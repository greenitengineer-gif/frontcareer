<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'file' => 'required|image|max:2048',
        ]);

        $file = $request->file('file');
        $filename = 'avatars/' . uniqid() . '.' . $file->getClientOriginalExtension();
        
        $path = $file->storeAs('public', $filename);
        
        if (!$path) {
            return response()->json(['message' => 'Файл хуулах үед алдаа гарлаа'], 500);
        }

        $url = asset('storage/' . $filename);

        return response()->json([
            'url' => $url,
            'path' => $filename,
        ]);
    }

    public function uploadCV(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf|max:10240',
        ]);

        $file = $request->file('file');
        $filename = 'cvs/' . uniqid() . '.' . $file->getClientOriginalExtension();
        
        $path = $file->storeAs('public', $filename);
        
        if (!$path) {
            return response()->json(['message' => 'Файл хуулах үед алдаа гарлаа'], 500);
        }

        $url = asset('storage/' . $filename);

        return response()->json([
            'url' => $url,
            'path' => $filename,
        ]);
    }

    public function uploadGeneral(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:5120',
        ]);

        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();
        $filename = 'uploads/' . uniqid() . '.' . $extension;
        
        $path = $file->storeAs('public', $filename);
        
        if (!$path) {
            return response()->json(['message' => 'Файл хуулах үед алдаа гарлаа'], 500);
        }

        $url = asset('storage/' . $filename);

        return response()->json([
            'url' => $url,
            'path' => $filename,
        ]);
    }
}
