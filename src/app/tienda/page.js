'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import ProductGrid from '@/components/shop/ProductGrid';
import CartButton from '@/components/shop/CartButton';
import CartSidebar from '@/components/shop/CartSidebar';
import CustomCursor from '@/components/CustomCursor'; // ✅ AÑADIDO
import { Toaster } from 'react-hot-toast';
import { FaStore } from 'react-icons/fa';

export default function TiendaPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

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
      <CustomCursor /> {/* ✅ AÑADIDO */}
      <Toaster position="top-right" />
      <CartButton />
      <CartSidebar />
      
      <div className="min-h-screen bg-black pt-24 pb-20 px-4 md:px-6">
        <div className="container mx-auto">
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
              <p className="text-gray-500 text-xl mb-6">No hay productos disponibles</p>
              <p className="text-gray-600 text-sm mb-4">
                Inicia sesión como admin para añadir productos
              </p>
              <a 
                href="/admin/tienda"
                className="inline-block px-6 py-3 bg-[var(--color-accent)] text-black font-bold rounded-xl hover:bg-white transition-colors"
              >
                Ir al Panel Admin
              </a>
            </div>
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </div>
      </div>
    </>
  );
}
