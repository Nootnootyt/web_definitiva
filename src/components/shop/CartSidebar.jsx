'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaTrash, FaMinus, FaPlus, FaShoppingBag } from 'react-icons/fa';
import { useCartStore } from '@/lib/cartStore';
import { useState } from 'react';
import CheckoutModal from './CheckoutModal';
import Image from 'next/image'; // ✅ IMPORTAR

export default function CartSidebar() {
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getTotal = useCartStore((state) => state.getTotal);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckout = () => {
    setShowCheckout(true);
    closeCart();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCart}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 h-full w-full sm:w-[500px] glass-strong z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <FaShoppingBag className="text-2xl text-[var(--color-accent)]" />
                  <div>
                    <h2 className="text-2xl font-black text-white">Tu Carrito</h2>
                    <p className="text-sm text-gray-400">{items.length} productos</p>
                  </div>
                </div>
                <button
                  onClick={closeCart}
                  className="w-10 h-10 rounded-full glass-accent hover:bg-red-500 transition-colors flex items-center justify-center"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <FaShoppingBag className="text-6xl text-gray-700 mb-4" />
                    <p className="text-gray-400 text-lg">Tu carrito está vacío</p>
                    <button
                      onClick={closeCart}
                      className="mt-6 px-6 py-3 bg-[var(--color-accent)] text-black font-bold rounded-lg hover:bg-white transition-colors"
                    >
                      Ir a la tienda
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="glass rounded-xl p-4 relative"
                      >
                        <div className="flex gap-4">
                          {/* ✅ IMAGEN OPTIMIZADA */}
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <h3 className="font-bold text-white mb-1 line-clamp-1">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-400 mb-2">
                              €{item.price.toFixed(2)} / unidad
                            </p>

                            {/* Cantidad */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-7 h-7 rounded-full glass-accent hover:bg-[var(--color-accent)] hover:text-black transition-all text-xs"
                              >
                                <FaMinus className="mx-auto" />
                              </button>
                              <span className="text-white font-bold w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-7 h-7 rounded-full glass-accent hover:bg-[var(--color-accent)] hover:text-black transition-all text-xs"
                              >
                                <FaPlus className="mx-auto" />
                              </button>
                            </div>
                          </div>

                          {/* Precio y eliminar */}
                          <div className="flex flex-col items-end justify-between">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="w-8 h-8 rounded-full glass-accent hover:bg-red-500 transition-colors flex items-center justify-center text-sm"
                            >
                              <FaTrash />
                            </button>
                            <span className="text-xl font-black text-[var(--color-accent)]">
                              €{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer con total */}
              {items.length > 0 && (
                <div className="p-6 border-t border-gray-800 space-y-4">
                  {/* Resumen */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal:</span>
                      <span>€{getTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Envío:</span>
                      <span className="text-green-500 font-semibold">GRATIS</span>
                    </div>
                    <div className="h-px bg-gray-800 my-2" />
                    <div className="flex justify-between text-white text-2xl font-black">
                      <span>Total:</span>
                      <span className="text-[var(--color-accent)]">€{getTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Botón checkout */}
                  <button
                    onClick={handleCheckout}
                    className="w-full py-4 bg-[var(--color-accent)] text-black font-bold text-lg rounded-xl hover:bg-white transition-colors"
                  >
                    Realizar Pedido
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal onClose={() => setShowCheckout(false)} />
      )}
    </>
  );
}