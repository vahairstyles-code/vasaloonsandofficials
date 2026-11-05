import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api, errMsg, fmtDate, fmtTime } from '../../services/api';
import { Spinner } from '../../components/ui';

export default function Availability() {
  const [s, setS] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [b, setB] = useState({ date: '', time: '', reason: '' });
  const loadBlocks = () => api.get('/admin/blocked').then((r) => setBlocks(r.data));
  useEffect(() => { api.get('/admin/settings').then((r) => setS(r.data)); loadBlocks(); }, []);
  if (!s) return <Spinner />;

  const saveHours = async (e) => {
    e.preventDefault();
    try { await api.put('/admin/settings', { openTime: s.openTime, closeTime: s.closeTime, slotInterval: Number(s.slotInterval), capacityPerSlot: Number(s.capacityPerSlot), advanceAmount: Number(s.advanceAmount) }); toast.success('Availability saved'); } catch (er) { toast.error(errMsg(er)); }
  };
  const block = async (e) => {
    e.preventDefault();
    try { await api.post('/admin/blocked', { date: b.date, time: b.time || null, reason: b.reason }); setB({ date: '', time: '', reason: '' }); loadBlocks(); toast.success(b.time ? 'Slot blocked' : 'Date blocked'); } catch (er) { toast.error(errMsg(er)); }
  };
  const unblock = async (x) => { await api.delete(`/admin/blocked/${x._id}`); loadBlocks(); toast.success('Unblocked'); };

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-3xl">Availability</h1>
      <form onSubmit={saveHours} className="card mt-6 grid gap-4 p-5 sm:grid-cols-2">
        {[['openTime', 'Opening time', 'time'], ['closeTime', 'Closing time', 'time'], ['slotInterval', 'Slot interval (minutes)', 'number'], ['capacityPerSlot', 'Bookings per slot', 'number'], ['advanceAmount', 'Booking advance (₹)', 'number']].map(([k, l, t]) => (
          <div key={k}><label className="label">{l}</label><input type={t} min={t === 'number' ? 0 : undefined} className="input" value={s[k] ?? ''} onChange={(e) => setS({ ...s, [k]: e.target.value })} /></div>
        ))}
        <div className="sm:col-span-2"><button className="btn btn-gold">Save</button></div>
      </form>

      <h2 className="mt-12 font-serif text-2xl">Block a date or slot (holidays, breaks)</h2>
      <form onSubmit={block} className="mt-4 grid gap-2 sm:grid-cols-4">
        <input required type="date" className="input" value={b.date} onChange={(e) => setB({ ...b, date: e.target.value })} />
        <input type="time" step="1800" className="input" value={b.time} onChange={(e) => setB({ ...b, time: e.target.value })} title="Leave empty to block the whole day" />
        <input className="input" placeholder="Reason" value={b.reason} onChange={(e) => setB({ ...b, reason: e.target.value })} />
        <button className="btn btn-gold !py-3">Block</button>
      </form>
      <p className="mt-2 text-xs text-mute">Leave the time empty to block the entire day.</p>
      <ul className="mt-5 space-y-2">
        {!blocks.length && <li className="text-sm text-mute">No upcoming blocks.</li>}
        {blocks.map((x) => <li key={x._id} className="card flex items-center justify-between p-3 text-sm"><span>{fmtDate(x.date)} · {x.time ? fmtTime(x.time) : 'Whole day'} {x.reason && <span className="text-mute">— {x.reason}</span>}</span><button className="text-xs text-red-300 underline" onClick={() => unblock(x)}>Unblock</button></li>)}
      </ul>
    </div>
  );
}
