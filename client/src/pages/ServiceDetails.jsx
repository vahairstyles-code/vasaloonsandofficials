import { Link, useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { ErrorBox, Placeholder, Spinner } from '../components/ui';
import { img, rupee } from '../services/api';
import { useSettings } from '../context/SettingsContext';

export default function ServiceDetails() {
  const { id } = useParams();
  const { data, loading, error } = useFetch('/services');
  const { settings: s } = useSettings();
  if (loading) return <Spinner />;
  if (error) return <div className="container-x py-24"><ErrorBox>{error}</ErrorBox></div>;
  const svc = data.find((x) => x._id === id);
  if (!svc) return <div className="container-x py-32 text-center"><h1 className="h-display text-3xl">Service not found</h1><Link to="/services" className="btn btn-line mt-8">All services</Link></div>;
  const adv = Math.min(s?.advanceAmount ?? 10, svc.price);
  return (
    <div className="container-x grid gap-14 py-24 md:grid-cols-2">
      <div className="aspect-[4/5] overflow-hidden">{svc.image ? <img src={img(svc.image)} alt={svc.name} className="h-full w-full object-cover" /> : <Placeholder label={svc.name.slice(0, 2).toUpperCase()} />}</div>
      <div className="self-center">
        <p className="eyebrow mb-3">{svc.category}</p>
        <h1 className="h-display text-5xl">{svc.name}</h1>
        <p className="mt-6 text-mute">{svc.description}</p>
        <p className="mt-8 font-serif text-4xl text-champagne">{rupee(svc.price)}</p>
        <p className="mt-2 text-sm text-mute">Pay {rupee(adv)} advance online, the rest at the salon.</p>
        <Link to={`/booking?service=${svc._id}`} className="btn btn-gold mt-8">Book This Service</Link>
      </div>
    </div>
  );
}
