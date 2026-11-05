import { Booking, BlockedSlot, BusinessSettings, Customer, Service } from '../models/index.js';
import { buildSlots, newBookingId, nowMinutesIST, toMin, todayIST } from '../utils/helpers.js';

export const ACTIVE = ['PAYMENT_PENDING', 'CONFIRMED', 'COMPLETED'];
export const getSettings = () => BusinessSettings.findOneAndUpdate({ key: 'main' }, { $setOnInsert: { key: 'main' } }, { upsert: true, new: true });

const httpErr = (status, message) => Object.assign(new Error(message), { status });

export async function getAvailability(date) {
  const s = await getSettings();
  const all = buildSlots(s.openTime, s.closeTime, s.slotInterval);
  const [blocked, booked] = await Promise.all([
    BlockedSlot.find({ date }).lean(),
    Booking.aggregate([{ $match: { date, status: { $in: ACTIVE } } }, { $group: { _id: '$time', n: { $sum: 1 } } }]),
  ]);
  const dayBlocked = blocked.some((b) => !b.time);
  const count = Object.fromEntries(booked.map((b) => [b._id, b.n]));
  const today = todayIST();
  return all.map((time) => {
    let available = !dayBlocked && !blocked.some((b) => b.time === time) && (count[time] || 0) < s.capacityPerSlot;
    if (date < today) available = false;
    if (date === today && toMin(time) <= nowMinutesIST()) available = false;
    return { time, available };
  });
}

// Core creation: validates on the server, computes prices from DB, and relies on the
// unique partial index on slotKey so simultaneous requests cannot take the same slot.
export async function createBooking({ customerName, phone, serviceIds, date, time, notes, adminCreated = false }) {
  const s = await getSettings();
  const slots = await getAvailability(date);
  const slot = slots.find((x) => x.time === time);
  if (!slot) throw httpErr(400, 'Selected time is outside salon hours');
  if (!slot.available && !adminCreated) throw httpErr(409, 'That slot is not available. Please choose another.');
  if (!slot.available && adminCreated && (date < todayIST())) throw httpErr(400, 'Cannot book in the past');

  const services = await Service.find({ _id: { $in: serviceIds }, active: true }).lean();
  if (!services.length || services.length !== new Set(serviceIds.map(String)).size) throw httpErr(400, 'One or more services are unavailable');
  const total = services.reduce((a, x) => a + x.price, 0);
  const advance = Math.min(s.advanceAmount, total);

  for (let n = 1; n <= s.capacityPerSlot; n++) {
    try {
      const booking = await Booking.create({
        bookingId: newBookingId(), customerName, phone, date, time, notes,
        services: services.map((x) => ({ serviceId: x._id, name: x.name, price: x.price })),
        totalAmount: total, advanceAmount: advance, remainingAmount: total - advance,
        slotKey: `${date}_${time}_${n}`,
        ...(adminCreated ? { status: 'CONFIRMED', paymentStatus: 'VERIFIED' } : {}),
      });
      await Customer.findOneAndUpdate({ phone }, { $set: { name: customerName }, $inc: { totalBookings: 1 } }, { upsert: true });
      return booking;
    } catch (e) {
      if (e.code === 11000 && /slotKey/.test(e.message)) continue; // try next capacity lane
      throw e;
    }
  }
  throw httpErr(409, 'That slot was just taken. Please choose another.');
}

export async function rescheduleBooking(booking, date, time) {
  const s = await getSettings();
  const slot = (await getAvailability(date)).find((x) => x.time === time);
  if (!slot || !slot.available) throw httpErr(409, 'New slot is not available');
  for (let n = 1; n <= s.capacityPerSlot; n++) {
    const updated = await Booking.updateOne({ _id: booking._id }, { date, time, slotKey: `${date}_${time}_${n}` }).catch((e) => (e.code === 11000 ? null : Promise.reject(e)));
    if (updated) return Booking.findById(booking._id);
  }
  throw httpErr(409, 'New slot was just taken');
}
