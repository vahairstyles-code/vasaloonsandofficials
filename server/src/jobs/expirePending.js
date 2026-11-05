import { Booking } from '../models/index.js';

// Releases slots held by bookings that never submitted any payment proof within 30 minutes.
export function startExpiryJob() {
  const run = async () => {
    const cutoff = new Date(Date.now() - 30 * 60_000);
    await Booking.updateMany(
      { status: 'PAYMENT_PENDING', paymentStatus: 'PENDING', createdAt: { $lt: cutoff } },
      { $set: { status: 'CANCELLED', slotKey: null, adminNotes: 'Auto-cancelled: advance not paid within 30 minutes' } },
    ).catch((e) => console.error('expiry job', e.message));
  };
  setInterval(run, 5 * 60_000).unref();
}
