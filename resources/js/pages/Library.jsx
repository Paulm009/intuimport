import { useEffect, useMemo, useState } from 'react';
import { api, firstError } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { Empty, Modal, PageHeader, Pill, Spinner, btnNavy } from '../components/ui';
import Icon from '../components/Icon';

export default function Library() {
    const { toast } = useToast();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('Todos');
    const [search, setSearch] = useState('');
    const [active, setActive] = useState(null);

    useEffect(() => {
        api.get('/library')
            .then((data) => setResources(data.resources))
            .catch((error) => toast(firstError(error, 'No se pudo cargar la biblioteca.'), 'error'))
            .finally(() => setLoading(false));
    }, []);

    const categories = useMemo(() => {
        const set = new Set(resources.map((item) => item.category));
        return ['Todos', ...Array.from(set)];
    }, [resources]);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        return resources.filter((item) => {
            if (category !== 'Todos' && item.category !== category) return false;
            if (query && !item.title.toLowerCase().includes(query)) return false;
            return true;
        });
    }, [resources, category, search]);

    if (loading) return <Spinner label="Cargando biblioteca..." />;

    return (
        <div className="space-y-6">
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
                <PageHeader
                    title="Biblioteca de Recursos y Plantillas"
                    subtitle="Manuales operativos, contratos internacionales, glosarios y listas de verificación."
                    actions={
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Buscar documento o guía..."
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
                        />
                    }
                />
                <div className="flex flex-wrap gap-1.5">
                    {categories.map((item) => (
                        <Pill key={item} active={category === item} onClick={() => setCategory(item)}>
                            {item}
                        </Pill>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <Empty>No se encontraron recursos.</Empty>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col justify-between space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div className="space-y-2">
                                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                                    {item.category}
                                </span>
                                <h3 className="text-sm font-bold text-navy">{item.title}</h3>
                                <p className="line-clamp-3 text-xs text-slate-500">{item.content}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActive(item)}
                                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-2 text-xs font-semibold text-navy hover:bg-slate-200"
                            >
                                <Icon name="eye" size={14} /> Ver Recurso Completo
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                open={!!active}
                onClose={() => setActive(null)}
                title={active?.title || 'Recurso'}
                footer={
                    <button type="button" onClick={() => setActive(null)} className={btnNavy}>
                        Cerrar
                    </button>
                }
            >
                {active && (
                    <div className="whitespace-pre-line rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
                        {active.content}
                    </div>
                )}
            </Modal>
        </div>
    );
}
