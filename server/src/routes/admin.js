import { Router } from 'express';
import { z } from 'zod';
import { AuditLog, BlockedSlot, Booking, BusinessSettings, Customer, Gallery, Product, PromoBanner, Service } from '../models/index.js';
import { requireAdmin, saveImage, upload } from '../middleware/auth.js';
import { audit, todayIST, wrap } from '../utils/helpers.js';
import { ACTIVE, createBooking, getSettings, rescheduleBooking } from '../services/booking.js';

const r = Router();
r.use(requireAdmin);

const num = (v) => (v === '' || v === undefined || v === null ? undefined : Number(v));
const bool = (v) => v === true || v === 'true' || v === 'on' || v === '1';
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ---------- generic CRUD with optional image upload ----------
function crud(path, Model, fields, imageField = 'image', sort = { createdAt: -1 }) {
  const pick = async (req) => {
    const out = {};
    for (const [k, type] of Object.entries(fields)) {
      if (req.body[k] === undefined) continue;
      if (type === 'number') { const n = num(req.body[k]); out[k] = n; }
      else if (type === 'bool') out[k] = bool(req.body[k]);
      else out[k] = String(req.body[k]);
    }
    if (req.file) out[imageField] = await saveImage(req.file, `va/${path}`);
    return out;
  };
  r.get(`/${path}`, wrap(async (_req, res) => res.json(await Model.find().sort(sort).lean())));
  r.post(`/${path}`, upload.single('image'), wrap(async (req, res) => {
    const doc = await Model.create(await pick(req));
    audit(req, 'create', path, doc._id, { name: doc.name || doc.caption });
    res.status(201).json(doc);
  }));
  r.put(`/${path}/:id`, upload.single('image'), wrap(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, { $set: await pick(req) }, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    audit(req, 'update', path, doc._id);
    res.json(doc);
  }));
  r.delete(`/${path}/:id`, wrap(async (req, res) => {
    await Model.findByIdAndDelete(req.params.id);
    audit(req, 'delete', path, req.params.id);
    res.json({ ok: true });
  }));
}
crud('services', Service, { name: 'string', description: 'string', price: 'number', category: 'string', active: 'bool', featured: 'bool', order: 'number' }, 'image', { order: 1 });
crud('products', Product, { name: 'string', description: 'string', category: 'string', price: 'number', mrp: 'number', offerPrice: 'number', available: 'bool', featured: 'bool' });
crud('gallery', Gallery, { caption: 'string', category: 'string', featured: 'bool' });
crud('banners', PromoBanner, { text: 'string', link: 'string', active: 'bool' });

