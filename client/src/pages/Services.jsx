import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { Empty, ErrorBox, Reveal, SectionTitle, Spinner } from '../components/ui';
import { rupee } from '../services/api';

export default function Services() {
  const { data, loading, error, reload } = useFetch('/services');
  const groups = useMemo(() => {
    const m = new Map();
    (data || []).forEach((s) => m.set(s.category, [...(m.get(s.category) || []), s]));
    return [...m.entries()];
  }, [data]);

  return (
    <div className="container-x py-24">
      <SectionTitle eyebrow="Menu" title="Services & pricing">Select as many services as you like when you book — the total is calculated automatically.</SectionTitle>
      {loading ? <Spinner /> : error ? <ErrorBox onRetry={reload}>{error}</ErrorBox> : !groups.length ? <Empty>No services available right now.</Empty> : (
        <div className="space-y-16">
          {groups.map(([cat, items]) => (
            <section key={cat}>
              <h3 className="eyebrow mb-6">{cat}</h3>
              <div className="border-t border-white/10">
                {items.map((s, i) => (
                  <Reveal key={s._id} delay={i * 0.04}>
                    <div className="flex flex-col gap-4 border-b border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between">
                      <Link to={`/services/${s._id}`} className="group">
                        <h4 className="font-serif text-2xl transition group-hover:text-gold">{s.name}</h4>
                        <p className="mt-1 text-sm text-mute">{s.description}</p>
                      </Link>
                      <div className="flex items-center gap-6">
                        <span className="font-serif text-2xl text-champagne">{rupee(s.price)}</span>
                        <Link to={`/booking?service=${s._id}`} className="btn btn-line !px-5 !py-2.5">Book</Link>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
