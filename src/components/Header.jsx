'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = ['Inicio', 'Portfolio', 'Videos', 'Contacto'];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/80 backdrop-blur-lg py-4' : 'bg-transparent py-6'
      }`}
    >
      <nav className="container mx-auto px-6 flex justify-between items-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="text-2xl font-bold"
        >
          <span className="text-white">JAVIER</span>
          <span style={{ color: 'var(--color-accent)' }}> JIMÉNEZ</span>
        </motion.div>
        
        <ul className="flex gap-8">
          {navItems.map((item, index) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              <a
                href={`#${item.toLowerCase()}`}
                className="text-white hover:text-[var(--color-accent)] transition-colors duration-300 text-sm uppercase tracking-wider font-medium"
              >
                {item}
              </a>
            </motion.li>
          ))}
        </ul>
      </nav>
    </motion.header>
  );
}
