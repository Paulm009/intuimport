import { useEffect, useState } from 'react';
import { api, firstError } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Field, Modal, PageHeader, Spinner, btnGhost, btnPrimary, inputClass } from '../../components/ui';
import { money } from '../../lib/format';

const emptyForm = { name: '', fob: '0', ga: '10', moq: '1', description: '' };

export default function AdminSuggestions() {
    const { toast } = useToast();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try {
            const data = await api.get('/admin/suggestions');
            setItems(data.suggestions);
        } catch (error) {
            toast(firstError(error, 'No se pudieron cargar las sugerencias.'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const openCreate = () => { setEditing({ id: null }); setForm(emptyForm); };
    const openEdit = (item) => { setEditing(item); setForm({ name: item.name, fob: String(item.fob), ga: String(item.ga), moq: String(item.moq), description: item.description || '' }); };

    const save = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, fob: Number(form.fob), ga: Number(form.ga), moq: Number(form.moq) };
            if (editing.id) {
                await api.put(`/admin/suggestions/${editing.id}`, payload);
                toast('Sugerencia actualizada');
            } else {
                await api.post('/admin/suggestions', payload);
                toast('Sugerencia creada');
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
        if (!window.confirm('¿Eliminar esta sugerencia?')) return;
        try {
            await api.del(`/admin/suggestions/${item.id}`);
            toast('Sugerencia eliminada');
            load();
        } catch (error) {
            toast(firstError(error), 'error');
        }
    };

    if (loading) return <Spinner label="Cargando sugerencias..." />;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Sugerencias de Productos"
                subtitle="Productos ganadores recomendados a los importadores."
                actions={<button type="button" onClick={openCreate} className={btnPrimary}>+ Nueva Sugerencia</button>}
            />
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                                <th className="px-4 py-3">Producto</th>
                                <th className="px-4 py-3">FOB</th>
                                <th className="px-4 py-3">GA</th>
                                <th className="px-4 py-3">MOQ</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {items.length === 0 ? (
                                <tr><td colSpan={5} className="py-8 text-center text-slate-400">No hay sugerencias.</td></tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-navy">{item.name}</div>
                                            <div className="max-w-md truncate text-slate-400">{item.description}</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{money(item.fob)}</td>
                                        <td className="px-4 py-3 text-slate-600">{item.ga}%</td>
                                        <td className="px-4 py-3 text-slate-600">{item.moq}</td>
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
                title={editing?.id ? 'Editar Sugerencia' : 'Nueva Sugerencia'}
                footer={
                    <>
                        <button type="button" onClick={() => setEditing(null)} className={btnGhost}>Cancelar</button>
                        <button type="submit" form="suggestion-form" disabled={saving} className={btnPrimary}>{saving ? 'Guardando...' : 'Guardar'}</button>
                    </>
                }
            >
                <form id="suggestion-form" onSubmit={save} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Nombre del producto *" className="sm:col-span-2">
                        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Precio FOB (USD)">
                        <input type="number" step="0.01" min="0" value={form.fob} onChange={(e) => setForm({ ...form, fob: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="GA (%)">
                        <input type="number" step="0.01" min="0" value={form.ga} onChange={(e) => setForm({ ...form, ga: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="MOQ (cantidad mínima)">
                        <input type="number" min="1" value={form.moq} onChange={(e) => setForm({ ...form, moq: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Descripción" className="sm:col-span-2">
                        <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
                    </Field>
                </form>
            </Modal>
        </div>
    );
}
