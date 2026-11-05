import { useCallback, useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarCheck, CalendarOff, FileText, Image, LayoutDashboard, LogOut, Package, Scissors, Settings, Users, BarChart3, ScrollText, KeyRound, Menu, X } from 'lucide-react';
import { api, errMsg } from '../services/api';
import Login from './Login';
import ChangePassword from './ChangePassword';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Crud from './pages/Crud';
import Content from './pages/Content';
import Availability from './pages/Availability';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import Audit from './pages/Audit';

const nav = [
  ['', 'Dashboard', LayoutDashboard], ['bookings', 'Bookings', CalendarCheck], ['services', 'Services', Scissors], ['products', 'Products', Package],
  ['gallery', 'Gallery', Image], ['content', 'Website Content', FileText], ['availability', 'Availability', CalendarOff], ['customers', 'Customers', Users],
  ['reports', 'Reports', BarChart3], ['audit', 'Audit Log', ScrollText], ['account', 'Account', KeyRound],
];

export default function AdminApp() {
  const [admin, setAdmin] = useState(undefined); // undefined = checking, null = logged out
  const [menu, setMenu] = useState(false);
  const navigate = useNavigate();

  const check = useCallback(() => api.get('/auth/me').then((r) => setAdmin(r.data)).catch(() => setAdmin(null)), []);
  useEffect(() => { check(); }, [check]);
  useEffect(() => { document.title = 'Admin | V.A Haircut & Officials'; }, []);

  const logout = async () => { await api.post('/auth/logout').catch(() => {}); setAdmin(null); navigate('/admin'); toast.success('Logged out'); };

  if (admin === undefined) return <div className="grid min-h-screen place-items-center text-xs tracking-[0.3em] text-mute">LOADING…</div>;
  if (!admin) return <Login onDone={setAdmin} />;
  if (admin.mustChangePassword) return <ChangePassword forced onDone={check} />;

  return (
    <div className="min-h-screen bg-ink md:flex">
      <header className="flex items-center justify-between border-b border-white/5 bg-coal p-4 md:hidden">
        <span className="font-serif text-lg text-gold">VA Admin</span>
        <button onClick={() => setMenu(!menu)} aria-label="Menu">{menu ? <X /> : <Menu />}</button>
      </header>
      <aside className={`${menu ? 'block' : 'hidden'} w-full shrink-0 border-r border-white/5 bg-coal md:sticky md:top-0 md:block md:h-screen md:w-60 md:overflow-y-auto`}>
        <div className="hidden p-6 md:block"><p className="font-serif text-xl text-gold">VA Admin</p><p className="mt-1 truncate text-[11px] text-mute">{admin.email}</p></div>
        <nav className="px-3 pb-4">
          {nav.map(([to, label, Icon]) => (
            <NavLink key={to} to={`/admin/${to}`} end={to === ''} onClick={() => setMenu(false)} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 text-sm ${isActive ? 'bg-gold/10 text-gold' : 'text-mute hover:text-white'}`}><Icon size={16} />{label}</NavLink>
          ))}
          <a href="/" className="mt-2 flex items-center gap-3 px-3 py-2.5 text-sm text-mute hover:text-white"><Settings size={16} />View website</a>
          <button onClick={logout} className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-red-300 hover:text-red-200"><LogOut size={16} />Log out</button>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="services" element={<Crud kind="services" />} />
          <Route path="products" element={<Crud kind="products" />} />
          <Route path="gallery" element={<Crud kind="gallery" />} />
          <Route path="content" element={<Content />} />
          <Route path="availability" element={<Availability />} />
          <Route path="customers" element={<Customers />} />
          <Route path="reports" element={<Reports />} />
          <Route path="audit" element={<Audit />} />
          <Route path="account" element={<ChangePassword onDone={check} />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}
