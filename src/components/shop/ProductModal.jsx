'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaShoppingCart, FaMinus, FaPlus } from 'react-icons/fa';
import { useCartStore } from '@/lib/cartStore';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function ProductModal({ product, isOpen, onClose }) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [imageOrientation, setImageOrientation] = useState('square'); // 'portrait', 'landscape', 'square'

  // ✅ Detectar orientación de la imagen
  useEffect(() => {
    if (!product?.image) return;
    
    const img = document.createElement('img');
    img.src = product.image;
    img.onload = () => {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      
      if (aspectRatio < 0.75) {
        setImageOrientation('portrait'); // Imagen vertical
      } else if (aspectRatio > 1.3) {
        setImageOrientation('landscape'); // Imagen horizontal
      } else {
        setImageOrientation('square'); // Cuadrada
      }
    };
  }, [product?.image]);

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

  if (!isOpen) return null;

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
            <h2 className="text-xl md:text-2xl font-black text-white">Detalles del Producto</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[#1A1F2E] hover:bg-red-500 transition-colors flex items-center justify-center text-white"
            >
              <FaTimes />
            </button>
          </div>

          {/* ✅ Contenido - Layout según orientación de imagen */}
          <div className={`p-4 md:p-6 ${
            imageOrientation === 'portrait' 
              ? 'grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 md:gap-8' // Imagen vertical: lado a lado (imagen izq, texto der)
              : 'flex flex-col gap-6 md:gap-8' // Imagen horizontal/cuadrada: stack vertical (imagen arriba, texto abajo)
          }`}>
            
            {/* ✅ IMAGEN - Tamaño según orientación */}
            <div className={`relative flex items-center justify-center bg-[#1A1F2E] rounded-2xl p-4 border-2 border-gray-800 overflow-hidden ${
              imageOrientation === 'portrait'
                ? 'w-full lg:w-auto lg:max-w-[350px] min-h-[400px] lg:min-h-[600px]' // Imagen vertical: ocupa altura completa
                : 'w-full min-h-[300px] md:min-h-[400px]' // Imagen horizontal/cuadrada: ocupa ancho completo
            }`}>
              <Image
                src={product.image}
                alt={product.name}
                width={600}
                height={500}
                className={`rounded-2xl ${
                  imageOrientation === 'portrait'
                    ? 'w-auto h-full max-h-[600px] object-contain' // Imagen vertical: ajustar a altura
                    : 'w-full h-auto max-h-[500px] object-contain' // Otras: ajustar a ancho
                }`}
                priority
                quality={90}
                unoptimized
              />
            </div>

            {/* ✅ Información del producto */}
            <div className="flex flex-col justify-between">
              {/* Categoría */}
              {product.category && (
                <span className="inline-block w-fit px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--color-accent)]/20 text-[var(--color-accent)] mb-3 md:mb-4">
                  {product.category}
                </span>
              )}

              {/* Nombre */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 md:mb-4">
                {product.name}
              </h1>

              {/* Descripción */}
              {product.description && (
                <p className="text-gray-400 text-base md:text-lg mb-4 md:mb-6 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Precio */}
              <div className="mb-4 md:mb-6">
                <p className="text-5xl md:text-6xl font-black text-[var(--color-accent)] mb-1">
                  €{product.price}
                </p>
                <p className="text-gray-500 text-sm">/ unidad</p>
              </div>

              {/* Stock */}
              <div className="flex items-center justify-between mb-4 md:mb-6 p-3 md:p-4 bg-[#1A1F2E] rounded-xl border-2 border-gray-800">
                <span className="text-gray-400 font-semibold text-sm md:text-base">Stock disponible:</span>
                <span className="text-[var(--color-accent)] font-black text-xl md:text-2xl">
                  {product.stock} unidades
                </span>
              </div>

              {/* Selector de cantidad */}
              <div className="mb-4 md:mb-6">
                <label className="text-gray-400 font-semibold mb-2 md:mb-3 block text-sm md:text-base">Cantidad:</label>
                <div className="flex items-center gap-3 md:gap-4">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#1A1F2E] text-white font-bold text-xl md:text-2xl hover:bg-[var(--color-accent)] hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaMinus className="mx-auto text-sm md:text-base" />
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
                    className="w-16 h-10 md:w-20 md:h-12 text-center text-xl md:text-2xl font-black bg-[#1A1F2E] text-white rounded-xl border-2 border-gray-800 focus:outline-none focus:border-[var(--color-accent)]"
                  />
                  
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#1A1F2E] text-white font-bold text-xl md:text-2xl hover:bg-[var(--color-accent)] hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaPlus className="mx-auto text-sm md:text-base" />
                  </button>
                </div>
              </div>

              {/* Subtotal */}
              <div className="flex items-center justify-between mb-4 md:mb-6 p-3 md:p-4 bg-[var(--color-accent)]/10 rounded-xl border-2 border-[var(--color-accent)]/30">
                <span className="text-white font-bold text-lg md:text-xl">Subtotal:</span>
                <span className="text-[var(--color-accent)] font-black text-2xl md:text-3xl">
                  €{subtotal}
                </span>
              </div>

              {/* Botón añadir */}
              <button
                onClick={handleAddToCart}
                className="w-full py-4 md:py-5 bg-[var(--color-accent)] text-black font-black text-lg md:text-xl rounded-xl hover:bg-white transition-all hover:scale-105 flex items-center justify-center gap-3"
              >
                <FaShoppingCart className="text-xl md:text-2xl" />
                <span>Añadir al Carrito</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}