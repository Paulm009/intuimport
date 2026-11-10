import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { firstError } from '../lib/api';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        email: '',
        city: '',
        password: '',
        password_confirmation: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(form);
            navigate('/dashboard');
        } catch (err) {
            setError(firstError(err, 'No se pudo crear la cuenta.'));
        } finally {
            setLoading(false);
        }
    };

    const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });

    return (
        <div className="flex min-h-screen items-center justify-center bg-navy p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
                <div className="flex items-center gap-3">
                    <img
                        src="/images/intu-import-logo.png"
                        alt="INTU IMPORT"
                        className="h-12 w-12 rounded-xl bg-white object-contain p-1 shadow-sm ring-1 ring-slate-200"
                    />
                    <div>
                        <h1 className="text-lg font-bold text-navy">Crear cuenta</h1>
                        <p className="text-xs text-slate-500">INTU IMPORT · Portal del Importador</p>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                        {error}
                    </div>
                )}

                <form onSubmit={submit} className="mt-5 space-y-3">
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">Nombre completo</label>
                        <input
                            required
                            value={form.name}
                            onChange={update('name')}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                            placeholder="Tu nombre"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">Correo electrónico</label>
                        <input
                            type="email"
                            required
                            value={form.email}
                            onChange={update('email')}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                            placeholder="tu@empresa.bo"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">Ciudad / País</label>
                        <input
                            value={form.city}
                            onChange={update('city')}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                            placeholder="Cochabamba · Bolivia"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-600">Contraseña</label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={form.password}
                                onChange={update('password')}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                                placeholder="Mínimo 8"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-600">Repetir</label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={form.password_confirmation}
                                onChange={update('password_confirmation')}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                                placeholder="Repite"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-gold bg-gold-hover py-2.5 text-sm font-bold text-white disabled:opacity-60"
                    >
                        {loading ? 'Creando cuenta...' : 'Registrarme'}
                    </button>
                </form>

                <p className="mt-5 text-center text-xs text-slate-500">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" className="font-semibold text-amber-600 hover:underline">
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}
