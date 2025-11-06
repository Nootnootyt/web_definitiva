/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Añade estas líneas (reemplaza 'nombre-repositorio' con el nombre real de tu repo)
  basePath: '/web_definitiva',
  assetPrefix: '/web_definitiva/',
}

export default nextConfig
