import { useEffect, useMemo, useState } from 'react';
import { api, firstError } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { Empty, Modal, PageHeader, Pill, Spinner, btnNavy } from '../components/ui';
import Icon from '../components/Icon';
import { formatDate } from '../lib/format';

export default function Recordings() {
    const { toast } = useToast();
    const [recordings, setRecordings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Todas');
    const [search, setSearch] = useState('');
    const [active, setActive] = useState(null);

    useEffect(() => {
        api.get('/recordings')
            .then((data) => setRecordings(data.recordings))
            .catch((error) => toast(firstError(error, 'No se pudieron cargar las grabaciones.'), 'error'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        return recordings.filter((item) => {
            if (filter !== 'Todas' && item.category !== filter) return false;
            if (query && !item.title.toLowerCase().includes(query)) return false;
            return true;
        });
    }, [recordings, filter, search]);

    if (loading) return <Spinner label="Cargando grabaciones..." />;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Grabaciones de Clases en Vivo"
                subtitle="Sesiones prácticas, revisiones de cotizaciones y talleres grabados."
                actions={
                    <>
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Buscar grabación..."
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
                        />
                        <Pill active={filter === 'Todas'} onClick={() => setFilter('Todas')}>
                            Todas
                        </Pill>
                        <Pill active={filter === 'CLASES'} onClick={() => setFilter('CLASES')}>
                            CLASES
                        </Pill>
                        <Pill active={filter === 'TALLERES'} onClick={() => setFilter('TALLERES')}>
                            TALLERES
                        </Pill>
                    </>
                }
            />

            {filtered.length === 0 ? (
                <Empty>No hay grabaciones con ese filtro.</Empty>
            ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                        >
                            <div>
                                <div className="relative flex h-36 items-center justify-center bg-navy">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-white shadow">
                                        <Icon name="recording" size={22} />
                                    </div>
                                    <span className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white">
                                        {item.duration}
                                    </span>
                                    <span className="absolute left-2 top-2 rounded bg-gold px-2 py-0.5 text-[10px] font-bold text-white">
                                        {item.category}
                                    </span>
                                </div>
                                <div className="space-y-1.5 p-4">
                                    <div className="text-[11px] text-slate-400">Emitido el {formatDate(item.recorded_on)}</div>
                                    <h3 className="text-sm font-bold text-navy">{item.title}</h3>
                                    <p className="text-xs text-slate-500">{item.summary}</p>
                                </div>
                            </div>
                            <div className="p-4 pt-0">
                                <button
                                    type="button"
                                    onClick={() => setActive(item)}
                                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-2 text-xs font-semibold text-navy hover:bg-slate-200"
                                >
                                    <Icon name="recording" size={14} /> Reproducir Resumen de Grabación
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                open={!!active}
                onClose={() => setActive(null)}
                title={active?.title || 'Grabación'}
                footer={
                    <button type="button" onClick={() => setActive(null)} className={btnNavy}>
                        Cerrar
                    </button>
                }
            >
                {active && (
                    <div className="space-y-3 text-xs text-slate-600">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 whitespace-pre-line">
                            {active.summary}
                        </div>
                        <p className="text-slate-500">
                            Duración: {active.duration} · Fecha: {formatDate(active.recorded_on)} · Categoría:{' '}
                            {active.category}
                        </p>
                    </div>
                )}
            </Modal>
        </div>
    );
}
