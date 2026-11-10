<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostLike;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Post::with(['user', 'replies.user'])->withCount('replies')->latest('id');

        if ($request->query('filter') === 'mine') {
            $query->where('user_id', $user->id);
        }

        if ($request->query('filter') === 'liked') {
            $query->whereHas('likes', fn ($q) => $q->where('user_id', $user->id));
        }

        $likedIds = PostLike::where('user_id', $user->id)->pluck('post_id')->all();

        $posts = $query->get()->map(fn ($post) => $this->format($post, $user->id, $likedIds));

        return response()->json(['posts' => $posts]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:180'],
            'body' => ['required', 'string', 'max:4000'],
        ]);

        $post = $request->user()->posts()->create([
            'title' => $data['title'],
            'body' => $data['body'],
            'likes' => 0,
        ]);

        $post->load(['user', 'replies.user']);

        return response()->json([
            'post' => $this->format($post, $request->user()->id, []),
        ], 201);
    }

    public function toggleLike(Request $request, Post $post)
    {
        $user = $request->user();

        DB::transaction(function () use ($user, $post) {
            $like = PostLike::where('user_id', $user->id)->where('post_id', $post->id)->first();

            if ($like) {
                $like->delete();
            } else {
                PostLike::create(['user_id' => $user->id, 'post_id' => $post->id]);
            }

            $post->update(['likes' => PostLike::where('post_id', $post->id)->count()]);
        });

        return response()->json([
            'likes' => $post->fresh()->likes,
            'liked' => PostLike::where('user_id', $user->id)->where('post_id', $post->id)->exists(),
        ]);
    }

    public function addReply(Request $request, Post $post)
    {
        $data = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $post->replies()->create([
            'user_id' => $request->user()->id,
            'body' => $data['body'],
        ]);

        $post->load(['user', 'replies.user']);
        $likedIds = PostLike::where('user_id', $request->user()->id)->pluck('post_id')->all();

        return response()->json([
            'post' => $this->format($post, $request->user()->id, $likedIds),
        ]);
    }

    public function destroy(Request $request, Post $post)
    {
        abort_unless($post->user_id === $request->user()->id, 403);
        $post->delete();

        return response()->json(['message' => 'Publicación eliminada']);
    }

    private function format(Post $post, int $userId, array $likedIds): array
    {
        return [
            'id' => $post->id,
            'author' => $post->user->name,
            'author_initials' => $this->initials($post->user->name),
            'mine' => $post->user_id === $userId,
            'title' => $post->title,
            'body' => $post->body,
            'likes' => $post->likes,
            'liked_by_me' => in_array($post->id, $likedIds),
            'created_at' => $post->created_at->toIso8601String(),
            'replies' => $post->replies->map(fn ($reply) => [
                'id' => $reply->id,
                'author' => $reply->user->name,
                'body' => $reply->body,
                'created_at' => $reply->created_at->toIso8601String(),
            ])->values(),
        ];
    }

    private function initials(string $name): string
    {
        $parts = preg_split('/\s+/', trim($name));
        $letters = array_map(fn ($part) => mb_substr($part, 0, 1), array_slice($parts, 0, 2));

        return mb_strtoupper(implode('', $letters)) ?: 'US';
    }
}
