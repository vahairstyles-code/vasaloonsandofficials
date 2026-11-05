import useFetch from '../hooks/useFetch';

export default function PromoBar() {
  const { data } = useFetch('/banners');
  const b = data?.[0];
  if (!b?.text) return null;
  const inner = <span className="text-[11px] uppercase tracking-[0.22em]">{b.text}</span>;
  return (
    <div className="bg-gold py-2 text-center text-ink">
      {b.link ? <a href={b.link} target="_blank" rel="noreferrer">{inner}</a> : inner}
    </div>
  );
}
