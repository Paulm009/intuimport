import { useEffect, useMemo, useState } from 'react';
import { api, firstError } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { Empty, Modal, PageHeader, Pill, Spinner, btnNavy } from '../components/ui';
import Icon from '../components/Icon';

export default function Courses() {
    const { toast } = useToast();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('todos');
    const [search, setSearch] = useState('');
    const [activeCourse, setActiveCourse] = useState(null);

    const load = async () => {
        try {
            const data = await api.get('/courses');
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

    const withProgress = useMemo(
        () =>
            courses.map((course) => {
                const done = course.lessons.filter((lesson) => lesson.completed).length;
                const pct = course.lessons.length ? Math.round((done / course.lessons.length) * 100) : 0;
                return { ...course, done, pct };
            }),
        [courses],
    );

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        return withProgress.filter((course) => {
            if (filter === 'en-progreso' && (course.pct === 0 || course.pct === 100)) return false;
            if (filter === 'completados' && course.pct < 100) return false;
            if (query && !course.title.toLowerCase().includes(query)) return false;
            return true;
        });
    }, [withProgress, filter, search]);

    const toggleLesson = async (courseId, lesson) => {
        try {
            const data = await api.post('/courses/lesson', { lesson_id: lesson.id });
            setCourses((current) =>
                current.map((course) =>
                    course.id === courseId
                        ? {
                              ...course,
                              lessons: course.lessons.map((item) =>
                                  item.id === lesson.id ? { ...item, completed: data.completed } : item,
                              ),
                          }
                        : course,
                ),
            );
            setActiveCourse((current) =>
                current && current.id === courseId
                    ? {
                          ...current,
                          lessons: current.lessons.map((item) =>
                              item.id === lesson.id ? { ...item, completed: data.completed } : item,
                          ),
                      }
                    : current,
            );
        } catch (error) {
            toast(firstError(error), 'error');
        }
    };

    if (loading) return <Spinner label="Cargando cursos..." />;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Cursos y Módulos de Formación"
                subtitle="Haz clic en cualquier curso para abrir sus lecciones y registrar tu avance."
                actions={
                    <>
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Buscar curso..."
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
                        />
                        <Pill active={filter === 'todos'} onClick={() => setFilter('todos')}>
                            Todos
                        </Pill>
                        <Pill active={filter === 'en-progreso'} onClick={() => setFilter('en-progreso')}>
                            En progreso
                        </Pill>
                        <Pill active={filter === 'completados'} onClick={() => setFilter('completados')}>
                            Completados
                        </Pill>
                    </>
                }
            />

            {filtered.length === 0 ? (
                <Empty>No se encontraron cursos con ese filtro.</Empty>
            ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((course) => (
                        <div
                            key={course.id}
                            className="flex flex-col justify-between space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-gold">
                                        <Icon name="course" size={20} />
                                    </div>
                                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                                        {course.badge}
                                    </span>
                                </div>
                                <h3 className="text-sm font-bold leading-snug text-navy">{course.title}</h3>
                                <div className="text-xs text-slate-500">
                                    {course.modules} módulos · {course.lessons.length} clases prácticas
                                </div>
                            </div>
                            <div className="space-y-3 pt-2">
                                <div>
                                    <div className="mb-1 flex justify-between text-[11px] font-semibold">
                                        <span className="text-slate-500">Progreso</span>
                                        <span className="text-navy">{course.pct}% completado</span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                        <div className="h-full bg-gold transition-all" style={{ width: `${course.pct}%` }} />
                                    </div>
                                </div>
                                <button type="button" onClick={() => setActiveCourse(course)} className={`w-full py-2 ${btnNavy}`}>
                                    Abrir Módulos y Clases
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                open={!!activeCourse}
                onClose={() => setActiveCourse(null)}
                title={activeCourse?.title || 'Curso'}
                footer={
                    <button type="button" onClick={() => setActiveCourse(null)} className={btnNavy}>
                        Cerrar
                    </button>
                }
            >
                <p className="mb-3 text-xs text-slate-500">
                    Marca las casillas de cada clase para actualizar tu porcentaje de avance.
                </p>
                <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto text-xs">
                    {activeCourse?.lessons.map((lesson) => (
                        <label
                            key={lesson.id}
                            className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-3 hover:bg-slate-50"
                        >
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={lesson.completed}
                                    onChange={() => toggleLesson(activeCourse.id, lesson)}
                                    className="h-4 w-4 accent-amber-500"
                                />
                                <span className={lesson.completed ? 'font-medium text-slate-400 line-through' : 'font-medium text-slate-800'}>
                                    {lesson.title}
                                </span>
                            </div>
                            <span
                                className={`rounded px-2 py-0.5 text-[11px] ${
                                    lesson.completed ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                }`}
                            >
                                {lesson.completed ? 'Completada' : 'Pendiente'}
                            </span>
                        </label>
                    ))}
                </div>
            </Modal>
        </div>
    );
}
