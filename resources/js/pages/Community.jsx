import { useEffect, useState } from 'react';
import { api, firstError } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { Empty, Field, Modal, PageHeader, Pill, Spinner, btnGhost, btnPrimary, inputClass } from '../components/ui';
import Icon from '../components/Icon';
import { relativeDate } from '../lib/format';

const filters = [
    { key: 'all', label: 'Todas' },
    { key: 'mine', label: 'Mis publicaciones' },
    { key: 'liked', label: 'Que me gustaron' },
];

export default function Community() {
    const { toast } = useToast();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ title: '', body: '' });
    const [saving, setSaving] = useState(false);
    const [replyFor, setReplyFor] = useState(null);
    const [replyBody, setReplyBody] = useState('');

    const load = async (nextFilter = filter) => {
        setLoading(true);
        try {
            const data = await api.get(`/posts?filter=${nextFilter}`);
            setPosts(data.posts);
        } catch (error) {
            toast(firstError(error, 'No se pudo cargar la comunidad.'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load(filter);
    }, [filter]);

    const publish = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            const data = await api.post('/posts', form);
            setPosts((current) => [data.post, ...current]);
            setForm({ title: '', body: '' });
            setModalOpen(false);
            toast('Publicación creada');
        } catch (error) {
            toast(firstError(error), 'error');
        } finally {
            setSaving(false);
        }
    };

    const like = async (post) => {
        try {
            const data = await api.post(`/posts/${post.id}/like`, {});
            setPosts((current) =>
                current.map((item) =>
                    item.id === post.id ? { ...item, likes: data.likes, liked_by_me: data.liked } : item,
                ),
            );
        } catch (error) {
            toast(firstError(error), 'error');
        }
    };

    const reply = async (event) => {
        event.preventDefault();
        if (!replyFor) return;
        try {
            const data = await api.post(`/posts/${replyFor.id}/replies`, { body: replyBody });
            setPosts((current) => current.map((item) => (item.id === replyFor.id ? data.post : item)));
            setReplyFor(null);
            setReplyBody('');
            toast('Respuesta publicada');
        } catch (error) {
            toast(firstError(error), 'error');
        }
    };

    const remove = async (post) => {
        try {
            await api.del(`/posts/${post.id}`);
            setPosts((current) => current.filter((item) => item.id !== post.id));
            toast('Publicación eliminada');
        } catch (error) {
            toast(firstError(error), 'error');
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Comunidad INTU IMPORT"
                subtitle="Comparte experiencias, resuelve dudas y aprende de otros importadores bolivianos."
                actions={
                    <button type="button" onClick={() => setModalOpen(true)} className={btnPrimary}>
                        + Nueva Publicación
                    </button>
                }
            />

            <div className="flex flex-wrap gap-1.5 rounded-2xl border border-slate-200 bg-white p-4">
                {filters.map((item) => (
                    <Pill key={item.key} active={filter === item.key} onClick={() => setFilter(item.key)}>
                        {item.label}
                    </Pill>
                ))}
            </div>

            {loading ? (
                <Spinner label="Cargando publicaciones..." />
            ) : posts.length === 0 ? (
                <Empty>No hay publicaciones en este filtro. ¡Sé el primero en compartir!</Empty>
            ) : (
                <div className="space-y-4">
                    {posts.map((post) => (
                        <article key={post.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-xs font-bold text-gold">
                                        {post.author_initials}
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-navy">{post.author}</div>
                                        <div className="text-[11px] text-slate-400">{relativeDate(post.created_at)}</div>
                                    </div>
                                </div>
                                {post.mine && (
                                    <button type="button" onClick={() => remove(post)} className="text-[11px] font-semibold text-slate-400 hover:text-rose-600">
                                        Eliminar
                                    </button>
                                )}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-navy">{post.title}</h3>
                                <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-slate-600">{post.body}</p>
                            </div>
                            <div className="flex items-center gap-4 border-t border-slate-100 pt-3 text-xs">
                                <button
                                    type="button"
                                    onClick={() => like(post)}
                                    className={`flex items-center gap-1 font-semibold ${post.liked_by_me ? 'text-amber-600' : 'text-slate-500 hover:text-amber-600'}`}
                                >
                                    <Icon name="heart" size={14} className={post.liked_by_me ? 'fill-current' : ''} /> {post.likes}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setReplyFor(post)}
                                    className="flex items-center gap-1 font-semibold text-slate-500 hover:text-navy"
                                >
                                    <Icon name="reply" size={14} /> Responder ({post.replies.length})
                                </button>
                            </div>
                            {post.replies.length > 0 && (
                                <div className="space-y-2 rounded-xl bg-slate-50 p-3">
                                    {post.replies.map((item) => (
                                        <div key={item.id} className="text-xs">
                                            <span className="font-bold text-navy">{item.author}</span>
                                            <span className="ml-2 text-[10px] text-slate-400">{relativeDate(item.created_at)}</span>
                                            <p className="text-slate-600">{item.body}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            )}

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Nueva Publicación"
                footer={
                    <>
                        <button type="button" onClick={() => setModalOpen(false)} className={btnGhost}>
                            Cancelar
                        </button>
                        <button type="submit" form="post-form" disabled={saving} className={btnPrimary}>
                            {saving ? 'Publicando...' : 'Publicar'}
                        </button>
                    </>
                }
            >
                <form id="post-form" onSubmit={publish} className="space-y-3">
                    <Field label="Título *">
                        <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={inputClass} placeholder="Ej. ¿Conviene importar por Iquique o Arica?" />
                    </Field>
                    <Field label="Contenido *">
                        <textarea required rows={6} value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} className={inputClass} placeholder="Comparte tu experiencia, dudas o consejos..." />
                    </Field>
                </form>
            </Modal>

            <Modal
                open={!!replyFor}
                onClose={() => setReplyFor(null)}
                title={`Responder a ${replyFor?.author || ''}`}
                footer={
                    <>
                        <button type="button" onClick={() => setReplyFor(null)} className={btnGhost}>
                            Cancelar
                        </button>
                        <button type="submit" form="reply-form" className={btnPrimary}>
                            Responder
                        </button>
                    </>
                }
            >
                <form id="reply-form" onSubmit={reply} className="space-y-3">
                    <Field label="Tu respuesta *">
                        <textarea required rows={5} value={replyBody} onChange={(event) => setReplyBody(event.target.value)} className={inputClass} />
                    </Field>
                </form>
            </Modal>
        </div>
    );
}
