'use client';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaEnvelope } from 'react-icons/fa';

export default function Footer() {
  const socialLinks = [
    { icon: FaGithub, url: 'https://github.com/Nootnootyt', label: 'GitHub' },
    { icon: FaLinkedin, url: '#', label: 'LinkedIn' },
    { icon: FaTwitter, url: '#', label: 'Twitter' },
    { icon: FaInstagram, url: 'https://www.instagram.com/jaavijmg05?igsh=M2MwaDc4MHNrZXUx&utm_source=qr', label: 'Instagram' },
  ];

  return (
    <footer id="contacto" className="relative bg-black border-t border-gray-800 py-20 px-6 overflow-hidden">
      {/* Efecto de fondo */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, var(--color-accent) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-16 mb-16">
          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: false }}
          >
            <h3 className="text-5xl font-black mb-6">
              <span className="text-white">TRABAJEMOS</span>{' '}
              <span style={{ color: 'var(--color-accent)' }}>JUNTOS</span>
            </h3>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              Desarrollador front-end especializado en crear experiencias web impactantes 
              y dinámicas. Siempre buscando proyectos desafiantes que combinen diseño 
              y tecnología de vanguardia.
            </p>
            <motion.a
              href="mailto:tu@email.com"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-6 py-3 bg-[var(--color-accent)] text-black font-bold rounded-full hover:shadow-lg hover:shadow-[var(--color-accent)]/50 transition-all duration-300"
            >
              <FaEnvelope />
              fjavierjimg@gmail.com
            </motion.a>
          </motion.div>

          {/* Redes Sociales */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: false }}
            className="flex flex-col justify-center"
          >
            <h4 className="text-2xl font-bold text-white mb-8">Sígueme</h4>
            <div className="flex gap-6">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.url}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.2 }}
                  viewport={{ once: false }}
                  className="w-16 h-16 rounded-full bg-gray-800 hover:bg-[var(--color-accent)] hover:text-black text-white flex items-center justify-center text-2xl transition-all duration-300 border-2 border-transparent hover:border-[var(--color-accent)]"
                  aria-label={social.label}
                >
                  <social.icon />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: false }}
          className="border-t border-gray-800 pt-8 text-center"
        >
          <p className="text-gray-500">
            © 2025 Javier. Diseñado y desarrollado con{' '}
            <span style={{ color: 'var(--color-accent)' }}>pasión</span>.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
