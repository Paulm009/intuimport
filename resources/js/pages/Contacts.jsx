import { useEffect, useState } from 'react';
import { api, firstError } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { Empty, Field, Modal, PageHeader, Spinner, btnGhost, btnPrimary, inputClass } from '../components/ui';
import Icon from '../components/Icon';
import { initials } from '../lib/format';

const emptyForm = { name: '', role: 'Agente de carga', phone: '', email: '', location: 'Bolivia' };

export default function Contacts() {
    const { toast } = useToast();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try {
            const data = await api.get('/contacts');
            setContacts(data.contacts);
        } catch (error) {
            toast(firstError(error, 'No se pudo cargar la agenda.'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const create = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            await api.post('/contacts', form);
            toast('Contacto guardado');
            setModalOpen(false);
            setForm(emptyForm);
            load();
        } catch (error) {
            toast(firstError(error), 'error');
        } finally {
            setSaving(false);
        }
    };

    const remove = async (contact) => {
        try {
            await api.del(`/contacts/${contact.id}`);
            setContacts((current) => current.filter((item) => item.id !== contact.id));
            toast('Contacto eliminado');
        } catch (error) {
            toast(firstError(error), 'error');
        }
    };

    if (loading) return <Spinner label="Cargando contactos..." />;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Agenda de Contactos Clave"
                subtitle="Agentes de carga, despachantes de aduana, transportistas y proveedores de confianza."
                actions={
                    <button type="button" onClick={() => setModalOpen(true)} className={btnPrimary}>
                        + Nuevo Contacto
                    </button>
                }
            />

            {contacts.length === 0 ? (
                <Empty>Tu agenda está vacía. Agrega tu primer contacto.</Empty>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {contacts.map((contact) => (
                        <div key={contact.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-xs font-bold text-gold">
                                    {initials(contact.name)}
                                </div>
                                <div className="min-w-0">
                                    <div className="truncate text-sm font-bold text-navy">{contact.name}</div>
                                    <div className="truncate text-[11px] text-slate-500">{contact.role}</div>
                                </div>
                            </div>
                            <div className="space-y-1.5 text-xs text-slate-600">
                                <div className="flex items-center gap-1.5"><Icon name="phone" size={12} /> {contact.phone || '-'}</div>
                                <div className="flex items-center gap-1.5 truncate"><Icon name="mail" size={12} /> {contact.email || '-'}</div>
                                <div className="flex items-center gap-1.5"><Icon name="mapPin" size={12} /> {contact.location}</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => remove(contact)}
                                className="w-full rounded-lg border border-slate-200 py-1.5 text-[11px] font-semibold text-slate-500 hover:border-rose-200 hover:text-rose-600"
                            >
                                Eliminar contacto
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Nuevo Contacto"
                footer={
                    <>
                        <button type="button" onClick={() => setModalOpen(false)} className={btnGhost}>
                            Cancelar
                        </button>
                        <button type="submit" form="contact-form" disabled={saving} className={btnPrimary}>
                            {saving ? 'Guardando...' : 'Guardar Contacto'}
                        </button>
                    </>
                }
            >
                <form id="contact-form" onSubmit={create} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Nombre completo *" className="sm:col-span-2">
                        <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Rol / Cargo">
                        <input value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Teléfono / WhatsApp">
                        <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className={inputClass} placeholder="+591 ..." />
                    </Field>
                    <Field label="Correo electrónico">
                        <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Ciudad / País">
                        <input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} className={inputClass} />
                    </Field>
                </form>
            </Modal>
        </div>
    );
}
