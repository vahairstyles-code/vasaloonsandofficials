import { useState } from 'react';
import useFetch from '../hooks/useFetch';
import { Empty, ErrorBox, SectionTitle, Spinner } from '../components/ui';
import { img } from '../services/api';

export default function Gallery() {
  const { data, loading, error, reload } = useFetch('/gallery');
  const [cat, setCat] = useState('All');
  const [open, setOpen] = useState(null);
  const cats = ['All', ...new Set((data || []).map((g) => g.category))];
  const list = (data || []).filter((g) => cat === 'All' || g.category === cat);
  return (
    <div className="container-x py-24">
      <SectionTitle eyebrow="Gallery" title="Our work & space" />
      {loading ? <Spinner /> : error ? <ErrorBox onRetry={reload}>{error}</ErrorBox> : !data.length ? <Empty>Photos will appear here soon.</Empty> : (
        <>
          <div className="mb-8 flex flex-wrap gap-2">{cats.map((c) => <button key={c} onClick={() => setCat(c)} className={`border px-4 py-2 text-[11px] uppercase tracking-widest ${cat === c ? 'border-gold bg-gold text-ink' : 'border-white/10 text-mute hover:border-gold/50'}`}>{c}</button>)}</div>
          <div className="columns-2 gap-3 md:columns-3">
            {list.map((g) => <button key={g._id} className="mb-3 block w-full" onClick={() => setOpen(g)}><img src={img(g.image)} alt={g.caption || g.category} loading="lazy" className="w-full transition hover:opacity-80" /></button>)}
          </div>
        </>
      )}
      {open && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/90 p-4" onClick={() => setOpen(null)} role="dialog" aria-modal="true">
          <figure className="max-h-full max-w-4xl"><img src={img(open.image)} alt={open.caption || ''} className="max-h-[80vh] w-auto" />{open.caption && <figcaption className="mt-3 text-center text-sm text-mute">{open.caption}</figcaption>}</figure>
        </div>
      )}
    </div>
  );
}
