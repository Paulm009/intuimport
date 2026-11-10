import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, firstError } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { PageHeader, Spinner, StatCard } from '../../components/ui';
import Icon from '../../components/Icon';

export default function AdminDashboard() {
    const { toast } = useToast();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        api.get('/admin/dashboard')
            .then((data) => setStats(data.stats))
            .catch((error) => toast(firstError(error, 'No se pudo cargar el resumen.'), 'error'));
    }, []);

    if (!stats) return <Spinner label="Cargando panel..." />;

    const cards = [
        { label: 'Importadores totales', value: stats.users, icon: <Icon name="users" />, to: '/admin/usuarios' },
        { label: 'Cuentas activas', value: stats.active_users, icon: <Icon name="check" />, to: '/admin/usuarios?status=active' },
        { label: 'Suspendidas', value: stats.suspended, icon: <Icon name="block" />, to: '/admin/usuarios?status=suspended' },
        { label: 'Suscripciones vencidas', value: stats.expired, icon: <Icon name="clock" />, to: '/admin/usuarios?status=expired' },
        { label: 'Cursos', value: stats.courses, icon: <Icon name="course" />, to: '/admin/cursos' },
        { label: 'Lecciones', value: stats.lessons, icon: <Icon name="library" />, to: '/admin/cursos' },
        { label: 'Grabaciones', value: stats.recordings, icon: <Icon name="recording" />, to: '/admin/grabaciones' },
        { label: 'Aranceles', value: stats.tariffs, icon: <Icon name="receipt" />, to: '/admin/aranceles' },
        { label: 'Recursos de biblioteca', value: stats.library, icon: <Icon name="library" />, to: '/admin/biblioteca' },
        { label: 'Sugerencias', value: stats.suggestions, icon: <Icon name="bulb" />, to: '/admin/sugerencias' },
        { label: 'Reuniones', value: stats.meetings, icon: <Icon name="calendar" />, to: '/admin/reuniones' },
        { label: 'Publicaciones', value: stats.posts, icon: <Icon name="chat" />, to: '/admin/comunidad' },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Panel de Administración"
                subtitle="Gestiona el contenido del portal y las suscripciones de los importadores."
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                    <Link key={card.label} to={card.to}>
                        <StatCard label={card.label} value={card.value} icon={card.icon} />
                    </Link>
                ))}
            </div>
        </div>
    );
}
