import { useEffect, useState } from 'react';
import { api, fmtDate, fmtTime, rupee } from '../../services/api';
import { Empty, Spinner } from '../../components/ui';
import { Modal, StatusBadge } from './Bookings';

export default function Customers() {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState(null);
  const [hist, setHist] = useState(null);
  useEffect(() => { const t = setTimeout(() => api.get('/admin/customers', { params: { q } }).then((r) => setRows(r.data)), 250); return () => clearTimeout(t); }, [q]);
  const open = async (c) => setHist({ c, items: (await api.get(`/admin/customers/${c.phone}/bookings`)).data });
  return (
    <div>
      <h1 className="font-serif text-3xl">Customers</h1>
      <input className="input mt-5 max-w-sm" placeholder="Search name or phone" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="mt-5">{!rows ? <Spinner /> : !rows.length ? <Empty>No customers yet.</Empty> : (
        <table className="w-full text-left text-sm"><thead className="text-[11px] uppercase tracking-wider text-mute"><tr><th className="py-3 font-normal">Name</th><th className="font-normal">Phone</th><th className="font-normal">Bookings</th><th /></tr></thead>
          <tbody>{rows.map((c) => <tr key={c._id} className="border-t border-white/5"><td className="py-3">{c.name}</td><td><a className="hover:text-gold" href={`tel:+91${c.phone}`}>{c.phone}</a></td><td>{c.totalBookings}</td><td className="text-right"><button className="text-gold underline" onClick={() => open(c)}>History</button></td></tr>)}</tbody></table>
      )}</div>
      {hist && <Modal title={`${hist.c.name} · history`} onClose={() => setHist(null)}>{hist.items.map((b) => <div key={b._id} className="flex items-center justify-between border-t border-white/5 py-3 text-sm"><div>{fmtDate(b.date)} · {fmtTime(b.time)}<p className="text-xs text-mute">{b.services.map((s) => s.name).join(', ')} · {rupee(b.totalAmount)}</p></div><StatusBadge s={b.status} /></div>)}</Modal>}
    </div>
  );
}
