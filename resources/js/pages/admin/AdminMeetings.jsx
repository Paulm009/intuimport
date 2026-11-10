import { useEffect, useState } from 'react';
import { api, firstError } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Field, Modal, PageHeader, Spinner, btnGhost, btnPrimary, inputClass } from '../../components/ui';

const emptyForm = { title: '', day: 'Martes', time: '20:00 - 21:30', modality: 'Sesión Programada', scheduled_for: '' };

export default function AdminMeetings() {
    const { toast } = useToast();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try {
            const data = await api.get('/admin/meetings');
            setItems(data.meetings);
        } catch (error) {
            toast(firstError(error, 'No se pudieron cargar las reuniones.'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const openCreate = () => { setEditing({ id: null }); setForm(emptyForm); };
    const openEdit = (item) => { setEditing(item); setForm({ title: item.title, day: item.day, time: item.time, modality: item.modality || '', scheduled_for: item.scheduled_for || '' }); };

    const save = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, scheduled_for: form.scheduled_for || null };
            if (editing.id) {
                await api.put(`/admin/meetings/${editing.id}`, payload);
                toast('Reunión actualizada');
            } else {
                await api.post('/admin/meetings', payload);
                toast('Reunión creada');
            }
            setEditing(null);
            load();
        } catch (error) {
            toast(firstError(error), 'error');
        } finally {
            setSaving(false);
        }
    };

    const remove = async (item) => {
        if (!window.confirm('¿Eliminar esta reunión?')) return;
        try {
            await api.del(`/admin/meetings/${item.id}`);
            toast('Reunión eliminada');
            load();
        } catch (error) {
            toast(firstError(error), 'error');
        }
    };

    if (loading) return <Spinner label="Cargando reuniones..." />;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Reuniones y Clases en Vivo"
                subtitle="Agenda de sesiones programadas para los importadores."
                actions={<button type="button" onClick={openCreate} className={btnPrimary}>+ Nueva Reunión</button>}
            />
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                                <th className="px-4 py-3">Título</th>
                                <th className="px-4 py-3">Día</th>
                                <th className="px-4 py-3">Hora</th>
                                <th className="px-4 py-3">Modalidad</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {items.length === 0 ? (
                                <tr><td colSpan={5} className="py-8 text-center text-slate-400">No hay reuniones programadas.</td></tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-bold text-navy">{item.title}</td>
                                        <td className="px-4 py-3 text-slate-600">{item.day}</td>
                                        <td className="px-4 py-3 text-slate-600">{item.time}</td>
                                        <td className="px-4 py-3"><span className="rounded bg-slate-100 px-2 py-0.5 font-semibold">{item.modality}</span></td>
                                        <td className="px-4 py-3 text-right">
                                            <button type="button" onClick={() => openEdit(item)} className="mr-3 font-semibold text-amber-600 hover:underline">Editar</button>
                                            <button type="button" onClick={() => remove(item)} className="font-semibold text-rose-500 hover:underline">Eliminar</button>
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
                title={editing?.id ? 'Editar Reunión' : 'Nueva Reunión'}
                footer={
                    <>
                        <button type="button" onClick={() => setEditing(null)} className={btnGhost}>Cancelar</button>
                        <button type="submit" form="meeting-form" disabled={saving} className={btnPrimary}>{saving ? 'Guardando...' : 'Guardar'}</button>
                    </>
                }
            >
                <form id="meeting-form" onSubmit={save} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Título *" className="sm:col-span-2">
                        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Día">
                        <input value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Hora">
                        <input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Modalidad">
                        <input value={form.modality} onChange={(e) => setForm({ ...form, modality: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Fecha programada">
                        <input type="date" value={form.scheduled_for} onChange={(e) => setForm({ ...form, scheduled_for: e.target.value })} className={inputClass} />
                    </Field>
                </form>
            </Modal>
        </div>
    );
}
