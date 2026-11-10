import { useAuth } from '../context/AuthContext';
import { subscriptionExpired } from '../lib/format';
import Icon from './Icon';

export default function BlockedScreen() {
    const { user, logout } = useAuth();

    const suspended = user?.status === 'suspended';
    const expired = subscriptionExpired(user);
    const endDate = user?.subscription_ends_at;

    const title = suspended ? 'Cuenta suspendida' : 'Suscripción vencida';
    const iconName = suspended ? 'block' : 'clock';
    const message = suspended
        ? 'Tu cuenta fue suspendida por el administrador. Para reactivarla o resolver cualquier inconveniente, contáctanos.'
        : `Tu suscripción venció${endDate ? ` el ${endDate}` : ''}. Renueva tu plan para volver a acceder a la plataforma.`;

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                    <Icon name={iconName} size={28} />
                </div>
                <h1 className="mt-4 text-xl font-bold text-navy">{title}</h1>
                <p className="mt-2 text-sm text-slate-500">{message}</p>
                <div className="mt-6 flex flex-col gap-2">
                    <a
                        href="mailto:admin@intuimport.bo"
                        className="rounded-lg bg-gold px-4 py-2 text-xs font-bold text-white shadow-sm"
                    >
                        Contactar al administrador
                    </a>
                    <button
                        type="button"
                        onClick={logout}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </div>
    );
}
