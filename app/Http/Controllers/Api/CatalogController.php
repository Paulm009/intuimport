<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LibraryResource;
use App\Models\Recording;
use App\Models\Suggestion;
use App\Models\Tariff;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    public function recordings()
    {
        return response()->json(['recordings' => Recording::orderByDesc('recorded_on')->get()]);
    }

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

    public function library()
    {
        return response()->json(['resources' => LibraryResource::orderBy('id')->get()]);
    }

    public function suggestions()
    {
        return response()->json(['suggestions' => Suggestion::orderBy('id')->get()]);
    }
}
