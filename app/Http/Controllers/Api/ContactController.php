<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(['contacts' => $request->user()->contacts()->latest('id')->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'role' => ['nullable', 'string', 'max:80'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:150'],
            'location' => ['nullable', 'string', 'max:150'],
        ]);

        $contact = $request->user()->contacts()->create([
            'name' => $data['name'],
            'role' => $data['role'] ?? 'Agente de carga',
            'phone' => $data['phone'] ?? '-',
            'email' => $data['email'] ?? null,
            'location' => $data['location'] ?? 'Bolivia',
        ]);

        return response()->json(['contact' => $contact], 201);
    }

    public function destroy(Request $request, Contact $contact)
    {
        abort_unless($contact->user_id === $request->user()->id, 403);
        $contact->delete();

        return response()->json(['message' => 'Contacto eliminado']);
    }
}
