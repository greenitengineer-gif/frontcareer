<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\CVController;
use App\Http\Controllers\Api\JobApplicationController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\AIController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/auth/employers/list', [AuthController::class, 'getEmployers']);
Route::get('/auth/employers/profile/{id}', [AuthController::class, 'getEmployer']);

Route::get('/listings', [JobController::class, 'index']);
Route::get('/listings/recommendations', [JobController::class, 'recommendations']);
Route::get('/listings/{id}', [JobController::class, 'show']);
Route::get('/listings/{id}/similar', [JobController::class, 'similar']);

Route::get('/cv/public', [CVController::class, 'getPublicCVs']);

Route::get('/stats/public', [StatsController::class, 'getPublicStats']);
Route::get('/stats/categories', [StatsController::class, 'getCategoryStats']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/employers/{id}/follow', [AuthController::class, 'followEmployer']);
    Route::delete('/auth/employers/{id}/follow', [AuthController::class, 'unfollowEmployer']);

    // Stats
    Route::get('/stats/candidate', [StatsController::class, 'getCandidateStats']);
    Route::get('/stats/employer', [StatsController::class, 'getEmployerStats']);

    // Jobs
    Route::post('/listings', [JobController::class, 'store']);
    Route::put('/listings/{id}', [JobController::class, 'update']);
    Route::delete('/listings/{id}', [JobController::class, 'destroy']);
    Route::get('/my-listings', [JobController::class, 'myJobs']);

    // CV
    Route::get('/cv/my', [CVController::class, 'show']);
    Route::post('/cv/my', [CVController::class, 'store']);
    Route::get('/cv', [CVController::class, 'show']);
    Route::post('/cv', [CVController::class, 'store']);
    Route::get('/cv/{id}', [CVController::class, 'show']);

    // Job Applications
    Route::get('/job-applications', [JobApplicationController::class, 'index']);
    Route::get('/job-applications/{id}', [JobApplicationController::class, 'show']);
    Route::post('/job-applications/{id}/schedule', [JobApplicationController::class, 'scheduleInterview']);
    Route::put('/job-applications/{id}/status', [JobApplicationController::class, 'updateStatus']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // Favorites
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{id}', [FavoriteController::class, 'destroy']);

    // AI
    Route::post('/ai/analyze', [AIController::class, 'analyzeCV']);
    Route::post('/ai/suggest-skills', [AIController::class, 'suggestSkills']);

    // Admin
    Route::middleware('can:admin')->group(function () {
        Route::get('/admin/stats', [AdminController::class, 'getStats']);
        Route::get('/admin/listings', [AdminController::class, 'getListings']);
        Route::delete('/admin/listings/{id}', [AdminController::class, 'deleteListing']);
    });
});
