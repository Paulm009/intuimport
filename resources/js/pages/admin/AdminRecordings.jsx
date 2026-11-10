import { useEffect, useState } from 'react';
import { api, firstError } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Field, Modal, PageHeader, Spinner, btnGhost, btnPrimary, inputClass } from '../../components/ui';
import { formatDate } from '../../lib/format';

const emptyForm = { title: '', category: 'CLASES', duration: '60 min', recorded_on: '', summary: '' };

export default function AdminRecordings() {
    const { toast } = useToast();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try {
            const data = await api.get('/admin/recordings');
            setItems(data.recordings);
        } catch (error) {
            toast(firstError(error, 'No se pudieron cargar las grabaciones.'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const openCreate = () => { setEditing({ id: null }); setForm(emptyForm); };
    const openEdit = (item) => { setEditing(item); setForm({ title: item.title, category: item.category, duration: item.duration, recorded_on: item.recorded_on || '', summary: item.summary || '' }); };

    const save = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, recorded_on: form.recorded_on || null };
            if (editing.id) {
                await api.put(`/admin/recordings/${editing.id}`, payload);
                toast('Grabación actualizada');
            } else {
                await api.post('/admin/recordings', payload);
                toast('Grabación creada');
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
        if (!window.confirm('¿Eliminar esta grabación?')) return;
        try {
            await api.del(`/admin/recordings/${item.id}`);
            toast('Grabación eliminada');
            load();
        } catch (error) {
            toast(firstError(error), 'error');
        }
    };

    if (loading) return <Spinner label="Cargando grabaciones..." />;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Grabaciones"
                subtitle="Clases y talleres grabados disponibles para los importadores."
                actions={<button type="button" onClick={openCreate} className={btnPrimary}>+ Nueva Grabación</button>}
            />
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                                <th className="px-4 py-3">Título</th>
                                <th className="px-4 py-3">Categoría</th>
                                <th className="px-4 py-3">Duración</th>
                                <th className="px-4 py-3">Fecha</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {items.length === 0 ? (
                                <tr><td colSpan={5} className="py-8 text-center text-slate-400">No hay grabaciones.</td></tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-navy">{item.title}</div>
                                            <div className="max-w-md truncate text-slate-400">{item.summary}</div>
                                        </td>
                                        <td className="px-4 py-3"><span className="rounded bg-slate-100 px-2 py-0.5 font-semibold">{item.category}</span></td>
                                        <td className="px-4 py-3 text-slate-600">{item.duration}</td>
                                        <td className="px-4 py-3 text-slate-600">{formatDate(item.recorded_on)}</td>
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
                title={editing?.id ? 'Editar Grabación' : 'Nueva Grabación'}
                footer={
                    <>
                        <button type="button" onClick={() => setEditing(null)} className={btnGhost}>Cancelar</button>
                        <button type="submit" form="recording-form" disabled={saving} className={btnPrimary}>{saving ? 'Guardando...' : 'Guardar'}</button>
                    </>
                }
            >
                <form id="recording-form" onSubmit={save} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Título *" className="sm:col-span-2">
                        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Categoría">
                        <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Duración">
                        <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Fecha">
                        <input type="date" value={form.recorded_on} onChange={(e) => setForm({ ...form, recorded_on: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Resumen" className="sm:col-span-2">
                        <textarea rows={3} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className={inputClass} />
                    </Field>
                </form>
            </Modal>
        </div>
    );
}
