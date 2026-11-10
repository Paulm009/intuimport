import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { initials } from '../lib/format';
import Icon from './Icon';

const navItems = [
    { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
    { to: '/admin/usuarios', label: 'Usuarios y Suscripciones', icon: 'users' },
    { to: '/admin/cursos', label: 'Cursos', icon: 'course' },
    { to: '/admin/grabaciones', label: 'Grabaciones', icon: 'recording' },
    { to: '/admin/aranceles', label: 'Aranceles NANDINA', icon: 'receipt' },
    { to: '/admin/biblioteca', label: 'Biblioteca', icon: 'library' },
    { to: '/admin/sugerencias', label: 'Sugerencias', icon: 'bulb' },
    { to: '/admin/reuniones', label: 'Reuniones', icon: 'calendar' },
    { to: '/admin/comunidad', label: 'Comunidad', icon: 'chat' },
];

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const current =
        navItems.find((item) => (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)))
            ?.label || 'Dashboard';

    return (
        <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#f4f6f8] md:flex-row">
            {mobileOpen && (
                <div className="fixed inset-0 z-30 bg-slate-900/60 md:hidden" onClick={() => setMobileOpen(false)} />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 select-none flex-col bg-navy text-slate-200 transition-transform duration-200 md:static md:translate-x-0 ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/intu-import-logo.png"
                            alt="INTU IMPORT"
                            className="h-10 w-10 rounded-lg bg-white object-contain p-0.5 shadow-sm"
                        />
                        <div>
                            <div className="text-sm font-bold leading-tight tracking-wide text-white">INTU IMPORT</div>
                            <div className="text-[11px] font-medium text-amber-400">Panel de Administración</div>
                        </div>
                    </div>
                    <button type="button" onClick={() => setMobileOpen(false)} className="p-1 text-slate-300 md:hidden">
                        <Icon name="x" size={18} />
                    </button>
                </div>

                <nav className="custom-scrollbar flex-1 space-y-0.5 overflow-y-auto py-3 text-sm">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) =>
                                `sidebar-item flex w-full items-center gap-3 px-5 py-2.5 text-left text-sm ${
                                    isActive ? 'active' : 'text-slate-200'
                                }`
                            }
                        >
                            <span>{item.icon && <Icon name={item.icon} size={16} />}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="flex items-center justify-between border-t border-white/10 bg-navy-dark p-4">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-bold text-white">
                            {initials(user?.name)}
                        </div>
                        <div className="truncate">
                            <div className="truncate text-xs font-semibold text-white">{user?.name}</div>
                            <div className="text-[11px] text-amber-400">Administrador</div>
                        </div>
                    </div>
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 md:hidden"
                        >
                            <Icon name="menu" size={18} />
                        </button>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                            <span className="font-semibold text-amber-600">Panel</span>
                            <span>·</span>
                            <span className="font-medium text-slate-800">{current}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                            ← Ver portal
                        </button>
                        <button
                            type="button"
                            onClick={logout}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                            Salir
                        </button>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
