'use client';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function PortfolioFotos() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const projects = [
    { 
    id: 1, 
    title: 'Retrato Natural', 
    category: 'Retratos', 
    image: 'https://i.imgur.com/CjD6odO.jpeg',
    color: '#FF6B6B' 
  },
  { 
    id: 2, 
    title: 'Ciudad Nocturna', 
    category: 'Paisaje Urbano', 
    image: 'https://i.imgur.com/04UemMB.jpeg',
    color: '#4ECDC4' 
  },
  { 
    id: 3, 
    title: 'Bodas 2024', 
    category: 'Eventos', 
    image: 'https://i.imgur.com/EP8prma.jpeg',
    color: '#FFE66D' 
  },
  { 
    id: 4, 
    title: 'Naturaleza Salvaje', 
    category: 'Naturaleza', 
    image: 'https://i.imgur.com/EDTD6dC.jpeg',
    color: '#A8E6CF' 
  },
  { 
    id: 5, 
    title: 'Producto Comercial', 
    category: 'Comercial', 
    image: 'https://i.imgur.com/CUF8fCX.jpeg',
    color: '#FF8B94' 
  },
  { 
    id: 6, 
    title: 'Street Photography', 
    category: 'Calle', 
    image: 'https://i.imgur.com/Etgko19.jpeg',
    color: '#C7CEEA' 
  },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  return (
    <section id="portfolio" className="py-32 px-6 bg-black" ref={ref}>
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="container mx-auto"
      >
        <h2 className="text-6xl md:text-8xl font-black mb-4">
          <span className="text-white">MIS</span>{' '}
          <span style={{ color: 'var(--color-accent)' }}>PROYECTOS</span>
        </h2>
        <p className="text-gray-400 text-xl mb-16 max-w-2xl">
          Una selección de trabajos que demuestran creatividad, técnica y pasión por el diseño
        </p>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {projects.map((project) => (
            <motion.div
              key={project.id}
              variants={itemVariants}
              whileHover={{ y: -20, scale: 1.05 }}
              className="relative group overflow-hidden rounded-2xl aspect-square cursor-pointer"
            >
              {/* Fondo de color */}
              <div
                className="absolute inset-0 transition-all duration-500 group-hover:scale-110"
                style={{
                  backgroundImage: `url(${project.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />


              {/* Overlay oscuro */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300" />
              
              
              
              

              {/* Contenido */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300"
                >
                  <span className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-2 block">
                    {project.category}
                  </span>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {project.title}
                  </h3>
                  <div className="w-12 h-1 bg-[var(--color-accent)] group-hover:w-full transition-all duration-500" />
                </motion.div>
              </div>

              {/* Borde animado */}
              <motion.div
                className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--color-accent)] transition-all duration-300 rounded-2xl"
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
