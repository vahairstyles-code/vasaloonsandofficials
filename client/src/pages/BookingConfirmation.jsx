import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MessageCircle, Smartphone, Upload } from 'lucide-react';
import { api, errMsg, fmtDate, fmtTime, rupee, waLink } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import { ErrorBox, Spinner } from '../components/ui';

const LABEL = { PAYMENT_PENDING: 'Payment Pending', CONFIRMED: 'Confirmed', COMPLETED: 'Completed', CANCELLED: 'Cancelled', REJECTED: 'Rejected', NO_SHOW: 'No Show' };
const PAY = { PENDING: 'Pending', SCREENSHOT_SUBMITTED: 'Screenshot submitted — awaiting verification', VERIFIED: 'Verified', REJECTED: 'Rejected — please re-upload', REFUNDED: 'Refunded' };

export default function BookingConfirmation() {
  const { bookingId } = useParams();
  const [q] = useSearchParams();
  const { state } = useLocation();
  const { settings: s } = useSettings();
  const phone = q.get('phone') || '';
  const [b, setB] = useState(state?.booking || null);
  const [err, setErr] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    api.get(`/bookings/${bookingId}`, { params: { phone } }).then((r) => setB(r.data)).catch((e) => !b && setErr(errMsg(e)));
  }, [bookingId, phone]); // eslint-disable-line

  if (err) return <div className="container-x py-24"><ErrorBox>{err}</ErrorBox></div>;
  if (!b) return <Spinner />;

  const upload = async () => {
    if (!file) return toast.error('Choose your payment screenshot first');
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5 MB');
    const fd = new FormData(); fd.append('screenshot', file); fd.append('phone', phone || b.phone);
    setBusy(true);
    try { const r = await api.post(`/bookings/${bookingId}/screenshot`, fd); setB(r.data); setFile(null); toast.success('Screenshot submitted. We will verify it soon.'); }
    catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  const svc = b.services.map((x) => x.name).join(', ');
  const msg = `Hello V.A Haircut & Officials,\n\nI would like to confirm my appointment.\n\nBooking ID: ${b.bookingId}\nName: ${b.customerName}\nPhone: ${b.phone}\nServices: ${svc}\nDate: ${fmtDate(b.date)}\nTime: ${fmtTime(b.time)}\nTotal: ₹${b.totalAmount}\nAdvance: ₹${b.advanceAmount}\nRemaining: ₹${b.remainingAmount}\n\nI have submitted my payment screenshot.\n\nPlease verify and confirm my appointment.\n\nThank you.`;
  const upiUrl = `upi://pay?pa=${encodeURIComponent(s?.upiId || '')}&pn=${encodeURIComponent('V.A Haircut & Officials')}&am=${b.advanceAmount}&cu=INR&tn=${encodeURIComponent(b.bookingId)}`;
  const awaiting = b.status === 'PAYMENT_PENDING';

  return (
    <div className="container-x max-w-3xl py-20">
      <p className="eyebrow mb-3">Booking {b.bookingId}</p>
      <h1 className="h-display text-4xl md:text-5xl">{b.status === 'CONFIRMED' ? 'Your appointment is confirmed.' : awaiting ? 'Slot reserved — pay to confirm.' : `Booking ${LABEL[b.status]}`}</h1>

      <div className="card mt-10 divide-y divide-white/5 text-sm">
        {[['Name', b.customerName], ['Phone', b.phone], ['Services', svc], ['Date', fmtDate(b.date)], ['Time', fmtTime(b.time)], ['Total', rupee(b.totalAmount)], ['Advance', rupee(b.advanceAmount)], ['Pay at salon', rupee(b.remainingAmount)], ['Booking status', LABEL[b.status]], ['Payment', PAY[b.paymentStatus]]].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-6 px-5 py-3"><span className="text-mute">{k}</span><span className="text-right">{v}</span></div>
        ))}
      </div>

      {awaiting && (
        <div className="card mt-8 p-6">
          <h2 className="font-serif text-2xl">Pay {rupee(b.advanceAmount)} advance</h2>
          <p className="mt-2 text-sm text-mute">UPI / WhatsApp Pay to <b className="text-white">{s?.whatsapp}</b>{s?.upiId ? <> · UPI ID <b className="text-white">{s.upiId}</b></> : null}. The advance is non-refundable. Unpaid reservations are released after 30 minutes.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={upiUrl} className="btn btn-gold w-full sm:w-auto"><Smartphone size={15} />Pay via UPI</a>
          </div>
          <div className="mt-8 border-t border-white/10 pt-6">
            <h3 className="eyebrow mb-3">Upload payment screenshot</h3>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm text-mute file:mr-4 file:border-0 file:bg-gold file:px-4 file:py-2 file:text-xs file:font-semibold file:uppercase file:text-ink" />
            <button className="btn btn-line mt-4 w-full sm:w-auto" disabled={busy || !file} onClick={upload}><Upload size={15} />{busy ? 'Uploading…' : 'Submit screenshot'}</button>
            <p className="mt-3 text-xs text-mute">Submitting a screenshot does not confirm your booking. The salon confirms it after verifying your payment.</p>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a className="btn btn-line" target="_blank" rel="noreferrer" href={waLink(s?.whatsapp || '7330947785', msg)}><MessageCircle size={15} />Message salon on WhatsApp</a>
        <Link to="/" className="btn btn-line">Back to home</Link>
      </div>
      <p className="mt-4 text-xs text-mute">The WhatsApp message opens pre-filled — you send it yourself. Save your Booking ID: {b.bookingId}.</p>
    </div>
  );
}
