<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\LessonProgress;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $completedIds = LessonProgress::where('user_id', $user->id)
            ->where('completed', true)
            ->pluck('lesson_id')
            ->all();

        $courses = Course::with('lessons')->orderBy('position')->get()->map(function ($course) use ($completedIds) {
            $lessons = $course->lessons->map(fn ($lesson) => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'completed' => in_array($lesson->id, $completedIds),
            ]);

            return [
                'id' => $course->id,
                'title' => $course->title,
                'icon' => $course->icon,
                'badge' => $course->badge,
                'modules' => $course->modules,
                'lessons' => $lessons,
            ];
        });

        return response()->json(['courses' => $courses]);
    }

    public function toggleLesson(Request $request)
    {
        $data = $request->validate([
            'lesson_id' => ['required', 'integer', 'exists:lessons,id'],
        ]);

        $progress = LessonProgress::firstOrCreate(
            ['user_id' => $request->user()->id, 'lesson_id' => $data['lesson_id']],
            ['completed' => false],
        );

        $progress->completed = ! $progress->completed;
        $progress->save();

        return response()->json(['completed' => $progress->completed]);
    }
}
