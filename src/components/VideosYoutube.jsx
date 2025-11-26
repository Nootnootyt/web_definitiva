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
      embedId: 'eEc3IvWyGa8',
      title: 'Embalse de Los Melonares',
      description: 'Embalse de los Melonares a vista de dron QHD 60fps'
    },
    {
      id: 2,
      embedId: 'N8u68iPCgIY',
      title: 'Praia da Marinha',
      description: 'Portugal a vista de dron QHD 60fps'
    },
    {
      id: 3,
      embedId: 'aAIAAR9ZkaI', 
      title: 'Praia do Barrill, Santa Luzia',
      description: 'Praia do Barril, Ilha de Tavira. Desde el aire con dron 1080p 60fps'
    },
  ];

  return (
    <section id="videos" className="py-32 px-6 bg-gradient-to-b from-black to-gray-900" ref={ref}>
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-6xl md:text-8xl font-black mb-4">
            <span style={{ color: 'var(--color-accent)' }}>VÍDEOS</span>{' '}
            <span className="text-white">DESTACADOS</span>
          </h2>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto">
            Explora contenido visual que documenta mi trabajo y proceso creativo
          </p>
        </motion.div>

        {/* Grid de videos: 2 arriba, 1 abajo centrado */}
        <div className="space-y-8">
          {/* Fila superior: 2 videos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {videos.slice(0, 2).map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative group"
              >
                <div className="relative overflow-hidden rounded-2xl">
                  {/* Border glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-accent)] to-purple-600 rounded-2xl opacity-0 group-hover:opacity-75 blur-lg transition-opacity duration-500" />
                  
                  <div className="relative bg-black rounded-2xl overflow-hidden border-2 border-gray-800 hover:border-[var(--color-accent)] transition-colors">
                    <div className="aspect-video relative video-container">
                      {/* ✅ Capa protectora para el cursor - Solo visible en hover */}
                      <div className="absolute inset-0 z-10 pointer-events-none group-hover:pointer-events-auto cursor-pointer" />
                      
                      <iframe
                        src={`https://www.youtube.com/embed/${video.embedId}`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full relative z-0"
                      />
                    </div>
                    
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={inView ? { opacity: 1 } : {}}
                      transition={{ delay: index * 0.15 + 0.3 }}
                      className="p-6 bg-gradient-to-t from-black to-transparent"
                    >
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {video.title}
                      </h3>
                      <p className="text-gray-400 text-base">
                        {video.description}
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Fila inferior: 1 video centrado */}
          {videos.length > 2 && (
            <div className="flex justify-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative group w-full md:w-1/2"
              >
                <div className="relative overflow-hidden rounded-2xl">
                  {/* Border glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-accent)] to-purple-600 rounded-2xl opacity-0 group-hover:opacity-75 blur-lg transition-opacity duration-500" />
                  
                  <div className="relative bg-black rounded-2xl overflow-hidden border-2 border-gray-800 hover:border-[var(--color-accent)] transition-colors">
                    <div className="aspect-video relative video-container">
                      {/* ✅ Capa protectora para el cursor - Solo visible en hover */}
                      <div className="absolute inset-0 z-10 pointer-events-none group-hover:pointer-events-auto cursor-pointer" />
                      
                      <iframe
                        src={`https://www.youtube.com/embed/${videos[2].embedId}`}
                        title={videos[2].title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full relative z-0"
                      />
                    </div>
                    
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={inView ? { opacity: 1 } : {}}
                      transition={{ delay: 0.5 }}
                      className="p-6 bg-gradient-to-t from-black to-transparent"
                    >
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {videos[2].title}
                      </h3>
                      <p className="text-gray-400 text-base">
                        {videos[2].description}
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}