import { useEffect } from 'react';
import Icon from './Icon';

export function Modal({ open, onClose, title, children, footer, wide = false }) {
    useEffect(() => {
        if (!open) return undefined;
        const handler = (event) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                className={`w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl`}
            >
                <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-navy">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Cerrar"
                    >
                        <Icon name="x" size={18} />
                    </button>
                </div>
                {children}
                {footer && <div className="mt-4 flex justify-end gap-2 pt-2">{footer}</div>}
            </div>
        </div>
    );
}

export function PageHeader({ title, subtitle, actions }) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5">
            <div>
                <h1 className="text-xl font-bold text-navy">{title}</h1>
                {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}

export function Pill({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-lg px-3 py-1.5 text-xs transition ${
                active ? 'pill-active' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
        >
            {children}
        </button>
    );
}

export function Empty({ children }) {
    return (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-xs text-slate-400">
            {children}
        </div>
    );
}

export function Spinner({ label = 'Cargando...' }) {
    return (
        <div className="flex items-center justify-center gap-2 py-16 text-xs text-slate-400">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-navy" />
            {label}
        </div>
    );
}

export function StatCard({ label, value, icon, hint, onClick }) {
    return (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div>
                <div className="text-xs font-medium text-slate-500">{label}</div>
                <div className="mt-1 text-2xl font-extrabold text-navy">{value}</div>
                {hint && (
                    <button
                        type="button"
                        onClick={onClick}
                        className="mt-1 text-[11px] font-semibold text-amber-600 hover:underline"
                    >
                        {hint}
                    </button>
                )}
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-xl text-amber-600">
                {icon}
            </div>
        </div>
    );
}

export function Field({ label, children, className = '' }) {
    return (
        <div className={className}>
            <label className="mb-1 block text-[11px] font-semibold text-slate-600">{label}</label>
            {children}
        </div>
    );
}

export const inputClass =
    'w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-amber-500 focus:outline-none';

export const btnPrimary =
    'rounded-lg bg-gold bg-gold-hover px-4 py-2 text-xs font-bold text-white shadow-sm';

export const btnNavy = 'rounded-lg bg-navy px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800';

export const btnGhost =
    'rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50';

export const btnDanger = 'text-xs font-bold text-rose-600 hover:underline';
