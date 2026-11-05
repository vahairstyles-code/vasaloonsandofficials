import { MapPin, MessageCircle, Navigation, Phone } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { SectionTitle, Reveal } from '../components/ui';
import { waLink } from '../services/api';

export default function Contact() {
  const { settings: s } = useSettings();
  const phone = (s?.phone || '7330947785').replace(/\D/g, '').slice(-10);
  return (
    <div className="container-x py-24">
      <SectionTitle eyebrow="Contact" title="Visit or reach us" />
      <div className="grid gap-12 md:grid-cols-2">
        <Reveal>
          <ul className="space-y-5 text-mute">
            <li className="flex gap-3"><MapPin className="mt-0.5 shrink-0 text-gold" size={18} />{s?.address}</li>
            <li className="flex gap-3"><Phone className="mt-0.5 shrink-0 text-gold" size={18} />{s?.phone}</li>
            <li>Monday – Sunday: {s?.openTime || '09:00'} – {s?.closeTime || '21:00'}</li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="btn btn-gold" href={`tel:+91${phone}`}><Phone size={15} />Call now</a>
            <a className="btn btn-line" target="_blank" rel="noreferrer" href={waLink(s?.whatsapp || '7330947785', 'Hello V.A Haircut & Officials')}><MessageCircle size={15} />WhatsApp</a>
            <a className="btn btn-line" target="_blank" rel="noreferrer" href={s?.mapLink}><Navigation size={15} />Directions</a>
          </div>
        </Reveal>
        <iframe title="Map" loading="lazy" className="h-80 w-full border-0 grayscale invert-[0.92] contrast-90" src="https://www.google.com/maps?q=Gurazala,Andhra+Pradesh&output=embed" />
      </div>
    </div>
  );
}
