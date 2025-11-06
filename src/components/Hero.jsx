'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  return (
    <section
      id="inicio"
      ref={ref}
      className="relative h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Efecto de fondo parallax */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, var(--color-accent) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </motion.div>

      {/* Contenido principal con efecto parallax */}
      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 text-center px-6"
      >
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-7xl md:text-9xl font-black mb-6 leading-none"
        >
          <span className="block text-white">BIENVENID@</span>
          <motion.span
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="block"
            style={{ color: 'var(--color-accent)' }}
          >
            A MI WEB
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-12"
        >
          Prueba Web de desarrollo front-end y diseño visual dinámico
        </motion.p>

        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-[var(--color-accent)] text-black font-bold text-lg rounded-full hover:shadow-2xl hover:shadow-[var(--color-accent)]/50 transition-all duration-300"
        >
          Ver Proyectos
        </motion.button>
      </motion.div>

      {/* Indicador de scroll */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1, repeat: Infinity, repeatType: 'reverse' }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-[var(--color-accent)] rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-3 bg-[var(--color-accent)] rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  );
}
