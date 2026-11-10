import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, firstError } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Field, Modal, PageHeader, Pill, Spinner, btnGhost, btnPrimary, inputClass } from '../../components/ui';
import { formatDate } from '../../lib/format';

const statusLabels = {
    active: 'Activo',
    suspended: 'Suspendido',
    expired: 'Vencido',
};

function StatusBadge({ status }) {
    const styles = {
        active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        suspended: 'bg-rose-50 text-rose-700 border-rose-200',
        expired: 'bg-amber-50 text-amber-700 border-amber-200',
    };

    return (
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${styles[status] || styles.active}`}>
            {statusLabels[status] || status}
        </span>
    );
}

const emptyEdit = {
    name: '', email: '', ci: '', phone: '', job_role: '', city: '', interests: '',
    membership_plan: '', password: '', is_admin: false,
};

export default function AdminUsers() {
    const { toast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyEdit);
    const [saving, setSaving] = useState(false);
    const [subscribing, setSubscribing] = useState(null);
    const [subForm, setSubForm] = useState({ membership_plan: '', subscription_ends_at: '' });

    const status = searchParams.get('status') || 'all';

    const load = async () => {
        try {
            const params = new URLSearchParams();
            if (query.trim()) params.set('q', query.trim());
            const data = await api.get(`/admin/users?${params.toString()}`);
            setUsers(data.users);
        } catch (error) {
            toast(firstError(error, 'No se pudieron cargar los usuarios.'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [query]);

    const filtered = useMemo(() => {
        if (status === 'all') return users;
        return users.filter((user) => user.access_status === status);
    }, [users, status]);

    const openEdit = (user) => {
        setEditing(user);
        setForm({
            name: user.name, email: user.email, ci: user.ci || '', phone: user.phone || '',
            job_role: user.job_role || '', city: user.city || '', interests: user.interests || '',
            membership_plan: user.membership_plan || '', password: '', is_admin: user.is_admin,
        });
    };

    const saveEdit = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form };
            if (!payload.password) delete payload.password;
            await api.put(`/admin/users/${editing.id}`, payload);
            toast('Usuario actualizado');
            setEditing(null);
            load();
        } catch (error) {
            toast(firstError(error), 'error');
        } finally {
            setSaving(false);
        }
    };

    const openSubscription = (user) => {
        setSubscribing(user);
        setSubForm({
            membership_plan: user.membership_plan || '',
            subscription_ends_at: user.subscription_ends_at || '',
        });
    };

    const saveSubscription = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            await api.post(`/admin/users/${subscribing.id}/subscription`, {
                membership_plan: subForm.membership_plan,
                subscription_ends_at: subForm.subscription_ends_at || null,
            });
            toast('Suscripción actualizada');
            setSubscribing(null);
            load();
        } catch (error) {
            toast(firstError(error), 'error');
        } finally {
            setSaving(false);
        }
    };

    const toggleStatus = async (user) => {
        const next = user.status === 'suspended' ? 'active' : 'suspended';
        try {
            await api.post(`/admin/users/${user.id}/status`, { status: next });
            toast(next === 'suspended' ? 'Cuenta suspendida' : 'Cuenta reactivada');
            load();
        } catch (error) {
            toast(firstError(error), 'error');
        }
    };

    const remove = async (user) => {
        if (!window.confirm(`¿Eliminar a ${user.name}? Esta acción no se puede deshacer.`)) return;
        try {
            await api.del(`/admin/users/${user.id}`);
            toast('Usuario eliminado');
            load();
        } catch (error) {
            toast(firstError(error), 'error');
        }
    };

    if (loading) return <Spinner label="Cargando usuarios..." />;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Usuarios y Suscripciones"
                subtitle="Administra las cuentas de los importadores: suspende, reactiva o define la fecha límite de su suscripción."
            />

            <div className="flex flex-wrap items-center gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar por nombre, correo o ciudad..."
                    className="w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                />
                <div className="flex flex-wrap gap-1.5">
                    {['all', 'active', 'suspended', 'expired'].map((value) => (
                        <Pill
                            key={value}
                            active={status === value}
                            onClick={() => setSearchParams(value === 'all' ? {} : { status: value })}
                        >
                            {value === 'all' ? 'Todos' : statusLabels[value]}
                        </Pill>
                    ))}
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                                <th className="px-4 py-3">Usuario</th>
                                <th className="px-4 py-3">Plan</th>
                                <th className="px-4 py-3">Estado</th>
                                <th className="px-4 py-3">Vence</th>
                                <th className="px-4 py-3">Actividad</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-400">
                                        No hay usuarios que coincidan con el filtro.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-navy">
                                                {user.name}
                                                {user.is_admin && (
                                                    <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                                                        ADMIN
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-slate-500">{user.email}</div>
                                            <div className="text-[11px] text-slate-400">{user.city}</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{user.membership_plan || '—'}</td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={user.access_status} />
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {user.subscription_ends_at ? formatDate(user.subscription_ends_at) : 'Sin límite'}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">
                                            {user.imports_count ?? 0} imp. · {user.products_count ?? 0} prod.
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <button type="button" onClick={() => openSubscription(user)} className="font-semibold text-amber-600 hover:underline">
                                                    Suscripción
                                                </button>
                                                <button type="button" onClick={() => openEdit(user)} className="font-semibold text-slate-500 hover:underline">
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleStatus(user)}
                                                    className={`font-semibold hover:underline ${user.status === 'suspended' ? 'text-emerald-600' : 'text-rose-600'}`}
                                                >
                                                    {user.status === 'suspended' ? 'Reactivar' : 'Suspender'}
                                                </button>
                                                <button type="button" onClick={() => remove(user)} className="font-semibold text-slate-400 hover:text-rose-600">
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                open={!!editing}
                onClose={() => setEditing(null)}
                title={`Editar usuario · ${editing?.name || ''}`}
                wide
                footer={
                    <>
                        <button type="button" onClick={() => setEditing(null)} className={btnGhost}>
                            Cancelar
                        </button>
                        <button type="submit" form="user-edit-form" disabled={saving} className={btnPrimary}>
                            {saving ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </>
                }
            >
                <form id="user-edit-form" onSubmit={saveEdit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Nombre completo *">
                        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Correo electrónico *">
                        <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="C.I.">
                        <input value={form.ci} onChange={(e) => setForm({ ...form, ci: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Teléfono">
                        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Rol / Ocupación">
                        <input value={form.job_role} onChange={(e) => setForm({ ...form, job_role: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Ciudad">
                        <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Intereses">
                        <input value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Plan de membresía">
                        <input value={form.membership_plan} onChange={(e) => setForm({ ...form, membership_plan: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Nueva contraseña (opcional)">
                        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} placeholder="Dejar vacío para no cambiar" />
                    </Field>
                    <Field label="Rol en la plataforma">
                        <select
                            value={form.is_admin ? '1' : '0'}
                            onChange={(e) => setForm({ ...form, is_admin: e.target.value === '1' })}
                            className={inputClass}
                        >
                            <option value="0">Importador</option>
                            <option value="1">Administrador</option>
                        </select>
                    </Field>
                </form>
            </Modal>

            <Modal
                open={!!subscribing}
                onClose={() => setSubscribing(null)}
                title={`Suscripción · ${subscribing?.name || ''}`}
                footer={
                    <>
                        <button type="button" onClick={() => setSubscribing(null)} className={btnGhost}>
                            Cancelar
                        </button>
                        <button type="submit" form="subscription-form" disabled={saving} className={btnPrimary}>
                            {saving ? 'Guardando...' : 'Guardar suscripción'}
                        </button>
                    </>
                }
            >
                <form id="subscription-form" onSubmit={saveSubscription} className="grid grid-cols-1 gap-3">
                    <Field label="Plan de membresía">
                        <select
                            value={subForm.membership_plan}
                            onChange={(e) => setSubForm({ ...subForm, membership_plan: e.target.value })}
                            className={inputClass}
                        >
                            <option value="">— Seleccionar plan —</option>
                            <option value="Plan Importador Anual">Plan Importador Anual</option>
                            <option value="Plan Importador Semestral">Plan Importador Semestral</option>
                            <option value="Plan Importador Mensual">Plan Importador Mensual</option>
                            <option value="Staff">Staff</option>
                        </select>
                    </Field>
                    <Field label="Fecha límite de la suscripción">
                        <input
                            type="date"
                            value={subForm.subscription_ends_at}
                            onChange={(e) => setSubForm({ ...subForm, subscription_ends_at: e.target.value })}
                            className={inputClass}
                        />
                    </Field>
                    <p className="text-[11px] text-slate-400">
                        Deja la fecha vacía para una cuenta sin límite de vencimiento. Al vencer la fecha, el importador perderá el acceso hasta renovar.
                    </p>
                </form>
            </Modal>
        </div>
    );
}
