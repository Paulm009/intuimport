import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        async function bootstrap() {
            if (!getToken()) {
                setLoading(false);
                return;
            }

            try {
                const data = await api.get('/me');
                if (active) setUser(data.user);
            } catch {
                setToken(null);
            } finally {
                if (active) setLoading(false);
            }
        }

        bootstrap();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        const handler = () => setUser(null);
        window.addEventListener('fulcomex:unauthorized', handler);
        return () => window.removeEventListener('fulcomex:unauthorized', handler);
    }, []);

    const login = useCallback(async (email, password) => {
        const data = await api.post('/login', { email, password }, { auth: false });
        setToken(data.token);
        setUser(data.user);
        return data.user;
    }, []);

    const register = useCallback(async (payload) => {
        const data = await api.post('/register', payload, { auth: false });
        setToken(data.token);
        setUser(data.user);
        return data.user;
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post('/logout', {});
        } catch {
            // El token pudo haber expirado.
        }
        setToken(null);
        setUser(null);
    }, []);

    const updateUser = useCallback((next) => setUser(next), []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
    return context;
}
