import { Link, useLocation } from 'react-router-dom';

export default function MobileBookBar() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/booking')) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/30 bg-ink/95 p-3 backdrop-blur lg:hidden">
      <Link to="/booking" className="btn btn-gold w-full !py-3.5">Book Your Slot · ₹10 advance</Link>
    </div>
  );
}
