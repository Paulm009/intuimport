import { useEffect, useState } from 'react';
import { api, firstError } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { Field, Modal, PageHeader, Pill, Spinner, btnGhost, btnPrimary, inputClass } from '../components/ui';
import Icon from '../components/Icon';
import { money } from '../lib/format';

const emptyForm = {
    name: '',
    supplier: '',
    brand: '',
    qty: '100',
    price: '14.50',
    state: 'importados',
};

export default function Products() {
    const { toast } = useToast();
    const [tab, setTab] = useState('importados');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const load = async (state = tab) => {
        setLoading(true);
        try {
            const data = await api.get(`/products?state=${state}`);
            setProducts(data.products);
        } catch (error) {
            toast(firstError(error, 'No se pudieron cargar los productos.'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load(tab);
    }, [tab]);

    const create = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            await api.post('/products', {
                ...form,
                qty: Number(form.qty),
                price: Number(form.price),
            });
            toast('Producto registrado');
            setModalOpen(false);
            setForm(emptyForm);
            setTab(form.state);
            load(form.state);
        } catch (error) {
            toast(firstError(error), 'error');
        } finally {
            setSaving(false);
        }
    };

    const remove = async (product) => {
        try {
            await api.del(`/products/${product.id}`);
            setProducts((current) => current.filter((item) => item.id !== product.id));
            toast('Producto eliminado');
        } catch (error) {
            toast(firstError(error), 'error');
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Registro de Productos e Ítems Cotizados"
                subtitle="Clasificados entre productos ya importados y productos en evaluación."
                actions={
                    <>
                        <Pill active={tab === 'importados'} onClick={() => setTab('importados')}>
                            Productos importados
                        </Pill>
                        <Pill active={tab === 'no-importados'} onClick={() => setTab('no-importados')}>
                            Productos no importados
                        </Pill>
                        <button type="button" onClick={() => setModalOpen(true)} className={btnPrimary}>
                            + Agregar Producto
                        </button>
                    </>
                }
            />

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {loading ? (
                    <Spinner label="Cargando productos..." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                                    <th className="px-4 py-3">Producto</th>
                                    <th className="px-4 py-3">Importación</th>
                                    <th className="px-4 py-3">Proveedor</th>
                                    <th className="px-4 py-3">Marca</th>
                                    <th className="px-4 py-3 text-right">Cantidad</th>
                                    <th className="px-4 py-3 text-right">Precio EXW</th>
                                    <th className="px-4 py-3 text-right">Sub Total</th>
                                    <th className="px-4 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-8 text-center text-slate-400">
                                            No hay productos registrados en esta pestaña.
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 font-bold text-navy">{product.name}</td>
                                            <td className="px-4 py-3 font-mono text-slate-500">{product.import_ref}</td>
                                            <td className="px-4 py-3 text-slate-700">{product.supplier}</td>
                                            <td className="px-4 py-3 text-slate-600">{product.brand}</td>
                                            <td className="px-4 py-3 text-right font-semibold">{product.qty}</td>
                                            <td className="px-4 py-3 text-right">{money(product.price)}</td>
                                            <td className="px-4 py-3 text-right font-bold text-emerald-700">
                                                {money((Number(product.qty) || 0) * (Number(product.price) || 0))}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button type="button" onClick={() => remove(product)} className="p-1 text-slate-400 hover:text-rose-600">
                                                    <Icon name="x" size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Agregar Producto al Catálogo"
                footer={
                    <>
                        <button type="button" onClick={() => setModalOpen(false)} className={btnGhost}>
                            Cancelar
                        </button>
                        <button type="submit" form="product-form" disabled={saving} className={btnPrimary}>
                            {saving ? 'Guardando...' : 'Guardar Producto'}
                        </button>
                    </>
                }
            >
                <form id="product-form" onSubmit={create} className="space-y-3">
                    <Field label="Nombre del Producto *">
                        <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClass} placeholder="Ej. Taladro Inalámbrico 21V Brushless" />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Proveedor">
                            <input value={form.supplier} onChange={(event) => setForm({ ...form, supplier: event.target.value })} className={inputClass} placeholder="Ej. Yongkang Tools" />
                        </Field>
                        <Field label="Marca">
                            <input value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} className={inputClass} placeholder="OEM / Propia" />
                        </Field>
                        <Field label="Cantidad">
                            <input type="number" min="1" value={form.qty} onChange={(event) => setForm({ ...form, qty: event.target.value })} className={inputClass} />
                        </Field>
                        <Field label="Precio EXW (USD)">
                            <input type="number" min="0.01" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className={inputClass} />
                        </Field>
                    </div>
                    <Field label="Categoría de Estado">
                        <select value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} className={inputClass}>
                            <option value="importados">Productos importados</option>
                            <option value="no-importados">Productos no importados (en cotización)</option>
                        </select>
                    </Field>
                </form>
            </Modal>
        </div>
    );
}
