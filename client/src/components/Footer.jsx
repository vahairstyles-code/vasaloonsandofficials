import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { Logo } from './Navbar';
import { waLink } from '../services/api';

export default function Footer() {
  const { settings: s } = useSettings();
  return (
    <footer className="border-t border-white/5 bg-coal">
      <div className="container-x grid gap-12 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-mute">Precision grooming. Timeless style. An experience crafted for the modern man.</p>
        </div>
        <div>
          <h4 className="eyebrow mb-5">Explore</h4>
          <ul className="space-y-3 text-sm text-mute">
            {[['Services', '/services'], ['Products', '/products'], ['Gallery', '/gallery'], ['Book Appointment', '/booking'], ['Contact', '/contact']].map(([l, to]) => (
              <li key={to}><Link className="hover:text-gold" to={to}>{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="eyebrow mb-5">Visit</h4>
          <address className="space-y-3 text-sm not-italic text-mute">
            <p>{s?.address || 'Beside SBI Bank, Gurazala, Andhra Pradesh'}</p>
            <p>Mon – Sun, 9 AM – 9 PM</p>
            <p><a className="hover:text-gold" href={`tel:+91${(s?.phone || '7330947785').replace(/\D/g, '').slice(-10)}`}>{s?.phone || '7330947785'}</a></p>
            <p><a className="hover:text-gold" href={waLink(s?.whatsapp || '7330947785', 'Hello V.A Haircut & Officials')} target="_blank" rel="noreferrer">WhatsApp us</a></p>
          </address>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-mute md:flex-row">
          <p>{s?.footer || '© V.A Haircut & Officials. All rights reserved.'}</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-gold">Privacy</Link>
            <Link to="/terms" className="hover:text-gold">Terms</Link>
            <Link to="/refund-policy" className="hover:text-gold">Cancellation & Refund</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
