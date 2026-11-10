<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Import;
use Illuminate\Http\Request;

class ImportController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->user()->imports()->latest('id');

        if ($status = $request->query('status')) {
            if ($status !== 'Todas') {
                $query->where('status', $status);
            }
        }

        return response()->json(['imports' => $query->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'supplier' => ['nullable', 'string', 'max:150'],
            'ports' => ['nullable', 'string', 'max:180'],
            'load_type' => ['nullable', 'string', 'max:40'],
            'incoterm' => ['nullable', 'string', 'max:20'],
            'status' => ['nullable', 'string', 'max:40'],
            'operation_date' => ['nullable', 'date'],
        ]);

        $user = $request->user();
        $next = $user->imports()->count() + 1;

        $import = $user->imports()->create([
            'code' => 'IMP-'.str_pad((string) $next, 3, '0', STR_PAD_LEFT),
            'operation_date' => $data['operation_date'] ?? now()->toDateString(),
            'name' => $data['name'],
            'supplier' => $data['supplier'] ?? 'Proveedor por definir',
            'ports' => $data['ports'] ?? 'China → Bolivia',
            'load_type' => $data['load_type'] ?? 'LCL',
            'incoterm' => $data['incoterm'] ?? 'FOB',
            'status' => $data['status'] ?? 'Cotizando',
        ]);

        return response()->json(['import' => $import], 201);
    }

    public function update(Request $request, Import $import)
    {
        abort_unless($import->user_id === $request->user()->id, 403);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:150'],
            'supplier' => ['sometimes', 'nullable', 'string', 'max:150'],
            'ports' => ['sometimes', 'nullable', 'string', 'max:180'],
            'load_type' => ['sometimes', 'string', 'max:40'],
            'incoterm' => ['sometimes', 'string', 'max:20'],
            'status' => ['sometimes', 'string', 'max:40'],
        ]);

        $import->update($data);

        return response()->json(['import' => $import]);
    }

    public function destroy(Request $request, Import $import)
    {
        abort_unless($import->user_id === $request->user()->id, 403);
        $import->delete();

        return response()->json(['message' => 'Importación eliminada']);
    }
}
