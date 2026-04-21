<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class AIService
{
    protected $openaiKey;
    protected $googleKey;

    public function __construct()
    {
        $this->openaiKey = config('services.openai.key');
        $this->googleKey = config('services.google.key');
    }

    /**
     * Calculate match score between CV and Job Description
     */
    public function calculateMatchScore($cvText, $jobDescription)
    {
        // Example implementation using OpenAI
        if (!$this->openaiKey) return 0;

        $response = Http::withToken($this->openaiKey)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    ['role' => 'system', 'content' => 'You are an HR expert. Compare the CV and Job Description and return a match score from 0 to 100 as a single number.'],
                    ['role' => 'user', 'content' => "CV: $cvText\n\nJob: $jobDescription"]
                ]
            ]);

        if ($response->successful()) {
            return (int) $response->json('choices.0.message.content');
        }

        return 0;
    }

    /**
     * Generate interview questions based on job and candidate
     */
    public function generateInterviewQuestions($jobTitle, $candidateName, $cvSummary)
    {
        // Implementation for generating questions
    }
}
