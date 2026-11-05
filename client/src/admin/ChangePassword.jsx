import { useState } from 'react';
import toast from 'react-hot-toast';
import { api, errMsg } from '../services/api';

export default function ChangePassword({ forced, onDone }) {
  const [f, setF] = useState({ current: '', next: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (f.next !== f.confirm) return toast.error('New passwords do not match');
    setBusy(true);
    try { await api.post('/auth/change-password', { current: f.current, next: f.next }); toast.success('Password updated'); setF({ current: '', next: '', confirm: '' }); onDone?.(); }
    catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  const form = (
    <form onSubmit={submit} className="card w-full max-w-sm space-y-5 p-8">
      <div><h1 className="font-serif text-2xl">{forced ? 'Set a new password' : 'Change password'}</h1>{forced && <p className="mt-2 text-sm text-mute">For security, you must replace the initial password before continuing.</p>}</div>
      {[['current', 'Current password'], ['next', 'New password (min 8 characters)'], ['confirm', 'Confirm new password']].map(([k, l]) => (
        <div key={k}><label className="label">{l}</label><input type="password" required minLength={k === 'current' ? 1 : 8} autoComplete={k === 'current' ? 'current-password' : 'new-password'} className="input" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>
      ))}
      <button className="btn btn-gold w-full" disabled={busy}>{busy ? 'Saving…' : 'Update password'}</button>
    </form>
  );
  return forced ? <div className="grid min-h-screen place-items-center bg-ink p-5">{form}</div> : form;
}
