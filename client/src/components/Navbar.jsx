import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, UserRound, X } from 'lucide-react';

const links = [['Home', '/'], ['Services', '/services'], ['Products', '/products'], ['Gallery', '/gallery'], ['About', '/about'], ['Contact', '/contact']];

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="V.A Haircut & Officials home">
      <span className="grid h-10 w-10 place-items-center border border-gold font-serif text-lg text-gold">VA</span>
      <span className="hidden leading-tight sm:block">
        <span className="block font-serif text-base tracking-wide">V.A Haircut</span>
        <span className="block text-[9px] uppercase tracking-[0.35em] text-mute">& Officials</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 30);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; }, [open]);

  return (
    <>
    <header className={`sticky top-0 z-50 transition-colors duration-300 ${solid || open ? 'bg-ink/90 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}`}>
      <div className="container-x flex h-20 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {links.map(([l, to]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `text-[12px] uppercase tracking-[0.2em] transition hover:text-gold ${isActive ? 'text-gold' : 'text-white/80'}`}>{l}</NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/admin" title="Admin login" aria-label="Admin login" className="grid h-10 w-10 place-items-center rounded-full border border-gold/50 text-gold transition hover:bg-gold hover:text-ink">
            <UserRound size={18} />
          </Link>
          <Link to="/booking" className="btn btn-gold hidden !py-3 lg:inline-flex">Book Appointment</Link>
          <button className="grid h-10 w-10 place-items-center lg:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[45] flex flex-col justify-between overflow-y-auto bg-ink px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-28 lg:hidden">
            <nav className="flex flex-col gap-2">
              {links.map(([l, to], i) => (
                <motion.div key={to} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 * i }}>
                  <Link to={to} className="block border-b border-white/5 py-4 font-serif text-3xl">{l}</Link>
                </motion.div>
              ))}
            </nav>
            <Link to="/booking" className="btn btn-gold w-full">Book Appointment</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
