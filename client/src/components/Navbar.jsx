import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, UserRound, X } from "lucide-react";

const links = [
  ["Home", "/"],
  ["Services", "/services"],
  ["Products", "/products"],
  ["Gallery", "/gallery"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

// Apple-style fluid spring & liquid cubic-bezier curves
const liquidSpring = { type: "spring", stiffness: 380, damping: 30, mass: 0.8 };
const liquidEase = [0.22, 1, 0.36, 1];

export function Logo() {
  return (
    <Link
      to="/"
      className="group flex items-center gap-3"
      aria-label="V.A Haircut & Officials home"
    >
      <motion.span
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        transition={liquidSpring}
        className="grid h-9 w-9 place-items-center rounded-full border border-gold/40 bg-gradient-to-br from-gold/20 via-gold/5 to-transparent font-serif text-sm font-semibold text-gold shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] backdrop-blur-md"
      >
        VA
      </motion.span>
      <span className="hidden leading-tight sm:block">
        <span className="block font-serif text-sm tracking-wide text-white transition-colors duration-300 group-hover:text-gold">
          V.A Haircut
        </span>
        <span className="block text-[8px] font-medium uppercase tracking-[0.35em] text-mute">
          & Officials
        </span>
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
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 pb-2 pointer-events-none">
        <motion.div
          layout
          transition={{ duration: 0.65, ease: liquidEase }}
          className={`pointer-events-auto relative mx-auto overflow-hidden rounded-full transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            solid || open
              ? "max-w-5xl bg-ink/70 backdrop-blur-2xl backdrop-saturate-150 border border-white/20 px-5 py-2 shadow-[0_12px_40px_-4px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.28)]"
              : "max-w-6xl bg-white/[0.06] backdrop-blur-xl backdrop-saturate-150 border border-white/15 px-6 py-3 shadow-[0_8px_32px_0_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)]"
          }`}
        >
          {/* Top specular glass rim highlight */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
          />

          <div className="relative flex items-center justify-between">
            <Logo />

            {/* Liquid Glass Segmented Pill Navigation */}
            <nav
              className="hidden items-center gap-1 rounded-full border border-white/10 bg-black/20 p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] backdrop-blur-md lg:flex"
              aria-label="Primary"
            >
              {links.map(([l, to]) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    `relative px-4 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-300 ${
                      isActive ? "text-gold" : "text-white/70 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="liquidGlassActivePill"
                          transition={liquidSpring}
                          className="absolute inset-0 -z-10 rounded-full border border-gold/40 bg-gradient-to-b from-gold/25 via-gold/15 to-gold/5 shadow-[0_0_16px_rgba(212,175,55,0.3),inset_0_1px_1px_rgba(255,255,255,0.35)]"
                        />
                      )}
                      <motion.span
                        className="inline-block"
                        whileHover={{ y: -0.5 }}
                        whileTap={{ scale: 0.94 }}
                        transition={liquidSpring}
                      >
                        {l}
                      </motion.span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Action Buttons with Tactile Spring */}
            <div className="flex items-center gap-2.5">
              <motion.div
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.92 }}
                transition={liquidSpring}
              >
                <Link
                  to="/admin"
                  title="Admin login"
                  aria-label="Admin login"
                  className="grid h-9 w-9 place-items-center rounded-full border border-gold/40 bg-white/[0.04] text-gold shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] transition-colors duration-300 hover:bg-gold hover:text-ink hover:shadow-[0_0_20px_rgba(212,175,55,0.45)]"
                >
                  <UserRound size={16} />
                </Link>
              </motion.div>

              <motion.div
                className="hidden lg:block"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                transition={liquidSpring}
              >
                <Link
                  to="/booking"
                  className="btn btn-gold !rounded-full !py-2 !px-5 !text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(212,175,55,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)] transition-shadow duration-300 hover:shadow-[0_6px_26px_rgba(212,175,55,0.5)]"
                >
                  Book Appointment
                </Link>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.9 }}
                transition={liquidSpring}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/[0.07] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] transition-colors hover:bg-white/15 lg:hidden"
                onClick={() => setOpen((o) => !o)}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={open ? "close" : "menu"}
                    initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 45, scale: 0.7 }}
                    transition={{ duration: 0.2, ease: liquidEase }}
                  >
                    {open ? <X size={18} /> : <Menu size={18} />}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Fluid Mobile Glass Sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(28px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.45, ease: liquidEase }}
            className="fixed inset-0 z-[45] flex flex-col justify-between overflow-y-auto bg-ink/85 backdrop-saturate-150 px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-28 lg:hidden"
          >
            <nav className="flex flex-col gap-1">
              {links.map(([l, to], i) => (
                <motion.div
                  key={to}
                  initial={{ y: 24, opacity: 0, filter: "blur(8px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: 12, opacity: 0, filter: "blur(4px)" }}
                  transition={{
                    delay: 0.04 * i,
                    duration: 0.45,
                    ease: liquidEase,
                  }}
                >
                  <Link
                    to={to}
                    className="block border-b border-white/10 py-4 font-serif text-3xl text-white/90 transition-all duration-300 hover:translate-x-2 hover:text-gold"
                  >
                    {l}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.45, ease: liquidEase }}
            >
              <Link
                to="/booking"
                className="btn btn-gold w-full !rounded-full py-3.5 text-center shadow-[0_8px_28px_rgba(212,175,55,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)]"
              >
                Book Appointment
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
