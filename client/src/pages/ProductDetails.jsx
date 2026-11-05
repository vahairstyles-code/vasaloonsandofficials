import { Link, useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { ErrorBox, Placeholder, Spinner } from '../components/ui';
import { img, rupee, waLink } from '../services/api';
import { useSettings } from '../context/SettingsContext';

export default function ProductDetails() {
  const { id } = useParams();
  const { data: p, loading, error } = useFetch(`/products/${id}`);
  const { settings: s } = useSettings();
  if (loading) return <Spinner />;
  if (error) return <div className="container-x py-24"><ErrorBox>{error}</ErrorBox><div className="mt-6 text-center"><Link to="/products" className="btn btn-line">All products</Link></div></div>;
  const price = p.offerPrice ?? p.price;
  return (
    <div className="container-x grid gap-14 py-24 md:grid-cols-2">
      <div className="aspect-square overflow-hidden">{p.image ? <img src={img(p.image)} alt={p.name} className="h-full w-full object-cover" /> : <Placeholder />}</div>
      <div className="self-center">
        <p className="eyebrow mb-3">{p.category}{p.featured ? ' · Featured' : ''}</p>
        <h1 className="h-display text-4xl md:text-5xl">{p.name}</h1>
        <p className="mt-6 text-mute">{p.description}</p>
        <p className="mt-8 font-serif text-3xl text-champagne">
          {price != null ? <>{rupee(price)}{p.mrp && p.offerPrice != null && <span className="ml-3 text-lg text-mute line-through">{rupee(p.mrp)}</span>}</> : <span className="text-lg text-mute">Ask in salon for price</span>}
        </p>
        <p className="mt-2 text-sm text-mute">{p.available ? 'Available' : 'Currently out of stock'}</p>
        <a className="btn btn-gold mt-8" target="_blank" rel="noreferrer" href={waLink(s?.whatsapp || '7330947785', `Hello, I'm interested in: ${p.name}`)}>Enquire on WhatsApp</a>
      </div>
    </div>
  );
}
