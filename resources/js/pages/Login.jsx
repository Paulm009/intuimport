import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { firstError } from '../lib/api';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(form.email, form.password);
            navigate('/dashboard');
        } catch (err) {
            setError(firstError(err, 'No se pudo iniciar sesión.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-navy p-4">
            <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
                <div className="hidden flex-col justify-between bg-navy p-10 text-white md:flex">
                    <div>
                        <img
                            src="/images/intu-import-logo.png"
                            alt="INTU IMPORT"
                            className="h-20 w-20 rounded-2xl bg-white object-contain p-2 shadow-lg"
                        />
                        <h1 className="mt-6 text-2xl font-bold">INTU IMPORT</h1>
                        <p className="mt-1 text-sm font-semibold text-amber-400">Portal del Importador</p>
                        <p className="mt-2 text-sm text-slate-300">
                            Plataforma de gestión de importaciones, academia y herramientas aduaneras para Bolivia.
                        </p>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-300">
                        <li>Gestor de importaciones y proveedores</li>
                        <li>Calculadora CIF / GA / IVA y CBM</li>
                        <li>Academia y biblioteca de recursos</li>
                        <li>Comunidad de importadores</li>
                    </ul>
                </div>

                <div className="p-8 sm:p-10">
                    <h2 className="text-xl font-bold text-navy">Iniciar sesión</h2>
                    <p className="mt-1 text-xs text-slate-500">Accede a tu panel de miembro.</p>

                    {error && (
                        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={submit} className="mt-5 space-y-4">
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-600">Correo electrónico</label>
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={(event) => setForm({ ...form, email: event.target.value })}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                                placeholder="demo@intuimport.bo"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-600">Contraseña</label>
                            <input
                                type="password"
                                required
                                value={form.password}
                                onChange={(event) => setForm({ ...form, password: event.target.value })}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-gold bg-gold-hover py-2.5 text-sm font-bold text-white disabled:opacity-60"
                        >
                            {loading ? 'Ingresando...' : 'Entrar al Portal'}
                        </button>
                    </form>

                    <button
                        type="button"
                        onClick={() => setForm({ email: 'demo@intuimport.bo', password: 'password' })}
                        className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                        Usar credenciales demo
                    </button>

                    <p className="mt-5 text-center text-xs text-slate-500">
                        ¿No tienes cuenta?{' '}
                        <Link to="/register" className="font-semibold text-amber-600 hover:underline">
                            Regístrate gratis
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
