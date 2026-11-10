const TOKEN_KEY = 'fulcomex_token';

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
    const headers = { Accept: 'application/json' };

    if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }

    const token = getToken();
    if (auth && token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`/api${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();
    let data = {};
    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = { message: text };
    }

    if (!response.ok) {
        const error = new Error(data.message || 'No se pudo completar la operación.');
        error.status = response.status;
        error.errors = data.errors || {};

        if (response.status === 401) {
            setToken(null);
            window.dispatchEvent(new Event('fulcomex:unauthorized'));
        }

        throw error;
    }

    return data;
}

export const api = {
    get: (path, options) => request(path, { ...options, method: 'GET' }),
    post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
    put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
    del: (path, options) => request(path, { ...options, method: 'DELETE' }),
};

export function firstError(error, fallback = 'Revisa los datos ingresados.') {
    if (error?.errors) {
        const values = Object.values(error.errors);
        if (values.length > 0 && values[0]?.length) {
            return values[0][0];
        }
    }
    return error?.message || fallback;
}
