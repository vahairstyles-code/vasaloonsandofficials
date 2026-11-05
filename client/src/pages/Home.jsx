import { Link } from 'react-router-dom';
import { Check, MapPin, Phone, MessageCircle, Navigation } from 'lucide-react';
import Hero from '../sections/Hero';
import { ProductCard, Reveal, SectionTitle, ServiceCard, Spinner } from '../components/ui';
import useFetch from '../hooks/useFetch';
import { useSettings } from '../context/SettingsContext';
import { img, waLink } from '../services/api';

const why = [
  ['Affordable premium grooming', 'Quality grooming with clear, honest pricing.'],
  ['Experienced grooming service', 'Careful, hands-on work on every cut and shave.'],
  ['Personalised styling', 'Your face, your hair, your look — we style to suit you.'],
  ['Convenient appointment booking', 'Pick your slot online for just a ₹10 advance.'],
  ['Clean & comfortable environment', 'Relax in a tidy, welcoming salon.'],
];

export default function Home() {
  const { settings: s } = useSettings();
  const services = useFetch('/services');
  const products = useFetch('/products?limit=8');
  const gallery = useFetch('/gallery');
  const feat = (services.data || []).filter((x) => x.featured).slice(0, 6);
  const shown = feat.length ? feat : (services.data || []).slice(0, 6);
  const minPrice = services.data?.length ? Math.min(...services.data.map((x) => x.price)) : undefined;
  const wa = s?.whatsapp || '7330947785';
  const phone = (s?.phone || '7330947785').replace(/\D/g, '').slice(-10);
  const galleryImgs = (gallery.data || []).filter((g) => g.featured).concat(gallery.data || []).slice(0, 6);

  return (
    <>
      <Hero minPrice={minPrice} />

      <section className="py-28">
        <div className="container-x grid items-center gap-14 md:grid-cols-2">
          <Reveal>
            <p className="eyebrow mb-4">The Experience</p>
            <h2 className="h-display text-4xl md:text-6xl">MORE THAN JUST<br /><span className="metal-text">A HAIRCUT.</span></h2>
            <div className="gold-line mt-6 w-24" />
            <p className="mt-8 leading-relaxed text-mute">{s?.about}</p>
            <Link to="/about" className="btn btn-line mt-8">Our Story</Link>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="grid grid-cols-3 gap-px border border-white/5 bg-white/5 text-center">
              {[['Precision', 'Every line, clean'], ['Style', 'Made for you'], ['Comfort', 'Relaxed visit']].map(([a, b]) => (
                <div key={a} className="bg-card p-8"><p className="font-serif text-2xl text-champagne">{a}</p><p className="mt-2 text-xs uppercase tracking-widest text-mute">{b}</p></div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-coal py-28">
        <div className="container-x">
          <SectionTitle eyebrow="Signature Services" title="Crafted for the modern man" />
          {services.loading ? <Spinner /> : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{shown.map((x, i) => <ServiceCard key={x._id} s={x} i={i} />)}</div>
          )}
          <div className="mt-12 text-center"><Link to="/services" className="btn btn-line">View Full Menu</Link></div>
        </div>
      </section>

      <section className="py-28">
        <div className="container-x">
          <SectionTitle eyebrow="Why V.A" title="The standard we keep" />
          <ul className="grid gap-px border border-white/5 bg-white/5 md:grid-cols-2 lg:grid-cols-5">
            {why.map(([t, d], i) => (
              <Reveal key={t} delay={i * 0.07}>
                <li className="h-full bg-card p-7"><Check className="mb-5 text-gold" size={20} /><h3 className="font-serif text-xl">{t}</h3><p className="mt-3 text-sm text-mute">{d}</p></li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-coal py-28">
        <div className="container-x">
          <SectionTitle eyebrow="Product Showcase" title="Grooming essentials" />
          {products.loading ? <Spinner /> : <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">{(products.data?.items || []).map((p, i) => <ProductCard key={p._id} p={p} i={i} />)}</div>}
          <div className="mt-12 text-center"><Link to="/products" className="btn btn-line">Browse All Products</Link></div>
        </div>
      </section>

      {galleryImgs.length > 0 && (
        <section className="py-28">
          <div className="container-x">
            <SectionTitle eyebrow="Gallery" title="Styles we love" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {galleryImgs.map((g) => <img key={g._id} src={img(g.image)} alt={g.caption || 'Gallery'} loading="lazy" className="aspect-square w-full object-cover" />)}
            </div>
            <div className="mt-12 text-center"><Link to="/gallery" className="btn btn-line">Full Gallery</Link></div>
          </div>
        </section>
      )}

      <section className="relative isolate overflow-hidden py-32 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(201,164,92,0.18),transparent_65%)]" />
        <Reveal>
          <h2 className="h-display mx-auto max-w-3xl text-4xl md:text-7xl">YOUR NEXT LOOK <span className="metal-text">STARTS HERE.</span></h2>
          <p className="mt-6 text-mute">Reserve your slot with a ₹{s?.advanceAmount ?? 10} booking advance.</p>
          <Link to="/booking" className="btn btn-gold mt-10">Book Your Slot</Link>
        </Reveal>
      </section>

      <section className="bg-coal py-28">
        <div className="container-x grid gap-12 md:grid-cols-2">
          <Reveal>
            <p className="eyebrow mb-4">Visit Us</p>
            <h2 className="h-display text-4xl md:text-5xl">{s?.name || 'V.A Haircut & Officials'}</h2>
            <ul className="mt-8 space-y-4 text-mute">
              <li className="flex gap-3"><MapPin className="mt-0.5 shrink-0 text-gold" size={18} />{s?.address}</li>
              <li className="flex gap-3"><Phone className="mt-0.5 shrink-0 text-gold" size={18} />{s?.phone}</li>
              <li>Monday – Sunday: 9 AM – 9 PM</li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="btn btn-gold" href={`tel:+91${phone}`}><Phone size={15} />Call</a>
              <a className="btn btn-line" href={waLink(wa, 'Hello V.A Haircut & Officials')} target="_blank" rel="noreferrer"><MessageCircle size={15} />WhatsApp</a>
              <a className="btn btn-line" href={s?.mapLink} target="_blank" rel="noreferrer"><Navigation size={15} />Directions</a>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <iframe title="Salon location" loading="lazy" className="h-80 w-full border-0 grayscale invert-[0.92] contrast-90 md:h-full"
              src="https://www.google.com/maps?q=Gurazala,Andhra+Pradesh&output=embed" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
