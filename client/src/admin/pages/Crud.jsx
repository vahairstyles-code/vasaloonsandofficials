import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api, errMsg, img, rupee } from '../../services/api';
import { Empty, Spinner } from '../../components/ui';
import { Modal } from './Bookings';

const CONFIG = {
  services: { title: 'Services', fields: [['name', 'Name', 'text', true], ['category', 'Category', 'text', true], ['price', 'Price (₹)', 'number', true], ['description', 'Description', 'textarea'], ['order', 'Display order', 'number'], ['active', 'Active (visible & bookable)', 'bool'], ['featured', 'Feature on homepage', 'bool']], image: true, defaults: { active: true }, summary: (x) => `${x.category} · ${rupee(x.price)}${x.active ? '' : ' · hidden'}${x.featured ? ' · featured' : ''}` },
  products: { title: 'Products', fields: [['name', 'Name', 'text', true], ['category', 'Category', 'text', true], ['description', 'Description', 'textarea'], ['price', 'Price (₹, optional)', 'number'], ['mrp', 'MRP (₹, optional)', 'number'], ['offerPrice', 'Offer price (₹, optional)', 'number'], ['available', 'Available', 'bool'], ['featured', 'Featured', 'bool']], image: true, defaults: { available: true }, summary: (x) => `${x.category}${x.offerPrice != null ? ' · ' + rupee(x.offerPrice) : x.price != null ? ' · ' + rupee(x.price) : ' · no price'}${x.available ? '' : ' · out of stock'}` },
  gallery: { title: 'Gallery', fields: [['caption', 'Caption', 'text'], ['category', 'Category (Haircuts, Beard, Salon, Products, Before/After)', 'text'], ['featured', 'Show on homepage', 'bool']], image: true, imageRequired: true, defaults: { category: 'Haircuts' }, summary: (x) => `${x.category}${x.featured ? ' · featured' : ''}` },
};

export default function Crud({ kind }) {
  const cfg = CONFIG[kind];
  const [items, setItems] = useState(null);
  const [edit, setEdit] = useState(null); // null | {} (new) | item

  const load = () => api.get(`/admin/${kind}`).then((r) => setItems(r.data)).catch((e) => toast.error(errMsg(e)));
  useEffect(() => { setItems(null); load(); }, [kind]); // eslint-disable-line

  const remove = async (x) => {
    if (!window.confirm(`Delete "${x.name || x.caption || 'this item'}"? This cannot be undone.`)) return;
    try { await api.delete(`/admin/${kind}/${x._id}`); toast.success('Deleted'); load(); } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div>
      <div className="flex items-center justify-between"><h1 className="font-serif text-3xl">{cfg.title}</h1><button className="btn btn-gold !py-2.5" onClick={() => setEdit({})}>+ Add</button></div>
      <div className="mt-6">
        {!items ? <Spinner /> : !items.length ? <Empty>Nothing here yet.</Empty> : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((x) => (
              <div key={x._id} className="card flex gap-4 p-4">
                {x.image ? <img src={img(x.image)} alt="" className="h-20 w-20 shrink-0 object-cover" /> : <div className="grid h-20 w-20 shrink-0 place-items-center bg-coal text-xs text-mute">No image</div>}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif text-lg">{x.name || x.caption || '(no caption)'}</p>
                  <p className="text-xs text-mute">{cfg.summary(x)}</p>
                  <div className="mt-3 flex gap-4 text-xs"><button className="text-gold underline" onClick={() => setEdit(x)}>Edit</button><button className="text-red-300 underline" onClick={() => remove(x)}>Delete</button></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {edit && <Form cfg={cfg} kind={kind} item={edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }} />}
    </div>
  );
}

function Form({ cfg, kind, item, onClose, onSaved }) {
  const isNew = !item._id;
  const [v, setV] = useState(() => ({ ...cfg.defaults, ...item }));
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (isNew && cfg.imageRequired && !file) return toast.error('Please choose an image');
    const fd = new FormData();
    cfg.fields.forEach(([k, , t]) => { if (v[k] !== undefined && v[k] !== null) fd.append(k, t === 'bool' ? String(!!v[k]) : v[k]); });
    if (file) fd.append('image', file);
    setBusy(true);
    try { isNew ? await api.post(`/admin/${kind}`, fd) : await api.put(`/admin/${kind}/${item._id}`, fd); toast.success('Saved'); onSaved(); }
    catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <Modal title={`${isNew ? 'Add' : 'Edit'} ${cfg.title.replace(/s$/, '')}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        {cfg.fields.map(([k, label, type, req]) => type === 'bool' ? (
          <label key={k} className="flex items-center gap-3 text-sm"><input type="checkbox" className="accent-[#C9A45C]" checked={!!v[k]} onChange={(e) => setV({ ...v, [k]: e.target.checked })} />{label}</label>
        ) : (
          <div key={k}><label className="label">{label}</label>
            {type === 'textarea' ? <textarea rows={3} className="input" value={v[k] ?? ''} onChange={(e) => setV({ ...v, [k]: e.target.value })} />
              : <input required={req} type={type} min={type === 'number' ? 0 : undefined} step="any" className="input" value={v[k] ?? ''} onChange={(e) => setV({ ...v, [k]: e.target.value })} />}
          </div>
        ))}
        <div><label className="label">Image (JPG, PNG, WebP · max 5 MB)</label>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm text-mute file:mr-4 file:border-0 file:bg-gold file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:text-ink" />
          {!file && item.image && <img src={img(item.image)} alt="" className="mt-3 h-24 object-cover" />}
        </div>
        <button className="btn btn-gold w-full" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
      </form>
    </Modal>
  );
}
