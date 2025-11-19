'use client';
import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  
  // Posición del ratón
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Configuración de física "Liquid": 
  // Un poco más de 'damping' y 'mass' para que se sienta como un objeto de cristal sólido
  const springConfig = { 
    damping: 30,
    stiffness: 400, 
    mass: 0.15, 
  };
  
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  // Rotación dinámica basada en el movimiento (efecto inercia sutil)
  const velocityX = useMotionValue(0);
  const rotateX = useTransform(velocityX, [-1000, 1000], [-15, 15]);

  useEffect(() => {
    setIsMounted(true);
    const checkTouch = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(checkTouch());
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;

    let lastX = 0;
    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      
      // Calcular velocidad para inclinar un poco la flecha
      const vel = e.clientX - lastX;
      velocityX.set(vel * 10); // Amplificar para el efecto
      lastX = e.clientX;
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
  }, [isTouchDevice, cursorX, cursorY, velocityX]);

  if (!isMounted || isTouchDevice) return null;

  // Definimos la forma de la flecha (Path SVG) una vez para reusarla en el clip-path y el borde
  // Es una flecha más "gordita" y redondeada estilo Apple
  const arrowPath = "M6.5 2C8.5 0.5 11.5 0.5 13.5 2L28 13.5C30.5 15.5 30.5 19.5 28 21.5L18 29.5L15 38C14 41 10 41 9 38L2 13.5C1.5 11.5 2.5 9.5 4 8.5L6.5 2Z";

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{
        x: smoothX,
        y: smoothY,
        rotate: rotateX, // Inercia sutil
        filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.2))" // Sombra externa profunda
      }}
    >
      <motion.div
        animate={{
          scale: isClicking ? 0.85 : isHovering ? 1.1 : 1,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="relative w-12 h-12" // Tamaño GRANDE (48px)
      >
        {/* CAPA 1: EL CRISTAL (Blur + Color) 
            Usamos clip-path para recortar el div con backdrop-filter
        */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            // La magia del cristal:
            backdropFilter: 'blur(8px) brightness(1.1)', 
            WebkitBackdropFilter: 'blur(8px) brightness(1.1)',
            backgroundColor: 'rgba(183, 255, 0, 0.25)', // Tu verde característico (#b7ff00) con transparencia
            clipPath: `path('${arrowPath}')`,
          }}
        />

        {/* CAPA 2: EL BRILLO Y BORDE (SVG Overlay)
            Esto añade el borde blanco, el brillo especular y la definición
        */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 36 46" // Ajustado para que la flecha quepa bien
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
        >
          {/* Borde interior brillante para efecto 3D */}
          <path
            d={arrowPath}
            stroke="rgba(255, 255, 255, 0.9)"
            strokeWidth="1.5"
            fill="url(#glassGradient)" // Relleno degradado sutil
          />
          
          {/* Definición de degradados para el brillo "Liquid" */}
          <defs>
            <linearGradient id="glassGradient" x1="0" y1="0" x2="36" y2="46" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="white" stopOpacity="0.4" />
              <stop offset="40%" stopColor="white" stopOpacity="0.1" />
              <stop offset="100%" stopColor="rgba(183, 255, 0, 0.1)" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* CAPA 3: BRILLO "GLOSS" SUPERIOR 
            Un pequeño óvalo blanco en la parte superior para simular reflejo de luz
        */}
        <div 
          style={{
            position: 'absolute',
            top: '5px',
            left: '8px',
            width: '14px',
            height: '20px',
            borderRadius: '50%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 100%)',
            transform: 'rotate(-15deg)',
            filter: 'blur(2px)',
            opacity: 0.8,
            pointerEvents: 'none'
          }}
        />
      </motion.div>
    </motion.div>
  );
}