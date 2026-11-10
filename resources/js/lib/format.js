export function money(value, currency = 'USD') {
    const number = Number(value) || 0;
    const formatted = number.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return currency === 'BOB' ? `Bs ${formatted}` : `$${formatted}`;
}

export function number(value, digits = 2) {
    return (Number(value) || 0).toFixed(digits);
}

export function formatDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString('es-BO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function relativeDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    const diff = Date.now() - date.getTime();
    const minutes = Math.round(diff / 60000);
    if (minutes < 1) return 'Justo ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `Hace ${hours} h`;
    const days = Math.round(hours / 24);
    if (days < 30) return `Hace ${days} d`;
    return formatDate(value);
}

export function initials(name) {
    return String(name || 'US')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}

export function subscriptionExpired(user) {
    if (!user?.subscription_ends_at) return false;
    const end = new Date(`${user.subscription_ends_at}T00:00:00`);
    if (Number.isNaN(end.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return end < today;
}

export function accessStatus(user) {
    if (user?.status === 'suspended') return 'suspended';
    if (subscriptionExpired(user)) return 'expired';
    return 'active';
}
