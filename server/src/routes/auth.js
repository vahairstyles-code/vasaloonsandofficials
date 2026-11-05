import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { Admin } from '../models/index.js';
import { requireAdmin } from '../middleware/auth.js';
import { wrap, audit } from '../utils/helpers.js';

const r = Router();
const prod = process.env.NODE_ENV === 'production';
const cookieOpts = { httpOnly: true, secure: prod, sameSite: prod ? 'none' : 'lax', maxAge: 12 * 3600 * 1000 };
const loginLimiter = rateLimit({ windowMs: 15 * 60_000, max: 10, message: { message: 'Too many attempts. Try again later.' } });

r.post('/login', loginLimiter, wrap(async (req, res) => {
  const { email, password } = z.object({ email: z.string().trim().toLowerCase().email('Enter a valid email'), password: z.string().min(1).max(128) }).parse(req.body);
  const admin = await Admin.findOne({ email }).select('+passwordHash');
  // same error for unknown email and wrong password (no account enumeration)
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) return res.status(401).json({ message: 'Invalid email or password' });
  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '12h' });
  res.cookie('va_admin', token, cookieOpts);
  req.admin = admin; audit(req, 'login', 'admin', admin._id);
  res.json({ email: admin.email, mustChangePassword: admin.mustChangePassword });
}));

r.post('/logout', (_req, res) => { res.clearCookie('va_admin', cookieOpts); res.json({ ok: true }); });

r.get('/me', requireAdmin, (req, res) => res.json({ email: req.admin.email, mustChangePassword: req.admin.mustChangePassword }));

r.post('/change-password', requireAdmin, wrap(async (req, res) => {
  const { current, next } = z.object({ current: z.string(), next: z.string().min(8, 'New password must be at least 8 characters').max(64) }).parse(req.body);
  const admin = await Admin.findById(req.admin._id).select('+passwordHash');
  if (!(await bcrypt.compare(current, admin.passwordHash))) return res.status(401).json({ message: 'Current password is incorrect' });
  if (next === current) return res.status(400).json({ message: 'New value must differ from the current one' });
  admin.passwordHash = await bcrypt.hash(next, 12);
  admin.mustChangePassword = false;
  await admin.save();
  audit(req, 'change-password', 'admin', admin._id);
  res.json({ ok: true });
}));

export default r;
