'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCamera, FaMapMarkerAlt, FaCalendar, FaUser } from 'react-icons/fa';

export default function PhotoModal({ photo, isOpen, onClose }) {
  if (!isOpen || !photo) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="photo-modal fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/95"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative max-w-7xl w-full bg-gray-900 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="cursor-pointer absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-black/50 hover:bg-[var(--color-accent)] text-white hover:text-black transition-all duration-300 flex items-center justify-center"
          >
            <FaTimes size={20} />
          </button>

          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Imagen - TAMAÑO COMPLETO sin recortar */}
            <div className="flex items-center justify-center bg-gray-800 rounded-2xl p-4">
              <img
                src={photo.image}
                alt={photo.title}
                className="w-full h-auto max-h-[600px] object-contain rounded-2xl"
              />
            </div>

            {/* Información */}
            <div className="flex flex-col justify-center space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold">
                  {photo.category}
                </span>
                <h2 className="text-4xl md:text-5xl font-black text-white mt-2 mb-4">
                  {photo.title}
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {photo.description}
                </p>
              </div>

              {/* Metadatos */}
              <div className="space-y-3 pt-6 border-t border-gray-700">
                <div className="flex items-center gap-3 text-gray-400">
                  <FaUser className="text-[var(--color-accent)]" />
                  <span>{photo.author}</span>
                </div>
                
                <div className="flex items-center gap-3 text-gray-400">
                  <FaCalendar className="text-[var(--color-accent)]" />
                  <span>{new Date(photo.date).toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-400">
                  <FaMapMarkerAlt className="text-[var(--color-accent)]" />
                  <span>{photo.location}</span>
                </div>

                {photo.camera && (
                  <div className="flex items-center gap-3 text-gray-400">
                    <FaCamera className="text-[var(--color-accent)]" />
                    <span>{photo.camera}</span>
                  </div>
                )}
              </div>

              {/* Configuración de cámara */}
              {photo.settings && (
                <div className="pt-4 border-t border-gray-700">
                  <h3 className="text-sm uppercase tracking-wider text-[var(--color-accent)] font-semibold mb-2">
                    Configuración
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-gray-300">
                    <div className="bg-gray-800 px-4 py-2 rounded-lg">
                      <span className="text-xs text-gray-500">Lente</span>
                      <p className="text-sm font-medium">{photo.lens}</p>
                    </div>
                    <div className="bg-gray-800 px-4 py-2 rounded-lg">
                      <span className="text-xs text-gray-500">Ajustes</span>
                      <p className="text-sm font-medium">{photo.settings}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
