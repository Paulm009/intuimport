import { useEffect, useState } from 'react';
import { api, firstError } from '../lib/api';
import { useCalculator } from '../context/CalculatorContext';
import { useToast } from '../context/ToastContext';
import { Empty, PageHeader, Spinner } from '../components/ui';
import Icon from '../components/Icon';
import { money } from '../lib/format';

export default function Suggestions() {
    const { toast } = useToast();
    const { addProduct } = useCalculator();
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/suggestions')
            .then((data) => setSuggestions(data.suggestions))
            .catch((error) => toast(firstError(error, 'No se pudieron cargar las sugerencias.'), 'error'))
            .finally(() => setLoading(false));
    }, []);

    const send = (item) => {
        addProduct({
            name: item.name,
            price: Number(item.fob),
            qty: Number(item.moq) || 1,
            ga: Number(item.ga),
        });
        toast(`"${item.name}" enviado a la calculadora`);
    };

    if (loading) return <Spinner label="Cargando sugerencias..." />;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Sugerencias de Productos Rentables"
                subtitle="Productos recomendados por la comunidad con demanda comprobada en Bolivia. Envíalos directo a la calculadora."
            />

            {suggestions.length === 0 ? (
                <Empty>No hay sugerencias disponibles por ahora.</Empty>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {suggestions.map((item) => (
                        <div key={item.id} className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-sm font-bold text-navy">{item.name}</h3>
                                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                        GA {Number(item.ga)}%
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500">{item.description}</p>
                                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                                    <div className="rounded-lg bg-slate-50 p-2">
                                        <div className="text-slate-400">FOB unitario</div>
                                        <div className="font-bold text-navy">{money(item.fob)}</div>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 p-2">
                                        <div className="text-slate-400">MOQ</div>
                                        <div className="font-bold text-navy">{item.moq} uds</div>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => send(item)}
                                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-navy py-2 text-xs font-semibold text-white hover:bg-slate-800"
                            >
                                <Icon name="calculator" size={14} /> Enviar a Calculadora
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
