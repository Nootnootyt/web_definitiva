'use client';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function VideosYoutube() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.2,
  });

  const videos = [
    {
      id: 1,
      embedId: 'eEc3IvWyGa8', // Reemplaza con tus IDs de video
      title: 'DJI Mini 4K | Embalse de Los Melonares Sevilla',
      description: 'A vista de dron QHD 60fps'
    },
    {
      id: 2,
      embedId: 'N8u68iPCgIY',
      title: 'DJI Mini 4K | Praia da Marinha',
      description: 'A vista de dron QHD 60fps'
    },
  ];

  return (
    <section id="videos" className="py-32 px-6 bg-gradient-to-b from-black to-gray-900" ref={ref}>
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-6xl md:text-8xl font-black mb-4">
            <span style={{ color: 'var(--color-accent)' }}>VÍDEOS</span>{' '}
            <span className="text-white">DESTACADOS</span>
          </h2>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto">
            Explora contenido visual que documenta mi trabajo y proceso creativo
          </p>
        </motion.div>

        <div className="space-y-16">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="relative group"
            >
              <div className="relative overflow-hidden rounded-3xl">
                {/* Border glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-accent)] to-purple-600 rounded-3xl opacity-0 group-hover:opacity-75 blur-lg transition-opacity duration-500" />
                
                <div className="relative bg-black rounded-3xl overflow-hidden">
                  <div className="aspect-video relative">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.embedId}`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: index * 0.2 + 0.3 }}
                    className="p-8 bg-gradient-to-t from-black to-transparent"
                  >
                    <h3 className="text-3xl font-bold text-white mb-2">
                      {video.title}
                    </h3>
                    <p className="text-gray-400 text-lg">
                      {video.description}
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
