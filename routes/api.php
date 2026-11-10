<?php

use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\Admin\AdminContentController;
use App\Http\Controllers\Api\Admin\AdminCourseController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminPostController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ImportController;
use App\Http\Controllers\Api\MeetingController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SavedQuoteController;
use App\Http\Controllers\Api\SupplierController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'account.active'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/password', [AuthController::class, 'updatePassword']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/courses', [CourseController::class, 'index']);
    Route::post('/courses/lesson', [CourseController::class, 'toggleLesson']);

    Route::get('/recordings', [CatalogController::class, 'recordings']);
    Route::get('/tariffs', [CatalogController::class, 'tariffs']);
    Route::get('/library', [CatalogController::class, 'library']);
    Route::get('/suggestions', [CatalogController::class, 'suggestions']);

    Route::apiResource('imports', ImportController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::apiResource('suppliers', SupplierController::class)->only(['index', 'store', 'destroy']);
    Route::apiResource('products', ProductController::class)->only(['index', 'store', 'destroy']);
    Route::apiResource('contacts', ContactController::class)->only(['index', 'store', 'destroy']);

    Route::get('/posts', [PostController::class, 'index']);
    Route::post('/posts', [PostController::class, 'store']);
    Route::post('/posts/{post}/like', [PostController::class, 'toggleLike']);
    Route::post('/posts/{post}/replies', [PostController::class, 'addReply']);
    Route::delete('/posts/{post}', [PostController::class, 'destroy']);

    Route::get('/meetings', [MeetingController::class, 'index']);
    Route::post('/meetings', [MeetingController::class, 'store']);

    Route::get('/quotes', [SavedQuoteController::class, 'index']);
    Route::post('/quotes', [SavedQuoteController::class, 'store']);
    Route::delete('/quotes/{savedQuote}', [SavedQuoteController::class, 'destroy']);

    Route::get('/service-requests', [AccountController::class, 'serviceRequests']);
    Route::post('/service-requests', [AccountController::class, 'storeServiceRequest']);

    Route::get('/devices', [AccountController::class, 'devices']);
    Route::delete('/devices/{device}', [AccountController::class, 'destroyDevice']);

    Route::get('/certificates', [AccountController::class, 'certificates']);
    Route::post('/certificates', [AccountController::class, 'storeCertificate']);
});

// ── Panel de administración ─────────────────────────────────────
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index']);

    Route::get('/users', [AdminUserController::class, 'index']);
    Route::get('/users/{user}', [AdminUserController::class, 'show']);
    Route::put('/users/{user}', [AdminUserController::class, 'update']);
    Route::post('/users/{user}/subscription', [AdminUserController::class, 'subscription']);
    Route::post('/users/{user}/status', [AdminUserController::class, 'status']);
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy']);

    Route::get('/courses', [AdminCourseController::class, 'index']);
    Route::post('/courses', [AdminCourseController::class, 'store']);
    Route::put('/courses/{course}', [AdminCourseController::class, 'update']);
    Route::delete('/courses/{course}', [AdminCourseController::class, 'destroy']);
    Route::post('/courses/{course}/lessons', [AdminCourseController::class, 'storeLesson']);
    Route::delete('/lessons/{lesson}', [AdminCourseController::class, 'destroyLesson']);

    Route::get('/recordings', [AdminContentController::class, 'recordings']);
    Route::post('/recordings', [AdminContentController::class, 'storeRecording']);
    Route::put('/recordings/{recording}', [AdminContentController::class, 'updateRecording']);
    Route::delete('/recordings/{recording}', [AdminContentController::class, 'destroyRecording']);

    Route::get('/tariffs', [AdminContentController::class, 'tariffs']);
    Route::post('/tariffs', [AdminContentController::class, 'storeTariff']);
    Route::put('/tariffs/{tariff}', [AdminContentController::class, 'updateTariff']);
    Route::delete('/tariffs/{tariff}', [AdminContentController::class, 'destroyTariff']);

    Route::get('/library', [AdminContentController::class, 'library']);
    Route::post('/library', [AdminContentController::class, 'storeLibrary']);
    Route::put('/library/{resource}', [AdminContentController::class, 'updateLibrary']);
    Route::delete('/library/{resource}', [AdminContentController::class, 'destroyLibrary']);

    Route::get('/suggestions', [AdminContentController::class, 'suggestions']);
    Route::post('/suggestions', [AdminContentController::class, 'storeSuggestion']);
    Route::put('/suggestions/{suggestion}', [AdminContentController::class, 'updateSuggestion']);
    Route::delete('/suggestions/{suggestion}', [AdminContentController::class, 'destroySuggestion']);

    Route::get('/meetings', [AdminContentController::class, 'meetings']);
    Route::post('/meetings', [AdminContentController::class, 'storeMeeting']);
    Route::put('/meetings/{meeting}', [AdminContentController::class, 'updateMeeting']);
    Route::delete('/meetings/{meeting}', [AdminContentController::class, 'destroyMeeting']);

    Route::get('/posts', [AdminPostController::class, 'index']);
    Route::delete('/posts/{post}', [AdminPostController::class, 'destroy']);
});
