<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->user()->products()->latest('id');

        if ($state = $request->query('state')) {
            $query->where('state', $state);
        }

        return response()->json(['products' => $query->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'import_id' => ['nullable', 'integer', 'exists:imports,id'],
            'import_ref' => ['nullable', 'string', 'max:60'],
            'supplier' => ['nullable', 'string', 'max:150'],
            'brand' => ['nullable', 'string', 'max:120'],
            'qty' => ['nullable', 'numeric', 'min:0'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'state' => ['nullable', 'in:importados,no-importados'],
        ]);

        $product = $request->user()->products()->create([
            'name' => $data['name'],
            'import_id' => $data['import_id'] ?? null,
            'import_ref' => $data['import_ref'] ?? 'IMP-GEN',
            'supplier' => $data['supplier'] ?? 'Fábrica OEM',
            'brand' => $data['brand'] ?? 'OEM',
            'qty' => $data['qty'] ?? 1,
            'price' => $data['price'] ?? 0,
            'state' => $data['state'] ?? 'importados',
        ]);

        return response()->json(['product' => $product], 201);
    }

    public function destroy(Request $request, Product $product)
    {
        abort_unless($product->user_id === $request->user()->id, 403);
        $product->delete();

        return response()->json(['message' => 'Producto eliminado']);
    }
}
