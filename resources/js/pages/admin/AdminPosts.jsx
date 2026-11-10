import { useEffect, useState } from 'react';
import { api, firstError } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { PageHeader, Spinner } from '../../components/ui';
import Icon from '../../components/Icon';
import { formatDateTime } from '../../lib/format';

export default function AdminPosts() {
    const { toast } = useToast();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        try {
            const data = await api.get('/admin/posts');
            setItems(data.posts);
        } catch (error) {
            toast(firstError(error, 'No se pudieron cargar las publicaciones.'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const remove = async (post) => {
        if (!window.confirm('¿Eliminar esta publicación y sus respuestas?')) return;
        try {
            await api.del(`/admin/posts/${post.id}`);
            toast('Publicación eliminada');
            load();
        } catch (error) {
            toast(firstError(error), 'error');
        }
    };

    if (loading) return <Spinner label="Cargando comunidad..." />;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Comunidad"
                subtitle="Modera las publicaciones del foro de importadores."
            />
            <div className="space-y-3">
                {items.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-xs text-slate-400">
                        No hay publicaciones en la comunidad.
                    </div>
                )}
                {items.map((post) => (
                    <div key={post.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                                <h3 className="text-sm font-bold text-navy">{post.title}</h3>
                                <div className="mt-0.5 text-[11px] text-slate-400">
                                    {post.author} ({post.author_email}) · {formatDateTime(post.created_at)}
                                </div>
                                <p className="mt-2 whitespace-pre-line text-xs text-slate-600">{post.body}</p>
                            </div>
                            <button type="button" onClick={() => remove(post)} className="shrink-0 font-semibold text-rose-500 hover:underline">
                                Eliminar
                            </button>
                        </div>
                        <div className="mt-3 flex items-center gap-4 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1"><Icon name="thumbsUp" size={12} /> {post.likes} me gusta</span>
                            <span className="flex items-center gap-1"><Icon name="chat" size={12} /> {post.replies_count} respuestas</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
