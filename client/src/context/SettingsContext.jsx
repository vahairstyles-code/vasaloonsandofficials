import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

const Ctx = createContext({ settings: null, ready: false });
export const useSettings = () => useContext(Ctx);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    api.get('/settings').then((r) => {
      setSettings(r.data);
      if (r.data.seoTitle) document.title = r.data.seoTitle;
      const meta = document.querySelector('meta[name="description"]');
      if (meta && r.data.seoDescription) meta.setAttribute('content', r.data.seoDescription);
    }).catch(() => {}).finally(() => setReady(true));
  }, []);
  return <Ctx.Provider value={{ settings, ready }}>{children}</Ctx.Provider>;
}
