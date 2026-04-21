<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AIService;
use Illuminate\Http\Request;

class AIController extends Controller
{
    protected $aiService;

    public function __construct(AIService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function analyzeCV(Request $request)
    {
        $request->validate([
            'cv_text' => 'required|string',
            'job_description' => 'required|string',
        ]);

        $score = $this->aiService->calculateMatchScore(
            $request->cv_text,
            $request->job_description
        );

        return response()->json([
            'score' => $score,
            'analysis' => $score > 70 ? 'Та энэ ажлын байранд сайн тохирч байна.' : 'Таны зарим ур чадвар дутуу байж магадгүй байна.'
        ]);
    }

    public function suggestSkills(Request $request)
    {
        $request->validate([
            'job_title' => 'required|string',
        ]);

        // Mock response for now if OpenAI key is missing
        return response()->json([
            'skills' => ['Харилцааны чадвар', 'Багаар ажиллах', 'Асуудал шийдвэрлэх', 'Мэргэжлийн ёс зүй']
        ]);
    }
}
