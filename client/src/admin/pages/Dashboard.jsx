import useFetch from '../../hooks/useFetch';
import { ErrorBox, Spinner } from '../../components/ui';
import { fmtDate, fmtTime, rupee } from '../../services/api';
import { StatusBadge } from './Bookings';

export default function Dashboard() {
  const { data: d, loading, error, reload } = useFetch('/admin/dashboard');
  if (loading) return <Spinner />;
  if (error) return <ErrorBox onRetry={reload}>{error}</ErrorBox>;
  const stats = [['Total bookings', d.total], ["Today's bookings", d.today], ['Awaiting payment verification', d.pendingVerification], ['Confirmed', d.confirmed], ['Completed', d.completed], ['Cancelled', d.cancelled], ['Advance collected', rupee(d.advanceCollected)], ['Completed revenue', rupee(d.completedRevenue)], ['Pending advance', rupee(d.pendingPayments)]];
  const max = Math.max(1, d.confirmed, d.completed, d.cancelled, d.pendingVerification);
  return (
    <div>
      <h1 className="font-serif text-3xl">Dashboard</h1>
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map(([k, v]) => <div key={k} className="card p-5"><p className="text-[11px] uppercase tracking-wider text-mute">{k}</p><p className="mt-2 font-serif text-3xl text-champagne">{v}</p></div>)}
      </div>
      <div className="card mt-6 p-5">
        <h2 className="eyebrow mb-4">Booking status</h2>
        {[['Awaiting verification', d.pendingVerification], ['Confirmed', d.confirmed], ['Completed', d.completed], ['Cancelled', d.cancelled]].map(([k, v]) => (
          <div key={k} className="mb-3 flex items-center gap-3 text-sm"><span className="w-40 text-mute">{k}</span><div className="h-2 flex-1 bg-white/5"><div className="h-2 bg-gold" style={{ width: `${(v / max) * 100}%` }} /></div><span className="w-8 text-right">{v}</span></div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {[['Recent bookings', d.recent], ['Upcoming appointments', d.upcoming]].map(([t, rows]) => (
          <div key={t} className="card p-5">
            <h2 className="eyebrow mb-4">{t}</h2>
            {!rows.length ? <p className="text-sm text-mute">Nothing yet.</p> : rows.map((b) => (
              <div key={b._id} className="flex items-center justify-between border-t border-white/5 py-3 text-sm">
                <div><p>{b.customerName} <span className="text-mute">· {b.bookingId}</span></p><p className="text-xs text-mute">{fmtDate(b.date)} · {fmtTime(b.time)}</p></div>
                <StatusBadge s={b.status} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
