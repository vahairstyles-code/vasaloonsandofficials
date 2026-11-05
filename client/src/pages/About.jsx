import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { Reveal, SectionTitle } from '../components/ui';

export default function About() {
  const { settings: s } = useSettings();
  return (
    <div className="container-x max-w-4xl py-24">
      <SectionTitle eyebrow="About Us" title="More than just a haircut." />
      <Reveal><p className="text-lg leading-relaxed text-mute">{s?.about}</p></Reveal>
      <Reveal delay={0.1}>
        <div className="mt-14 grid gap-px border border-white/5 bg-white/5 sm:grid-cols-3">
          {[['Precision', 'Clean lines and careful finishing on every service.'], ['Personal style', 'We listen first, then style to suit you.'], ['Comfort', 'A tidy, relaxed space for a good grooming session.']].map(([t, d]) => (
            <div key={t} className="bg-card p-7"><h3 className="font-serif text-xl text-champagne">{t}</h3><p className="mt-3 text-sm text-mute">{d}</p></div>
          ))}
        </div>
      </Reveal>
      <p className="mt-10 text-sm text-mute">Owner: Vamsi · {s?.address}</p>
      <Link to="/booking" className="btn btn-gold mt-8">Book Your Appointment</Link>
    </div>
  );
}
