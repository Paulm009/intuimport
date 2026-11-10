<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\LibraryResource;
use App\Models\Meeting;
use App\Models\Post;
use App\Models\Recording;
use App\Models\Suggestion;
use App\Models\Tariff;
use App\Models\User;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $today = now()->toDateString();

        return response()->json([
            'stats' => [
                'users' => User::count(),
                'active_users' => User::where('status', 'active')
                    ->where(function ($q) use ($today) {
                        $q->whereNull('subscription_ends_at')
                            ->orWhere('subscription_ends_at', '>=', $today);
                    })->count(),
                'suspended' => User::where('status', 'suspended')->count(),
                'expired' => User::where('status', 'active')
                    ->whereNotNull('subscription_ends_at')
                    ->where('subscription_ends_at', '<', $today)
                    ->count(),
                'courses' => Course::count(),
                'lessons' => Lesson::count(),
                'recordings' => Recording::count(),
                'tariffs' => Tariff::count(),
                'library' => LibraryResource::count(),
                'suggestions' => Suggestion::count(),
                'meetings' => Meeting::count(),
                'posts' => Post::count(),
            ],
        ]);
    }
}
