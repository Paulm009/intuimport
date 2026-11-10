import { useEffect, useState } from 'react';
import { api, firstError } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Empty, Field, Modal, PageHeader, Pill, Spinner, btnGhost, btnNavy, btnPrimary, inputClass } from '../components/ui';
import Icon from '../components/Icon';
import { formatDate, formatDateTime, initials, money } from '../lib/format';

const emptyCertificate = { title: '', folio: '' };
const emptyPassword = { current_password: '', password: '', password_confirmation: '' };

export default function Account() {
    const { user, updateUser } = useAuth();
    const { toast } = useToast();
    const [tab, setTab] = useState('resumen');
    const [stats, setStats] = useState(null);
    const [certificates, setCertificates] = useState([]);
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    const [profileOpen, setProfileOpen] = useState(false);
    const [profile, setProfile] = useState({});
    const [certOpen, setCertOpen] = useState(false);
    const [certificate, setCertificate] = useState(emptyCertificate);
    const [viewCert, setViewCert] = useState(null);
    const [password, setPassword] = useState(emptyPassword);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try {
            const [dashboard, certs, devs] = await Promise.all([
                api.get('/dashboard'),
                api.get('/certificates'),
                api.get('/devices'),
            ]);
            setStats(dashboard.kpis);
            setCertificates(certs.certificates);
            setDevices(devs.devices);
        } catch (error) {
            toast(firstError(error, 'No se pudo cargar la cuenta.'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    useEffect(() => {
        if (user) {
            setProfile({
                name: user.name || '',
                email: user.email || '',
                ci: user.ci || '',
                phone: user.phone || '',
                job_role: user.job_role || '',
                city: user.city || '',
                interests: user.interests || '',
            });
        }
    }, [user]);

    const saveProfile = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            const data = await api.put('/profile', profile);
            updateUser(data.user);
            setProfileOpen(false);
            toast('Perfil actualizado');
        } catch (error) {
            toast(firstError(error), 'error');
        } finally {
            setSaving(false);
        }
    };

    const savePassword = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            await api.put('/password', password);
            setPassword(emptyPassword);
            toast('Contraseña actualizada');
        } catch (error) {
            toast(firstError(error), 'error');
        } finally {
            setSaving(false);
        }
    };

    const addCertificate = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            const data = await api.post('/certificates', certificate);
            setCertificates((current) => [data.certificate, ...current]);
            setCertificate(emptyCertificate);
            setCertOpen(false);
            toast('Certificado registrado');
        } catch (error) {
            toast(firstError(error), 'error');
        } finally {
            setSaving(false);
        }
    };

    const closeDevice = async (device) => {
        try {
            await api.del(`/devices/${device.id}`);
            setDevices((current) => current.filter((item) => item.id !== device.id));
            toast('Sesión remota cerrada');
        } catch (error) {
            toast(firstError(error), 'error');
        }
    };

    if (loading) return <Spinner label="Cargando cuenta..." />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 rounded-2xl bg-navy p-6 text-white sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold text-2xl font-extrabold text-white">
                        {initials(user?.name)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold">{user?.name}</h1>
                            <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Activo
                            </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-300">
                            {user?.email} · {user?.city || 'Bolivia'}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setProfileOpen(true)}
                    className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
                >
                    <Icon name="edit" size={14} /> Editar Perfil
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                <Pill active={tab === 'resumen'} onClick={() => setTab('resumen')}>Resumen</Pill>
                <Pill active={tab === 'certificados'} onClick={() => setTab('certificados')}>Mis Certificados</Pill>
                <Pill active={tab === 'seguridad'} onClick={() => setTab('seguridad')}>Seguridad y Sesiones</Pill>
            </div>

            {tab === 'resumen' && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-7">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-navy">Datos de Perfil del Miembro</h2>
                        <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
                            {[
                                ['Carnet / Documento', user?.ci || '—'],
                                ['Celular / WhatsApp', user?.phone || '—'],
                                ['Ocupación', user?.job_role || '—'],
                                ['Ciudad / País', user?.city || '—'],
                            ].map(([label, value]) => (
                                <div key={label} className="rounded-xl bg-slate-50 p-3">
                                    <div className="text-[10px] font-bold uppercase text-slate-400">{label}</div>
                                    <div className="mt-0.5 font-semibold text-slate-800">{value}</div>
                                </div>
                            ))}
                            <div className="rounded-xl bg-slate-50 p-3 sm:col-span-2">
                                <div className="text-[10px] font-bold uppercase text-slate-400">Rubros que me interesan</div>
                                <div className="mt-0.5 font-semibold text-slate-800">{user?.interests || '—'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 lg:col-span-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="text-xs text-slate-500">Importaciones Realizadas</div>
                                <div className="mt-1 text-2xl font-extrabold text-navy">{stats?.imports ?? 0}</div>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="text-xs text-slate-500">Total Cotizado (USD)</div>
                                <div className="mt-1 text-2xl font-extrabold text-emerald-600">{money(stats?.total_quoted_usd ?? 0)}</div>
                            </div>
                        </div>
                        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase text-navy">Detalle de Membresía</span>
                                <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">Plan Importador Anual</span>
                            </div>
                            <p className="text-xs text-slate-500">
                                Acceso completo a calculadoras, buscador arancelario, gestor de embarques y grabaciones.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'certificados' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button type="button" onClick={() => setCertOpen(true)} className={btnPrimary}>
                            + Registrar Certificado
                        </button>
                    </div>
                    {certificates.length === 0 ? (
                        <Empty>Aún no tienes certificados registrados.</Empty>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            {certificates.map((item) => (
                                <div key={item.id} className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">VERIFICADO CON QR</span>
                                            <h3 className="mt-1 text-base font-bold text-navy">{item.title}</h3>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Folio: {item.folio} · Emisión: {formatDate(item.issued_at)}
                                            </p>
                                        </div>
                                        <div className="text-amber-500"><Icon name="medal" size={24} /></div>
                                    </div>
                                    <button type="button" onClick={() => setViewCert(item)} className={`${btnNavy} flex w-full items-center justify-center gap-1.5`}>
                                        <Icon name="eye" size={14} /> Ver Certificado y QR
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {tab === 'seguridad' && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <form onSubmit={savePassword} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-6">
                        <h2 className="text-sm font-bold text-navy">Cambiar Contraseña de Acceso</h2>
                        <Field label="Contraseña actual">
                            <input type="password" required value={password.current_password} onChange={(event) => setPassword({ ...password, current_password: event.target.value })} className={inputClass} />
                        </Field>
                        <Field label="Nueva contraseña">
                            <input type="password" required minLength={8} value={password.password} onChange={(event) => setPassword({ ...password, password: event.target.value })} className={inputClass} placeholder="Mínimo 8 caracteres" />
                        </Field>
                        <Field label="Repetir nueva contraseña">
                            <input type="password" required minLength={8} value={password.password_confirmation} onChange={(event) => setPassword({ ...password, password_confirmation: event.target.value })} className={inputClass} />
                        </Field>
                        <button type="submit" disabled={saving} className={btnPrimary}>
                            {saving ? 'Actualizando...' : 'Actualizar Contraseña'}
                        </button>
                    </form>

                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-navy">Dispositivos Activos</h2>
                            <span className="text-xs font-bold text-slate-500">{devices.length} / 3</span>
                        </div>
                        {devices.length === 0 ? (
                            <Empty>No hay dispositivos registrados.</Empty>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {devices.map((device) => (
                                    <div key={device.id} className="flex items-center justify-between gap-3 py-3 text-xs">
                                        <div>
                                            <div className="font-semibold text-slate-800">
                                                {device.name}
                                                {device.is_current && (
                                                    <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">Actual</span>
                                                )}
                                            </div>
                                            <div className="text-[11px] text-slate-400">
                                                {device.location || '—'} · {formatDateTime(device.last_active_at)}
                                            </div>
                                        </div>
                                        {!device.is_current && (
                                            <button type="button" onClick={() => closeDevice(device)} className="shrink-0 font-bold text-slate-400 hover:text-rose-600">
                                                Cerrar
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Modal
                open={profileOpen}
                onClose={() => setProfileOpen(false)}
                title="Editar Perfil"
                footer={
                    <>
                        <button type="button" onClick={() => setProfileOpen(false)} className={btnGhost}>Cancelar</button>
                        <button type="submit" form="profile-form" disabled={saving} className={btnPrimary}>
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </>
                }
            >
                <form id="profile-form" onSubmit={saveProfile} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Nombre completo *" className="sm:col-span-2">
                        <input required value={profile.name || ''} onChange={(event) => setProfile({ ...profile, name: event.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Correo electrónico *">
                        <input type="email" required value={profile.email || ''} onChange={(event) => setProfile({ ...profile, email: event.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Carnet / Documento">
                        <input value={profile.ci || ''} onChange={(event) => setProfile({ ...profile, ci: event.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Celular / WhatsApp">
                        <input value={profile.phone || ''} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Ocupación">
                        <input value={profile.job_role || ''} onChange={(event) => setProfile({ ...profile, job_role: event.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Ciudad / País" className="sm:col-span-2">
                        <input value={profile.city || ''} onChange={(event) => setProfile({ ...profile, city: event.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Rubros que me interesan" className="sm:col-span-2">
                        <input value={profile.interests || ''} onChange={(event) => setProfile({ ...profile, interests: event.target.value })} className={inputClass} />
                    </Field>
                </form>
            </Modal>

            <Modal
                open={certOpen}
                onClose={() => setCertOpen(false)}
                title="Registrar Certificado"
                footer={
                    <>
                        <button type="button" onClick={() => setCertOpen(false)} className={btnGhost}>Cancelar</button>
                        <button type="submit" form="certificate-form" disabled={saving} className={btnPrimary}>
                            {saving ? 'Guardando...' : 'Registrar'}
                        </button>
                    </>
                }
            >
                <form id="certificate-form" onSubmit={addCertificate} className="space-y-3">
                    <Field label="Título del certificado *">
                        <input required value={certificate.title} onChange={(event) => setCertificate({ ...certificate, title: event.target.value })} className={inputClass} placeholder="Ej. Especialización en Importación China – Bolivia" />
                    </Field>
                    <Field label="Folio *">
                        <input required value={certificate.folio} onChange={(event) => setCertificate({ ...certificate, folio: event.target.value })} className={inputClass} placeholder="Ej. CERT-IMP-2026-0841" />
                    </Field>
                </form>
            </Modal>

            <Modal
                open={!!viewCert}
                onClose={() => setViewCert(null)}
                title="Certificado Digital"
                footer={<button type="button" onClick={() => setViewCert(null)} className={btnNavy}>Cerrar</button>}
            >
                {viewCert && (
                    <div className="space-y-4 rounded-xl border-2 border-double border-amber-300 bg-amber-50/40 p-6 text-center">
                        <div className="text-amber-600"><Icon name="medal" size={32} /></div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700">INTU IMPORT · Certificación Oficial</div>
                        <h3 className="text-base font-extrabold text-navy">{viewCert.title}</h3>
                        <p className="text-xs text-slate-600">
                            Se certifica que <strong>{user?.name}</strong> completó satisfactoriamente el programa de formación.
                        </p>
                        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-lg bg-white text-[10px] font-mono text-slate-400 shadow-inner">
                            [ QR · {viewCert.folio} ]
                        </div>
                        <div className="text-[11px] text-slate-500">
                            Folio: {viewCert.folio} · Emisión: {formatDate(viewCert.issued_at)}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
