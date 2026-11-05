import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api, API, errMsg, fmtDate, fmtTime, img, rupee } from '../../services/api';
import { Empty, Spinner } from '../../components/ui';

const COLORS = { PAYMENT_PENDING: 'text-amber-300 border-amber-300/40', CONFIRMED: 'text-emerald-300 border-emerald-300/40', COMPLETED: 'text-sky-300 border-sky-300/40', CANCELLED: 'text-red-300 border-red-300/40', REJECTED: 'text-red-300 border-red-300/40', NO_SHOW: 'text-orange-300 border-orange-300/40' };
export const StatusBadge = ({ s }) => <span className={`border px-2 py-0.5 text-[10px] uppercase tracking-wider ${COLORS[s] || 'text-mute border-white/20'}`}>{s.replace('_', ' ')}</span>;

const STATUSES = ['PAYMENT_PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED', 'NO_SHOW'];
const PAYS = ['PENDING', 'SCREENSHOT_SUBMITTED', 'VERIFIED', 'REJECTED', 'REFUNDED'];

export default function Bookings() {
  const [f, setF] = useState({ q: '', date: '', status: '', paymentStatus: '' });
  const [page, setPage] = useState(1);
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);
  const [manual, setManual] = useState(false);

  const load = () => { setLoading(true); api.get('/admin/bookings', { params: { ...f, page } }).then((r) => setRes(r.data)).catch((e) => toast.error(errMsg(e))).finally(() => setLoading(false)); };
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [f, page]); // eslint-disable-line

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl">Bookings</h1>
        <div className="flex gap-2">
          <button className="btn btn-gold whitespace-nowrap !px-4 !py-2.5" onClick={() => setManual(true)}>+ Manual booking</button>
          <a className="btn btn-line whitespace-nowrap !px-4 !py-2.5" href={`${API}/api/admin/bookings-export.csv`}>Export CSV</a>
        </div>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <input className="input" placeholder="Search ID, name, phone" value={f.q} onChange={(e) => { setPage(1); setF({ ...f, q: e.target.value }); }} />
        <input type="date" className="input" value={f.date} onChange={(e) => { setPage(1); setF({ ...f, date: e.target.value }); }} />
        <select className="input" value={f.status} onChange={(e) => { setPage(1); setF({ ...f, status: e.target.value }); }}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        <select className="input" value={f.paymentStatus} onChange={(e) => { setPage(1); setF({ ...f, paymentStatus: e.target.value }); }}><option value="">All payments</option>{PAYS.map((s) => <option key={s}>{s}</option>)}</select>
      </div>
      <div className="mt-5">
        {loading && !res ? <Spinner /> : !res?.items.length ? <Empty>No bookings found.</Empty> : (
          <table className="hidden w-full text-left text-sm lg:table">
            <thead className="text-[11px] uppercase tracking-wider text-mute"><tr>{['ID', 'Customer', 'Date / time', 'Total', 'Payment', 'Status', ''].map((h) => <th key={h} className="border-b border-white/10 px-3 py-3 font-normal">{h}</th>)}</tr></thead>
            <tbody>
              {res.items.map((b) => (
                <tr key={b._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-3 py-3 font-mono text-xs">{b.bookingId}</td>
                  <td className="px-3 py-3">{b.customerName}<span className="block text-xs text-mute">{b.phone}</span></td>
                  <td className="px-3 py-3">{fmtDate(b.date)}<span className="block text-xs text-mute">{fmtTime(b.time)}</span></td>
                  <td className="px-3 py-3">{rupee(b.totalAmount)}</td>
                  <td className="px-3 py-3 text-xs">{b.paymentStatus.replace('_', ' ')}</td>
                  <td className="px-3 py-3"><StatusBadge s={b.status} /></td>
                  <td className="px-3 py-3 text-right"><button className="text-gold underline" onClick={() => setSel(b)}>Manage</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {res?.items.length > 0 && (
          <ul className="space-y-3 lg:hidden">
            {res.items.map((b) => (
              <li key={b._id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><p className="truncate font-serif text-lg">{b.customerName}</p><p className="font-mono text-[11px] text-mute">{b.bookingId}</p></div>
                  <StatusBadge s={b.status} />
                </div>
                <p className="mt-3 text-sm">{fmtDate(b.date)} · {fmtTime(b.time)}</p>
                <p className="mt-1 text-xs text-mute">{b.services.map((x) => x.name).join(', ')}</p>
                <div className="mt-3 flex items-center justify-between text-sm"><span className="text-champagne">{rupee(b.totalAmount)} <span className="text-xs text-mute">· {b.paymentStatus.replace('_', ' ')}</span></span>
                  <button className="btn btn-line !min-h-0 !px-4 !py-2" onClick={() => setSel(b)}>Manage</button></div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {res?.pages > 1 && <div className="mt-6 flex items-center justify-center gap-4 text-sm"><button className="btn btn-line !py-2" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button><span className="text-mute">{page} / {res.pages}</span><button className="btn btn-line !py-2" disabled={page >= res.pages} onClick={() => setPage(page + 1)}>Next</button></div>}
      {sel && <Manage b={sel} onClose={() => setSel(null)} onChange={(nb) => { setSel(nb); load(); }} />}
      {manual && <Manual onClose={() => setManual(false)} onDone={() => { setManual(false); load(); }} />}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-black/80 p-4" onClick={onClose}>
      <div className="card my-8 w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between"><h2 className="font-serif text-2xl">{title}</h2><button onClick={onClose} className="text-mute">✕</button></div>
        {children}
      </div>
    </div>
  );
}
export { Modal };

function Manage({ b, onClose, onChange }) {
  const [notes, setNotes] = useState(b.adminNotes || '');
  const [rs, setRs] = useState({ date: b.date, time: b.time });
  const [busy, setBusy] = useState(false);
  const act = async (action, extra = {}, confirmMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setBusy(true);
    try { const r = await api.post(`/admin/bookings/${b._id}/action`, { action, ...extra }); toast.success('Updated'); onChange(r.data); }
    catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  const Btn = ({ a, label, cls = 'btn-line', msg, extra }) => <button disabled={busy} className={`btn ${cls} !px-4 !py-2.5`} onClick={() => act(a, extra, msg)}>{label}</button>;
  return (
    <Modal title={`Booking ${b.bookingId}`} onClose={onClose}>
      <dl className="space-y-1 text-sm">
        {[['Customer', `${b.customerName} · ${b.phone}`], ['Services', b.services.map((s) => `${s.name} (${rupee(s.price)})`).join(', ')], ['When', `${fmtDate(b.date)} · ${fmtTime(b.time)}`], ['Total / advance / due', `${rupee(b.totalAmount)} / ${rupee(b.advanceAmount)} / ${rupee(b.remainingAmount)}`], ['Customer notes', b.notes || '—'], ['Payment', b.paymentStatus], ['Status', b.status]].map(([k, v]) => <div key={k} className="flex justify-between gap-4"><dt className="text-mute">{k}</dt><dd className="text-right">{v}</dd></div>)}
      </dl>
      {b.paymentScreenshot && <a href={img(b.paymentScreenshot)} target="_blank" rel="noreferrer"><img src={img(b.paymentScreenshot)} alt="Payment screenshot" className="mt-4 max-h-64 w-full border border-white/10 object-contain" /></a>}
      <div className="mt-5 flex flex-wrap gap-2">
        <Btn a="verify-payment" label="Verify payment" cls="btn-gold" />
        <Btn a="reject-payment" label="Reject payment" msg="Reject this payment proof?" />
        <Btn a="confirm" label="Confirm" />
        <Btn a="complete" label="Completed" />
        <Btn a="no-show" label="No-show" msg="Mark as no-show? The slot will be released." />
        <Btn a="cancel" label="Cancel" msg="Cancel this booking? The slot will be released." />
        <Btn a="reject" label="Reject" msg="Reject this booking?" />
      </div>
      <div className="mt-5 border-t border-white/10 pt-4">
        <p className="label">Reschedule</p>
        <div className="flex gap-2"><input type="date" className="input" value={rs.date} onChange={(e) => setRs({ ...rs, date: e.target.value })} /><input type="time" step="1800" className="input" value={rs.time} onChange={(e) => setRs({ ...rs, time: e.target.value })} /><button disabled={busy} className="btn btn-line !px-4" onClick={() => act('reschedule', rs, 'Move this booking to the new slot?')}>Move</button></div>
      </div>
      <div className="mt-5 border-t border-white/10 pt-4">
        <label className="label">Admin notes</label>
        <textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        <button disabled={busy} className="btn btn-line mt-2 !py-2" onClick={() => act('notes', { adminNotes: notes })}>Save notes</button>
      </div>
    </Modal>
  );
}

function Manual({ onClose, onDone }) {
  const [services, setServices] = useState([]);
  const [f, setF] = useState({ customerName: '', phone: '', date: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date()), time: '', notes: '' });
  const [sel, setSel] = useState([]);
  const [slots, setSlots] = useState([]);
  useEffect(() => { api.get('/services').then((r) => setServices(r.data)); }, []);
  useEffect(() => { api.get('/availability', { params: { date: f.date } }).then((r) => setSlots(r.data.slots)); }, [f.date]);
  const submit = async (e) => {
    e.preventDefault();
    try { await api.post('/admin/bookings', { ...f, serviceIds: sel }); toast.success('Booking created and confirmed'); onDone(); } catch (err) { toast.error(errMsg(err)); }
  };
  return (
    <Modal title="Manual booking" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <input required className="input" placeholder="Customer name" value={f.customerName} onChange={(e) => setF({ ...f, customerName: e.target.value })} />
        <input required className="input" placeholder="10-digit mobile" maxLength={10} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, '') })} />
        <div className="max-h-40 space-y-1 overflow-y-auto border border-white/10 p-3 text-sm">{services.map((s) => <label key={s._id} className="flex gap-2"><input type="checkbox" className="accent-[#C9A45C]" checked={sel.includes(s._id)} onChange={() => setSel(sel.includes(s._id) ? sel.filter((x) => x !== s._id) : [...sel, s._id])} />{s.name} — {rupee(s.price)}</label>)}</div>
        <input type="date" required className="input" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value, time: '' })} />
        <select required className="input" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })}><option value="">Select time</option>{slots.filter((s) => s.available).map((s) => <option key={s.time} value={s.time}>{fmtTime(s.time)}</option>)}</select>
        <button className="btn btn-gold w-full" disabled={!sel.length}>Create booking</button>
      </form>
    </Modal>
  );
}
