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
  
  const [initialDistance, setInitialDistance] = useState(0);
  const [initialZoom, setInitialZoom] = useState(1);

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

  useEffect(() => {
    if (zoomLevel === 1) {
      setPosition({ x: 0, y: 0 });
    }
  }, [zoomLevel]);

  // 🚀 OPTIMIZACIÓN: Bloquear scroll con clase en body
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

  if (!isOpen || !photo) return null;

  const getTouchDistance = (touches) => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

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

  const handleWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const delta = e.deltaY * -0.001;
    const newZoom = Math.min(Math.max(zoomLevel + delta, 1), 3);
    setZoomLevel(newZoom);
  };

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

  const handleTouchStart = (e) => {
    e.stopPropagation();
    
    if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      setInitialDistance(distance);
      setInitialZoom(zoomLevel);
    } else if (e.touches.length === 1 && zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      const scale = distance / initialDistance;
      const newZoom = Math.min(Math.max(initialZoom * scale, 1), 3);
      setZoomLevel(newZoom);
    } else if (isDragging && e.touches.length === 1 && zoomLevel > 1) {
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
        transition={{ duration: 0.2, ease: 'easeOut' }} // 🚀 Transición más rápida
        className="photo-modal modal-active fixed inset-0 z-[9998] bg-black/95 backdrop-blur-sm overflow-hidden"
        onClick={onClose}
        style={{ 
          touchAction: 'none',
          willChange: 'opacity' // 🚀 Hint para GPU
        }}
      >
        {/* Botón cerrar */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="cursor-pointer fixed top-4 right-4 md:top-6 md:right-6 z-[9999] w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#0A0F1C]/90 hover:bg-[var(--color-accent)] text-white hover:text-black transition-colors flex items-center justify-center shadow-2xl"
          style={{ willChange: 'transform' }} // 🚀 GPU hint
        >
          <FaTimes size={20} className="md:text-2xl" />
        </button>

        {/* Controles de zoom */}
        <div className="fixed top-4 left-4 md:top-6 md:left-6 z-[9999] flex gap-2">
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3}
            className="cursor-pointer w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#0A0F1C]/90 hover:bg-[var(--color-accent)] text-white hover:text-black transition-all duration-200 flex items-center justify-center shadow-lg disabled:opacity-30"
            title="Aumentar zoom"
            style={{ willChange: 'transform' }}
          >
            <FaSearchPlus size={16} className="md:text-lg" />
          </button>
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 1}
            className="cursor-pointer w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#0A0F1C]/90 hover:bg-[var(--color-accent)] text-white hover:text-black transition-all duration-200 flex items-center justify-center shadow-lg disabled:opacity-30"
            title="Reducir zoom"
            style={{ willChange: 'transform' }}
          >
            <FaSearchMinus size={16} className="md:text-lg" />
          </button>
          <button
            onClick={handleResetZoom}
            disabled={zoomLevel === 1}
            className="cursor-pointer w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#0A0F1C]/90 hover:bg-[var(--color-accent)] text-white hover:text-black transition-all duration-200 flex items-center justify-center shadow-lg disabled:opacity-30"
            title="Restablecer zoom"
            style={{ willChange: 'transform' }}
          >
            <FaExpand size={14} className="md:text-base" />
          </button>
        </div>

        {/* Indicador de zoom */}
        {zoomLevel > 1 && (
          <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-[9999] px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-[#0A0F1C]/90 text-white text-xs md:text-sm font-bold backdrop-blur-sm border border-[var(--color-accent)]/30">
            {Math.round(zoomLevel * 100)}%
          </div>
        )}

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, // 🚀 Spring más rápido
            damping: 30,
            duration: 0.3
          }}
          className="relative w-full h-full flex items-center justify-center p-4 md:p-6"
          onClick={(e) => e.stopPropagation()}
          style={{ willChange: 'transform, opacity' }} // 🚀 GPU hint
        >
          <div className="flex flex-col lg:grid lg:grid-cols-[2fr,auto] gap-4 lg:gap-6 w-full h-full max-w-[1800px]">
            
            {/* IMAGEN */}
            <div 
              className="relative flex items-center justify-center overflow-hidden h-[65vh] lg:h-full rounded-2xl select-none bg-[#0A0F1C]/95 backdrop-blur-md border-2 border-[var(--color-accent)]/20 shadow-2xl"
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
                touchAction: 'none',
                contain: 'layout style paint', // 🚀 Aislar re-renders
                willChange: zoomLevel > 1 ? 'transform' : 'auto' // 🚀 Hint condicional
              }}
            >
              <motion.div
                ref={imageRef}
                animate={{
                  scale: zoomLevel,
                  x: position.x,
                  y: position.y
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 250, // 🚀 Más responsive
                  damping: 25
                }}
                className="relative w-full h-full"
                style={{ willChange: 'transform' }} // 🚀 GPU
              >
                <Image
                  src={photo.image}
                  alt={photo.title}
                  fill
                  className="object-contain pointer-events-none rounded-xl"
                  priority
                  quality={90} // 🚀 Reducir calidad ligeramente para mejor performance
                  unoptimized
                  draggable={false}
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </motion.div>

              {/* Hints de zoom */}
              {zoomLevel === 1 && !isTouchDevice && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="hidden md:block absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full bg-[#0A0F1C]/80 text-white text-xs backdrop-blur-md border border-[var(--color-accent)]/30"
                >
                  Usa la rueda del ratón para hacer zoom
                </motion.div>
              )}

              {zoomLevel === 1 && isTouchDevice && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full bg-[#0A0F1C]/80 text-white text-xs backdrop-blur-md border border-[var(--color-accent)]/30"
                >
                  Pellizca para hacer zoom
                </motion.div>
              )}
            </div>

            {/* INFORMACIÓN */}
            <div 
              className="flex flex-col justify-center space-y-4 overflow-y-auto p-6 lg:p-8 bg-[#0A0F1C]/95 rounded-2xl backdrop-blur-md border-2 border-[var(--color-accent)]/20 shadow-2xl lg:w-[400px] xl:w-[450px]"
              style={{ 
                contain: 'layout style', // 🚀 Aislar del resto
                overscrollBehavior: 'contain'
              }}
            >
              
              <div className="space-y-3">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-[var(--color-accent)]/20 text-[var(--color-accent)] border border-[var(--color-accent)]/30">
                  {photo.category}
                </span>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight">
                  {photo.title}
                </h2>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                  {photo.description}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-[var(--color-accent)]/20">
                
                {/* Autor */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[var(--color-accent)]/5 to-transparent border border-[var(--color-accent)]/10">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center flex-shrink-0 border border-[var(--color-accent)]/30">
                    <FaUser className="text-[var(--color-accent)] text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Autor</p>
                    <p className="text-white font-bold text-sm truncate">{photo.author}</p>
                  </div>
                </div>
                
                {/* Fecha */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[var(--color-accent)]/5 to-transparent border border-[var(--color-accent)]/10">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center flex-shrink-0 border border-[var(--color-accent)]/30">
                    <FaCalendar className="text-[var(--color-accent)] text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Fecha</p>
                    <p className="text-white font-bold text-sm">
                      {new Date(photo.date).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                {/* Ubicación */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[var(--color-accent)]/5 to-transparent border border-[var(--color-accent)]/10">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center flex-shrink-0 border border-[var(--color-accent)]/30">
                    <FaMapMarkerAlt className="text-[var(--color-accent)] text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Ubicación</p>
                    <p className="text-white font-bold text-sm truncate">{photo.location}</p>
                  </div>
                </div>

                {/* Cámara */}
                {photo.camera && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[var(--color-accent)]/5 to-transparent border border-[var(--color-accent)]/10">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center flex-shrink-0 border border-[var(--color-accent)]/30">
                      <FaCamera className="text-[var(--color-accent)] text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Cámara</p>
                      <p className="text-white font-bold text-sm truncate">{photo.camera}</p>
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