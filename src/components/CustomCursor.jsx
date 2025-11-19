'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function LiquidGlassCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  // Posición del ratón
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Configuración física suave
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
      els.forEach((el) => {
        el.addEventListener('mouseenter', () => setIsHovering(true));
        el.addEventListener('mouseleave', () => setIsHovering(false));
      });
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

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
      style={{
        x: smoothX,
        y: smoothY,
        translateX: -32, // Offset para centrar la punta de la flecha
        translateY: -24,
        position: 'fixed',
        top: 0,
        left: 0,
        width: 64,
        height: 48,
        zIndex: 9999,
        pointerEvents: 'none',
        userSelect: 'none',
        willChange: 'transform',
      }}
      animate={{
        scale: isHovering || isClicking ? 1.1 : 1,
        opacity: isHovering ? 0.9 : 1,
      }}
      transition={{ duration: 0.1 }}
    >
      {/* SVG para la forma de flecha Windows con efectos de liquid glass */}
      <svg
        width="64"
        height="48"
        viewBox="0 0 64 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))', // Halo sutil azulado
          backdropFilter: 'blur(10px) saturate(1.2)', // Efecto de cristal translúcido
          background: 'rgba(255, 255, 255, 0.1)', // Base translúcida
        }}
      >
        {/* Definición de clip-path para la forma de flecha clásica de Windows */}
        <defs>
          <clipPath id="arrowClip">
            <path d="M0 0 L64 24 L0 48 L12 24 Z" /> {/* Triángulo principal con remate inferior */}
          </clipPath>
          {/* Filtro para refracción/simulación de cristal curvado */}
          <filter id="glassRefraction" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blurred" />
            <feDisplacementMap
              in="blurred"
              in2="SourceGraphic"
              scale="5"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feMerge>
              <feMergeNode in="displaced" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Filtro para highlights y bordes refractados */}
          <filter id="highlightRefraction">
            <feGaussianBlur stdDeviation="1" result="highlightBlur" />
            <feFlood floodColor="rgba(255, 255, 255, 0.6)" floodOpacity="0.5" result="highlightColor" />
            <feComposite in="highlightColor" in2="highlightBlur" operator="in" result="highlight" />
            <feMerge>
              <feMergeNode in="highlight" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Capa base translúcida con gradiente */}
        <g clipPath="url(#arrowClip)">
          <rect width="64" height="48" fill="url(#baseGradient)" filter="url(#glassRefraction)" />
        </g>

        {/* Gradiente base para translucidez */}
        <defs>
          <linearGradient id="baseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.15)" />
            <stop offset="50%" stopColor="rgba(255, 255, 255, 0.05)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.1)" />
          </linearGradient>
        </defs>

        {/* Borde principal con refracción (simulando cristal curvado) */}
        <path
          d="M0 0 L64 24 L0 48 L12 24 Z"
          stroke="rgba(0, 0, 0, 0.2)"
          strokeWidth="1"
          fill="none"
          filter="url(#glassRefraction)"
          opacity="0.8"
        />

        {/* Highlight superior para efecto de luz en cristal */}
        <path
          d="M0 0 L64 24 L32 12 Z"
          fill="url(#highlightGradient)"
          filter="url(#highlightRefraction)"
          opacity="0.7"
        />

        {/* Gradiente para highlight */}
        <defs>
          <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.8)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.2)" />
          </linearGradient>
        </defs>

        {/* Reflejos internos elípticos (gota de agua en bordes) */}
        <ellipse
          cx="20"
          cy="24"
          rx="8"
          ry="4"
          fill="rgba(255, 255, 255, 0.3)"
          filter="url(#highlightRefraction)"
          opacity="0.6"
        />

        {/* Borde exterior sutil para rematar el cristal */}
        <path
          d="M0 0 L64 24 L0 48 L12 24 Z"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="0.5"
          fill="none"
        />

        {/* Efecto de refracción en bordes inferiores (gota-like) */}
        <path
          d="M0 48 L12 24 L0 36 Z"
          fill="rgba(59, 130, 246, 0.1)" // Tono azulado sutil
          filter="url(#glassRefraction)"
          opacity="0.5"
        />
      </svg>

      {/* Ocultar cursor por defecto */}
      <style jsx global>{`
        body { cursor: none; }
      `}</style>
    </motion.div>
  );
}
