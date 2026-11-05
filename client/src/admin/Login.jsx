import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { api, errMsg } from '../services/api';

export default function Login({ onDone }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const r = await api.post('/auth/login', { email, password }); onDone(r.data); toast.success('Welcome back'); }
    catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-ink p-5">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-5 p-8">
        <div className="text-center"><p className="font-serif text-5xl metal-text">VA</p><p className="mt-2 text-[10px] uppercase tracking-[0.35em] text-mute">Admin Login</p></div>
        <div><label className="label" htmlFor="em">Email</label><input id="em" type="email" required autoComplete="username" className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div>
          <label className="label" htmlFor="pw">Password</label>
          <div className="relative">
            <input id="pw" type={show ? 'text' : 'password'} required autoComplete="current-password" className="input pr-11" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-mute" aria-label="Toggle password visibility">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
        </div>
        <button className="btn btn-gold w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <Link to="/" className="block text-center text-xs text-mute hover:text-gold">← Back to website</Link>
      </form>
    </div>
  );
}
