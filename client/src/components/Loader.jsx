import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Shown once per session, only while the page is actually loading (max ~1.2s).
export default function Loader() {
  const [show, setShow] = useState(() => !sessionStorage.getItem('va_loaded'));
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (!show) return;
    const t0 = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(100, ((t - t0) / 900) * 100);
      setPct(Math.round(p));
      if (p < 100) raf = requestAnimationFrame(tick);
      else {
        const done = () => { try { sessionStorage.setItem('va_loaded', '1'); } catch {} setShow(false); };
        document.readyState === 'complete' ? done() : window.addEventListener('load', done, { once: true });
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div className="fixed inset-0 z-[100] grid place-items-center bg-ink" exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9, letterSpacing: '0.5em' }} animate={{ opacity: 1, scale: 1, letterSpacing: '0.12em' }} transition={{ duration: 0.9 }}
              className="font-serif text-7xl metal-text">VA</motion.div>
            <p className="mt-3 text-[10px] uppercase tracking-[0.4em] text-mute">Haircut & Officials</p>
            <div className="mx-auto mt-8 h-px w-40 bg-white/10"><div className="h-px bg-gold transition-all" style={{ width: `${pct}%` }} /></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
