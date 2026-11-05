import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { img, rupee } from '../services/api';

export const Reveal = ({ children, delay = 0, className = '', y = 28 }) => (
  <motion.div className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}>
    {children}
  </motion.div>
);

export const SectionTitle = ({ eyebrow, title, children, center }) => (
  <Reveal className={`mb-14 ${center ? 'text-center' : ''}`}>
    {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
    <h2 className="h-display text-4xl md:text-6xl">{title}</h2>
    <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} className={`gold-line mt-6 h-px w-24 origin-left ${center ? 'mx-auto' : ''}`} />
    {children && <p className={`mt-6 max-w-2xl leading-relaxed text-mute ${center ? 'mx-auto' : ''}`}>{children}</p>}
  </Reveal>
);

export const Spinner = ({ label = 'Loading…' }) => <div className="py-20 text-center text-xs uppercase tracking-[0.3em] text-mute">{label}</div>;
export const Empty = ({ children }) => <div className="card py-16 text-center text-mute">{children}</div>;
export const ErrorBox = ({ children, onRetry }) => (
  <div className="card py-12 text-center">
    <p className="text-red-300">{children}</p>
    {onRetry && <button className="btn btn-line mt-5" onClick={onRetry}>Retry</button>}
  </div>
);

// Neutral placeholder when no photo has been uploaded yet.
export const Placeholder = ({ label = 'VA' }) => (
  <div className="grid h-full w-full place-items-center bg-gradient-to-br from-coal via-card to-coal">
    <span className="font-serif text-4xl text-gold/40">{label}</span>
  </div>
);

export function ServiceCard({ s, i = 0 }) {
  return (
    <Reveal delay={i * 0.06}>
      <article className="group card relative overflow-hidden transition duration-500 hover:-translate-y-1 hover:border-gold/40">
        <div className="aspect-[4/3] overflow-hidden">
          {s.image ? <img src={img(s.image)} alt={s.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /> : <Placeholder label={s.name.slice(0, 2).toUpperCase()} />}
        </div>
        <div className="p-6">
          <p className="eyebrow mb-2">{s.category}</p>
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-serif text-2xl">{s.name}</h3>
            <span className="font-serif text-xl text-champagne">{rupee(s.price)}</span>
          </div>
          <p className="mt-3 text-sm text-mute">{s.description}</p>
          <Link to={`/booking?service=${s._id}`} className="btn btn-line mt-6 w-full">Book Now</Link>
        </div>
      </article>
    </Reveal>
  );
}

export function ProductCard({ p, i = 0 }) {
  const price = p.offerPrice ?? p.price;
  return (
    <Reveal delay={(i % 4) * 0.05}>
      <Link to={`/products/${p._id}`} className="group card block overflow-hidden transition duration-500 hover:border-gold/40">
        <div className="relative aspect-square overflow-hidden">
          {p.image ? <img src={img(p.image)} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /> : <Placeholder />}
          {p.featured && <span className="absolute left-3 top-3 bg-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-ink">Featured</span>}
          {!p.available && <span className="absolute right-3 top-3 bg-black/80 px-3 py-1 text-[10px] uppercase tracking-widest text-mute">Out of stock</span>}
        </div>
        <div className="p-5">
          <p className="eyebrow mb-2">{p.category}</p>
          <h3 className="font-serif text-lg leading-snug">{p.name}</h3>
          <p className="mt-3 text-sm">
            {price != null ? (<><span className="text-champagne">{rupee(price)}</span>{p.mrp && p.offerPrice != null && <span className="ml-2 text-mute line-through">{rupee(p.mrp)}</span>}</>) : <span className="text-mute">Ask in salon for price</span>}
          </p>
        </div>
      </Link>
    </Reveal>
  );
}
