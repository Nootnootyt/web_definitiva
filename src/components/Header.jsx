'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaSignInAlt, FaSignOutAlt, FaUser, FaShoppingBag, FaBox } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import LoginModal from './LoginModal';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMouseAtTop, setIsMouseAtTop] = useState(false); // 🆕 Estado para detectar mouse arriba
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();

  // 🆕 Detectar cuando el ratón está en la parte superior de la página
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Si el mouse está en los primeros 100px desde arriba, mostrar header
      if (e.clientY <= 100) {
        setIsMouseAtTop(true);
      } else {
        setIsMouseAtTop(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // ✅ Smart scroll handler - Oculta/muestra header según dirección
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determinar si está scrolleado
      setScrolled(currentScrollY > 50);
      
      // ✅ Lógica de auto-hide mejorada:
      // - Siempre visible si está en el top (< 100px)
      // - Mostrar si scrollea hacia arriba
      // - Ocultar si scrollea hacia abajo (y ha pasado 100px)
      if (currentScrollY < 100) {
        setVisible(true);
      } else if (currentScrollY < lastScrollY) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false);
        setMobileMenuOpen(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // ✅ Verificar sesión
  const checkUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }, []);

  useEffect(() => {
    checkUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [checkUser]);

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

  const navItems = ['Inicio', 'Destacado', 'Videos', 'Contacto'];

  const scrollToSection = (item) => {
    const sectionMap = {
      'Inicio': 'hero',
      'Destacado': 'destacado',
      'Videos': 'videos',
      'Contacto': 'contacto'
    };
    const sectionId = sectionMap[item];
    
    if (pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push(`/#${sectionId}`);
    }
    
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* ✅ Header con animación de entrada/salida + APARECE CON MOUSE ARRIBA */}
      <motion.header
        initial={{ y: 0 }}
        animate={{ 
          y: (visible || isMouseAtTop) ? 0 : -100, // 🆕 Aparece si el mouse está arriba
        }}
        transition={{ 
          duration: 0.3, 
          ease: 'easeInOut' 
        }}
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${scrolled 
            ? 'bg-black/95 backdrop-blur-xl shadow-2xl py-3 border-b border-white/5' 
            : 'bg-black/80 backdrop-blur-md py-5 border-b border-white/10'
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
                <span className="text-white">AETHE</span>{' '}
                <span style={{ color: 'var(--color-accent)' }}>RIS</span>
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
              
              <Link href="/album">
                <motion.button
                  whileHover={{ y: -2 }}
                  className="cursor-pointer text-white hover:text-[var(--color-accent)] transition-colors duration-300 font-semibold text-sm uppercase tracking-wider"
                >
                  Álbum
                </motion.button>
              </Link>

              <Link href="/tienda">
                <motion.button
                  whileHover={{ y: -2 }}
                  className="cursor-pointer flex items-center gap-2 text-white hover:text-[var(--color-accent)] transition-colors duration-300 font-semibold text-sm uppercase tracking-wider"
                >
                  <FaShoppingBag />
                  Tienda
                </motion.button>
              </Link>

              {user && (
                <Link href="/admin/pedidos">
                  <motion.button
                    whileHover={{ y: -2 }}
                    className="cursor-pointer flex items-center gap-2 text-white hover:text-[var(--color-accent)] transition-colors duration-300 font-semibold text-sm uppercase tracking-wider"
                  >
                    <FaBox />
                    Pedidos
                  </motion.button>
                </Link>
              )}

              {user ? (
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.1 }}
                  className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-all duration-300"
                >
                  <FaSignOutAlt />
                  Salir
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => setShowLoginModal(true)}
                  whileHover={{ scale: 1.1 }}
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

              <Link href="/tienda">
                <motion.button
                  whileHover={{ y: -2 }}
                  className="cursor-pointer text-white hover:text-[var(--color-accent)] transition-colors duration-300 font-semibold text-xs uppercase tracking-wider"
                >
                  <FaShoppingBag />
                </motion.button>
              </Link>

              {user && (
                <Link href="/admin/pedidos">
                  <motion.button
                    whileHover={{ y: -2 }}
                    className="cursor-pointer text-white hover:text-[var(--color-accent)] transition-colors duration-300 font-semibold text-xs uppercase tracking-wider"
                  >
                    <FaBox />
                  </motion.button>
                </Link>
              )}

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

      {/* ✅ Espaciador para evitar que el contenido se esconda debajo del header */}
      <div className="h-[72px] md:h-[80px]" aria-hidden="true" />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
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
              className="absolute right-0 top-0 h-full w-full sm:w-96 bg-black/95 backdrop-blur-xl border-l border-white/10 p-6 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-white">MENÚ</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="cursor-pointer w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-red-500 text-white transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <nav className="flex flex-col gap-3 mb-6">
                {navItems.map((item, index) => (
                  <motion.button
                    key={index}
                    onClick={() => scrollToSection(item)}
                    whileHover={{ x: 8 }}
                    className="cursor-pointer w-full text-left px-6 py-4 text-white hover:bg-[var(--color-accent)] hover:text-black rounded-lg transition-all duration-300 font-bold text-lg uppercase tracking-wider"
                  >
                    {item}
                  </motion.button>
                ))}

                <Link href="/album">
                  <motion.button
                    onClick={() => setMobileMenuOpen(false)}
                    whileHover={{ x: 8 }}
                    className="cursor-pointer w-full text-left px-6 py-4 text-white hover:bg-[var(--color-accent)] hover:text-black rounded-lg transition-all duration-300 font-bold text-lg uppercase tracking-wider"
                  >
                    Álbum
                  </motion.button>
                </Link>

                <Link href="/tienda">
                  <motion.button
                    onClick={() => setMobileMenuOpen(false)}
                    whileHover={{ x: 8 }}
                    className="cursor-pointer w-full text-left px-6 py-4 text-white hover:bg-[var(--color-accent)] hover:text-black rounded-lg transition-all duration-300 font-bold text-lg uppercase tracking-wider flex items-center gap-3"
                  >
                    <FaShoppingBag />
                    Tienda
                  </motion.button>
                </Link>

                {user && (
                  <Link href="/admin/pedidos">
                    <motion.button
                      onClick={() => setMobileMenuOpen(false)}
                      whileHover={{ x: 8 }}
                      className="cursor-pointer w-full text-left px-6 py-4 text-white hover:bg-[var(--color-accent)] hover:text-black rounded-lg transition-all duration-300 font-bold text-lg uppercase tracking-wider flex items-center gap-3"
                    >
                      <FaBox />
                      Pedidos
                    </motion.button>
                  </Link>
                )}
              </nav>

              {user ? (
                <button
                  onClick={handleLogout}
                  className="cursor-pointer w-full px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 mt-auto"
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
                  className="cursor-pointer w-full px-6 py-4 bg-[var(--color-accent)] hover:bg-white text-black rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 mt-auto"
                >
                  <FaSignInAlt />
                  Iniciar Sesión
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}