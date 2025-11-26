'use client';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaEdit, FaTrash, FaInfoCircle } from 'react-icons/fa';
import { useCartStore } from '@/lib/cartStore';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import ProductModal from './ProductModal';
import Image from 'next/image';

export default function ProductCard({ product, isAdmin, onEdit, onDelete }) {
  const [showModal, setShowModal] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e) => {
    e.stopPropagation(); // ✅ Evitar abrir modal al añadir al carrito
    addItem(product);
    toast.success(`${product.name} añadido al carrito`);
  };

  const handleEdit = (e) => {
    e.stopPropagation(); // ✅ Evitar abrir modal
    onEdit(product);
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // ✅ Evitar abrir modal
    onDelete(product);
  };

  return (
    <>
      {/* ✅ Toda la tarjeta es clickable */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setShowModal(true)} // ✅ Click en cualquier parte abre modal
        className="cursor-pointer group relative glass rounded-2xl overflow-hidden hover:glass-accent transition-all duration-300"
      >
        {/* Botones de admin (esquina superior derecha) */}
        {isAdmin && (
          <div className="absolute top-3 right-3 z-10 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleEdit}
              className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-lg transition-colors"
            >
              <FaEdit />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDelete}
              className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-colors"
            >
              <FaTrash />
            </motion.button>
          </div>
        )}

        {/* IMAGEN OPTIMIZADA */}
        <div className="relative h-64 overflow-hidden bg-gray-900">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* ✅ Indicador visual de que es clickable */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 rounded-full bg-[var(--color-accent)]/90 flex items-center justify-center backdrop-blur-sm">
              <FaInfoCircle className="text-2xl text-black" />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-white line-clamp-1">{product.name}</h3>
            <span className="text-2xl font-black text-[var(--color-accent)]">
              €{product.price}
            </span>
          </div>

          {product.description && (
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
              {product.description}
            </p>
          )}

          {product.category && (
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-accent)]/20 text-[var(--color-accent)] mb-4">
              {product.category}
            </span>
          )}

          {/* ✅ Solo botón de añadir al carrito (más grande y prominente) */}
          <button
            onClick={handleAddToCart}
            className="w-full px-4 py-3 bg-[var(--color-accent)] text-black font-bold rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            <FaShoppingCart />
            <span>Añadir al Carrito</span>
          </button>
        </div>
      </motion.div>

      <ProductModal
        product={product}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}