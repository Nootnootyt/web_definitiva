'use client';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import PortfolioFotos from '@/components/PortfolioFotos';
import VideosYoutube from '@/components/VideosYoutube';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';

export default function Home() {
  return (
    <>
      <CustomCursor />
      <Header />
      <main>
        <Hero />
        <PortfolioFotos />
        <VideosYoutube />
      </main>
      <Footer />
    </>
  );
}
