<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\LibraryResource;
use App\Models\Meeting;
use App\Models\Recording;
use App\Models\Suggestion;
use App\Models\Tariff;
use Illuminate\Http\Request;

class AdminContentController extends Controller
{
    // ── Grabaciones ──────────────────────────────────────────────
    public function recordings()
    {
        return response()->json(['recordings' => Recording::orderByDesc('recorded_on')->get()]);
    }

    public function storeRecording(Request $request)
    {
        $data = $this->validateRecording($request);

        return response()->json(['recording' => Recording::create($data)], 201);
    }

    public function updateRecording(Request $request, Recording $recording)
    {
        $recording->update($this->validateRecording($request));

        return response()->json(['recording' => $recording, 'message' => 'Grabación actualizada']);
    }

    public function destroyRecording(Recording $recording)
    {
        $recording->delete();

        return response()->json(['message' => 'Grabación eliminada']);
    }

    // ── Aranceles ────────────────────────────────────────────────
    public function tariffs(Request $request)
    {
        $query = Tariff::query();

        if ($search = $request->query('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return response()->json(['tariffs' => $query->orderBy('code')->get()]);
    }

    public function storeTariff(Request $request)
    {
        return response()->json(['tariff' => Tariff::create($this->validateTariff($request))], 201);
    }

    public function updateTariff(Request $request, Tariff $tariff)
    {
        $tariff->update($this->validateTariff($request));

        return response()->json(['tariff' => $tariff, 'message' => 'Arancel actualizado']);
    }

    public function destroyTariff(Tariff $tariff)
    {
        $tariff->delete();

        return response()->json(['message' => 'Arancel eliminado']);
    }

    // ── Biblioteca ───────────────────────────────────────────────
    public function library()
    {
        return response()->json(['resources' => LibraryResource::orderBy('id')->get()]);
    }

    public function storeLibrary(Request $request)
    {
        return response()->json(['resource' => LibraryResource::create($this->validateLibrary($request))], 201);
    }

    public function updateLibrary(Request $request, LibraryResource $resource)
    {
        $resource->update($this->validateLibrary($request));

        return response()->json(['resource' => $resource, 'message' => 'Recurso actualizado']);
    }

    public function destroyLibrary(LibraryResource $resource)
    {
        $resource->delete();

        return response()->json(['message' => 'Recurso eliminado']);
    }

    // ── Sugerencias ──────────────────────────────────────────────
    public function suggestions()
    {
        return response()->json(['suggestions' => Suggestion::orderBy('id')->get()]);
    }

    public function storeSuggestion(Request $request)
    {
        return response()->json(['suggestion' => Suggestion::create($this->validateSuggestion($request))], 201);
    }

    public function updateSuggestion(Request $request, Suggestion $suggestion)
    {
        $suggestion->update($this->validateSuggestion($request));

        return response()->json(['suggestion' => $suggestion, 'message' => 'Sugerencia actualizada']);
    }

    public function destroySuggestion(Suggestion $suggestion)
    {
        $suggestion->delete();

        return response()->json(['message' => 'Sugerencia eliminada']);
    }

    // ── Reuniones ────────────────────────────────────────────────
    public function meetings()
    {
        return response()->json(['meetings' => Meeting::orderBy('id')->get()]);
    }

    public function storeMeeting(Request $request)
    {
        return response()->json(['meeting' => Meeting::create($this->validateMeeting($request))], 201);
    }

    public function updateMeeting(Request $request, Meeting $meeting)
    {
        $meeting->update($this->validateMeeting($request));

        return response()->json(['meeting' => $meeting, 'message' => 'Reunión actualizada']);
    }

    public function destroyMeeting(Meeting $meeting)
    {
        $meeting->delete();

        return response()->json(['message' => 'Reunión eliminada']);
    }

    // ── Validaciones ─────────────────────────────────────────────
    private function validateRecording(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:60'],
            'duration' => ['nullable', 'string', 'max:40'],
            'recorded_on' => ['nullable', 'date'],
            'summary' => ['nullable', 'string'],
        ]);
    }

    private function validateTariff(Request $request): array
    {
        return $request->validate([
            'code' => ['required', 'string', 'max:40'],
            'description' => ['required', 'string', 'max:255'],
            'ga' => ['nullable', 'numeric', 'min:0'],
            'iva' => ['nullable', 'numeric', 'min:0'],
            'requirement' => ['nullable', 'string', 'max:255'],
        ]);
    }

    private function validateLibrary(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:60'],
            'content' => ['required', 'string'],
        ]);
    }

    private function validateSuggestion(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'fob' => ['nullable', 'numeric', 'min:0'],
            'ga' => ['nullable', 'numeric', 'min:0'],
            'moq' => ['nullable', 'integer', 'min:1'],
            'description' => ['nullable', 'string'],
        ]);
    }

    private function validateMeeting(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:180'],
            'day' => ['required', 'string', 'max:30'],
            'time' => ['required', 'string', 'max:50'],
            'modality' => ['nullable', 'string', 'max:80'],
            'scheduled_for' => ['nullable', 'date'],
        ]);
    }
}
