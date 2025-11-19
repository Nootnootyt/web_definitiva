'use client';
import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  
  // Posición del ratón
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Configuración de física "Liquid Glass": suave y fluido
  const springConfig = { 
    damping: 25,
    stiffness: 350, 
    mass: 0.2, 
  };
  
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    setIsMounted(true);
    const checkTouch = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(checkTouch());
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
      const els = document.querySelectorAll('button, a, input, textarea, .cursor-pointer');
      els.forEach(el => {
        el.addEventListener('mouseenter', () => setIsHovering(true));
        el.addEventListener('mouseleave', () => setIsHovering(false));
      });
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    
    // Observer para detectar nuevos elementos interactivos
    const observer = new MutationObserver(handleHoverElements);
    observer.observe(document.body, { childList: true, subtree: true });
    handleHoverElements();

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
        translateX: '-20%',
        translateY: '-15%',
      }}
    >
      <motion.div
        animate={{
          scale: isClicking ? 0.88 : isHovering ? 1.15 : 1,
        }}
        transition={{ type: 'spring', stiffness: 450, damping: 28 }}
        className="relative"
        style={{
          width: '56px',
          height: '68px',
          filter: 'drop-shadow(0px 12px 24px rgba(0, 0, 0, 0.25)) drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.15))',
        }}
      >
        {/* SVG Container con forma de flecha */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 56 68"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', inset: 0 }}
        >
          <defs>
            {/* Gradiente principal del cristal verde */}
            <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(183, 255, 0, 0.45)" />
              <stop offset="50%" stopColor="rgba(183, 255, 0, 0.28)" />
              <stop offset="100%" stopColor="rgba(183, 255, 0, 0.35)" />
            </linearGradient>

            {/* Gradiente para el brillo superior (highlight) */}
            <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.85)" />
              <stop offset="60%" stopColor="rgba(255, 255, 255, 0.4)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
            </linearGradient>

            {/* Gradiente para el reflejo tipo iOS (iridiscencia sutil) */}
            <radialGradient id="iridescent" cx="30%" cy="30%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.6)" />
              <stop offset="40%" stopColor="rgba(200, 255, 150, 0.3)" />
              <stop offset="80%" stopColor="rgba(183, 255, 0, 0.15)" />
              <stop offset="100%" stopColor="rgba(183, 255, 0, 0)" />
            </radialGradient>

            {/* Filtro blur para el efecto de refracción */}
            <filter id="glassBlur">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" />
            </filter>

            {/* Máscara para la forma de la flecha con bordes redondeados */}
            <clipPath id="arrowClip">
              <path d="M 8 4 
                       C 6 2, 4 2, 3 4
                       L 3 42
                       L 14 53
                       C 15 54, 16 54, 17 53
                       L 19 48
                       L 26 48
                       C 28 48, 29 46, 28 44
                       L 20 28
                       L 48 12
                       C 51 10, 52 6, 49 4
                       C 47 2, 44 3, 42 5
                       L 15 24
                       L 15 8
                       C 15 6, 13 4, 11 4
                       L 8 4 Z"
                     style={{
                       strokeLinejoin: 'round',
                     }}
              />
            </clipPath>
          </defs>

          {/* Capa de fondo del cristal con gradiente verde */}
          <g clipPath="url(#arrowClip)">
            {/* Base del cristal */}
            <rect 
              width="100%" 
              height="100%" 
              fill="url(#glassGradient)"
            />
            
            {/* Capa de iridiscencia */}
            <rect 
              width="100%" 
              height="100%" 
              fill="url(#iridescent)"
              opacity="0.7"
            />
          </g>

          {/* Borde del cristal con efecto brillante */}
          <path 
            d="M 8 4 
               C 6 2, 4 2, 3 4
               L 3 42
               L 14 53
               C 15 54, 16 54, 17 53
               L 19 48
               L 26 48
               C 28 48, 29 46, 28 44
               L 20 28
               L 48 12
               C 51 10, 52 6, 49 4
               C 47 2, 44 3, 42 5
               L 15 24
               L 15 8
               C 15 6, 13 4, 11 4
               L 8 4 Z"
            stroke="rgba(255, 255, 255, 0.6)"
            strokeWidth="1.2"
            fill="none"
            strokeLinejoin="round"
          />

          {/* Brillo interno superior (highlight) */}
          <path 
            d="M 8 5 
               L 8 20
               L 35 8
               L 42 6
               C 44 5, 45 5, 43 6
               L 15 20
               L 10 20
               C 8 20, 7 18, 7 16
               L 7 7
               C 7 5, 8 4, 8 5 Z"
            fill="url(#highlightGradient)"
            opacity="0.8"
            filter="url(#glassBlur)"
          />

          {/* Reflejos adicionales tipo liquid glass */}
          <ellipse 
            cx="12" 
            cy="12" 
            rx="5" 
            ry="8" 
            fill="rgba(255, 255, 255, 0.5)"
            filter="url(#glassBlur)"
          />
          
          <ellipse 
            cx="18" 
            cy="30" 
            rx="3" 
            ry="6" 
            fill="rgba(255, 255, 255, 0.25)"
            filter="url(#glassBlur)"
          />

          {/* Borde externo sutil para definición */}
          <path 
            d="M 8 4 
               C 6 2, 4 2, 3 4
               L 3 42
               L 14 53
               C 15 54, 16 54, 17 53
               L 19 48
               L 26 48
               C 28 48, 29 46, 28 44
               L 20 28
               L 48 12
               C 51 10, 52 6, 49 4
               C 47 2, 44 3, 42 5
               L 15 24
               L 15 8
               C 15 6, 13 4, 11 4
               L 8 4 Z"
            stroke="rgba(183, 255, 0, 0.4)"
            strokeWidth="0.5"
            fill="none"
            strokeLinejoin="round"
          />
        </svg>

        {/* Capa adicional con backdrop-filter para efecto de cristal real sobre el fondo */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backdropFilter: 'blur(12px) saturate(1.3) brightness(1.1)',
            WebkitBackdropFilter: 'blur(12px) saturate(1.3) brightness(1.1)',
            clipPath: `path('M 8 4 C 6 2, 4 2, 3 4 L 3 42 L 14 53 C 15 54, 16 54, 17 53 L 19 48 L 26 48 C 28 48, 29 46, 28 44 L 20 28 L 48 12 C 51 10, 52 6, 49 4 C 47 2, 44 3, 42 5 L 15 24 L 15 8 C 15 6, 13 4, 11 4 L 8 4 Z')`,
            opacity: 0.6,
          }}
        />
      </motion.div>
    </motion.div>
  );
}