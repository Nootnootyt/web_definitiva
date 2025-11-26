'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaLock, FaEnvelope, FaSpinner } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🚀 OPTIMIZACIÓN: Bloquear scroll con clase
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.classList.add('modal-open');
      document.body.style.top = `-${scrollY}px`;
      
      return () => {
        document.body.classList.remove('modal-open');
        document.body.style.top = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      console.log('Login exitoso:', data);
      onLoginSuccess?.(data.user);
      onClose();
    } catch (error) {
      console.error('Error de login:', error);
      setError('Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }} // 🚀 Más rápido
      className="modal modal-active fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      style={{ 
        willChange: 'opacity',
        overscrollBehavior: 'contain'
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} // 🚀 Movimiento más sutil
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 25
        }}
        className="bg-gray-900 rounded-3xl p-8 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          willChange: 'transform, opacity',
          contain: 'layout style paint'
        }}
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
              <FaLock className="text-black" size={20} />
            </div>
            <h2 className="text-3xl font-black text-white">
              Iniciar Sesión
            </h2>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer w-10 h-10 rounded-full bg-gray-800 hover:bg-red-500 text-white transition-colors flex items-center justify-center"
            style={{ willChange: 'background-color' }}
          >
            <FaTimes />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[var(--color-accent)] mb-2">
              Email
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="tu-email@gmail.com"
                className="w-full pl-12 pr-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-accent)] mb-2">
              Contraseña
            </label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer w-full py-3 bg-[var(--color-accent)] text-black font-bold rounded-lg hover:bg-white transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ willChange: 'transform' }}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}