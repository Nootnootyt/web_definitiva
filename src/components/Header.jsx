'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBars, FaTimes, FaSignInAlt, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import LoginModal from './LoginModal';
import Link from 'next/link';


export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Verificar sesión
  useEffect(() => {
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMobileMenuOpen(false);
  };

  // Bloquear scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navItems = ['Inicio', 'Portfolio', 'Videos', 'Contacto'];

  const scrollToSection = (item) => {
    const sectionMap = {
      'Inicio': 'hero',
      'Portfolio': 'portfolio',
      'Videos': 'videos',
      'Contacto': 'contacto'
    };

    const sectionId = sectionMap[item];
    const element = document.getElementById(sectionId);
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-black/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
        }`}
      >
        <nav className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-shrink-0"
            >
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black">
                <span className="text-white">JAVIER</span>{' '}
                <span style={{ color: 'var(--color-accent)' }}>JIMÉNEZ</span>
              </h1>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="hidden lg:flex items-center gap-8"
            >
              <ul className="flex items-center gap-8">
                {navItems.map((item, index) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <button
                      onClick={() => scrollToSection(item)}
                      className="cursor-pointer text-white hover:text-[var(--color-accent)] transition-colors duration-300 font-semibold text-sm uppercase tracking-wider"
                    >
                      {item}
                    </button>
                  </motion.li>
                ))}

                {/* Enlace al álbum separado */}
                <motion.li
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Link href="/album">
                    <button className="cursor-pointer text-white hover:text-[var(--color-accent)] transition-colors duration-300 font-semibold text-sm uppercase tracking-wider">
                      Álbum
                    </button>
                  </Link>
                </motion.li>

              </ul>

              {/* Botón Login/Logout Desktop */}
              {user ? (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={handleLogout}
                  className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-all duration-300"
                >
                  <FaSignOutAlt />
                  Cerrar Sesión
                </motion.button>
              ) : (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowLoginModal(true)}
                  className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-accent)] hover:bg-white text-black font-semibold text-sm transition-all duration-300"
                >
                  <FaSignInAlt />
                  Iniciar Sesión
                </motion.button>
              )}
            </motion.div>

            {/* Tablet Navigation */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="hidden md:flex lg:hidden items-center gap-4"
            >
              <ul className="flex items-center gap-4">
                {navItems.map((item, index) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <button
                      onClick={() => scrollToSection(item)}
                      className="cursor-pointer text-white hover:text-[var(--color-accent)] transition-colors duration-300 font-semibold text-xs uppercase tracking-wider"
                    >
                      {item}
                    </button>
                  </motion.li>
                ))}
              </ul>

              {/* Botón Login/Logout Tablet */}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="cursor-pointer w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all"
                  title="Cerrar sesión"
                >
                  <FaSignOutAlt size={16} />
                </button>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="cursor-pointer w-10 h-10 rounded-full bg-[var(--color-accent)] hover:bg-white text-black flex items-center justify-center transition-all"
                  title="Iniciar sesión"
                >
                  <FaSignInAlt size={16} />
                </button>
              )}
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="cursor-pointer md:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--color-accent)] text-black hover:bg-white transition-colors"
            >
              {mobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </motion.button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/95 backdrop-blur-lg md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="absolute right-0 top-0 h-full w-full max-w-sm bg-gray-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <h2 className="text-2xl font-black">
                  <span className="text-white">MENÚ</span>
                </h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="cursor-pointer w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-red-500 text-white transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Mobile Menu Items */}
              <nav className="flex-1 overflow-y-auto p-6">
                <ul className="space-y-2">
                  {navItems.map((item, index) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => scrollToSection(item)}
                        className="cursor-pointer w-full text-left px-6 py-4 text-white hover:bg-[var(--color-accent)] hover:text-black rounded-lg transition-all duration-300 font-bold text-lg uppercase tracking-wide"
                      >
                        {item}
                      </button>
                    </motion.li>
                  ))}
                </ul>

                {/* Botón Login/Logout Mobile */}
                <div className="mt-6">
                  {user ? (
                    <button
                      onClick={handleLogout}
                      className="cursor-pointer w-full px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-300 font-bold text-lg flex items-center justify-center gap-3"
                    >
                      <FaSignOutAlt />
                      Cerrar Sesión
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowLoginModal(true);
                        setMobileMenuOpen(false);
                      }}
                      className="cursor-pointer w-full px-6 py-4 bg-[var(--color-accent)] hover:bg-white text-black rounded-lg transition-all duration-300 font-bold text-lg flex items-center justify-center gap-3"
                    >
                      <FaSignInAlt />
                      Iniciar Sesión
                    </button>
                  )}
                </div>

                {/* Indicador de sesión */}
                {user && (
                  <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 text-[var(--color-accent)]">
                      <FaUser />
                      <span className="text-sm">Sesión iniciada</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                  </div>
                )}
              </nav>

              {/* Mobile Menu Footer */}
              <div className="p-6 border-t border-gray-800">
                <p className="text-gray-500 text-sm text-center">
                  © 2025 Javier Jiménez
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal de login */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={(user) => {
          setUser(user);
          setShowLoginModal(false);
        }}
      />
    </>
  );
}
