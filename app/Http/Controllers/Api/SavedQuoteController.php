<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SavedQuote;
use Illuminate\Http\Request;

class SavedQuoteController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(['quotes' => $request->user()->savedQuotes()->latest('id')->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:180'],
            'mode' => ['nullable', 'string', 'max:40'],
            'quote_date' => ['nullable', 'date'],
            'cif_usd' => ['nullable', 'numeric', 'min:0'],
            'total_usd' => ['nullable', 'numeric', 'min:0'],
            'total_bob' => ['nullable', 'numeric', 'min:0'],
            'payload' => ['nullable', 'array'],
        ]);

        $quote = $request->user()->savedQuotes()->create([
            'name' => $data['name'],
            'mode' => $data['mode'] ?? 'Marítima',
            'quote_date' => $data['quote_date'] ?? now()->toDateString(),
            'cif_usd' => $data['cif_usd'] ?? 0,
            'total_usd' => $data['total_usd'] ?? 0,
            'total_bob' => $data['total_bob'] ?? 0,
            'payload' => $data['payload'] ?? null,
        ]);

        return response()->json(['quote' => $quote], 201);
    }

    public function destroy(Request $request, SavedQuote $savedQuote)
    {
        abort_unless($savedQuote->user_id === $request->user()->id, 403);
        $savedQuote->delete();

        return response()->json(['message' => 'Cotización eliminada']);
    }
}
