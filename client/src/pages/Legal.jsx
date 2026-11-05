import { useSettings } from '../context/SettingsContext';

const DOCS = {
  privacy: ['Privacy Policy', (s) => [
    ['What we collect', 'When you book, we collect your name, mobile number, selected services, appointment time, optional notes and the payment screenshot you upload.'],
    ['How we use it', 'Only to manage your appointment, verify your advance payment and contact you about your booking. We do not sell your data.'],
    ['Storage & security', 'Data is stored in a secured database. Payment screenshots are visible only to salon staff.'],
    ['Your choices', `To correct or delete your booking data, contact us on ${s?.phone || '7330947785'}.`],
  ]],
  terms: ['Terms & Conditions', (s) => [
    ['Appointments', `Bookings are subject to availability within ${s?.openTime || '09:00'}–${s?.closeTime || '21:00'}, every day. A slot is confirmed only after the salon verifies your advance payment.`],
    ['Pricing', 'Prices shown are current service prices. The total is calculated by our system at booking time. The balance is payable at the salon.'],
    ['Punctuality', 'Please arrive on time. Late arrivals may need to be rescheduled depending on availability.'],
    ['Changes', 'The salon may update services, prices and these terms at any time.'],
  ]],
  refund: ['Cancellation & Refund Policy', (s) => [
    ['Booking advance', `A ₹${s?.advanceAmount ?? 10} advance reserves your slot. This advance is non-refundable.`],
    ['Cancellation / reschedule', `Contact us on WhatsApp ${s?.whatsapp || '7330947785'} as early as possible. Rescheduling is at the salon's discretion and subject to availability.`],
    ['No-shows', 'If you do not arrive for your appointment, the advance is forfeited.'],
    ['If the salon cancels', 'If we cancel or reject a booking, we will offer a new slot or arrange a return of your advance.'],
    ['Unpaid reservations', 'Slots without any payment proof are released automatically after 30 minutes.'],
  ]],
};

export default function Legal({ kind }) {
  const { settings: s } = useSettings();
  const [title, fn] = DOCS[kind];
  return (
    <div className="container-x max-w-3xl py-24">
      <h1 className="h-display text-4xl md:text-5xl">{title}</h1>
      <div className="gold-line mt-6 w-24" />
      <div className="mt-10 space-y-8">{fn(s).map(([h, t]) => <section key={h}><h2 className="font-serif text-xl text-champagne">{h}</h2><p className="mt-2 leading-relaxed text-mute">{t}</p></section>)}</div>
      <p className="mt-12 text-xs text-mute">General policy text provided as a starting point; have it reviewed before relying on it legally.</p>
    </div>
  );
}
