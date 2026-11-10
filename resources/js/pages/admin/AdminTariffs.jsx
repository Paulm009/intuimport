import { useEffect, useState } from 'react';
import { api, firstError } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Field, Modal, PageHeader, Spinner, btnGhost, btnPrimary, inputClass } from '../../components/ui';

const emptyForm = { code: '', description: '', ga: '10', iva: '14.94', requirement: '' };

export default function AdminTariffs() {
    const { toast } = useToast();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try {
            const data = await api.get('/admin/tariffs');
            setItems(data.tariffs);
        } catch (error) {
            toast(firstError(error, 'No se pudieron cargar los aranceles.'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const openCreate = () => { setEditing({ id: null }); setForm(emptyForm); };
    const openEdit = (item) => { setEditing(item); setForm({ code: item.code, description: item.description, ga: String(item.ga), iva: String(item.iva), requirement: item.requirement || '' }); };

    const save = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, ga: Number(form.ga), iva: Number(form.iva) };
            if (editing.id) {
                await api.put(`/admin/tariffs/${editing.id}`, payload);
                toast('Arancel actualizado');
            } else {
                await api.post('/admin/tariffs', payload);
                toast('Arancel creado');
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
        if (!window.confirm('¿Eliminar este arancel?')) return;
        try {
            await api.del(`/admin/tariffs/${item.id}`);
            toast('Arancel eliminado');
            load();
        } catch (error) {
            toast(firstError(error), 'error');
        }
    };

    if (loading) return <Spinner label="Cargando aranceles..." />;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Aranceles NANDINA"
                subtitle="Partidas arancelarias que consulta la calculadora del importador."
                actions={<button type="button" onClick={openCreate} className={btnPrimary}>+ Nuevo Arancel</button>}
            />
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                                <th className="px-4 py-3">Código</th>
                                <th className="px-4 py-3">Descripción</th>
                                <th className="px-4 py-3">GA</th>
                                <th className="px-4 py-3">IVA</th>
                                <th className="px-4 py-3">Requisito</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {items.length === 0 ? (
                                <tr><td colSpan={6} className="py-8 text-center text-slate-400">No hay aranceles.</td></tr>
                            ) : (
                                items.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-mono font-bold text-navy">{item.code}</td>
                                        <td className="px-4 py-3 text-slate-600">{item.description}</td>
                                        <td className="px-4 py-3 text-slate-600">{item.ga}%</td>
                                        <td className="px-4 py-3 text-slate-600">{item.iva}%</td>
                                        <td className="px-4 py-3 text-slate-500">{item.requirement}</td>
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
                title={editing?.id ? 'Editar Arancel' : 'Nuevo Arancel'}
                footer={
                    <>
                        <button type="button" onClick={() => setEditing(null)} className={btnGhost}>Cancelar</button>
                        <button type="submit" form="tariff-form" disabled={saving} className={btnPrimary}>{saving ? 'Guardando...' : 'Guardar'}</button>
                    </>
                }
            >
                <form id="tariff-form" onSubmit={save} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Código NANDINA *">
                        <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className={inputClass} placeholder="8539.52.00.00" />
                    </Field>
                    <Field label="GA (%)">
                        <input type="number" step="0.01" min="0" value={form.ga} onChange={(e) => setForm({ ...form, ga: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Descripción *" className="sm:col-span-2">
                        <input required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="IVA (%)">
                        <input type="number" step="0.01" min="0" value={form.iva} onChange={(e) => setForm({ ...form, iva: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Requisito">
                        <input value={form.requirement} onChange={(e) => setForm({ ...form, requirement: e.target.value })} className={inputClass} />
                    </Field>
                </form>
            </Modal>
        </div>
    );
}
