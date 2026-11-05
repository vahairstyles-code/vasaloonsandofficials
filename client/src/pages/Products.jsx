import { useState } from 'react';
import useFetch from '../hooks/useFetch';
import { Empty, ErrorBox, ProductCard, SectionTitle, Spinner } from '../components/ui';

export default function Products() {
  const [cat, setCat] = useState('All');
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useFetch(`/products?limit=24&page=${page}&category=${encodeURIComponent(cat)}`);
  const cats = ['All', ...(data?.categories || [])];
  const pick = (c) => { setCat(c); setPage(1); };
  return (
    <div className="container-x py-24">
      <SectionTitle eyebrow="Shop" title="Grooming products">Products available at the salon. Prices are shown only where provided — ask in salon for the rest.</SectionTitle>
      <div className="mb-10 flex flex-wrap gap-2">
        {cats.map((c) => <button key={c} onClick={() => pick(c)} className={`border px-4 py-2 text-[11px] uppercase tracking-widest transition ${cat === c ? 'border-gold bg-gold text-ink' : 'border-white/10 text-mute hover:border-gold/50'}`}>{c}</button>)}
      </div>
      {loading ? <Spinner /> : error ? <ErrorBox onRetry={reload}>{error}</ErrorBox> : !data.items.length ? <Empty>No products in this category yet.</Empty> : (
        <>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">{data.items.map((p, i) => <ProductCard key={p._id} p={p} i={i} />)}</div>
          {data.pages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-4 text-sm">
              <button className="btn btn-line !py-2" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
              <span className="text-mute">{page} / {data.pages}</span>
              <button className="btn btn-line !py-2" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
