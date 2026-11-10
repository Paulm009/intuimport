<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(['suppliers' => $request->user()->suppliers()->latest('id')->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'city' => ['nullable', 'string', 'max:120'],
            'sells' => ['nullable', 'string', 'max:180'],
            'port' => ['nullable', 'string', 'max:120'],
            'contact' => ['nullable', 'string', 'max:150'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
        ]);

        $supplier = $request->user()->suppliers()->create([
            'name' => $data['name'],
            'city' => $data['city'] ?? 'China',
            'sells' => $data['sells'] ?? 'Mercadería general',
            'port' => $data['port'] ?? 'FOB Shenzhen',
            'contact' => $data['contact'] ?? 'Contacto directo',
            'rating' => $data['rating'] ?? 5,
        ]);

        return response()->json(['supplier' => $supplier], 201);
    }

    public function destroy(Request $request, Supplier $supplier)
    {
        abort_unless($supplier->user_id === $request->user()->id, 403);
        $supplier->delete();

        return response()->json(['message' => 'Proveedor eliminado']);
    }
}
