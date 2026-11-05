import { Router } from 'express';
import { z } from 'zod';
import { Booking, Gallery, Product, PromoBanner, Service } from '../models/index.js';
import { saveImage, upload } from '../middleware/auth.js';
import { wrap, todayIST } from '../utils/helpers.js';
import { createBooking, getAvailability, getSettings } from '../services/booking.js';

const r = Router();
const cache = (sec) => (_req, res, next) => { res.set('Cache-Control', `public, max-age=${sec}`); next(); };

r.get('/settings', wrap(async (_req, res) => {
  const s = await getSettings();
  const { _id, __v, createdAt, updatedAt, ...pub } = s.toObject();
  res.json(pub);
}));

r.get('/services', cache(30), wrap(async (_req, res) => res.json(await Service.find({ active: true }).sort({ order: 1, createdAt: 1 }).lean())));

r.get('/products', cache(30), wrap(async (req, res) => {
  const page = Math.max(1, +req.query.page || 1), limit = Math.min(60, +req.query.limit || 30);
  const q = {};
  if (typeof req.query.category === 'string' && req.query.category !== 'All') q.category = req.query.category;
  const [items, total, categories] = await Promise.all([
    Product.find(q).sort({ featured: -1, createdAt: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    Product.countDocuments(q),
    Product.distinct('category'),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit), categories });
}));
r.get('/products/:id', wrap(async (req, res) => {
  const p = await Product.findById(req.params.id).lean().catch(() => null);
  if (!p) return res.status(404).json({ message: 'Product not found' });
  res.json(p);
}));

r.get('/gallery', cache(30), wrap(async (_req, res) => res.json(await Gallery.find().sort({ createdAt: -1 }).lean())));
r.get('/banners', cache(30), wrap(async (_req, res) => res.json(await PromoBanner.find({ active: true }).lean())));

r.get('/availability', wrap(async (req, res) => {
  const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).parse(req.query.date);
  res.json({ date, slots: await getAvailability(date) });
}));

const bookingSchema = z.object({
  customerName: z.string().trim().min(2).max(80),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  serviceIds: z.array(z.string().regex(/^[a-f\d]{24}$/i)).min(1, 'Select at least one service').max(12),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().max(300).optional(),
});

r.post('/bookings', rateLimitBooking(), wrap(async (req, res) => {
  const data = bookingSchema.parse(req.body);
  if (data.date < todayIST()) return res.status(400).json({ message: 'Date is in the past' });
  const b = await createBooking(data);
  res.status(201).json(publicBooking(b));
}));

// Screenshot only marks payment as "submitted"; it NEVER confirms the booking.
r.post('/bookings/:bookingId/screenshot', upload.single('screenshot'), wrap(async (req, res) => {
  const phone = String(req.body.phone || '');
  const b = await Booking.findOne({ bookingId: req.params.bookingId, phone });
  if (!b) return res.status(404).json({ message: 'Booking not found' });
  if (b.status !== 'PAYMENT_PENDING') return res.status(400).json({ message: 'Booking is not awaiting payment' });
  if (!req.file) return res.status(400).json({ message: 'Screenshot is required' });
  b.paymentScreenshot = await saveImage(req.file, 'va/payments');
  b.paymentStatus = 'SCREENSHOT_SUBMITTED';
  await b.save();
  res.json(publicBooking(b));
}));

r.get('/bookings/:bookingId', wrap(async (req, res) => {
  const b = await Booking.findOne({ bookingId: req.params.bookingId, phone: String(req.query.phone || '') });
  if (!b) return res.status(404).json({ message: 'Booking not found' });
  res.json(publicBooking(b));
}));

function publicBooking(b) {
  const o = b.toObject();
  delete o.adminNotes; delete o.slotKey; delete o.__v;
  return o;
}

function rateLimitBooking() {
  const hits = new Map();
  return (req, res, next) => {
    const k = req.ip, now = Date.now();
    const list = (hits.get(k) || []).filter((t) => now - t < 10 * 60_000);
    if (list.length >= 8) return res.status(429).json({ message: 'Too many booking attempts. Try later.' });
    list.push(now); hits.set(k, list); next();
  };
}

export default r;
