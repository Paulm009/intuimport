import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, firstError } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { Empty, Field, Modal, PageHeader, Spinner, StatCard, btnGhost, btnPrimary, inputClass } from '../components/ui';
import Icon from '../components/Icon';
import { relativeDate } from '../lib/format';

const defaultMeeting = { title: '', day: 'Martes', time: '20:00 - 21:30', modality: 'Sesión Programada' };

export default function Dashboard() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [meeting, setMeeting] = useState(defaultMeeting);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try {
            const response = await api.get('/dashboard');
            setData(response);
        } catch (error) {
            toast(firstError(error, 'No se pudo cargar el dashboard.'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const createMeeting = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            await api.post('/meetings', meeting);
            toast('Sesión agregada al calendario');
            setModalOpen(false);
            setMeeting(defaultMeeting);
            load();
        } catch (error) {
            toast(firstError(error), 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading || !data) return <Spinner label="Cargando dashboard..." />;

    const { kpis, meetings, posts } = data;

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 rounded-2xl bg-navy p-6 text-white shadow-sm lg:flex-row lg:items-center">
                <div className="space-y-1">
                    <span className="inline-block rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-semibold text-white">
                        CENTRO DE CONTROL
                    </span>
                    <h1 className="text-xl font-bold lg:text-2xl">Centro de Control de Importaciones</h1>
                    <p className="max-w-2xl text-xs text-slate-300 lg:text-sm">
                        Gestiona tus cotizaciones CIF/aduana, cubicaje CBM, proveedores, embarques y formación desde un
                        único panel.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                    <button
                        type="button"
                        onClick={() => navigate('/herramientas')}
                        className="flex items-center gap-2 rounded-xl bg-gold bg-gold-hover px-4 py-2.5 text-xs font-bold text-white shadow-sm"
                    >
                        <Icon name="calculator" size={15} /> Calculadora de Costos
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/importes')}
                        className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/20"
                    >
                        + Nueva Importación
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Importaciones Registradas"
                    value={kpis.imports}
                    icon={<Icon name="box" />}
                    hint="Ver gestor →"
                    onClick={() => navigate('/importes')}
                />
                <StatCard
                    label="Proveedores Verificados"
                    value={kpis.suppliers}
                    icon={<Icon name="factory" />}
                    hint="Ver directorio →"
                    onClick={() => navigate('/proveedores')}
                />
                <StatCard
                    label="Cotizaciones Guardadas"
                    value={kpis.quotes}
                    icon={<Icon name="calculator" />}
                    hint="Abrir calculadora →"
                    onClick={() => navigate('/herramientas')}
                />
                <StatCard
                    label="Progreso de Academia"
                    value={`${kpis.course_progress}%`}
                    icon={<Icon name="course" />}
                    hint="Ir a cursos →"
                    onClick={() => navigate('/cursos')}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <section className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-7">
                    <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="flex items-center gap-2 text-base font-bold text-navy">
                                    <Icon name="calendar" size={17} /> Próximas Reuniones y Clases en Vivo
                                </h2>
                                <p className="text-xs text-slate-500">Semana actual · Sesiones en vivo</p>
                            </div>
                            <button type="button" onClick={() => setModalOpen(true)} className={btnPrimary}>
                                + Agendar
                            </button>
                        </div>

                        <div className="mt-3 divide-y divide-slate-100">
                            {meetings.length === 0 ? (
                                <Empty>No hay sesiones programadas.</Empty>
                            ) : (
                                meetings.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between gap-3 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="min-w-[76px] rounded-lg bg-slate-100 px-2.5 py-1.5 text-center text-xs font-bold text-navy">
                                                {item.day}
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-800">{item.title}</div>
                                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                                    <Icon name="clock" size={12} /> {item.time} · {item.modality}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                toast(`Sala habilitada 15 min antes: ${item.day} ${item.time}`, 'info')
                                            }
                                            className="shrink-0 rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                                        >
                                            Acceder
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                        <span>Zona horaria: America/La_Paz (GMT-4)</span>
                        <button
                            type="button"
                            onClick={() => navigate('/grabaciones')}
                            className="font-semibold text-navy hover:underline"
                        >
                            Ver grabaciones anteriores →
                        </button>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="flex items-center gap-2 text-base font-bold text-navy">
                                <Icon name="chat" size={17} /> Comunidad Importadora
                            </h2>
                            <p className="text-xs text-slate-500">Consultas y avances recientes</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/comunidad')}
                            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                        >
                            Ver todo
                        </button>
                    </div>
                    <div className="mt-4 space-y-3">
                        {posts.length === 0 ? (
                            <Empty>Sin publicaciones recientes.</Empty>
                        ) : (
                            posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="space-y-1.5 rounded-xl border border-slate-200/70 bg-slate-50 p-3.5"
                                >
                                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                                        <span className="font-bold text-navy">{post.author}</span>
                                        <span>{relativeDate(post.created_at)}</span>
                                    </div>
                                    <div className="text-xs font-bold text-slate-800">{post.title}</div>
                                    <p className="line-clamp-2 text-xs text-slate-600">{post.body}</p>
                                    <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-500">
                                        <span className="flex items-center gap-1"><Icon name="thumbsUp" size={12} /> {post.likes}</span>
                                        <span className="flex items-center gap-1"><Icon name="chat" size={12} /> {post.replies_count} respuestas</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Programar Sesión en Calendario"
                footer={
                    <>
                        <button type="button" onClick={() => setModalOpen(false)} className={btnGhost}>
                            Cancelar
                        </button>
                        <button type="submit" form="meeting-form" disabled={saving} className={btnPrimary}>
                            {saving ? 'Guardando...' : 'Guardar Sesión'}
                        </button>
                    </>
                }
            >
                <form id="meeting-form" onSubmit={createMeeting} className="space-y-3">
                    <Field label="Título de la sesión *">
                        <input
                            required
                            value={meeting.title}
                            onChange={(event) => setMeeting({ ...meeting, title: event.target.value })}
                            className={inputClass}
                            placeholder="Ej. Revisión en vivo de proveedores 1688"
                        />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Día">
                            <select
                                value={meeting.day}
                                onChange={(event) => setMeeting({ ...meeting, day: event.target.value })}
                                className={inputClass}
                            >
                                <option>Martes</option>
                                <option>Jueves</option>
                                <option>Sábado</option>
                            </select>
                        </Field>
                        <Field label="Horario">
                            <input
                                value={meeting.time}
                                onChange={(event) => setMeeting({ ...meeting, time: event.target.value })}
                                className={inputClass}
                            />
                        </Field>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
