import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

// Optimizar carga de fuentes
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap', // ⭐ AÑADIR
  preload: true,   // ⭐ AÑADIR
  fallback: ['system-ui', 'arial'], // ⭐ AÑADIR
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap', // ⭐ AÑADIR
  preload: true,   // ⭐ AÑADIR
  fallback: ['monospace'], // ⭐ AÑADIR
});

export const metadata = {
  title: 'Portfolio Dinámico - Javier Jiménez',
  description: 'Web de prueba para mostrar un portfolio dinámico',
  // ⭐ AÑADIR metadatos para SEO
  keywords: 'portfolio, fotografía, desarrollo web, Next.js',
  authors: [{ name: 'Javier Jiménez' }],
  openGraph: {
    title: 'Portfolio Dinámico - Javier Jiménez',
    description: 'Web de prueba para mostrar un portfolio dinámico',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es"> {/* Cambiado de "en" a "es" */}
      <head>
        {/* ⭐ AÑADIR preconnect para Supabase */}
        <link rel="preconnect" href="https://supabase.co" />
        <link rel="dns-prefetch" href="https://supabase.co" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}