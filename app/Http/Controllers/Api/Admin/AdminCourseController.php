<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Http\Request;

class AdminCourseController extends Controller
{
    public function index()
    {
        return response()->json(['courses' => Course::with('lessons')->orderBy('position')->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:20'],
            'badge' => ['nullable', 'string', 'max:60'],
            'modules' => ['nullable', 'integer', 'min:0'],
            'position' => ['nullable', 'integer', 'min:0'],
            'lessons' => ['nullable', 'array'],
            'lessons.*.title' => ['required', 'string', 'max:255'],
        ]);

        $course = Course::create([
            'title' => $data['title'],
            'icon' => $data['icon'] ?? '',
            'badge' => $data['badge'] ?? 'Incluido',
            'modules' => $data['modules'] ?? 1,
            'position' => $data['position'] ?? 0,
        ]);

        foreach ($data['lessons'] ?? [] as $position => $lesson) {
            $course->lessons()->create([
                'title' => $lesson['title'],
                'position' => $position,
            ]);
        }

        $course->load('lessons');

        return response()->json(['course' => $course], 201);
    }

    public function update(Request $request, Course $course)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:20'],
            'badge' => ['nullable', 'string', 'max:60'],
            'modules' => ['nullable', 'integer', 'min:0'],
            'position' => ['nullable', 'integer', 'min:0'],
        ]);

        $course->update($data);
        $course->load('lessons');

        return response()->json(['course' => $course, 'message' => 'Curso actualizado']);
    }

    public function destroy(Course $course)
    {
        $course->delete();

        return response()->json(['message' => 'Curso eliminado']);
    }

    public function storeLesson(Request $request, Course $course)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
        ]);

        $position = $course->lessons()->max('position') + 1;

        $lesson = $course->lessons()->create([
            'title' => $data['title'],
            'position' => $position,
        ]);

        return response()->json(['lesson' => $lesson], 201);
    }

    public function destroyLesson(Lesson $lesson)
    {
        $lesson->delete();

        return response()->json(['message' => 'Lección eliminada']);
    }
}
