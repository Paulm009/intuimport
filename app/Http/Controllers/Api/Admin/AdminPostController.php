<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;

class AdminPostController extends Controller
{
    public function index()
    {
        $posts = Post::with(['user', 'replies.user'])
            ->withCount('replies')
            ->latest('id')
            ->get()
            ->map(fn (Post $post) => [
                'id' => $post->id,
                'author' => $post->user?->name,
                'author_email' => $post->user?->email,
                'title' => $post->title,
                'body' => $post->body,
                'likes' => $post->likes,
                'replies_count' => $post->replies_count,
                'created_at' => $post->created_at?->toIso8601String(),
            ]);

        return response()->json(['posts' => $posts]);
    }

    public function destroy(Post $post)
    {
        $post->delete();

        return response()->json(['message' => 'Publicación eliminada']);
    }
}
