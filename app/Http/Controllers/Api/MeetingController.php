<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MeetingController extends Controller
{
    public function index(Request $request)
    {
        $meetings = $request->user()->meetings()
            ->orWhereNull('user_id')
            ->orderBy('id')
            ->get();

        return response()->json(['meetings' => $meetings]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:180'],
            'day' => ['required', 'string', 'max:30'],
            'time' => ['required', 'string', 'max:50'],
            'modality' => ['nullable', 'string', 'max:80'],
            'scheduled_for' => ['nullable', 'date'],
        ]);

        $meeting = $request->user()->meetings()->create([
            'title' => $data['title'],
            'day' => $data['day'],
            'time' => $data['time'],
            'modality' => $data['modality'] ?? 'Sesión Programada',
            'scheduled_for' => $data['scheduled_for'] ?? null,
        ]);

        return response()->json(['meeting' => $meeting], 201);
    }
}
