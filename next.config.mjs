/** @type {import('next').NextConfig} */
const nextConfig = {
  // Export estático (GitHub Pages / hosting estático)
  output: 'export',
  
  images: {
    unoptimized: true,
    
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Base path SOLO para producción (GitHub Pages)
  basePath: process.env.NODE_ENV === 'production' ? '/web_definitiva' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/web_definitiva/' : '',

  compress: true,
  reactStrictMode: true,

  turbopack: {},
};

export default nextConfig;