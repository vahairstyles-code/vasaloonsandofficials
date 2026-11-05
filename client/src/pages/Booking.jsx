import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Check } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { api, errMsg, fmtDate, fmtTime, rupee, todayStr } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import { ErrorBox, SectionTitle, Spinner } from '../components/ui';

const addDays = (d, n) => { const x = new Date(`${d}T00:00:00`); x.setDate(x.getDate() + n); return new Intl.DateTimeFormat('en-CA').format(x); };
const STEPS = ['Services', 'Date & Time', 'Your Details', 'Pay Advance'];

export default function Booking() {
  const { settings: s } = useSettings();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { data: services, loading, error, reload } = useFetch('/services');
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(() => (params.get('service') ? [params.get('service')] : []));
  const [date, setDate] = useState(todayStr());
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [time, setTime] = useState('');
  const [form, setForm] = useState({ customerName: '', phone: '', notes: '' });
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);

  const chosen = useMemo(() => (services || []).filter((x) => selected.includes(x._id)), [services, selected]);
  const total = chosen.reduce((a, x) => a + x.price, 0);
  const advance = Math.min(s?.advanceAmount ?? 10, total);
  const days = useMemo(() => Array.from({ length: 30 }, (_, i) => addDays(todayStr(), i)), []);

  useEffect(() => {
    if (step !== 1) return;
    setSlotsLoading(true); setTime('');
    api.get('/availability', { params: { date } }).then((r) => setSlots(r.data.slots)).catch((e) => toast.error(errMsg(e))).finally(() => setSlotsLoading(false));
  }, [date, step]);

  const grouped = services ? [...new Set(services.map((x) => x.category))] : [];
  const toggle = (id) => setSelected((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const next = () => {
    if (step === 0 && !selected.length) return toast.error('Select at least one service');
    if (step === 1 && !time) return toast.error('Choose a time slot');
    if (step === 2) {
      if (form.customerName.trim().length < 2) return toast.error('Enter your full name');
      if (!/^[6-9]\d{9}$/.test(form.phone)) return toast.error('Enter a valid 10-digit mobile number');
    }
    setStep((x) => x + 1);
  };

  const submit = async () => {
    if (!agree) return toast.error('Please accept the advance payment condition');
    setBusy(true);
    try {
      const { data } = await api.post('/bookings', { ...form, serviceIds: selected, date, time });
      toast.success('Slot reserved. Complete your payment.');
      nav(`/booking/confirmation/${data.bookingId}?phone=${form.phone}`, { state: { booking: data } });
    } catch (e) {
      toast.error(errMsg(e));
      if (e?.response?.status === 409) setStep(1);
    } finally { setBusy(false); }
  };

  if (loading) return <Spinner />;
  if (error) return <div className="container-x py-24"><ErrorBox onRetry={reload}>{error}</ErrorBox></div>;

  return (
    <div className="container-x pb-32 pt-12 sm:py-20 lg:pb-20">
      <SectionTitle eyebrow="Appointment" title="Book your slot" />
      <div className="mb-8">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-widest">
          <span className="text-gold">Step {step + 1} of {STEPS.length}</span><span className="text-mute">{STEPS[step]}</span>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={4} aria-valuenow={step + 1}>
          {STEPS.map((t, i) => <span key={t} className={`h-1 transition-colors ${i <= step ? 'bg-gold' : 'bg-white/10'}`} />)}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
        <div className="min-w-0">
          {step === 0 && grouped.map((cat) => (
            <div key={cat} className="mb-8">
              <h3 className="eyebrow mb-3">{cat}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {services.filter((x) => x.category === cat).map((x) => {
                  const on = selected.includes(x._id);
                  return (
                    <button key={x._id} onClick={() => toggle(x._id)} aria-pressed={on} className={`card flex items-center justify-between p-4 text-left transition ${on ? '!border-gold bg-gold/10' : 'hover:border-white/20'}`}>
                      <span><span className="block font-serif text-lg">{x.name}</span><span className="text-xs text-mute">{x.description}</span></span>
                      <span className="ml-3 shrink-0 text-champagne">{rupee(x.price)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {step === 1 && (
            <div>
              <h3 className="eyebrow mb-3">Choose a date</h3>
              <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
                {days.map((d) => {
                  const dt = new Date(`${d}T00:00:00`);
                  return (
                    <button key={d} onClick={() => setDate(d)} className={`shrink-0 border px-4 py-3 text-center ${d === date ? 'border-gold bg-gold text-ink' : 'border-white/10 hover:border-gold/50'}`}>
                      <span className="block text-[10px] uppercase tracking-widest opacity-70">{dt.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                      <span className="block font-serif text-xl">{dt.getDate()}</span>
                      <span className="block text-[10px] uppercase opacity-70">{dt.toLocaleDateString('en-IN', { month: 'short' })}</span>
                    </button>
                  );
                })}
              </div>
              <h3 className="eyebrow mb-3">Choose a time · {fmtDate(date)}</h3>
              {slotsLoading ? <Spinner /> : !slots.some((x) => x.available) ? (
                <p className="card p-6 text-mute">No slots available on this day. Please pick another date.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {slots.map((x) => (
                    <button key={x.time} disabled={!x.available} onClick={() => setTime(x.time)}
                      className={`border py-3 text-sm transition ${time === x.time ? 'border-gold bg-gold text-ink' : x.available ? 'border-white/10 hover:border-gold/60' : 'cursor-not-allowed border-white/5 text-white/20 line-through'}`}>
                      {fmtTime(x.time)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="max-w-lg space-y-5">
              <div><label className="label" htmlFor="n">Full name</label><input id="n" className="input" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} autoComplete="name" /></div>
              <div><label className="label" htmlFor="p">Mobile number</label><input id="p" className="input" inputMode="numeric" maxLength={10} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })} autoComplete="tel" placeholder="10-digit number" /></div>
              <div><label className="label" htmlFor="no">Notes (optional)</label><textarea id="no" rows={3} maxLength={300} className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
          )}

          {step === 3 && (
            <div className="card max-w-lg p-6">
              <h3 className="font-serif text-2xl">Pay {rupee(advance)} to confirm your appointment.</h3>
              <p className="mt-3 text-sm text-mute">After you reserve, you will see UPI / WhatsApp Pay details for <b className="text-white">{s?.whatsapp}</b> and can upload your payment screenshot. The salon verifies it and then confirms your booking.</p>
              <label className="mt-6 flex cursor-pointer gap-3 text-sm">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 accent-[#C9A45C]" />
                <span>I understand the {rupee(advance)} advance is <b className="text-champagne">non-refundable</b> and the remaining {rupee(total - advance)} is paid at the salon. <Link to="/refund-policy" target="_blank" className="text-gold underline">Policy</Link></span>
              </label>
            </div>
          )}

          <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-gold/30 bg-ink/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:static lg:mt-10 lg:border-0 lg:bg-transparent lg:p-0">
            <div className="mr-auto min-w-0 lg:hidden">
              <p className="text-[10px] uppercase tracking-widest text-mute">{chosen.length ? `${chosen.length} service${chosen.length > 1 ? 's' : ''}` : 'Total'}</p>
              <p className="font-serif text-xl leading-tight text-champagne">{rupee(total)}</p>
            </div>
            {step > 0 && <button className="btn btn-line !px-5 !py-3.5" onClick={() => setStep(step - 1)}>Back</button>}
            {step < 3 ? <button className="btn btn-gold !py-3.5 sm:!px-10" onClick={next}>Continue</button> : <button className="btn btn-gold !py-3.5" disabled={busy} onClick={submit}>{busy ? 'Reserving…' : 'Reserve Slot'}</button>}
          </div>
        </div>

        <aside className="card h-fit p-5 lg:sticky lg:top-28 lg:p-6">
          <h3 className="eyebrow mb-4">Summary</h3>
          {chosen.length === 0 ? <p className="text-sm text-mute">No services selected yet.</p> : (
            <ul className="space-y-2 text-sm">{chosen.map((x) => <li key={x._id} className="flex justify-between"><span>{x.name}</span><span className="text-mute">{rupee(x.price)}</span></li>)}</ul>
          )}
          {time && <p className="mt-4 border-t border-white/10 pt-4 text-sm text-mute">{fmtDate(date)} · {fmtTime(time)}</p>}
          <div className="mt-4 space-y-1 border-t border-white/10 pt-4 text-sm">
            <p className="flex justify-between"><span>Total</span><span>{rupee(total)}</span></p>
            <p className="flex justify-between text-champagne"><span>Advance now</span><span>{rupee(advance)}</span></p>
            <p className="flex justify-between text-mute"><span>Pay at salon</span><span>{rupee(total - advance)}</span></p>
          </div>
        </aside>
      </div>
    </div>
  );
}
