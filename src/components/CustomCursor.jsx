'use client';
import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  
  // Motion values para el cursor
  const cursorX = useMotionValue(-100); // Iniciar fuera de pantalla
  const cursorY = useMotionValue(-100);
  
  // Configuración de física: Más tensa para mayor precisión (Estilo OS)
  // Menos 'mass' y más 'stiffness' eliminan la sensación de "lag" o borrachera
  const springConfig = { 
    damping: 40,
    stiffness: 600, 
    mass: 0.1,
  };
  
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const checkTouchDevice = () => {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      );
    };
    
    setIsTouchDevice(checkTouchDevice());
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;

    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleHoverElements = () => {
      const hoverableElements = document.querySelectorAll(
        'button, a, input, textarea, [role="button"], .cursor-pointer'
      );

      hoverableElements.forEach((el) => {
        el.addEventListener('mouseenter', () => setIsHovering(true));
        el.addEventListener('mouseleave', () => setIsHovering(false));
      });
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    handleHoverElements();

    const observer = new MutationObserver(handleHoverElements);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      observer.disconnect();
    };
  }, [isTouchDevice, cursorX, cursorY]);

  if (!isMounted || isTouchDevice) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{
        x: smoothX,
        y: smoothY,
        // No centramos (-50%) para que la punta de la flecha sea el punto de click exacto
      }}
    >
      <motion.div
        animate={{
          scale: isClicking ? 0.9 : isHovering ? 1.1 : 1,
          rotate: isClicking ? -10 : 0, // Pequeña rotación al hacer click (feedback)
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="relative"
      >
        {/* ESTÉTICA LIQUID GLASS / CRISTAL LÍQUIDO 
          SVG de flecha personalizada.
        */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          // Sombra para dar profundidad 3D y separarlo del fondo
          className="drop-shadow-xl"
          style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))' }}
        >
          <path
            d="M3.5 3.5L10.5 20.5L13.5 13.5L20.5 10.5L3.5 3.5Z"
            // Relleno: Tu color verde accent (#b7ff00) pero semitransparente
            fill="rgba(183, 255, 0, 0.35)" 
            stroke="rgba(255, 255, 255, 0.8)" // Borde blanco casi opaco para efecto cristal
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Brillo interno (simulación de reflejo de cristal) */}
          <path
            d="M5 6L9 16L11 11L16 9L5 6Z"
            fill="rgba(255, 255, 255, 0.1)"
          />
        </svg>

        {/* Efecto de desenfoque (Backdrop Blur) dentro de la flecha 
            Nota: backdrop-filter en SVG es complejo, usamos un div detrás con la misma forma 
            o confiamos en la transparencia del SVG para simularlo. 
            Para un efecto de cristal real en CSS dentro de una forma SVG compleja, 
            la transparencia + borde blanco + sombra suele ser más performante y visualmente similar.
        */}
        
      </motion.div>
    </motion.div>
  );
}