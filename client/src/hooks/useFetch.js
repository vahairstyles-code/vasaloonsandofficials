import { useCallback, useEffect, useState } from 'react';
import { api, errMsg } from '../services/api';

export default function useFetch(url, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(() => {
    setLoading(true); setError('');
    return api.get(url).then((r) => setData(r.data)).catch((e) => setError(errMsg(e))).finally(() => setLoading(false));
  }, [url]); // eslint-disable-line
  useEffect(() => { load(); }, [load, ...deps]); // eslint-disable-line
  return { data, loading, error, reload: load, setData };
}

export const useIsMobile = () => {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const h = (e) => setM(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return m;
};

export const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
