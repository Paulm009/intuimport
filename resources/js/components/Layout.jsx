import { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { initials } from '../lib/format';
import Icon from './Icon';

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/cursos', label: 'Cursos', icon: 'course' },
    { to: '/grabaciones', label: 'Grabaciones', icon: 'recording' },
    { to: '/herramientas', label: 'Herramientas', icon: 'tools' },
    { to: '/biblioteca', label: 'Biblioteca', icon: 'library' },
];

const importItems = [
    { to: '/importes', label: 'Mis importaciones', icon: 'box' },
    { to: '/proveedores', label: 'Proveedores', icon: 'factory' },
    { to: '/productos', label: 'Productos', icon: 'receipt' },
    { to: '/sugerencias', label: 'Sugerencias', icon: 'bulb' },
];

const secondaryItems = [
    { to: '/contactos', label: 'Contactos', icon: 'users' },
    { to: '/comunidad', label: 'Comunidad', icon: 'chat' },
    { to: '/servicios', label: 'Servicios', icon: 'briefcase' },
    { to: '/oficina', label: 'Oficina', icon: 'building' },
];

const allNav = [...navItems, ...importItems, ...secondaryItems, { to: '/cuenta', label: 'Mi cuenta', icon: 'user' }];

function SidebarLink({ item, nested = false, onNavigate }) {
    return (
        <NavLink
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
                `sidebar-item flex w-full items-center gap-3 py-2.5 text-left text-sm ${
                    nested ? 'pl-11 pr-5 text-xs' : 'px-5'
                } ${isActive ? 'active' : 'text-slate-200'}`
            }
        >
            <span>{nested ? <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-50" /> : <Icon name={item.icon} size={16} />}</span>
            <span>{item.label}</span>
        </NavLink>
    );
}

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [importsOpen, setImportsOpen] = useState(true);
    const [search, setSearch] = useState('');
    const [notifOpen, setNotifOpen] = useState(false);

    const current = useMemo(() => {
        return allNav.find((item) => location.pathname.startsWith(item.to))?.label || 'Dashboard';
    }, [location.pathname]);

    const results = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return [];
        return allNav.filter((item) => item.label.toLowerCase().includes(query)).slice(0, 6);
    }, [search]);

    const closeMobile = () => setMobileOpen(false);

    return (
        <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#f4f6f8] md:flex-row">
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-slate-900/60 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
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
                            <div className="text-sm font-bold leading-tight tracking-wide text-white">
                                INTU IMPORT
                            </div>
                            <div className="text-[11px] font-medium text-amber-400">Portal del Importador</div>
                        </div>
                    </div>
                    <button type="button" onClick={() => setMobileOpen(false)} className="p-1 text-slate-300 md:hidden">
                        <Icon name="x" size={18} />
                    </button>
                </div>

                <nav className="custom-scrollbar flex-1 space-y-0.5 overflow-y-auto py-3 text-sm">
                    {navItems.map((item) => (
                        <SidebarLink key={item.to} item={item} onNavigate={closeMobile} />
                    ))}

                    <div>
                        <button
                            type="button"
                            onClick={() => setImportsOpen((value) => !value)}
                            className="sidebar-item flex w-full items-center justify-between px-5 py-2.5 text-left text-sm"
                        >
                            <span className="flex items-center gap-3">
                                <Icon name="box" size={16} />
                                <span>Mis importaciones</span>
                            </span>
                            <Icon name="chevronDown" size={14} className={importsOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                        </button>
                        {importsOpen && (
                            <div className="space-y-0.5 bg-navy-dark/60 py-1">
                                {importItems.map((item) => (
                                    <SidebarLink key={item.to} item={item} nested onNavigate={closeMobile} />
                                ))}
                            </div>
                        )}
                    </div>

                    {secondaryItems.map((item) => (
                        <SidebarLink key={item.to} item={item} onNavigate={closeMobile} />
                    ))}

                    <div className="mt-3 border-t border-white/10 pt-3">
                        <div className="px-5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Cuenta
                        </div>
                        {user?.is_admin && (
                            <SidebarLink item={{ to: '/admin', label: 'Panel de administración', icon: 'sliders' }} onNavigate={closeMobile} />
                        )}
                        <SidebarLink item={{ to: '/cuenta', label: 'Mi cuenta', icon: 'user' }} onNavigate={closeMobile} />
                    </div>
                </nav>

                <div className="flex items-center justify-between border-t border-white/10 bg-navy-dark p-4">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-xs font-bold text-white">
                            {initials(user?.name)}
                        </div>
                        <div className="truncate">
                            <div className="truncate text-xs font-semibold text-white">{user?.name}</div>
                            <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> <span>Miembro Activo</span>
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/cuenta')}
                        title="Mi cuenta"
                        className="rounded border border-white/10 px-2 py-1 text-slate-400 hover:text-amber-400"
                    >
                        <Icon name="sliders" size={15} />
                    </button>
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
                            <span className="font-semibold text-navy">Portal</span>
                            <span>·</span>
                            <span className="font-medium text-slate-800">{current}</span>
                        </div>
                    </div>

                    <div className="flex max-w-xl flex-1 items-center justify-end gap-2.5">
                        <div className="relative max-w-xs flex-1">
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Buscar módulo, herramienta..."
                                className="w-full rounded-lg border border-slate-200 bg-slate-100 py-1.5 pl-8 pr-3 text-xs focus:border-amber-500 focus:bg-white focus:outline-none"
                            />
                            <span className="absolute left-2.5 top-2 text-slate-400"><Icon name="search" size={14} /></span>
                            {results.length > 0 && (
                                <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                                    {results.map((item) => (
                                        <button
                                            key={item.to}
                                            type="button"
                                            onClick={() => {
                                                navigate(item.to);
                                                setSearch('');
                                            }}
                                            className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-slate-50"
                                        >
                                            <span className="flex items-center gap-2 truncate text-xs font-medium text-slate-800">
                                                <Icon name={item.icon} size={14} className="text-slate-400" />
                                                {item.label}
                                            </span>
                                            <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                                                Módulo
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate('/herramientas')}
                            className="hidden items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 lg:flex"
                        >
                            <Icon name="calculator" size={14} /> Calculadora
                        </button>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setNotifOpen((value) => !value)}
                                className="relative rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                            >
                                <Icon name="bell" size={16} />
                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-navy">
                                    2
                                </span>
                            </button>
                            {notifOpen && (
                                <div className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                                    <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
                                        <span className="text-xs font-bold text-navy">Notificaciones</span>
                                        <button
                                            type="button"
                                            onClick={() => setNotifOpen(false)}
                                            className="text-[11px] text-amber-600 hover:underline"
                                        >
                                            Cerrar
                                        </button>
                                    </div>
                                    <div className="space-y-2 text-xs text-slate-600">
                                        <div className="rounded-lg border border-amber-200/60 bg-amber-50/60 p-2">
                                            <div className="font-semibold text-slate-800">Calculadora actualizada</div>
                                            <div className="text-[11px] text-slate-500">
                                                Parámetros IVA (14.94%) y TC (6.96 Bs/USD) listos.
                                            </div>
                                        </div>
                                        <div className="rounded-lg bg-slate-50 p-2">
                                            <div className="font-semibold text-slate-800">Datos en la nube</div>
                                            <div className="text-[11px] text-slate-500">
                                                Tus registros ahora se guardan en la base de datos.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

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
