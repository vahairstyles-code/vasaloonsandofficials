import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api, errMsg } from '../../services/api';
import { Spinner } from '../../components/ui';
import Crud from './Crud';

const FIELDS = [
  ['Hero', [['heroHeading', 'Hero heading (new line = line break)', 'textarea'], ['heroSubtitle', 'Hero subtitle', 'textarea']]],
  ['About & footer', [['about', 'About section', 'textarea'], ['footer', 'Footer text', 'text']]],
  ['Contact', [['name', 'Business name', 'text'], ['phone', 'Phone number', 'text'], ['whatsapp', 'WhatsApp number (digits only)', 'text'], ['address', 'Address', 'text'], ['mapLink', 'Google Maps / directions link', 'text']]],
  ['SEO', [['seoTitle', 'SEO title', 'text'], ['seoDescription', 'SEO description', 'textarea']]],
  ['Payment & booking', [['upiId', 'UPI ID', 'text'], ['advanceAmount', 'Booking advance (₹)', 'number']]],
];

export default function Content() {
  const [s, setS] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { api.get('/admin/settings').then((r) => setS(r.data)).catch((e) => toast.error(errMsg(e))); }, []);
  if (!s) return <Spinner />;
  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const keys = FIELDS.flatMap(([, f]) => f.map((x) => x[0]));
      const body = Object.fromEntries(keys.map((k) => [k, s[k]]));
      await api.put('/admin/settings', body); toast.success('Website content saved');
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  return (
    <div>
      <h1 className="font-serif text-3xl">Website content & settings</h1>
      <form onSubmit={save} className="mt-6 max-w-2xl space-y-8">
        {FIELDS.map(([title, fields]) => (
          <fieldset key={title} className="card space-y-4 p-5"><legend className="eyebrow px-2">{title}</legend>
            {fields.map(([k, label, type]) => (
              <div key={k}><label className="label">{label}</label>
                {type === 'textarea' ? <textarea rows={3} className="input" value={s[k] ?? ''} onChange={(e) => setS({ ...s, [k]: e.target.value })} /> : <input type={type} className="input" value={s[k] ?? ''} onChange={(e) => setS({ ...s, [k]: type === 'number' ? Number(e.target.value) : e.target.value })} />}
              </div>
            ))}
          </fieldset>
        ))}
        <button className="btn btn-gold" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
      </form>
      <div className="mt-14"><BannerCrud /></div>
    </div>
  );
}

function BannerCrud() {
  const [items, setItems] = useState([]);
  const [f, setF] = useState({ text: '', link: '' });
  const load = () => api.get('/admin/banners').then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);
  const add = async (e) => { e.preventDefault(); try { await api.post('/admin/banners', { ...f, active: true }); setF({ text: '', link: '' }); load(); toast.success('Banner added'); } catch (er) { toast.error(errMsg(er)); } };
  const toggle = async (b) => { await api.put(`/admin/banners/${b._id}`, { active: !b.active }); load(); };
  const del = async (b) => { if (window.confirm('Delete this banner?')) { await api.delete(`/admin/banners/${b._id}`); load(); } };
  return (
    <div className="max-w-2xl">
      <h2 className="font-serif text-2xl">Promotional banners</h2>
      <form onSubmit={add} className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]"><input required className="input" placeholder="Banner text" value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} /><input className="input" placeholder="Link (optional)" value={f.link} onChange={(e) => setF({ ...f, link: e.target.value })} /><button className="btn btn-gold !py-3">Add</button></form>
      <ul className="mt-4 space-y-2">{items.map((b) => <li key={b._id} className="card flex items-center justify-between gap-3 p-3 text-sm"><span className={b.active ? '' : 'text-mute line-through'}>{b.text}</span><span className="flex gap-4 text-xs"><button className="text-gold underline" onClick={() => toggle(b)}>{b.active ? 'Disable' : 'Enable'}</button><button className="text-red-300 underline" onClick={() => del(b)}>Delete</button></span></li>)}</ul>
    </div>
  );
}
