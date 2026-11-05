import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import PromoBar from '../components/PromoBar';
import MobileBookBar from '../components/MobileBookBar';

export default function SiteLayout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathname]);
  return (
    <>
      <Loader />
      <PromoBar />
      <Navbar />
      <main className="min-h-screen pb-[4.5rem] lg:pb-0"><Outlet /></main>
      <Footer />
      <MobileBookBar />
    </>
  );
}
