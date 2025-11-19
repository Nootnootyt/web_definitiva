'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCamera, FaMapMarkerAlt, FaCalendar, FaUser, FaSearchPlus, FaSearchMinus, FaExpand } from 'react-icons/fa';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';

export default function PhotoModal({ photo, isOpen, onClose }) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const imageRef = useRef(null);
  const modalRef = useRef(null);
  
  // Variables para pinch zoom
  const [initialDistance, setInitialDistance] = useState(0);
  const [initialZoom, setInitialZoom] = useState(1);

  // Detectar dispositivo táctil
  useEffect(() => {
    const checkTouch = () => {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      );
    };
    setIsTouchDevice(checkTouch());
  }, []);

  // Reset automático cuando el zoom vuelve a 1
  useEffect(() => {
    if (zoomLevel === 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [zoomLevel]);

  // ✅ CRÍTICO: Bloquear scroll de la página cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      // Guardar posición actual del scroll
      const scrollY = window.scrollY;
      
      // Bloquear scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        // Restaurar scroll
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen || !photo) return null;

  // Calcular distancia entre dos puntos táctiles
  const getTouchDistance = (touches) => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Funciones de zoom con stopPropagation
  const handleZoomIn = (e) => {
    e.stopPropagation();
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    const newZoom = Math.max(zoomLevel - 0.5, 1);
    setZoomLevel(newZoom);
  };

  const handleResetZoom = (e) => {
    e.stopPropagation();
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  // ✅ Zoom con rueda del ratón - MEJORADO para no pasar al fondo
  const handleWheel = (e) => {
    // CRÍTICO: Prevenir TODOS los comportamientos por defecto
    e.preventDefault();
    e.stopPropagation();
    
    const delta = e.deltaY * -0.001;
    const newZoom = Math.min(Math.max(zoomLevel + delta, 1), 3);
    setZoomLevel(newZoom);
  };

  // Drag con ratón
  const handleMouseDown = (e) => {
    e.stopPropagation();
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // ✅ PINCH ZOOM para iPad/iPhone/Tablets
  const handleTouchStart = (e) => {
    e.stopPropagation();
    
    if (e.touches.length === 2) {
      // Pinch zoom iniciado
      const distance = getTouchDistance(e.touches);
      setInitialDistance(distance);
      setInitialZoom(zoomLevel);
    } else if (e.touches.length === 1 && zoomLevel > 1) {
      // Drag con un dedo (solo si hay zoom)
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault(); // ✅ Evitar zoom de página
    e.stopPropagation();
    
    if (e.touches.length === 2) {
      // Pinch zoom en progreso
      const distance = getTouchDistance(e.touches);
      const scale = distance / initialDistance;
      const newZoom = Math.min(Math.max(initialZoom * scale, 1), 3);
      setZoomLevel(newZoom);
    } else if (isDragging && e.touches.length === 1 && zoomLevel > 1) {
      // Drag con un dedo
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setInitialDistance(0);
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="photo-modal fixed inset-0 z-[9998] bg-black overflow-hidden"
        onClick={onClose}
        style={{ touchAction: 'none' }} // ✅ Deshabilitar gestos del navegador
      >
        {/* Botón cerrar */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="cursor-pointer fixed top-4 right-4 md:top-6 md:right-6 z-[9999] w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/80 hover:bg-[var(--color-accent)] text-white hover:text-black transition-all duration-300 flex items-center justify-center backdrop-blur-sm border-2 border-white/10 hover:border-[var(--color-accent)] shadow-2xl"
        >
          <FaTimes size={20} className="md:text-2xl" />
        </button>

        {/* Controles de zoom */}
        <div className="fixed top-4 left-4 md:top-6 md:left-6 z-[9999] flex gap-2">
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3}
            className="cursor-pointer w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/80 hover:bg-[var(--color-accent)] text-white hover:text-black transition-all duration-300 flex items-center justify-center backdrop-blur-sm border-2 border-white/10 hover:border-[var(--color-accent)] disabled:opacity-30 disabled:cursor-not-allowed shadow-xl"
            title="Aumentar zoom"
          >
            <FaSearchPlus size={16} className="md:text-lg" />
          </button>
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 1}
            className="cursor-pointer w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/80 hover:bg-[var(--color-accent)] text-white hover:text-black transition-all duration-300 flex items-center justify-center backdrop-blur-sm border-2 border-white/10 hover:border-[var(--color-accent)] disabled:opacity-30 disabled:cursor-not-allowed shadow-xl"
            title="Reducir zoom"
          >
            <FaSearchMinus size={16} className="md:text-lg" />
          </button>
          <button
            onClick={handleResetZoom}
            disabled={zoomLevel === 1}
            className="cursor-pointer w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/80 hover:bg-[var(--color-accent)] text-white hover:text-black transition-all duration-300 flex items-center justify-center backdrop-blur-sm border-2 border-white/10 hover:border-[var(--color-accent)] disabled:opacity-30 disabled:cursor-not-allowed shadow-xl"
            title="Restablecer zoom"
          >
            <FaExpand size={14} className="md:text-base" />
          </button>
        </div>

        {/* Indicador de zoom */}
        {zoomLevel > 1 && (
          <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-[9999] px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-black/80 text-white text-xs md:text-sm font-bold backdrop-blur-sm border-2 border-white/10 shadow-xl">
            {Math.round(zoomLevel * 100)}%
          </div>
        )}

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full h-full flex items-center justify-center p-0 md:p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col lg:grid lg:grid-cols-[1.5fr,1fr] gap-0 lg:gap-6 w-full h-full max-w-[95vw] max-h-[95vh]">
            
            {/* IMAGEN con zoom */}
            <div 
              className="relative flex items-center justify-center overflow-hidden bg-black h-[70vh] lg:h-full lg:rounded-2xl select-none"
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ 
                cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                touchAction: 'none' // ✅ Deshabilitar zoom del navegador
              }}
            >
              <motion.div
                ref={imageRef}
                animate={{
                  scale: zoomLevel,
                  x: position.x,
                  y: position.y
                }}
                transition={{ type: "spring", stiffness: 200, damping: 30 }}
                className="relative w-full h-full"
              >
                <Image
                  src={photo.image}
                  alt={photo.title}
                  fill
                  className="object-contain pointer-events-none"
                  priority
                  quality={100}
                  unoptimized
                  draggable={false}
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </motion.div>

              {/* ✅ Hint adaptativo - Solo visible para NO táctiles */}
              {zoomLevel === 1 && !isTouchDevice && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="hidden md:block absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 text-white text-xs backdrop-blur-sm border border-white/10"
                >
                  Usa la rueda del ratón para hacer zoom
                </motion.div>
              )}

              {/* ✅ Hint para dispositivos táctiles */}
              {zoomLevel === 1 && isTouchDevice && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 text-white text-xs backdrop-blur-sm border border-white/10"
                >
                  Pellizca para hacer zoom
                </motion.div>
              )}
            </div>

            {/* INFORMACIÓN */}
            <div className="flex-1 flex flex-col space-y-4 md:space-y-6 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gradient-to-b from-gray-900/95 to-black lg:rounded-2xl lg:bg-gradient-to-br lg:from-gray-900/50 lg:to-black/50 backdrop-blur-sm border-t lg:border lg:border-white/5 h-[30vh] lg:h-full">
              <div>
                <span className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold">
                  {photo.category}
                </span>
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white mt-2 mb-3 leading-tight">
                  {photo.title}
                </h2>
                <p className="text-gray-300 text-sm md:text-base lg:text-lg leading-relaxed">
                  {photo.description}
                </p>
              </div>

              {/* Metadatos */}
              <div className="space-y-3 pt-4 border-t border-gray-800">
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center flex-shrink-0">
                    <FaUser className="text-[var(--color-accent)] text-sm md:text-base" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Autor</p>
                    <p className="text-white font-semibold text-sm md:text-base">{photo.author}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center flex-shrink-0">
                    <FaCalendar className="text-[var(--color-accent)] text-sm md:text-base" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Fecha</p>
                    <p className="text-white font-semibold text-sm md:text-base">
                      {new Date(photo.date).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-400">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="text-[var(--color-accent)] text-sm md:text-base" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Ubicación</p>
                    <p className="text-white font-semibold text-sm md:text-base">{photo.location}</p>
                  </div>
                </div>

                {photo.camera && (
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center flex-shrink-0">
                      <FaCamera className="text-[var(--color-accent)] text-sm md:text-base" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Cámara</p>
                      <p className="text-white font-semibold text-sm md:text-base">{photo.camera}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}