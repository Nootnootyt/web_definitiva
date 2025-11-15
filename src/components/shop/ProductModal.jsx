'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaShoppingCart, FaMinus, FaPlus } from 'react-icons/fa';
import { useCartStore } from '@/lib/cartStore';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ProductModal({ product, onClose }) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    toast.success(`${quantity}x ${product.name} añadido al carrito`);
    onClose();
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const subtotal = (product.price * quantity).toFixed(2);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#0A0F1C] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-[var(--color-accent)] shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-[#050A14] p-4 flex justify-between items-center border-b border-[var(--color-accent)]/30 z-10 rounded-t-3xl">
            <h2 className="text-2xl font-black text-white">Detalles del Producto</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[#1A1F2E] hover:bg-red-500 transition-colors flex items-center justify-center text-white"
            >
              <FaTimes />
            </button>
          </div>

          {/* Contenido */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Imagen - TAMAÑO REAL con esquinas redondeadas */}
            <div className="flex items-center justify-center bg-[#1A1F2E] rounded-2xl p-4 border-2 border-gray-800">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-auto max-h-[500px] object-contain rounded-2xl" // ✅ object-contain + esquinas redondeadas
              />
            </div>

            {/* Información */}
            <div className="flex flex-col justify-between">
              {/* Categoría */}
              {product.category && (
                <span className="inline-block w-fit px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--color-accent)]/20 text-[var(--color-accent)] mb-4">
                  {product.category}
                </span>
              )}

              {/* Nombre */}
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                {product.name}
              </h1>

              {/* Descripción */}
              {product.description && (
                <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Precio */}
              <div className="mb-6">
                <p className="text-6xl font-black text-[var(--color-accent)] mb-1">
                  €{product.price}
                </p>
                <p className="text-gray-500 text-sm">/ unidad</p>
              </div>

              {/* Stock */}
              <div className="flex items-center justify-between mb-6 p-4 bg-[#1A1F2E] rounded-xl border-2 border-gray-800">
                <span className="text-gray-400 font-semibold">Stock disponible:</span>
                <span className="text-[var(--color-accent)] font-black text-2xl">
                  {product.stock} unidades
                </span>
              </div>

              {/* Selector de cantidad */}
              <div className="mb-6">
                <label className="text-gray-400 font-semibold mb-3 block">Cantidad:</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="w-12 h-12 rounded-xl bg-[#1A1F2E] text-white font-bold text-2xl hover:bg-[var(--color-accent)] hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#1A1F2E] disabled:hover:text-white border-2 border-gray-800"
                  >
                    <FaMinus className="mx-auto" />
                  </button>
                  
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val >= 1 && val <= product.stock) {
                        setQuantity(val);
                      }
                    }}
                    className="w-20 h-12 text-center text-2xl font-black bg-[#1A1F2E] text-white rounded-xl border-2 border-gray-800 focus:outline-none focus:border-[var(--color-accent)]"
                  />
                  
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock}
                    className="w-12 h-12 rounded-xl bg-[#1A1F2E] text-white font-bold text-2xl hover:bg-[var(--color-accent)] hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#1A1F2E] disabled:hover:text-white border-2 border-gray-800"
                  >
                    <FaPlus className="mx-auto" />
                  </button>
                </div>
              </div>

              {/* Subtotal */}
              <div className="flex items-center justify-between mb-6 p-4 bg-[var(--color-accent)]/10 rounded-xl border-2 border-[var(--color-accent)]/30">
                <span className="text-white font-bold text-xl">Subtotal:</span>
                <span className="text-[var(--color-accent)] font-black text-3xl">
                  €{subtotal}
                </span>
              </div>

              {/* Botón añadir */}
              <button
                onClick={handleAddToCart}
                className="w-full py-5 bg-[var(--color-accent)] text-black font-black text-xl rounded-xl hover:bg-white transition-all hover:scale-105 flex items-center justify-center gap-3 shadow-lg shadow-[var(--color-accent)]/50"
              >
                <FaShoppingCart className="text-2xl" />
                <span>Añadir al Carrito</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
