'use client';

import dynamic from 'next/dynamic'; // ⭐ IMPORTAR
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import PortfolioFotos from '@/components/PortfolioFotos';
import VideosYoutube from '@/components/VideosYoutube';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';

// ⭐ LAZY LOAD componentes pesados
const Hero3D = dynamic(() => import('@/components/Hero3D'), {
  loading: () => <div className="h-screen bg-black" />,
  ssr: false, // Three.js no funciona en SSR
});

const AdminPanel = dynamic(() => import('@/components/AdminPanel'), {
  loading: () => null,
  ssr: false,
});

export default function Home() {
  return (
    <>
      <CustomCursor />
      <Header />
      <main>
        <Hero3D />
        <PortfolioFotos />
        <VideosYoutube />
      </main>
      <Footer />
      <AdminPanel />
    </>
  );
}