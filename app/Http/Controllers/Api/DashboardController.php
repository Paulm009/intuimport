<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\LessonProgress;
use App\Models\Post;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $totalLessons = Course::withCount('lessons')->get()->sum('lessons_count');
        $completed = LessonProgress::where('user_id', $user->id)
            ->where('completed', true)
            ->count();

        $progress = $totalLessons > 0 ? (int) round(($completed / $totalLessons) * 100) : 0;

        $meetings = $user->meetings()
            ->orWhereNull('user_id')
            ->orderBy('id')
            ->get();

        $posts = Post::with(['user', 'replies.user'])
            ->withCount('replies')
            ->latest()
            ->take(3)
            ->get()
            ->map(fn ($post) => [
                'id' => $post->id,
                'author' => $post->user->name,
                'title' => $post->title,
                'body' => $post->body,
                'likes' => $post->likes,
                'replies_count' => $post->replies_count,
                'created_at' => $post->created_at->toIso8601String(),
            ]);

        return response()->json([
            'kpis' => [
                'imports' => $user->imports()->count(),
                'suppliers' => $user->suppliers()->count(),
                'quotes' => $user->savedQuotes()->count(),
                'course_progress' => $progress,
                'total_quoted_usd' => (float) $user->savedQuotes()->sum('total_usd'),
            ],
            'meetings' => $meetings,
            'posts' => $posts,
        ]);
    }
}
