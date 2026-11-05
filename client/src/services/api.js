import axios from 'axios';

export const API = import.meta.env.VITE_API_URL || '';
export const api = axios.create({ baseURL: `${API}/api`, withCredentials: true });

export const errMsg = (e) => e?.response?.data?.message || e?.message || 'Something went wrong';

// Uploaded images may be relative (/uploads/..) when stored locally
export const img = (u) => (!u ? '' : u.startsWith('http') ? u : `${API}${u}`);

export const rupee = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export const fmtTime = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};
export const fmtDate = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
export const todayStr = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());

export const waLink = (number, text) => {
  const n = String(number).replace(/\D/g, '');
  return `https://wa.me/${n.length === 10 ? '91' + n : n}?text=${encodeURIComponent(text)}`;
};
