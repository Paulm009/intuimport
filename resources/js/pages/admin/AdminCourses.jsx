import { useEffect, useState } from 'react';
import { api, firstError } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Field, Modal, PageHeader, Spinner, btnGhost, btnPrimary, inputClass } from '../../components/ui';
import Icon from '../../components/Icon';

const emptyForm = { title: '', badge: 'Incluido', modules: 1, position: 0, lessons: [] };

export default function AdminCourses() {
    const { toast } = useToast();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [lessonTitle, setLessonTitle] = useState('');
    const [saving, setSaving] = useState(false);
    const [expanded, setExpanded] = useState(null);

    const load = async () => {
        try {
            const data = await api.get('/admin/courses');
            setCourses(data.courses);
        } catch (error) {
            toast(firstError(error, 'No se pudieron cargar los cursos.'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const openCreate = () => {
        setEditing({ id: null });
        setForm({ ...emptyForm, lessons: [] });
        setLessonTitle('');
    };

    const openEdit = (course) => {
        setEditing(course);
        setForm({
            title: course.title, badge: course.badge,
            modules: course.modules, position: course.position, lessons: [],
        });
        setLessonTitle('');
    };

    const addLesson = () => {
        if (!lessonTitle.trim()) return;
        setForm({ ...form, lessons: [...form.lessons, { title: lessonTitle.trim() }] });
        setLessonTitle('');
    };

    const removePendingLesson = (index) => {
        setForm({ ...form, lessons: form.lessons.filter((_, i) => i !== index) });
    };

    const save = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            if (editing.id) {
                await api.put(`/admin/courses/${editing.id}`, {
                    title: form.title, badge: form.badge,
                    modules: Number(form.modules), position: Number(form.position),
                });
                for (const lesson of form.lessons) {
                    await api.post(`/admin/courses/${editing.id}/lessons`, lesson);
                }
                toast('Curso actualizado');
            } else {
                await api.post('/admin/courses', {
                    title: form.title, badge: form.badge,
                    modules: Number(form.modules), position: Number(form.position),
                    lessons: form.lessons,
                });
                toast('Curso creado');
            }
            setEditing(null);
            load();
        } catch (error) {
            toast(firstError(error), 'error');
        } finally {
            setSaving(false);
        }
    };

    const addLessonExisting = async (course) => {
        if (!lessonTitle.trim()) return;
        try {
            await api.post(`/admin/courses/${course.id}/lessons`, { title: lessonTitle.trim() });
            setLessonTitle('');
            toast('Lección agregada');
            load();
        } catch (error) {
            toast(firstError(error), 'error');
        }
    };

    const removeLesson = async (lesson) => {
        try {
            await api.del(`/admin/lessons/${lesson.id}`);
            toast('Lección eliminada');
            load();
        } catch (error) {
            toast(firstError(error), 'error');
        }
    };

    const removeCourse = async (course) => {
        if (!window.confirm(`¿Eliminar el curso "${course.title}" y sus lecciones?`)) return;
        try {
            await api.del(`/admin/courses/${course.id}`);
            toast('Curso eliminado');
            load();
        } catch (error) {
            toast(firstError(error), 'error');
        }
    };

    if (loading) return <Spinner label="Cargando cursos..." />;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Cursos"
                subtitle="Administra los cursos y sus lecciones que ven los importadores."
                actions={
                    <button type="button" onClick={openCreate} className={btnPrimary}>
                        + Nuevo Curso
                    </button>
                }
            />

            <div className="space-y-3">
                {courses.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-xs text-slate-400">
                        Aún no hay cursos registrados.
                    </div>
                )}
                {courses.map((course) => (
                    <div key={course.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-navy">
                                    <Icon name="course" size={20} />
                                </span>
                                <div>
                                    <div className="text-sm font-bold text-navy">{course.title}</div>
                                    <div className="text-[11px] text-slate-400">
                                        {course.lessons.length} lecciones · {course.modules} módulos
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <button type="button" onClick={() => setExpanded(expanded === course.id ? null : course.id)} className="font-semibold text-slate-500 hover:underline">
                                    {expanded === course.id ? 'Ocultar lecciones' : 'Ver lecciones'}
                                </button>
                                <button type="button" onClick={() => openEdit(course)} className="font-semibold text-amber-600 hover:underline">
                                    Editar
                                </button>
                                <button type="button" onClick={() => removeCourse(course)} className="font-semibold text-rose-500 hover:underline">
                                    Eliminar
                                </button>
                            </div>
                        </div>

                        {expanded === course.id && (
                            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                                {course.lessons.map((lesson) => (
                                    <div key={lesson.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
                                        <span className="text-slate-700">{lesson.title}</span>
                                        <button type="button" onClick={() => removeLesson(lesson)} className="font-bold text-slate-400 hover:text-rose-600">
                                            Eliminar
                                        </button>
                                    </div>
                                ))}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={expanded === course.id ? lessonTitle : ''}
                                        onChange={(e) => setLessonTitle(e.target.value)}
                                        placeholder="Nueva lección..."
                                        className={`${inputClass} flex-1`}
                                    />
                                    <button type="button" onClick={() => addLessonExisting(course)} className={btnGhost}>
                                        Agregar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <Modal
                open={!!editing}
                onClose={() => setEditing(null)}
                title={editing?.id ? 'Editar Curso' : 'Nuevo Curso'}
                wide
                footer={
                    <>
                        <button type="button" onClick={() => setEditing(null)} className={btnGhost}>
                            Cancelar
                        </button>
                        <button type="submit" form="course-form" disabled={saving} className={btnPrimary}>
                            {saving ? 'Guardando...' : 'Guardar Curso'}
                        </button>
                    </>
                }
            >
                <form id="course-form" onSubmit={save} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Título del curso *" className="sm:col-span-2">
                        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Insignia">
                        <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Módulos">
                        <input type="number" min="0" value={form.modules} onChange={(e) => setForm({ ...form, modules: e.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Posición">
                        <input type="number" min="0" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className={inputClass} />
                    </Field>

                    <div className="sm:col-span-2">
                        <Field label="Lecciones a agregar (nuevo curso)">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={lessonTitle}
                                    onChange={(e) => setLessonTitle(e.target.value)}
                                    placeholder="Título de la lección..."
                                    className={`${inputClass} flex-1`}
                                />
                                <button type="button" onClick={addLesson} className={btnGhost}>
                                    Agregar
                                </button>
                            </div>
                        </Field>
                        {form.lessons.length > 0 && (
                            <ul className="mt-2 space-y-1">
                                {form.lessons.map((lesson, index) => (
                                    <li key={index} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-xs">
                                        <span className="text-slate-700">{lesson.title}</span>
                                        <button type="button" onClick={() => removePendingLesson(index)} className="p-1 text-slate-400 hover:text-rose-600">
                                            <Icon name="x" size={14} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </form>
            </Modal>
        </div>
    );
}
