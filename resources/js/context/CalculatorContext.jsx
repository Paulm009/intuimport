import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'fulcomex_calculator_v1';

const defaultProducts = [
    { id: 1, name: 'Reflectores Solares LED 200W IP67', price: 11.5, qty: 200, ga: 10, iva: 14.94 },
    { id: 2, name: 'Paneles Solares Monocristalinos 150W', price: 28, qty: 80, ga: 5, iva: 14.94 },
];

const defaultParams = {
    gastosOrigen: 0,
    transferencia: 35,
    seguroPct: 2,
    pesoTotal: 450,
    fletePrincipal: 420,
    fleteTerrestre: 180,
    tipoCarga: 'LCL',
    puertoLlegada: 'Iquique',
    tipoCambio: 6.96,
    gastosLocalesBob: 350,
    agencia: 0,
};

const defaultCbmItems = [
    { id: 1, name: 'Cajas Reflectores (10 uds/caja)', l: 54, w: 38, h: 42, weight: 18.5, boxes: 20 },
    { id: 2, name: 'Cajas Paneles Solares (2 uds/caja)', l: 118, w: 68, h: 12, weight: 21, boxes: 40 },
];

function load() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return {
                products: parsed.products || defaultProducts,
                params: { ...defaultParams, ...(parsed.params || {}) },
                shippingMode: parsed.shippingMode || 'Marítima',
                cbmItems: parsed.cbmItems || defaultCbmItems,
                cbmUnit: parsed.cbmUnit || 'cm',
            };
        }
    } catch {
        // ignore
    }
    return {
        products: defaultProducts,
        params: defaultParams,
        shippingMode: 'Marítima',
        cbmItems: defaultCbmItems,
        cbmUnit: 'cm',
    };
}

const CalculatorContext = createContext(null);

