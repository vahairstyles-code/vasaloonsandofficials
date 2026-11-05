import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import { ErrorBox, Spinner } from '../../components/ui';
import { rupee } from '../../services/api';

export default function Reports() {
  const [days, setDays] = useState(30);
  const { data, loading, error, reload } = useFetch(`/admin/reports?days=${days}`);
  const maxB = Math.max(1, ...(data?.daily || []).map((d) => d.bookings));
  const maxP = Math.max(1, ...(data?.popularity || []).map((d) => d.count));
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="font-serif text-3xl">Reports</h1>
        <select className="input w-auto" value={days} onChange={(e) => setDays(+e.target.value)}><option value={7}>Last 7 days (weekly)</option><option value={30}>Last 30 days (monthly)</option><option value={90}>Last 90 days</option><option value={365}>Last 365 days</option></select></div>
      {loading ? <Spinner /> : error ? <ErrorBox onRetry={reload}>{error}</ErrorBox> : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="card p-5 lg:col-span-2"><h2 className="eyebrow mb-4">Daily bookings & completed revenue</h2>
            {!data.daily.length ? <p className="text-sm text-mute">No data for this period.</p> : <div className="flex h-44 items-end gap-1 overflow-x-auto">{data.daily.map((d) => <div key={d._id} className="group relative flex min-w-[14px] flex-1 flex-col justify-end" title={`${d._id}: ${d.bookings} bookings, ${rupee(d.revenue)}`}><div className="bg-gold/80 transition group-hover:bg-champagne" style={{ height: `${(d.bookings / maxB) * 100}%` }} /></div>)}</div>}
            <p className="mt-3 text-xs text-mute">Total bookings: {data.daily.reduce((a, d) => a + d.bookings, 0)} · Completed revenue: {rupee(data.daily.reduce((a, d) => a + d.revenue, 0))}</p></section>
          <section className="card p-5"><h2 className="eyebrow mb-4">Service popularity</h2>
            {!data.popularity.length ? <p className="text-sm text-mute">No data.</p> : data.popularity.map((p) => <div key={p._id} className="mb-3 text-sm"><div className="flex justify-between"><span>{p._id}</span><span className="text-mute">{p.count} · {rupee(p.revenue)}</span></div><div className="mt-1 h-1.5 bg-white/5"><div className="h-1.5 bg-gold" style={{ width: `${(p.count / maxP) * 100}%` }} /></div></div>)}</section>
          <section className="card p-5"><h2 className="eyebrow mb-4">Payment verification</h2>
            {!data.payments.length ? <p className="text-sm text-mute">No data.</p> : data.payments.map((p) => <p key={p._id} className="flex justify-between border-t border-white/5 py-2 text-sm"><span>{p._id.replace('_', ' ')}</span><span>{p.count}</span></p>)}</section>
        </div>
      )}
    </div>
  );
}
