<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->isAdmin()) {
            // Permitir que el usuario consulte su propio estado y cierre sesión.
            if ($request->is('api/me') || $request->is('api/logout')) {
                return $next($request);
            }

            if ($user->isSuspended()) {
                abort(403, 'Tu cuenta está suspendida. Contacta al administrador para reactivarla.');
            }

            if ($user->subscriptionExpired()) {
                abort(403, 'Tu suscripción venció. Renueva tu plan para continuar usando la plataforma.');
            }
        }

        return $next($request);
    }
}
