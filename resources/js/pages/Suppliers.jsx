import { useEffect, useState } from 'react';
import { api, firstError } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { Field, Modal, PageHeader, Spinner, btnGhost, btnPrimary, inputClass } from '../components/ui';
import Icon from '../components/Icon';

const emptyForm = { name: '', city: 'China · ', sells: '', port: 'FOB Shenzhen', contact: '', rating: '5' };

export default function Suppliers() {
    const { toast } = useToast();
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try {
            const data = await api.get('/suppliers');
            setSuppliers(data.suppliers);
        } catch (error) {
            toast(firstError(error, 'No se pudo cargar el directorio.'), 'error');
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
            await api.post('/suppliers', { ...form, rating: Number(form.rating) });
            toast('Proveedor guardado');
            setModalOpen(false);
            setForm(emptyForm);
            load();
        } catch (error) {
            toast(firstError(error), 'error');
        } finally {
            setSaving(false);
        }
    };

    const remove = async (supplier) => {
        try {
            await api.del(`/suppliers/${supplier.id}`);
            setSuppliers((current) => current.filter((item) => item.id !== supplier.id));
            toast('Proveedor eliminado');
        } catch (error) {
            toast(firstError(error), 'error');
        }
    };

    if (loading) return <Spinner label="Cargando proveedores..." />;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Directorio de Proveedores y Fábricas"
                subtitle="Registra tus fabricantes verificados de Alibaba, 1688, ferias y agentes directos."
                actions={
                    <button type="button" onClick={() => setModalOpen(true)} className={btnPrimary}>
                        + Nuevo Proveedor
                    </button>
                }
            />

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                                <th className="px-4 py-3">Proveedor</th>
                                <th className="px-4 py-3">País · Ciudad</th>
                                <th className="px-4 py-3">Qué Vende</th>
                                <th className="px-4 py-3">Puerto / Incoterm</th>
                                <th className="px-4 py-3">Vendedor Contacto</th>
                                <th className="px-4 py-3">Reseña</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {suppliers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-slate-400">
                                        Directorio vacío. Registra tu primer proveedor.
                                    </td>
                                </tr>
                            ) : (
                                suppliers.map((supplier) => (
                                    <tr key={supplier.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-bold text-navy">{supplier.name}</td>
                                        <td className="px-4 py-3 text-slate-600">{supplier.city}</td>
                                        <td className="px-4 py-3 text-slate-700">{supplier.sells}</td>
                                        <td className="px-4 py-3">
                                            <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold">{supplier.port}</span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{supplier.contact}</td>
                                        <td className="px-4 py-3 text-amber-600">
                                            <span className="flex items-center gap-1 font-bold"><Icon name="star" size={13} /> {supplier.rating}/5</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button type="button" onClick={() => remove(supplier)} className="font-bold text-slate-400 hover:text-rose-600">
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Registrar Nuevo Proveedor"
                footer={
                    <>
                        <button type="button" onClick={() => setModalOpen(false)} className={btnGhost}>
                            Cancelar
                        </button>
                        <button type="submit" form="supplier-form" disabled={saving} className={btnPrimary}>
                            {saving ? 'Guardando...' : 'Guardar Proveedor'}
                        </button>
                    </>
                }
            >
                <form id="supplier-form" onSubmit={create} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Razón Social / Fábrica *" className="sm:col-span-2">
                        <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClass} placeholder="Ej. Guangzhou Smart Electronics Ltd." />
                    </Field>
                    <Field label="País y Ciudad">
                        <input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Rubro / Qué vende">
                        <input value={form.sells} onChange={(event) => setForm({ ...form, sells: event.target.value })} className={inputClass} placeholder="Ej. Audio y Accesorios Móviles" />
                    </Field>
                    <Field label="Puerto e Incoterm habitual">
                        <input value={form.port} onChange={(event) => setForm({ ...form, port: event.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Vendedor (Nombre y WhatsApp/WeChat)">
                        <input value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} className={inputClass} placeholder="Ej. Kevin Chen (+86 138...)" />
                    </Field>
                    <Field label="Calificación" className="sm:col-span-2">
                        <select value={form.rating} onChange={(event) => setForm({ ...form, rating: event.target.value })} className={inputClass}>
                            <option value="5">5/5 — Verificado</option>
                            <option value="4">4/5 — Confiable</option>
                            <option value="3">3/5 — En evaluación</option>
                        </select>
                    </Field>
                </form>
            </Modal>
        </div>
    );
}
