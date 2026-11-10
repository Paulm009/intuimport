<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::withCount(['imports', 'suppliers', 'products'])
            ->orderByDesc('id');

        if ($search = $request->query('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        $today = now()->toDateString();
        $status = $request->query('status');

        if ($status === 'suspended') {
            $query->where('status', 'suspended');
        } elseif ($status === 'expired') {
            $query->where('status', 'active')
                ->whereNotNull('subscription_ends_at')
                ->where('subscription_ends_at', '<', $today);
        } elseif ($status === 'active') {
            $query->where('status', 'active')
                ->where(function ($q) use ($today) {
                    $q->whereNull('subscription_ends_at')
                        ->orWhere('subscription_ends_at', '>=', $today);
                });
        }

        $users = $query->get()->map(fn (User $user) => $this->format($user));

        return response()->json(['users' => $users]);
    }

    public function show(User $user)
    {
        $user->loadCount(['imports', 'suppliers', 'products', 'contacts', 'posts', 'savedQuotes']);

        return response()->json(['user' => $this->format($user)]);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:150', Rule::unique('users', 'email')->ignore($user->id)],
            'ci' => ['nullable', 'string', 'max:40'],
            'phone' => ['nullable', 'string', 'max:40'],
            'job_role' => ['nullable', 'string', 'max:120'],
            'city' => ['nullable', 'string', 'max:120'],
            'interests' => ['nullable', 'string', 'max:255'],
            'membership_plan' => ['nullable', 'string', 'max:120'],
            'password' => ['nullable', 'string', 'min:8'],
            'is_admin' => ['boolean'],
            'status' => ['sometimes', Rule::in(['active', 'suspended'])],
            'subscription_ends_at' => ['nullable', 'date'],
        ]);

        if ($user->id === $request->user()->id && array_key_exists('is_admin', $data) && ! $data['is_admin']) {
            unset($data['is_admin']);
        }

        if ($user->id === $request->user()->id && ($data['status'] ?? null) === 'suspended') {
            unset($data['status']);
        }

        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return response()->json(['user' => $this->format($user), 'message' => 'Usuario actualizado']);
    }

    public function subscription(Request $request, User $user)
    {
        $data = $request->validate([
            'membership_plan' => ['nullable', 'string', 'max:120'],
            'subscription_ends_at' => ['nullable', 'date'],
        ]);

        $user->update([
            'membership_plan' => $data['membership_plan'] ?? $user->membership_plan,
            'subscription_ends_at' => $data['subscription_ends_at'] ?? null,
        ]);

        return response()->json(['user' => $this->format($user), 'message' => 'Suscripción actualizada']);
    }

    public function status(Request $request, User $user)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(['active', 'suspended'])],
        ]);

        if ($user->id === $request->user()->id && $data['status'] === 'suspended') {
            abort(422, 'No puedes suspender tu propia cuenta.');
        }

        $user->update(['status' => $data['status']]);

        return response()->json(['user' => $this->format($user), 'message' => 'Estado de cuenta actualizado']);
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            abort(422, 'No puedes eliminar tu propia cuenta.');
        }

        $user->delete();

        return response()->json(['message' => 'Usuario eliminado']);
    }

    private function format(User $user): array
    {
        $today = now()->toDateString();

        $accessStatus = 'active';
        if ($user->status === 'suspended') {
            $accessStatus = 'suspended';
        } elseif ($user->subscription_ends_at && $user->subscription_ends_at->lt($today)) {
            $accessStatus = 'expired';
        }

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'ci' => $user->ci,
            'phone' => $user->phone,
            'job_role' => $user->job_role,
            'city' => $user->city,
            'interests' => $user->interests,
            'membership_plan' => $user->membership_plan,
            'is_admin' => $user->isAdmin(),
            'status' => $user->status,
            'access_status' => $accessStatus,
            'subscription_ends_at' => $user->subscription_ends_at?->toDateString(),
            'created_at' => $user->created_at?->toIso8601String(),
            'imports_count' => $user->imports_count ?? null,
            'suppliers_count' => $user->suppliers_count ?? null,
            'products_count' => $user->products_count ?? null,
        ];
    }
}
