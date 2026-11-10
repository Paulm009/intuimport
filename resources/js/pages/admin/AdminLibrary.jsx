import { useEffect, useState } from 'react';
import { api, firstError } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Field, Modal, PageHeader, Spinner, btnGhost, btnPrimary, inputClass } from '../../components/ui';

const emptyForm = { title: '', category: 'Guía', content: '' };

export default function AdminLibrary() {
    const { toast } = useToast();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try {
            const data = await api.get('/admin/library');
            setItems(data.resources);
        } catch (error) {
            toast(firstError(error, 'No se pudieron cargar los recursos.'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const openCreate = () => { setEditing({ id: null }); setForm(emptyForm); };
    const openEdit = (item) => { setEditing(item); setForm({ title: item.title, category: item.category, content: item.content }); };

    const save = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            if (editing.id) {
                await api.put(`/admin/library/${editing.id}`, form);
                toast('Recurso actualizado');
            } else {
                await api.post('/admin/library', form);
                toast('Recurso creado');
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
        if (!window.confirm('¿Eliminar este recurso?')) return;
        try {
            await api.del(`/admin/library/${item.id}`);
            toast('Recurso eliminado');
            load();
        } catch (error) {
            toast(firstError(error), 'error');
        }
    };

    if (loading) return <Spinner label="Cargando biblioteca..." />;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Biblioteca"
                subtitle="Guías, manuales y plantillas de comercio exterior."
                actions={<button type="button" onClick={openCreate} className={btnPrimary}>+ Nuevo Recurso</button>}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {items.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-xs text-slate-400 sm:col-span-2">
                        No hay recursos en la biblioteca.
                    </div>
                )}
                {items.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">{item.category}</span>
                                <h3 className="mt-2 text-sm font-bold text-navy">{item.title}</h3>
                                <p className="mt-1 line-clamp-3 whitespace-pre-line text-xs text-slate-500">{item.content}</p>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3 text-xs">
                            <button type="button" onClick={() => openEdit(item)} className="font-semibold text-amber-600 hover:underline">Editar</button>
                            <button type="button" onClick={() => remove(item)} className="font-semibold text-rose-500 hover:underline">Eliminar</button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                open={!!editing}
                onClose={() => setEditing(null)}
                title={editing?.id ? 'Editar Recurso' : 'Nuevo Recurso'}
                wide
                footer={
                    <>
                        <button type="button" onClick={() => setEditing(null)} className={btnGhost}>Cancelar</button>
                        <button type="submit" form="library-form" disabled={saving} className={btnPrimary}>{saving ? 'Guardando...' : 'Guardar'}</button>
                    </>
                }
            >
                <form id="library-form" onSubmit={save} className="grid grid-cols-1 gap-3">
                    <Field label="Título *">
                        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Categoría">
                        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
                            <option>Guía</option>
                            <option>Glosarios</option>
                            <option>Contrato</option>
                            <option>Manual</option>
                            <option>Plantilla</option>
                        </select>
                    </Field>
                    <Field label="Contenido *">
                        <textarea required rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className={inputClass} />
                    </Field>
                </form>
            </Modal>
        </div>
    );
}