export function CalculatorProvider({ children }) {
    const initial = useMemo(load, []);
    const [products, setProducts] = useState(initial.products);
    const [params, setParams] = useState(initial.params);
    const [shippingMode, setShippingMode] = useState(initial.shippingMode);
    const [cbmItems, setCbmItems] = useState(initial.cbmItems);
    const [cbmUnit, setCbmUnit] = useState(initial.cbmUnit);

    useEffect(() => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ products, params, shippingMode, cbmItems, cbmUnit }),
        );
    }, [products, params, shippingMode, cbmItems, cbmUnit]);

    const addProduct = useCallback((product) => {
        setProducts((current) => [
            ...current,
            { id: Date.now() + Math.random(), iva: 14.94, ...product },
        ]);
    }, []);

    const updateProduct = useCallback((id, patch) => {
        setProducts((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    }, []);

    const removeProduct = useCallback((id) => {
        setProducts((current) => (current.length > 1 ? current.filter((item) => item.id !== id) : current));
    }, []);

    const addProductRow = useCallback(() => {
        setProducts((current) => [
            ...current,
            { id: Date.now(), name: 'Nuevo Producto', price: 10, qty: 50, ga: 10, iva: 14.94 },
        ]);
    }, []);

    const addCbmItem = useCallback(() => {
        setCbmItems((current) => [
            ...current,
            { id: Date.now(), name: 'Caja Adicional', l: 50, w: 40, h: 40, weight: 15, boxes: 10 },
        ]);
    }, []);

    const updateCbmItem = useCallback((id, patch) => {
        setCbmItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    }, []);

    const removeCbmItem = useCallback((id) => {
        setCbmItems((current) => (current.length > 1 ? current.filter((item) => item.id !== id) : current));
    }, []);

    const totals = useMemo(() => {
        const fobMercaderia = products.reduce(
            (acc, product) => acc + (Number(product.price) || 0) * (Number(product.qty) || 0),
            0,
        );
        const fobTotal = fobMercaderia + (Number(params.gastosOrigen) || 0);
        const seguroUsd = fobTotal * ((Number(params.seguroPct) || 0) / 100);
        const fleteTotal = (Number(params.fletePrincipal) || 0) + (Number(params.fleteTerrestre) || 0);
        const valorCif = fobTotal + seguroUsd + fleteTotal;

        let totalGa = 0;
        let totalIva = 0;

        const breakdown = products.map((product) => {
            const qty = Math.max(Number(product.qty) || 1, 1);
            const itemFob = (Number(product.price) || 0) * qty;
            const share = fobMercaderia > 0 ? itemFob / fobMercaderia : 1 / products.length;
            const itemCif = valorCif * share;
            const itemGa = itemCif * ((Number(product.ga) || 0) / 100);
            const itemIva = (itemCif + itemGa) * ((Number(product.iva) || 0) / 100);
            totalGa += itemGa;
            totalIva += itemIva;
            return { id: product.id, name: product.name || 'Ítem sin nombre', qty, share, itemCif, itemGa, itemIva };
        });

        const agenciaPct = Number(params.agencia) || 0;
        const comisionAgencia = agenciaPct > 0 ? valorCif * (agenciaPct / 100) + 28 : 0;
        const tc = Number(params.tipoCambio) || 1;
        const gastosLocalesUsd = tc > 0 ? (Number(params.gastosLocalesBob) || 0) / tc : 0;
        const otrosDespacho = comisionAgencia + (Number(params.transferencia) || 0) + gastosLocalesUsd;
        const costoTotalUsd = valorCif + totalGa + totalIva + otrosDespacho;
        const costoTotalBob = costoTotalUsd * tc;

        const unitBreakdown = breakdown.map((item) => {
            const itemTotal = item.itemCif + item.itemGa + item.itemIva + otrosDespacho * item.share;
            const unitUsd = itemTotal / item.qty;
            return { ...item, itemTotal, unitUsd, unitBob: unitUsd * tc };
        });

        return {
            fobMercaderia,
            seguroUsd,
            fleteTotal,
            valorCif,
            totalGa,
            totalIva,
            otrosDespacho,
            costoTotalUsd,
            costoTotalBob,
            unitBreakdown,
        };
    }, [products, params]);

    const cbmTotals = useMemo(() => {
        const factor = cbmUnit === 'in' ? 2.54 : 1;
        let totalCbm = 0;
        let totalWeight = 0;
        let totalBoxes = 0;

        const rows = cbmItems.map((item) => {
            const boxes = Number(item.boxes) || 0;
            const cbmPerBox =
                ((Number(item.l) * factor) * (Number(item.w) * factor) * (Number(item.h) * factor)) / 1000000;
            const subCbm = cbmPerBox * boxes;
            totalCbm += subCbm;
            totalWeight += (Number(item.weight) || 0) * boxes;
            totalBoxes += boxes;
            return { ...item, subCbm };
        });

        return {
            rows,
            totalCbm,
            totalWeight,
            totalBoxes,
            airVolWeight: totalCbm * 167,
            p20: Math.min(Math.round((totalCbm / 28) * 100), 100),
            p40: Math.min(Math.round((totalCbm / 58) * 100), 100),
            p40hq: Math.min(Math.round((totalCbm / 68) * 100), 100),
        };
    }, [cbmItems, cbmUnit]);

    return (
        <CalculatorContext.Provider
            value={{
                products,
                setProducts,
                params,
                setParams,
                shippingMode,
                setShippingMode,
                addProduct,
                updateProduct,
                removeProduct,
                addProductRow,
                totals,
                cbmItems,
                cbmUnit,
                setCbmUnit,
                addCbmItem,
                updateCbmItem,
                removeCbmItem,
                cbmTotals,
            }}
        >
            {children}
        </CalculatorContext.Provider>
    );
}

export function useCalculator() {
    const context = useContext(CalculatorContext);
    if (!context) throw new Error('useCalculator debe usarse dentro de CalculatorProvider');
    return context;
}