// ---------- bookings ----------
r.get('/bookings', wrap(async (req, res) => {
  const { q, date, status, paymentStatus } = req.query;
  const page = Math.max(1, +req.query.page || 1), limit = Math.min(100, +req.query.limit || 20);
  const f = {};
  if (date) f.date = String(date);
  if (status) f.status = String(status);
  if (paymentStatus) f.paymentStatus = String(paymentStatus);
  if (q) { const re = new RegExp(esc(q), 'i'); f.$or = [{ bookingId: re }, { customerName: re }, { phone: re }]; }
  const [items, total] = await Promise.all([
    Booking.find(f).sort({ date: -1, time: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Booking.countDocuments(f),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
}));

r.get('/bookings-export.csv', wrap(async (_req, res) => {
  const rows = await Booking.find().sort({ date: -1, time: -1 }).lean();
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""').replace(/^([=+\-@])/, "'$1")}"`;
  const head = ['Booking ID', 'Name', 'Phone', 'Services', 'Date', 'Time', 'Total', 'Advance', 'Remaining', 'Payment', 'Status', 'Notes'];
  const lines = rows.map((b) => [b.bookingId, b.customerName, b.phone, b.services.map((s) => s.name).join(' + '), b.date, b.time, b.totalAmount, b.advanceAmount, b.remainingAmount, b.paymentStatus, b.status, b.adminNotes].map(cell).join(','));
  res.set({ 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="bookings.csv"' });
  res.send([head.map(cell).join(','), ...lines].join('\n'));
}));

const adminBookingSchema = z.object({
  customerName: z.string().trim().min(2).max(80),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  serviceIds: z.array(z.string()).min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().max(300).optional(),
});
r.post('/bookings', wrap(async (req, res) => {
  const b = await createBooking({ ...adminBookingSchema.parse(req.body), adminCreated: true });
  audit(req, 'manual-booking', 'booking', b.bookingId);
  res.status(201).json(b);
}));

const FREE_SLOT = ['CANCELLED', 'REJECTED', 'NO_SHOW'];
r.post('/bookings/:id/action', wrap(async (req, res) => {
  const { action, adminNotes, date, time } = z.object({
    action: z.enum(['verify-payment', 'reject-payment', 'confirm', 'cancel', 'reject', 'complete', 'no-show', 'reschedule', 'notes']),
    adminNotes: z.string().max(500).optional(), date: z.string().optional(), time: z.string().optional(),
  }).parse(req.body);
  let b = await Booking.findById(req.params.id);
  if (!b) return res.status(404).json({ message: 'Booking not found' });

  if (action === 'verify-payment') { b.paymentStatus = 'VERIFIED'; if (b.status === 'PAYMENT_PENDING') b.status = 'CONFIRMED'; }
  else if (action === 'reject-payment') { b.paymentStatus = 'REJECTED'; }
  else if (action === 'confirm') {
    if (b.paymentStatus !== 'VERIFIED') return res.status(400).json({ message: 'Verify the payment before confirming' });
    b.status = 'CONFIRMED';
  }
  else if (action === 'cancel') b.status = 'CANCELLED';
  else if (action === 'reject') b.status = 'REJECTED';
  else if (action === 'complete') b.status = 'COMPLETED';
  else if (action === 'no-show') b.status = 'NO_SHOW';
  else if (action === 'reschedule') {
    if (!date || !time) return res.status(400).json({ message: 'Date and time required' });
    if (!ACTIVE.includes(b.status)) return res.status(400).json({ message: 'Only active bookings can be rescheduled' });
    b = await rescheduleBooking(b, date, time);
  }
  if (adminNotes !== undefined) b.adminNotes = adminNotes;
  if (FREE_SLOT.includes(b.status)) b.slotKey = null; // release the slot
  await b.save();
  audit(req, action, 'booking', b.bookingId, { status: b.status, paymentStatus: b.paymentStatus });
  res.json(b);
}));

// ---------- dashboard ----------
r.get('/dashboard', wrap(async (_req, res) => {
  const today = todayIST();
  const count = (f) => Booking.countDocuments(f);
  const [total, todays, pendingVerify, confirmed, completed, cancelled, revenueAgg, pendingAgg, recent, upcoming] = await Promise.all([
    count({}), count({ date: today }), count({ paymentStatus: 'SCREENSHOT_SUBMITTED' }), count({ status: 'CONFIRMED' }),
    count({ status: 'COMPLETED' }), count({ status: 'CANCELLED' }),
    Booking.aggregate([{ $match: { paymentStatus: 'VERIFIED' } }, { $group: { _id: null, advance: { $sum: '$advanceAmount' }, completedTotal: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, '$totalAmount', 0] } } } }]),
    Booking.aggregate([{ $match: { status: 'PAYMENT_PENDING' } }, { $group: { _id: null, amt: { $sum: '$advanceAmount' } } }]),
    Booking.find().sort({ createdAt: -1 }).limit(6).lean(),
    Booking.find({ date: { $gte: today }, status: 'CONFIRMED' }).sort({ date: 1, time: 1 }).limit(6).lean(),
  ]);
  res.json({
    total, today: todays, pendingVerification: pendingVerify, confirmed, completed, cancelled,
    advanceCollected: revenueAgg[0]?.advance || 0, completedRevenue: revenueAgg[0]?.completedTotal || 0,
    pendingPayments: pendingAgg[0]?.amt || 0, recent, upcoming,
  });
}));

// ---------- reports ----------
r.get('/reports', wrap(async (req, res) => {
  const days = Math.min(365, +req.query.days || 30);
  const since = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);
  const match = { date: { $gte: since } };
  const [daily, popularity, payments] = await Promise.all([
    Booking.aggregate([{ $match: match }, { $group: { _id: '$date', bookings: { $sum: 1 }, revenue: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, '$totalAmount', 0] } } } }, { $sort: { _id: 1 } }]),
    Booking.aggregate([{ $match: { ...match, status: { $in: ACTIVE } } }, { $unwind: '$services' }, { $group: { _id: '$services.name', count: { $sum: 1 }, revenue: { $sum: '$services.price' } } }, { $sort: { count: -1 } }, { $limit: 12 }]),
    Booking.aggregate([{ $match: match }, { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }]),
  ]);
  res.json({ days, daily, popularity, payments });
}));

// ---------- availability / blocks ----------
r.get('/blocked', wrap(async (_req, res) => res.json(await BlockedSlot.find({ date: { $gte: todayIST() } }).sort({ date: 1, time: 1 }).lean())));
r.post('/blocked', wrap(async (req, res) => {
  const d = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), time: z.string().regex(/^\d{2}:\d{2}$/).nullish(), reason: z.string().max(120).optional() }).parse(req.body);
  const b = await BlockedSlot.create({ ...d, time: d.time || null });
  audit(req, 'block', 'slot', b._id, d);
  res.status(201).json(b);
}));
r.delete('/blocked/:id', wrap(async (req, res) => { await BlockedSlot.findByIdAndDelete(req.params.id); audit(req, 'unblock', 'slot', req.params.id); res.json({ ok: true }); }));

// ---------- settings ----------
const settingsSchema = z.object({
  name: z.string().max(80), phone: z.string().max(20), whatsapp: z.string().regex(/^\d{10,13}$/, 'WhatsApp number digits only'),
  upiId: z.string().max(80), address: z.string().max(200), mapLink: z.string().max(500),
  openTime: z.string().regex(/^\d{2}:\d{2}$/), closeTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotInterval: z.coerce.number().int().min(10).max(180), capacityPerSlot: z.coerce.number().int().min(1).max(10),
  advanceAmount: z.coerce.number().min(0).max(5000),
  heroHeading: z.string().max(200), heroSubtitle: z.string().max(300), about: z.string().max(2000),
  footer: z.string().max(300), seoTitle: z.string().max(120), seoDescription: z.string().max(300),
}).partial();
r.get('/settings', wrap(async (_req, res) => res.json(await getSettings())));
r.put('/settings', wrap(async (req, res) => {
  const data = settingsSchema.parse(req.body);
  const s = await BusinessSettings.findOneAndUpdate({ key: 'main' }, { $set: data }, { new: true, upsert: true });
  audit(req, 'update-settings', 'settings', s._id, Object.keys(data));
  res.json(s);
}));

// ---------- customers & audit ----------
r.get('/customers', wrap(async (req, res) => {
  const f = req.query.q ? { $or: [{ name: new RegExp(esc(req.query.q), 'i') }, { phone: new RegExp(esc(req.query.q), 'i') }] } : {};
  res.json(await Customer.find(f).sort({ totalBookings: -1 }).limit(200).lean());
}));
r.get('/customers/:phone/bookings', wrap(async (req, res) => res.json(await Booking.find({ phone: req.params.phone }).sort({ date: -1 }).lean())));
r.get('/audit', wrap(async (_req, res) => res.json(await AuditLog.find().sort({ createdAt: -1 }).limit(100).lean())));

export default r;
