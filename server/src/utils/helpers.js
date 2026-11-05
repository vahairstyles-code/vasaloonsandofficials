import { AuditLog } from '../models/index.js';

const IST = 'Asia/Kolkata';
export const todayIST = () => new Intl.DateTimeFormat('en-CA', { timeZone: IST }).format(new Date());
export const nowMinutesIST = () => {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: IST, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
  const [h, m] = p.split(':').map(Number);
  return h * 60 + m;
};
export const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
export const toHHmm = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

export const buildSlots = (open, close, interval) => {
  const out = [];
  for (let m = toMin(open); m + interval <= toMin(close); m += interval) out.push(toHHmm(m));
  return out; // last slot 20:30 for 09:00-21:00 @30min, so nothing at/after 9 PM
};

export const audit = (req, action, entity, entityId, meta) =>
  AuditLog.create({ action, entity, entityId: String(entityId || ''), meta, admin: req.admin?.email || 'admin' }).catch(() => {});

export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const newBookingId = () =>
  'VA' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
