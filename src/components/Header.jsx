'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBars, FaTimes, FaSignInAlt, FaSignOutAlt, FaUser, FaShoppingBag, FaBox } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import LoginModal from './LoginModal';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';  // ✅ AÑADIDO

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const pathname = usePathname();  // ✅ AÑADIDO
  const router = useRouter();      // ✅ AÑADIDO

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

  // ✅ FUNCIÓN MEJORADA: navega si no estás en home, scroll si estás en home
  const scrollToSection = (item) => {
    const sectionMap = {
      'Inicio': 'hero',
      'Portfolio': 'portfolio',
      'Videos': 'videos',
      'Contacto': 'contacto'
    };
    const sectionId = sectionMap[item];
    
    // Si estamos en la home, hacer scroll
    if (pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Si estamos en otra ruta, navegar a home con hash
      router.push(`/#${sectionId}`);
    }
    
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${scrolled 
            ? 'glass-strong shadow-2xl py-3' 
            : 'bg-transparent py-5'
          }
        `}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group cursor-pointer">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-2xl font-black"
              >
                <span className="text-white">JAVIER</span>{' '}
                <span style={{ color: 'var(--color-accent)' }}>JIMÉNEZ</span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item, index) => (
                <motion.button
                  key={index}
                  onClick={() => scrollToSection(item)}
                  whileHover={{ y: -2 }}
                  className="cursor-pointer text-white hover:text-[var(--color-accent)] transition-colors duration-300 font-semibold text-sm uppercase tracking-wider"
                >
                  {item}
                </motion.button>
              ))}
              
              {/* Enlace al álbum */}
              <Link href="/album">
                <motion.button
                  whileHover={{ y: -2 }}
                  className="cursor-pointer text-white hover:text-[var(--color-accent)] transition-colors duration-300 font-semibold text-sm uppercase tracking-wider"
                >
                  Álbum
                </motion.button>
              </Link>

              {/* Enlace a Tienda */}
              <Link href="/tienda">
                <motion.button
                  whileHover={{ y: -2 }}
                  className="cursor-pointer flex items-center gap-2 text-white hover:text-[var(--color-accent)] transition-colors duration-300 font-semibold text-sm uppercase tracking-wider"
                >
                  <FaShoppingBag />
                  Tienda
                </motion.button>
              </Link>

              {/* Enlace a Pedidos (solo si está autenticado) */}
              {user && (
                <Link href="/admin/pedidos">
                  <motion.button
                    whileHover={{ y: -2 }}
                    className="cursor-pointer flex items-center gap-2 text-white hover:text-[var(--color-accent)] transition-colors duration-300 font-semibold text-sm uppercase tracking-wider border-2 border-[var(--color-accent)] rounded-full px-4 py-2"
                  >
                    <FaBox />
                    Pedidos
                  </motion.button>
                </Link>
              )}

              {/* Botón Login/Logout Desktop */}
              {user ? (
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-all duration-300"
                >
                  <FaSignOutAlt />
                  Cerrar Sesión
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => setShowLoginModal(true)}
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-accent)] hover:bg-white text-black font-semibold text-sm transition-all duration-300"
                >
                  <FaSignInAlt />
                  Iniciar Sesión
                </motion.button>
              )}
            </nav>

            {/* Tablet Navigation */}
            <nav className="hidden md:flex lg:hidden items-center gap-4">
              {navItems.map((item, index) => (
                <motion.button
                  key={index}
                  onClick={() => scrollToSection(item)}
                  whileHover={{ y: -2 }}
                  className="cursor-pointer text-white hover:text-[var(--color-accent)] transition-colors duration-300 font-semibold text-xs uppercase tracking-wider"
                >
                  {item}
                </motion.button>
              ))}
              
              <Link href="/album">
                <motion.button
                  whileHover={{ y: -2 }}
                  className="cursor-pointer text-white hover:text-[var(--color-accent)] transition-colors duration-300 font-semibold text-xs uppercase tracking-wider"
                >
                  Álbum
                </motion.button>
              </Link>

              {/* Tienda en tablet */}
              <Link href="/tienda">
                <motion.button
                  whileHover={{ y: -2 }}
                  className="cursor-pointer text-white hover:text-[var(--color-accent)] transition-colors duration-300 font-semibold text-xs uppercase tracking-wider"
                >
                  <FaShoppingBag className="text-lg" />
                </motion.button>
              </Link>

              {/* Pedidos en tablet (solo si está autenticado) */}
              {user && (
                <Link href="/admin/pedidos">
                  <motion.button
                    whileHover={{ y: -2 }}
                    className="cursor-pointer text-white hover:text-[var(--color-accent)] transition-colors duration-300 border-2 border-[var(--color-accent)] rounded-full w-9 h-9 flex items-center justify-center"
                    title="Pedidos"
                  >
                    <FaBox className="text-sm" />
                  </motion.button>
                </Link>
              )}

              {/* Botón Login/Logout Tablet */}
              {user ? (
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.1 }}
                  className="cursor-pointer w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all"
                  title="Cerrar sesión"
                >
                  <FaSignOutAlt />
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => setShowLoginModal(true)}
                  whileHover={{ scale: 1.1 }}
                  className="cursor-pointer w-10 h-10 rounded-full bg-[var(--color-accent)] hover:bg-white text-black flex items-center justify-center transition-all"
                  title="Iniciar sesión"
                >
                  <FaSignInAlt />
                </motion.button>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="cursor-pointer md:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--color-accent)] text-black hover:bg-white transition-colors"
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-40"
          onClick={() => setMobileMenuOpen(false)}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="absolute right-0 top-0 h-full w-full sm:w-96 glass-strong p-6 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-white">MENÚ</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="cursor-pointer w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-red-500 text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Mobile Menu Items */}
            <nav className="flex flex-col gap-3 mb-6">
              {navItems.map((item, index) => (
                <motion.button
                  key={index}
                  onClick={() => scrollToSection(item)}
                  whileHover={{ x: 8 }}
                  className="cursor-pointer w-full text-left px-6 py-4 text-white hover:bg-[var(--color-accent)] hover:text-black rounded-lg transition-all duration-300 font-bold text-lg uppercase tracking-wide"
                >
                  {item}
                </motion.button>
              ))}

              <Link href="/album">
                <motion.button
                  onClick={() => setMobileMenuOpen(false)}
                  whileHover={{ x: 8 }}
                  className="cursor-pointer w-full text-left px-6 py-4 text-white hover:bg-[var(--color-accent)] hover:text-black rounded-lg transition-all duration-300 font-bold text-lg uppercase tracking-wide"
                >
                  Álbum
                </motion.button>
              </Link>

              {/* Tienda en móvil */}
              <Link href="/tienda">
                <motion.button
                  onClick={() => setMobileMenuOpen(false)}
                  whileHover={{ x: 8 }}
                  className="cursor-pointer w-full text-left px-6 py-4 text-white hover:bg-[var(--color-accent)] hover:text-black rounded-lg transition-all duration-300 font-bold text-lg uppercase tracking-wide flex items-center gap-3"
                >
                  <FaShoppingBag />
                  Tienda
                </motion.button>
              </Link>

              {/* Pedidos en móvil (solo si está autenticado) */}
              {user && (
                <Link href="/admin/pedidos">
                  <motion.button
                    onClick={() => setMobileMenuOpen(false)}
                    whileHover={{ x: 8 }}
                    className="cursor-pointer w-full text-left px-6 py-4 text-white hover:bg-[var(--color-accent)] hover:text-black rounded-lg transition-all duration-300 font-bold text-lg uppercase tracking-wide flex items-center gap-3 border-2 border-[var(--color-accent)]"
                  >
                    <FaBox />
                    Pedidos
                  </motion.button>
                </Link>
              )}
            </nav>

            {/* Botón Login/Logout Mobile */}
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

            {/* Indicador de sesión */}
            {user && (
              <div className="mt-auto pt-6 border-t border-gray-800">
                <div className="flex items-center gap-3 text-gray-400">
                  <FaUser className="text-[var(--color-accent)]" />
                  <div>
                    <p className="text-xs text-gray-500">Sesión iniciada</p>
                    <p className="text-sm text-white">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Menu Footer */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <p className="text-center text-gray-500 text-sm">
                © 2025 Javier Jiménez
              </p>
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
