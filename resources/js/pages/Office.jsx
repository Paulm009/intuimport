import { PageHeader } from '../components/ui';
import Icon from '../components/Icon';

const offices = [
    {
        badge: 'Sede Central',
        tone: 'bg-amber-100 text-amber-800',
        name: 'Oficina La Paz',
        address: 'Av. 20 de Octubre N° 2635, Edificio Torreluz, Piso 3 Of. 301B (Sopocachi)',
        hours: ['Lunes a Viernes: 09:00 – 18:30', 'Sábados: 09:00 – 13:00'],
        phone: '+591 2 241 0000',
    },
    {
        badge: 'Sucursal',
        tone: 'bg-blue-100 text-blue-800',
        name: 'Oficina Cochabamba',
        address: 'Zona Norte / Centro Empresarial — Atención previa coordinación de cita',
        hours: ['Lunes a Viernes: 09:00 – 18:00', 'Sábados: 09:00 – 12:30'],
        phone: '+591 4 452 0000',
    },
    {
        badge: 'Sucursal',
        tone: 'bg-emerald-100 text-emerald-800',
        name: 'Oficina Santa Cruz',
        address: 'Equipetrol Norte — Recepción de documentación y asesoría logística',
        hours: ['Lunes a Viernes: 09:00 – 18:00', 'Sábados: 09:00 – 12:30'],
        phone: '+591 3 341 0000',
    },
];

export default function Office() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Oficinas y Puntos de Atención"
                subtitle="Direcciones operativas, horarios de atención presencial y canales de soporte."
            />

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {offices.map((office) => (
                    <div key={office.name} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${office.tone}`}>
                            {office.badge}
                        </span>
                        <h3 className="text-base font-bold text-navy">{office.name}</h3>
                        <p className="text-xs text-slate-600">{office.address}</p>
                        <div className="space-y-1 border-t border-slate-100 pt-2 text-xs text-slate-500">
                            {office.hours.map((line) => (
                                <div key={line} className="flex items-center gap-1.5"><Icon name="clock" size={12} /> {line}</div>
                            ))}
                            <div className="flex items-center gap-1.5"><Icon name="phone" size={12} /> {office.phone}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="text-sm font-bold text-navy">Canales de Soporte</h2>
                <div className="grid grid-cols-1 gap-3 text-xs text-slate-600 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                        <div className="text-[10px] font-bold uppercase text-slate-400">WhatsApp</div>
                        <div className="mt-1 font-semibold text-navy">+591 700 00000</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                        <div className="text-[10px] font-bold uppercase text-slate-400">Correo</div>
                        <div className="mt-1 font-semibold text-navy">soporte@intuimport.bo</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                        <div className="text-[10px] font-bold uppercase text-slate-400">Horario</div>
                        <div className="mt-1 font-semibold text-navy">Lun a Vie · 09:00 – 18:30</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
