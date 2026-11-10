import { useEffect, useState } from 'react';
import { api, firstError } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { Empty, Field, Modal, PageHeader, Spinner, btnGhost, btnPrimary, inputClass } from '../components/ui';
import Icon from '../components/Icon';
import { formatDate } from '../lib/format';

const services = [
    {
        icon: 'doc',
        tone: 'bg-amber-50 text-amber-600',
        title: 'Revisión de Proforma e Incoterms',
        description: 'Auditoría preventiva de la factura proforma del proveedor antes de realizar la transferencia.',
        cta: 'Solicitar Revisión',
        type: 'Revisión de Proforma e Incoterms',
    },
    {
        icon: 'receipt',
        tone: 'bg-blue-50 text-blue-600',
        title: 'Clasificación Arancelaria y Tributos',
        description: 'Validación de subpartida NANDINA, gravámenes aplicables y permisos previos de importación.',
        cta: 'Solicitar Clasificación',
        type: 'Clasificación Arancelaria y Tributos',
    },
    {
        icon: 'box',
        tone: 'bg-emerald-50 text-emerald-600',
        title: 'Coordinación de Carga Consolidada (LCL)',
        description: 'Reserva de espacio en almacén consolidado en China y seguimiento documental hasta destino.',
        cta: 'Solicitar Consolidación',
        type: 'Coordinación de Carga Consolidada LCL',
    },
];

const emptyMeeting = { title: '', day: 'Lunes', time: '16:00', modality: 'Sesión Programada' };

export default function Services() {
    const { toast } = useToast();
    const [requests, setRequests] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(emptyMeeting);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        try {
            const [requestsData, meetingsData] = await Promise.all([
                api.get('/service-requests'),
                api.get('/meetings'),
            ]);
            setRequests(requestsData.requests);
            setMeetings(meetingsData.meetings);
        } catch (error) {
            toast(firstError(error, 'No se pudieron cargar los servicios.'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const requestService = async (type) => {
        try {
            const data = await api.post('/service-requests', { type });
            setRequests((current) => [data.request, ...current]);
            toast('Solicitud enviada. El equipo te contactará.');
        } catch (error) {
            toast(firstError(error), 'error');
        }
    };

    const schedule = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            const data = await api.post('/meetings', form);
            setMeetings((current) => [...current, data.meeting]);
            setModalOpen(false);
            setForm(emptyMeeting);
            toast('Sesión agendada');
        } catch (error) {
            toast(firstError(error), 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Spinner label="Cargando servicios..." />;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Servicios de Asesoría y Verificación Operativa"
                subtitle="Solicita acompañamiento técnico para validación de proveedores, revisión de cotizaciones o despacho."
                actions={
                    <button type="button" onClick={() => setModalOpen(true)} className={`${btnPrimary} flex items-center gap-1.5`}>
                        <Icon name="calendar" size={14} /> Agendar Sesión
                    </button>
                }
            />

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {services.map((service) => (
                    <div key={service.type} className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="space-y-2">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${service.tone}`}>
                                <Icon name={service.icon} size={18} />
                            </div>
                            <h3 className="text-sm font-bold text-navy">{service.title}</h3>
                            <p className="text-xs text-slate-500">{service.description}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => requestService(service.type)}
                            className="w-full rounded-xl bg-navy py-2 text-xs font-semibold text-white hover:bg-slate-800"
                        >
                            {service.cta}
                        </button>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
                    <h2 className="text-sm font-bold text-navy">Mis Solicitudes de Servicio</h2>
                    {requests.length === 0 ? (
                        <Empty>No tienes solicitudes de servicio activas.</Empty>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {requests.map((request) => (
                                <div key={request.id} className="flex items-center justify-between gap-3 py-3 text-xs">
                                    <div>
                                        <div className="font-semibold text-slate-800">{request.type}</div>
                                        <div className="text-[11px] text-slate-400">
                                            {formatDate(request.created_at)}
                                        </div>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                                        {request.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-navy">Agenda de Sesiones</h2>
                        <button type="button" onClick={() => setModalOpen(true)} className="text-[11px] font-semibold text-amber-600 hover:underline">
                            + Agendar
                        </button>
                    </div>
                    {meetings.length === 0 ? (
                        <Empty>No hay sesiones programadas.</Empty>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {meetings.map((meeting) => (
                                <div key={meeting.id} className="flex items-center justify-between gap-3 py-3 text-xs">
                                    <div>
                                        <div className="font-semibold text-slate-800">{meeting.title}</div>
                                        <div className="text-[11px] text-slate-400">{meeting.modality}</div>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <div className="font-bold text-navy">{meeting.day}</div>
                                        <div className="text-[11px] text-slate-500">{meeting.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Agendar Sesión de Asesoría"
                footer={
                    <>
                        <button type="button" onClick={() => setModalOpen(false)} className={btnGhost}>
                            Cancelar
                        </button>
                        <button type="submit" form="meeting-form" disabled={saving} className={btnPrimary}>
                            {saving ? 'Agendando...' : 'Agendar Sesión'}
                        </button>
                    </>
                }
            >
                <form id="meeting-form" onSubmit={schedule} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Tema de la sesión *" className="sm:col-span-2">
                        <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={inputClass} placeholder="Ej. Revisión de proveedor de iluminación LED" />
                    </Field>
                    <Field label="Día">
                        <select value={form.day} onChange={(event) => setForm({ ...form, day: event.target.value })} className={inputClass}>
                            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((day) => (
                                <option key={day} value={day}>{day}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Hora">
                        <input type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} className={inputClass} />
                    </Field>
                    <Field label="Modalidad" className="sm:col-span-2">
                        <select value={form.modality} onChange={(event) => setForm({ ...form, modality: event.target.value })} className={inputClass}>
                            <option value="Sesión Programada">Sesión Programada</option>
                            <option value="Videollamada Zoom">Videollamada Zoom</option>
                            <option value="Presencial La Paz">Presencial La Paz</option>
                            <option value="Presencial Cochabamba">Presencial Cochabamba</option>
                        </select>
                    </Field>
                </form>
            </Modal>
        </div>
    );
}
