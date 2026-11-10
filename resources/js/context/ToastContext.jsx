import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

let counter = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const toast = useCallback(
        (message, type = 'success') => {
            const id = ++counter;
            setToasts((current) => [...current, { id, message, type }]);
            setTimeout(() => dismiss(id), 3200);
        },
        [dismiss],
    );

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[60] space-y-2 pointer-events-none">
                {toasts.map((item) => (
                    <div
                        key={item.id}
                        className={`pointer-events-auto max-w-sm rounded-xl border px-4 py-3 text-xs font-medium shadow-lg ${
                            item.type === 'error'
                                ? 'bg-rose-600 text-white border-rose-400'
                                : item.type === 'info'
                                  ? 'bg-white text-slate-700 border-slate-200'
                                  : 'bg-navy text-white border-amber-400/50'
                        }`}
                    >
                        <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-current align-middle" />
                        {item.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast debe usarse dentro de ToastProvider');
    return context;
}
