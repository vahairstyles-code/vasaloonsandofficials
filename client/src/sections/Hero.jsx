import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, IndianRupee } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { prefersReducedMotion, useIsMobile } from '../hooks/useFetch';

const ScissorsScene = lazy(() => import('../three/ScissorsScene'));

function canWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

export default function Hero({ minPrice }) {
  const { settings: s } = useSettings();
  const mobile = useIsMobile();
  const [show3d, setShow3d] = useState(false);
  const ref = useRef();

  // 3D only on desktop, with WebGL, no reduced-motion, and after first paint (idle)
  useEffect(() => {
    if (mobile || prefersReducedMotion() || !canWebGL()) return;
    const id = (window.requestIdleCallback || ((f) => setTimeout(f, 600)))(() => setShow3d(true));
    return () => (window.cancelIdleCallback || clearTimeout)(id);
  }, [mobile]);

  const lines = (s?.heroHeading || 'DEFINE YOUR STYLE.\nOWN YOUR PRESENCE.').split('\n');

  return (
    <section ref={ref} className="relative isolate flex min-h-[calc(100vh-5rem)] items-center overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_40%,rgba(201,164,92,0.14),transparent_60%),linear-gradient(180deg,#080808,#0d0c0a)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]" style={{ backgroundImage: 'repeating-linear-gradient(90deg,#fff 0 1px,transparent 1px 120px)' }} />
      {show3d && (
        <div className="absolute inset-y-0 right-0 -z-0 hidden w-1/2 md:block" aria-hidden>
          <Suspense fallback={null}><ScissorsScene /></Suspense>
        </div>
      )}
      <div className="container-x relative z-10 py-20">
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="eyebrow mb-6">V.A Haircut & Officials · Gurazala</motion.p>
        <h1 className="h-display max-w-4xl text-[2.6rem] sm:text-6xl lg:text-8xl">
          {lines.map((l, i) => (
            <span key={i} className="block overflow-hidden">
              <motion.span className={`block ${i === lines.length - 1 ? 'metal-text' : ''}`} initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ duration: 1, delay: 0.3 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}>{l}</motion.span>
            </span>
          ))}
        </h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-8 max-w-xl text-lg text-mute">{s?.heroSubtitle || 'Precision grooming. Timeless style. An experience crafted for the modern man.'}</motion.p>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link to="/booking" className="btn btn-gold">Book Your Appointment</Link>
          <Link to="/services" className="btn btn-line">Explore Our Services</Link>
        </motion.div>
        <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} className="mt-14 flex flex-wrap gap-x-10 gap-y-3 text-sm text-mute">
          <li className="flex items-center gap-2"><MapPin size={15} className="text-gold" /> Gurazala, Andhra Pradesh</li>
          <li className="flex items-center gap-2"><Clock size={15} className="text-gold" /> Open Daily: 9 AM – 9 PM</li>
          <li className="flex items-center gap-2"><IndianRupee size={15} className="text-gold" /> Starting from ₹{minPrice ?? 49}</li>
        </motion.ul>
      </div>
    </section>
  );
}
