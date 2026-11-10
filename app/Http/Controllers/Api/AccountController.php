<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Device;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function serviceRequests(Request $request)
    {
        return response()->json(['requests' => $request->user()->serviceRequests()->latest('id')->get()]);
    }

    public function storeServiceRequest(Request $request)
    {
        $data = $request->validate([
            'type' => ['required', 'string', 'max:180'],
        ]);

        $serviceRequest = $request->user()->serviceRequests()->create([
            'type' => $data['type'],
            'status' => 'Solicitud recibida',
        ]);

        return response()->json(['request' => $serviceRequest], 201);
    }

    public function devices(Request $request)
    {
        return response()->json(['devices' => $request->user()->devices()->latest('id')->get()]);
    }

    public function destroyDevice(Request $request, Device $device)
    {
        abort_unless($device->user_id === $request->user()->id, 403);
        abort_if($device->is_current, 422, 'No puedes cerrar la sesión actual.');
        $device->delete();

        return response()->json(['message' => 'Sesión remota cerrada']);
    }

    public function certificates(Request $request)
    {
        return response()->json(['certificates' => $request->user()->certificates()->latest('id')->get()]);
    }

    public function storeCertificate(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:180'],
            'folio' => ['required', 'string', 'max:80'],
            'issued_at' => ['nullable', 'date'],
        ]);

        $certificate = $request->user()->certificates()->create([
            'title' => $data['title'],
            'folio' => $data['folio'],
            'issued_at' => $data['issued_at'] ?? now()->toDateString(),
        ]);

        return response()->json(['certificate' => $certificate], 201);
    }
}
