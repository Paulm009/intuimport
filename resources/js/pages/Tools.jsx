import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, firstError } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { useCalculator } from '../context/CalculatorContext';
import { Empty, Field, PageHeader, Spinner, btnGhost, btnNavy, btnPrimary, inputClass } from '../components/ui';
import Icon from '../components/Icon';
import { formatDate, money, number } from '../lib/format';

const tabs = [
    { id: 'calc-import', label: 'Calculadora de importación' },
    { id: 'calc-cbm', label: 'Calculadora de CBM' },
    { id: 'aranceles', label: 'Libro de aranceles (NANDINA)' },
    { id: 'documentos', label: 'Generador Factura / Documentos' },
];

export default function Tools() {
    const [searchParams, setSearchParams] = useSearchParams();
    const active = searchParams.get('tab') || 'calc-import';

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex flex-wrap gap-1.5">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setSearchParams({ tab: tab.id })}
                            className={`rounded-xl px-4 py-2 text-xs font-semibold ${
                                active === tab.id
                                    ? 'pill-active'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {active === 'calc-import' && <ImportCalculator />}
            {active === 'calc-cbm' && <CbmCalculator />}
            {active === 'aranceles' && <Tariffs onSend={() => setSearchParams({ tab: 'calc-import' })} />}
            {active === 'documentos' && <InvoiceGenerator />}
        </div>
    );
}

function ImportCalculator() {
    const { toast } = useToast();
    const {
        products,
        params,
        setParams,
        shippingMode,
        setShippingMode,
        addProductRow,
        updateProduct,
        removeProduct,
        totals,
    } = useCalculator();
    const [quotes, setQuotes] = useState([]);
    const [quoteName, setQuoteName] = useState('');
    const [saving, setSaving] = useState(false);

    const loadQuotes = async () => {
        try {
            const data = await api.get('/quotes');
            setQuotes(data.quotes);
        } catch (error) {
            toast(firstError(error, 'No se pudo cargar el historial.'), 'error');
        }
    };

    useEffect(() => {
        loadQuotes();
    }, []);

    const saveQuote = async () => {
        const name = quoteName.trim() || `Cotización ${shippingMode} #${quotes.length + 1}`;
        setSaving(true);
        try {
            await api.post('/quotes', {
                name,
                mode: shippingMode,
                cif_usd: Number(totals.valorCif.toFixed(2)),
                total_usd: Number(totals.costoTotalUsd.toFixed(2)),
                total_bob: Number(totals.costoTotalBob.toFixed(2)),
                payload: { products, params, shippingMode },
            });
            setQuoteName('');
            toast('Cotización guardada en el historial');
            loadQuotes();
        } catch (error) {
            toast(firstError(error), 'error');
        } finally {
            setSaving(false);
        }
    };

    const deleteQuote = async (id) => {
        try {
            await api.del(`/quotes/${id}`);
            setQuotes((current) => current.filter((quote) => quote.id !== id));
            toast('Cotización eliminada');
        } catch (error) {
            toast(firstError(error), 'error');
        }
    };

    const updateParam = (key, value) => setParams((current) => ({ ...current, [key]: value }));

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-8">
                <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h2 className="text-base font-bold text-navy">1. Modalidad de Envío y Productos</h2>
                            <p className="text-xs text-slate-500">
                                Agrega los ítems de tu proforma para prorratear flete, seguro y tributos aduaneros.
                            </p>
                        </div>
                        <div className="flex gap-1.5">
                            {['Marítima', 'Aérea', 'Terrestre'].map((mode) => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setShippingMode(mode)}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                                        shippingMode === mode
                                            ? 'pill-active'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    {mode === 'Marítima' ? 'Marítima' : mode === 'Aérea' ? 'Aérea' : 'Terrestre'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                                    <th className="py-2 pr-2">Producto</th>
                                    <th className="w-24 py-2 px-2">Precio USD</th>
                                    <th className="w-20 py-2 px-2">Cant.</th>
                                    <th className="w-20 py-2 px-2">G.A. %</th>
                                    <th className="w-24 py-2 px-2">IVA %</th>
                                    <th className="w-24 py-2 px-2 text-right">FOB USD</th>
                                    <th className="w-10 py-2 pl-2" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td className="py-2 pr-2">
                                            <input
                                                value={product.name}
                                                onChange={(event) =>
                                                    updateProduct(product.id, { name: event.target.value })
                                                }
                                                className={inputClass}
                                                placeholder="Nombre del ítem"
                                            />
                                        </td>
                                        <td className="py-2 px-2">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={product.price}
                                                onChange={(event) =>
                                                    updateProduct(product.id, { price: event.target.value })
                                                }
                                                className={inputClass}
                                            />
                                        </td>
                                        <td className="py-2 px-2">
                                            <input
                                                type="number"
                                                min="1"
                                                value={product.qty}
                                                onChange={(event) =>
                                                    updateProduct(product.id, { qty: event.target.value })
                                                }
                                                className={inputClass}
                                            />
                                        </td>
                                        <td className="py-2 px-2">
                                            <input
                                                type="number"
                                                min="0"
                                                value={product.ga}
                                                onChange={(event) =>
                                                    updateProduct(product.id, { ga: event.target.value })
                                                }
                                                className={inputClass}
                                            />
                                        </td>
                                        <td className="py-2 px-2">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={product.iva}
                                                onChange={(event) =>
                                                    updateProduct(product.id, { iva: event.target.value })
                                                }
                                                className={inputClass}
                                            />
                                        </td>
                                        <td className="py-2 px-2 text-right font-semibold text-navy">
                                            {money((Number(product.price) || 0) * (Number(product.qty) || 0))}
                                        </td>
                                        <td className="py-2 pl-2 text-right">
                                            <button
                                                type="button"
                                                onClick={() => removeProduct(product.id)}
                                                className="p-1 text-slate-400 hover:text-rose-600"
                                            >
                                                <Icon name="x" size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <button
                            type="button"
                            onClick={addProductRow}
                            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-slate-200"
                        >
                            + Agregar ítem
                        </button>
                        <div className="text-xs text-slate-500">
                            IVA efectivo estándar en Bolivia: <strong className="text-navy">14.94%</strong>
                        </div>
                    </div>
                </section>

                <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-base font-bold text-navy">2. Costos Logísticos, Aduana y Tipo de Cambio</h2>
                    <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2 md:grid-cols-3">
                        <Field label="Gastos en origen (USD)">
                            <input type="number" min="0" step="0.01" value={params.gastosOrigen} onChange={(event) => updateParam('gastosOrigen', event.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Comisión transferencia (USD)">
                            <input type="number" min="0" step="0.01" value={params.transferencia} onChange={(event) => updateParam('transferencia', event.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Seguro (% sobre FOB)">
                            <input type="number" min="0" step="0.1" value={params.seguroPct} onChange={(event) => updateParam('seguroPct', event.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Peso total (kg)">
                            <input type="number" min="1" value={params.pesoTotal} onChange={(event) => updateParam('pesoTotal', event.target.value)} className={inputClass} />
                        </Field>
                        <Field label={`Flete ${shippingMode.toLowerCase()} principal (USD)`}>
                            <input type="number" min="0" value={params.fletePrincipal} onChange={(event) => updateParam('fletePrincipal', event.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Flete terrestre tramo (USD)">
                            <input type="number" min="0" value={params.fleteTerrestre} onChange={(event) => updateParam('fleteTerrestre', event.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Tipo de carga">
                            <select value={params.tipoCarga} onChange={(event) => updateParam('tipoCarga', event.target.value)} className={inputClass}>
                                <option value="LCL">LCL (Carga Consolidada)</option>
                                <option value="FCL">FCL (Contenedor Completo)</option>
                            </select>
                        </Field>
                        <Field label="Puerto / Aduana de llegada">
                            <select value={params.puertoLlegada} onChange={(event) => updateParam('puertoLlegada', event.target.value)} className={inputClass}>
                                <option value="Iquique">Iquique (Chile)</option>
                                <option value="Arica">Arica (Chile)</option>
                                <option value="Matarani">Matarani (Perú)</option>
                                <option value="Viru Viru">Aeropuerto Viru Viru (SCZ)</option>
                                <option value="El Alto">Aeropuerto El Alto (LPZ)</option>
                            </select>
                        </Field>
                        <Field label="Tipo de cambio (Bs/USD)">
                            <input type="number" min="1" step="0.01" value={params.tipoCambio} onChange={(event) => updateParam('tipoCambio', event.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Gastos locales / Almacén (BOB)">
                            <input type="number" min="0" value={params.gastosLocalesBob} onChange={(event) => updateParam('gastosLocalesBob', event.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Agencia despachante de aduana" className="sm:col-span-2">
                            <select value={params.agencia} onChange={(event) => updateParam('agencia', event.target.value)} className={inputClass}>
                                <option value="0">Sin agencia (no se cobran costos de despacho)</option>
                                <option value="1.8">Agencia Despachante Asociada (1.8% sobre CIF + $30)</option>
                                <option value="1.2">Agencia Corporativa Preferencial (1.2% sobre CIF + $25)</option>
                            </select>
                        </Field>
                        <Field label="Nombre de esta cotización (para historial)" className="sm:col-span-3">
                            <div className="flex gap-2">
                                <input
                                    value={quoteName}
                                    onChange={(event) => setQuoteName(event.target.value)}
                                    placeholder="Ej. Lote Lámparas LED Shenzhen - Noviembre"
                                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                                />
                                <button type="button" onClick={saveQuote} disabled={saving} className={btnPrimary}>
                                    {saving ? 'Guardando...' : (
                                    <span className="flex items-center gap-1.5"><Icon name="save" size={14} /> Guardar en Historial</span>
                                )}
                                </button>
                            </div>
                        </Field>
                    </div>
                </section>

                <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-navy">Historial de Cálculos Guardados</h3>
                        <span className="text-[11px] text-slate-400">Guardado en base de datos</span>
                    </div>
                    <div className="divide-y divide-slate-100 text-xs">
                        {quotes.length === 0 ? (
                            <Empty>No hay cotizaciones guardadas aún.</Empty>
                        ) : (
                            quotes.map((quote) => (
                                <div key={quote.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                                    <div>
                                        <span className="font-bold text-navy">{quote.name}</span>
                                        <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                            {quote.mode} · {formatDate(quote.quote_date)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-500">
                                            CIF: <strong>{money(quote.cif_usd)}</strong>
                                        </span>
                                        <span className="font-bold text-emerald-700">
                                            Total: {money(quote.total_usd)} ({money(quote.total_bob, 'BOB')})
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => deleteQuote(quote.id)}
                                            className="p-1 text-slate-400 hover:text-rose-600"
                                        >
                                            <Icon name="x" size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            <div className="lg:col-span-4">
                <div className="sticky top-20 space-y-4 rounded-2xl bg-navy p-5 text-white shadow-md">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div>
                            <span className="rounded bg-gold px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                                {shippingMode === 'Marítima' ? 'Marítima' : shippingMode === 'Aérea' ? 'Aérea' : 'Terrestre'}
                            </span>
                            <h3 className="mt-1 text-base font-bold">Resumen de Liquidación</h3>
                        </div>
                    </div>

                    <div className="space-y-2 text-xs">
                        <Row label="Valor FOB Mercadería" value={money(totals.fobMercaderia)} />
                        <Row
                            label="Gastos en Origen + Seguro"
                            value={money((Number(params.gastosOrigen) || 0) + totals.seguroUsd)}
                        />
                        <Row label="Flete Internacional Total" value={money(totals.fleteTotal)} />
                        <div className="flex justify-between border-y border-white/10 py-2 font-bold text-amber-300">
                            <span>Valor CIF Aduana (USD)</span>
                            <span>{money(totals.valorCif)}</span>
                        </div>
                        <Row label="Gravamen Arancelario (G.A.)" value={money(totals.totalGa)} />
                        <Row label="Impuesto IVA Importación" value={money(totals.totalIva)} />
                        <Row label="Despacho, Bancos y Locales" value={money(totals.otrosDespacho)} />
                    </div>

                    <div className="space-y-1 rounded-xl border border-white/15 bg-white/10 p-4">
                        <div className="text-[11px] font-semibold uppercase text-slate-300">
                            Costo Total Puesto en Almacén
                        </div>
                        <div className="text-2xl font-extrabold text-gold">{money(totals.costoTotalUsd)} USD</div>
                        <div className="text-sm font-semibold text-white">{money(totals.costoTotalBob, 'BOB')} BOB</div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                            Costo Unitario Final por Ítem
                        </div>
                        <div className="custom-scrollbar max-h-60 space-y-2 overflow-y-auto pr-1">
                            {totals.unitBreakdown.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 p-2.5"
                                >
                                    <div className="truncate">
                                        <div className="truncate text-xs font-semibold text-white">{item.name}</div>
                                        <div className="text-[10px] text-slate-300">
                                            {item.qty} uds. · Total lote: {money(item.itemTotal)}
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <div className="text-xs font-bold text-gold">{money(item.unitUsd)} / ud</div>
                                        <div className="text-[10px] text-slate-300">{money(item.unitBob, 'BOB')}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex justify-between text-slate-300">
            <span>{label}</span>
            <span className="font-semibold text-white">{value}</span>
        </div>
    );
}

function CbmCalculator() {
    const { cbmItems, cbmUnit, setCbmUnit, addCbmItem, updateCbmItem, removeCbmItem, cbmTotals } = useCalculator();

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h2 className="text-base font-bold text-navy">Calculadora de Volumen (CBM) y Ocupación</h2>
                        <p className="text-xs text-slate-500">
                            Calcula el cubicaje total por cajas, peso bruto y nivel de llenado del contenedor.
                        </p>
                    </div>
                    <select
                        value={cbmUnit}
                        onChange={(event) => setCbmUnit(event.target.value)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-navy"
                    >
                        <option value="cm">Dimensiones en Centímetros (cm)</option>
                        <option value="in">Dimensiones en Pulgadas (in)</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                                <th className="py-2 pr-2">Ítem / Descripción</th>
                                <th className="w-20 py-2 px-2">Largo</th>
                                <th className="w-20 py-2 px-2">Ancho</th>
                                <th className="w-20 py-2 px-2">Alto</th>
                                <th className="w-24 py-2 px-2">Peso/Caja</th>
                                <th className="w-20 py-2 px-2">Cajas</th>
                                <th className="w-24 py-2 px-2 text-right">CBM Sub.</th>
                                <th className="w-8 py-2 pl-2" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {cbmTotals.rows.map((item) => (
                                <tr key={item.id}>
                                    <td className="py-2 pr-2">
                                        <input value={item.name} onChange={(event) => updateCbmItem(item.id, { name: event.target.value })} className={inputClass} />
                                    </td>
                                    {['l', 'w', 'h'].map((field) => (
                                        <td key={field} className="py-2 px-2">
                                            <input type="number" min="0" value={item[field]} onChange={(event) => updateCbmItem(item.id, { [field]: event.target.value })} className={inputClass} />
                                        </td>
                                    ))}
                                    <td className="py-2 px-2">
                                        <input type="number" min="0" step="0.1" value={item.weight} onChange={(event) => updateCbmItem(item.id, { weight: event.target.value })} className={inputClass} />
                                    </td>
                                    <td className="py-2 px-2">
                                        <input type="number" min="1" value={item.boxes} onChange={(event) => updateCbmItem(item.id, { boxes: event.target.value })} className={inputClass} />
                                    </td>
                                    <td className="py-2 px-2 text-right font-semibold text-navy">{number(item.subCbm, 3)} m³</td>
                                    <td className="py-2 pl-2 text-right">
                                        <button type="button" onClick={() => removeCbmItem(item.id)} className="p-1 text-slate-400 hover:text-rose-600">
                                            <Icon name="x" size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <button
                    type="button"
                    onClick={addCbmItem}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-navy hover:bg-slate-200"
                >
                    + Agregar fila de cajas
                </button>
            </div>

            <div className="space-y-4 rounded-2xl bg-navy p-5 text-white shadow-md lg:col-span-4">
                <h3 className="border-b border-white/10 pb-3 text-base font-bold">Resultado de Cubicaje</h3>
                <div className="grid grid-cols-2 gap-3">
                    <Metric label="Volumen Total" value={`${number(cbmTotals.totalCbm, 3)} m³`} accent />
                    <Metric label="Peso Bruto Total" value={`${number(cbmTotals.totalWeight, 1)} kg`} />
                    <Metric label="Total Bultos" value={`${cbmTotals.totalBoxes} cajas`} />
                    <Metric label="Peso Vol. Aéreo" value={`${number(cbmTotals.airVolWeight, 1)} kg`} gold />
                </div>

                <div className="space-y-3 pt-2 text-xs">
                    <div className="font-bold uppercase tracking-wider text-amber-300">Ocupación Estimada de Contenedor</div>
                    <Bar label="Contenedor 20' STD (~28 CBM)" pct={cbmTotals.p20} color="bg-gold" />
                    <Bar label="Contenedor 40' STD (~58 CBM)" pct={cbmTotals.p40} color="bg-emerald-400" />
                    <Bar label="Contenedor 40' HQ (~68 CBM)" pct={cbmTotals.p40hq} color="bg-sky-400" />
                </div>
            </div>
        </div>
    );
}

function Metric({ label, value, accent, gold }) {
    return (
        <div className="rounded-xl bg-white/10 p-3">
            <div className="text-[11px] text-slate-300">{label}</div>
            <div className={`text-xl font-extrabold ${gold ? 'text-amber-300' : accent ? 'text-gold' : 'text-white'}`}>
                {value}
            </div>
        </div>
    );
}

function Bar({ label, pct, color }) {
    return (
        <div>
            <div className="mb-1 flex justify-between">
                <span>{label}</span>
                <span className="font-bold">{pct}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

function Tariffs({ onSend }) {
    const { toast } = useToast();
    const { addProduct } = useCalculator();
    const [tariffs, setTariffs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        api.get('/tariffs')
            .then((data) => setTariffs(data.tariffs))
            .catch((error) => toast(firstError(error, 'No se pudo cargar el arancel.'), 'error'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return tariffs;
        return tariffs.filter(
            (item) =>
                item.code.toLowerCase().includes(query) || item.description.toLowerCase().includes(query),
        );
    }, [tariffs, search]);

    const send = (tariff) => {
        addProduct({
            name: `${tariff.description} (${tariff.code})`,
            price: 15,
            qty: 50,
            ga: tariff.ga,
            iva: tariff.iva,
        });
        toast(`Partida ${tariff.code} (G.A. ${tariff.ga}%) agregada a la calculadora`);
        onSend();
    };

    if (loading) return <Spinner label="Cargando aranceles..." />;

    return (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-base font-bold text-navy">Buscador Arancelario de Importaciones (NANDINA)</h2>
                    <p className="text-xs text-slate-500">
                        Consulta partidas arancelarias, Gravamen Arancelario (G.A.) y requisitos previos.
                    </p>
                </div>
                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por código (ej. 8517) o mercadería..."
                    className="w-64 rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none"
                />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                            <th className="px-3 py-2.5">Código NANDINA</th>
                            <th className="px-3 py-2.5">Descripción</th>
                            <th className="px-3 py-2.5 text-center">G.A. %</th>
                            <th className="px-3 py-2.5 text-center">IVA %</th>
                            <th className="px-3 py-2.5">Permiso previo</th>
                            <th className="px-3 py-2.5 text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-slate-400">
                                    Sin coincidencias.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((tariff) => (
                                <tr key={tariff.id} className="hover:bg-slate-50">
                                    <td className="px-3 py-3 font-mono font-bold text-navy">{tariff.code}</td>
                                    <td className="px-3 py-3 font-medium text-slate-800">{tariff.description}</td>
                                    <td className="px-3 py-3 text-center">
                                        <span className="rounded bg-amber-100 px-2 py-0.5 font-bold text-amber-800">
                                            {tariff.ga}%
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 text-center font-semibold text-slate-600">{tariff.iva}%</td>
                                    <td className="px-3 py-3 text-slate-500">{tariff.requirement}</td>
                                    <td className="px-3 py-3 text-right">
                                        <button
                                            type="button"
                                            onClick={() => send(tariff)}
                                            className="rounded-lg bg-navy px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-slate-800"
                                        >
                                            + Enviar a Calculadora
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function InvoiceGenerator() {
    const { products } = useCalculator();
    const [invoice, setInvoice] = useState({
        number: 'INV-2026-001',
        incoterm: 'FOB Shenzhen',
        exporter: 'Shenzhen Bright Tech Co., Ltd.',
        importer: 'Importadora Andina S.R.L.',
    });

    const total = products.reduce(
        (acc, product) => acc + (Number(product.price) || 0) * (Number(product.qty) || 0),
        0,
    );

    const update = (key) => (event) => setInvoice({ ...invoice, [key]: event.target.value });

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-6">
                <h2 className="text-base font-bold text-navy">Generador de Proforma / Commercial Invoice</h2>
                <p className="text-xs text-slate-500">
                    Completa los datos para estructurar e imprimir una factura comercial estándar de importación.
                </p>
                <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                    <Field label="N° de Invoice">
                        <input value={invoice.number} onChange={update('number')} className={inputClass} />
                    </Field>
                    <Field label="Incoterm">
                        <select value={invoice.incoterm} onChange={update('incoterm')} className={inputClass}>
                            <option>FOB Shenzhen</option>
                            <option>EXW Guangzhou</option>
                            <option>CIF Arica</option>
                            <option>CIF Iquique</option>
                        </select>
                    </Field>
                    <Field label="Exportador (Proveedor)">
                        <input value={invoice.exporter} onChange={update('exporter')} className={inputClass} />
                    </Field>
                    <Field label="Consignatario (Importador)">
                        <input value={invoice.importer} onChange={update('importer')} className={inputClass} />
                    </Field>
                </div>
                <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => window.print()} className={`${btnPrimary} flex items-center gap-1.5`}>
                        <Icon name="printer" size={14} /> Imprimir / Guardar PDF
                    </button>
                </div>
            </div>

            <div className="print-area space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                        <div className="text-sm font-extrabold uppercase text-navy">COMMERCIAL INVOICE</div>
                        <div className="text-xs text-slate-500">{invoice.number}</div>
                    </div>
                    <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-bold text-navy">{invoice.incoterm}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                        <div className="text-[10px] font-bold uppercase text-slate-400">Seller / Exporter</div>
                        <div className="font-semibold text-slate-800">{invoice.exporter}</div>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold uppercase text-slate-400">Buyer / Consignee</div>
                        <div className="font-semibold text-slate-800">{invoice.importer}</div>
                    </div>
                </div>
                <div className="space-y-1.5 border-t border-slate-200 pt-3 text-xs">
                    {products.map((product) => {
                        const subtotal = (Number(product.price) || 0) * (Number(product.qty) || 0);
                        return (
                            <div key={product.id} className="flex justify-between border-b border-slate-100 py-1">
                                <span>
                                    {product.name || 'Ítem'} ({product.qty} uds × {money(product.price)})
                                </span>
                                <span className="font-semibold text-navy">{money(subtotal)}</span>
                            </div>
                        );
                    })}
                    <div className="flex justify-between pt-2 text-sm font-extrabold text-navy">
                        <span>TOTAL COMMERCIAL INVOICE ({invoice.incoterm})</span>
                        <span>{money(total)} USD</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
