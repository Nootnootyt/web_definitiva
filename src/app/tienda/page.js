'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import ProductGrid from '@/components/shop/ProductGrid';
import CartButton from '@/components/shop/CartButton';
import CartSidebar from '@/components/shop/CartSidebar';
import { Toaster } from 'react-hot-toast';
import { FaStore, FaArrowLeft, FaHome } from 'react-icons/fa';
import Link from 'next/link';

export default function TiendaPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Cursor personalizado
  useEffect(() => {
    const cursorDot = document.createElement('div');
    const cursorCircle = document.createElement('div');
    
    cursorDot.style.cssText = `
      position: fixed;
      width: 8px;
      height: 8px;
      background: var(--color-accent);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      mix-blend-mode: difference;
      transition: transform 0.1s ease;
    `;
    
    cursorCircle.style.cssText = `
      position: fixed;
      width: 40px;
      height: 40px;
      border: 2px solid var(--color-accent);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
      mix-blend-mode: difference;
      transition: all 0.2s ease;
    `;
    
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorCircle);
    
    const moveCursor = (e) => {
      cursorDot.style.left = `${e.clientX - 4}px`;
      cursorDot.style.top = `${e.clientY - 4}px`;
      cursorCircle.style.left = `${e.clientX - 20}px`;
      cursorCircle.style.top = `${e.clientY - 20}px`;
    };
    
    const hoverEffect = () => {
      cursorCircle.style.width = '60px';
      cursorCircle.style.height = '60px';
      cursorCircle.style.left = `${parseInt(cursorCircle.style.left) - 10}px`;
      cursorCircle.style.top = `${parseInt(cursorCircle.style.top) - 10}px`;
    };
    
    const normalEffect = () => {
      cursorCircle.style.width = '40px';
      cursorCircle.style.height = '40px';
    };
    
    document.addEventListener('mousemove', moveCursor);
    
    const addHoverListeners = () => {
      const hoverables = document.querySelectorAll('button, a, input, .cursor-pointer');
      hoverables.forEach(el => {
        el.addEventListener('mouseenter', hoverEffect);
        el.addEventListener('mouseleave', normalEffect);
      });
    };
    
    addHoverListeners();
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Ocultar cursor en móviles
    if ('ontouchstart' in window) {
      cursorDot.style.display = 'none';
      cursorCircle.style.display = 'none';
    }
    
    return () => {
      document.removeEventListener('mousemove', moveCursor);
      observer.disconnect();
      cursorDot.remove();
      cursorCircle.remove();
    };
  }, []);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(products.map(p => p.category))];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <>
      <Toaster position="top-right" />
      <CartButton />
      <CartSidebar />
      
      <div className="min-h-screen bg-black pt-24 pb-20 px-4 md:px-6">
        <div className="container mx-auto">
          {/* Botón Volver */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <Link href="/">
              <button className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-gray-400 hover:text-[var(--color-accent)] hover:glass-accent transition-all duration-300 group">
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-semibold">Volver al Inicio</span>
              </button>
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <FaStore className="text-4xl text-[var(--color-accent)]" />
              <h1 className="text-5xl md:text-7xl font-black text-white">
                TIENDA <span className="text-[var(--color-accent)]">DEMO</span>
              </h1>
            </div>
            <p className="text-gray-400 text-lg md:text-xl max-w-3xl">
              Ejemplo de e-commerce funcional. Sistema completo de gestión de productos y pedidos.
            </p>
          </motion.div>

          {/* Filtros de categoría */}
          {categories.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-8 flex flex-wrap gap-3"
            >
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    px-6 py-3 rounded-full font-semibold text-sm uppercase tracking-wider
                    transition-all duration-300
                    ${selectedCategory === category
                      ? 'bg-[var(--color-accent)] text-black'
                      : 'glass text-gray-400 hover:text-white hover:glass-accent'
                    }
                  `}
                >
                  {category === 'all' ? 'Todos' : category}
                </button>
              ))}
            </motion.div>
          )}

          {/* Grid de productos */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-16 h-16 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <FaStore className="text-6xl text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 text-xl mb-6">
                {products.length === 0 
                  ? 'No hay productos disponibles' 
                  : 'No hay productos en esta categoría'}
              </p>
              {products.length === 0 && (
                <>
                  <p className="text-gray-600 text-sm mb-6">
                    Inicia sesión como admin para añadir productos
                  </p>
                  <Link href="/admin/tienda">
                    <button className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] text-black font-bold rounded-xl hover:bg-white transition-colors">
                      <FaStore />
                      <span>Ir al Panel Admin</span>
                    </button>
                  </Link>
                </>
              )}
            </div>
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </div>
      </div>
    </>
  );
}
