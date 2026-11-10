import { useEffect, useMemo, useState } from 'react';
import { api, firstError } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { Empty, Field, Modal, PageHeader, Pill, Spinner, btnGhost, btnPrimary, inputClass } from '../components/ui';
import { formatDate } from '../lib/format';

const statuses = ['Todas', 'Cotizando', 'En proceso', 'Cerradas', 'Cancelados'];
const emptyForm = {
    name: '',
    supplier: '',
    ports: 'Shenzhen → Iquique → Cochabamba',
    load_type: 'LCL',
    incoterm: 'FOB',
    status: 'Cotizando',
};

export default function Imports() {
    const { toast } = useToast();
    const [imports, setImports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Todas');
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try {
            const data = await api.get('/imports');
            setImports(data.imports);
        } catch (error) {
            toast(firstError(error, 'No se pudieron cargar las importaciones.'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const filtered = useMemo(
        () => imports.filter((item) => filter === 'Todas' || item.status === filter),
        [imports, filter],
    );

    const createImport = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            await api.post('/imports', form);
            toast('Operación de importación creada');
            setModalOpen(false);
            setForm(emptyForm);
            load();
        } catch (error) {
            toast(firstError(error), 'error');
        } finally {
            setSaving(false);
        }
    };

    const changeStatus = async (item, status) => {
        try {
            await api.put(`/imports/${item.id}`, { status });
            setImports((current) => current.map((row) => (row.id === item.id ? { ...row, status } : row)));
            toast(`Estado actualizado a: ${status}`);
        } catch (error) {
            toast(firstError(error), 'error');
        }
    };

    const remove = async (item) => {
        try {
            await api.del(`/imports/${item.id}`);
            setImports((current) => current.filter((row) => row.id !== item.id));
            toast('Importación eliminada');
        } catch (error) {
            toast(firstError(error), 'error');
        }
    };

    if (loading) return <Spinner label="Cargando importaciones..." />;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Gestor de Mis Importaciones"
                subtitle="Controla el estado de cada operación desde la cotización hasta el cierre en almacén."
                actions={
                    <button type="button" onClick={() => setModalOpen(true)} className={btnPrimary}>
                        + Nueva Importación
                    </button>
                }
            />

            <div className="flex flex-wrap gap-1.5 rounded-2xl border border-slate-200 bg-white p-4">
                {statuses.map((status) => (
                    <Pill key={status} active={filter === status} onClick={() => setFilter(status)}>
                        {status}
                    </Pill>
                ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                                <th className="px-4 py-3">N° · Fecha</th>
                                <th className="px-4 py-3">Nombre</th>
                                <th className="px-4 py-3">Proveedor</th>
                                <th className="px-4 py-3">Puertos</th>
                                <th className="px-4 py-3">FCL/LCL</th>
                                <th className="px-4 py-3">Incoterms</th>
                                <th className="px-4 py-3">Estado</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-8 text-center text-slate-400">
                                        No hay importaciones en este estado.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                                            {item.code} · {formatDate(item.operation_date)}
                                        </td>
                                        <td className="px-4 py-3 font-bold text-navy">{item.name}</td>
                                        <td className="px-4 py-3 text-slate-700">{item.supplier}</td>
                                        <td className="px-4 py-3 text-slate-600">{item.ports}</td>
                                        <td className="px-4 py-3">
                                            <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold">{item.load_type}</span>
                                        </td>
                                        <td className="px-4 py-3 font-bold text-navy">{item.incoterm}</td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={item.status}
                                                onChange={(event) => changeStatus(item, event.target.value)}
                                                className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold"
                                            >
                                                {statuses.slice(1).map((status) => (
                                                    <option key={status} value={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button type="button" onClick={() => remove(item)} className="font-bold text-slate-400 hover:text-rose-600">
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
                title="Registrar Nueva Importación"
                footer={
                    <>
                        <button type="button" onClick={() => setModalOpen(false)} className={btnGhost}>
                            Cancelar
                        </button>
                        <button type="submit" form="import-form" disabled={saving} className={btnPrimary}>
                            {saving ? 'Creando...' : 'Crear Importación'}
                        </button>
                    </>
                }
            >
                <form id="import-form" onSubmit={createImport} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Nombre de la operación *" className="sm:col-span-2">
                        <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClass} placeholder="Ej. Lote Luminarias Solares Q4" />
                    </Field>
                    <Field label="Proveedor">
                        <input value={form.supplier} onChange={(event) => setForm({ ...form, supplier: event.target.value })} className={inputClass} placeholder="Ej. Zhongshan Solar Co." />
                    </Field>
                    <Field label="Ruta / Puertos">
                        <input value={form.ports} onChange={(event) => setForm({ ...form, ports: event.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Modalidad (FCL/LCL)">
                        <select value={form.load_type} onChange={(event) => setForm({ ...form, load_type: event.target.value })} className={inputClass}>
                            <option value="LCL">LCL (Consolidado)</option>
                            <option value="FCL 20'">FCL 20'</option>
                            <option value="FCL 40' HQ">FCL 40' HQ</option>
                            <option value="Courier Aéreo">Courier Aéreo</option>
                        </select>
                    </Field>
                    <Field label="Incoterm">
                        <select value={form.incoterm} onChange={(event) => setForm({ ...form, incoterm: event.target.value })} className={inputClass}>
                            <option value="FOB">FOB</option>
                            <option value="EXW">EXW</option>
                            <option value="CIF">CIF</option>
                            <option value="DDP">DDP</option>
                        </select>
                    </Field>
                    <Field label="Estado inicial" className="sm:col-span-2">
                        <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className={inputClass}>
                            <option value="Cotizando">Cotizando</option>
                            <option value="En proceso">En proceso</option>
                            <option value="Cerradas">Cerradas</option>
                        </select>
                    </Field>
                </form>
            </Modal>
        </div>
    );
}
