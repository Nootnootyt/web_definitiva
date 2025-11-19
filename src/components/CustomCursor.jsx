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

  // Config física suave
  const springConfig = {
    damping: 25,
    stiffness: 350,
    mass: 0.2,
  };

  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    setIsMounted(true);
    const checkTouch = () =>
      'ontouchstart' in window || navigator.maxTouchPoints > 0;
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
      const els = document.querySelectorAll(
        'button, a, input, textarea, .cursor-pointer'
      );
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
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{
        x: smoothX,
        y: smoothY,
        // Ajuste para que el vértice de la flecha sea la “punta” real
        translateX: '-10%',
        translateY: '-5%',
      }}
    >
      <motion.div
        animate={{
          scale: isClicking ? 0.9 : isHovering ? 1.15 : 1,
        }}
        transition={{ type: 'spring', stiffness: 450, damping: 28 }}
        className="relative"
        style={{
          // Cursor grande para apreciar bien los efectos
          width: '72px',
          height: '96px',
          filter:
            'drop-shadow(0px 18px 32px rgba(0, 0, 0, 0.35)) drop-shadow(0px 6px 12px rgba(0, 0, 0, 0.18))',
        }}
      >
        {/* Flecha tipo Windows pero con estética cristal / liquid glass */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 72 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', inset: 0 }}
        >
          <defs>
            {/* Gradiente principal: cristal neutro translúcido */}
            <linearGradient id="cursorGlassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.80)" />
              <stop offset="40%" stopColor="rgba(230,240,255,0.40)" />
              <stop offset="100%" stopColor="rgba(210,225,255,0.15)" />
            </linearGradient>

            {/* Halo de color muy sutil (tono azulado / púrpura tipo iOS) */}
            <radialGradient id="cursorIridescence" cx="30%" cy="20%" r="80%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
              <stop offset="35%" stopColor="rgba(210,230,255,0.5)" />
              <stop offset="70%" stopColor="rgba(150,190,255,0.25)" />
              <stop offset="100%" stopColor="rgba(120,170,255,0)" />
            </radialGradient>

            {/* Highlight superior */}
            <linearGradient id="cursorHighlightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="45%" stopColor="rgba(255,255,255,0.55)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>

            {/* Borde interior frío (refracción) */}
            <linearGradient id="cursorEdgeRefraction" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(180,210,255,0.85)" />
              <stop offset="35%" stopColor="rgba(140,180,255,0.55)" />
              <stop offset="70%" stopColor="rgba(100,160,255,0.3)" />
              <stop offset="100%" stopColor="rgba(70,130,255,0.2)" />
            </linearGradient>

            {/* Blur para reflejos internos */}
            <filter id="cursorGlassBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" />
            </filter>

            {/* Blur ligero para la línea de refracción */}
            <filter id="cursorEdgeSoft">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" />
            </filter>

            {/* ClipPath con forma de flecha clásica de Windows, pero suavizada */}
            <clipPath id="cursorArrowClip">
              {/* 
                Forma inspirada en el cursor Windows:
                - Triángulo principal
                - Remate de “cola” inferior
                - Esquinas suavizadas para que encaje con el estilo “liquid glass”
              */}
              <path
                d="
                  M 8 6
                  L 8 72
                  L 24 58
                  L 32 80
                  Q 33 83 36 82
                  L 42 80
                  Q 45 79 44 76
                  L 36 54
                  L 60 54
                  Q 64 54 66 50
                  L 68 46
                  Q 70 42 66 40
                  L 10 6
                  Q 8 5 8 6
                  Z
                "
              />
            </clipPath>
          </defs>

          {/* BASE DEL CRISTAL */}
          <g clipPath="url(#cursorArrowClip)">
            {/* Base translúcida principal */}
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="url(#cursorGlassGradient)"
            />

            {/* Capa de iridiscencia tipo “liquid glass” */}
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="url(#cursorIridescence)"
              opacity="0.9"
            />

            {/* Banda lateral simulando refracción más intensa en un borde */}
            <rect
              x="0"
              y="0"
              width="24"
              height="96"
              fill="rgba(255,255,255,0.35)"
              opacity="0.55"
              filter="url(#cursorGlassBlur)"
            />
          </g>

          {/* BORDE PRINCIPAL (similar al perfil negro del cursor clásico) */}
          <path
            d="
              M 8 6
              L 8 72
              L 24 58
              L 32 80
              Q 33 83 36 82
              L 42 80
              Q 45 79 44 76
              L 36 54
              L 60 54
              Q 64 54 66 50
              L 68 46
              Q 70 42 66 40
              L 10 6
              Q 8 5 8 6
              Z
            "
            stroke="rgba(0,0,0,0.55)"
            strokeWidth="2.2"
            fill="none"
            strokeLinejoin="round"
          />

          {/* BORDE INTERIOR CON REFRACCIÓN (azulados) */}
          <path
            d="
              M 10 9
              L 10 68
              L 24.5 56
              L 33 77
              Q 33.8 79.2 36.1 78.5
              L 41 77
              Q 43.2 76.4 42.5 74.3
              L 34 52
              L 58 52
              Q 61.5 52 63.5 49
              L 65 46
              Q 66.5 43.2 63.7 41.7
              L 11.5 9.5
              Q 10.3 8.7 10 9
              Z
            "
            stroke="url(#cursorEdgeRefraction)"
            strokeWidth="1.4"
            fill="none"
            strokeLinejoin="round"
            filter="url(#cursorEdgeSoft)"
            opacity="0.95"
          />

          {/* HIGHLIGHT SUPERIOR (borde brillante tipo cristal curvado) */}
          <path
            d="
              M 10.5 10
              L 10.5 32
              L 32 47
              Q 33 47.6 34 47
              L 60 48
              Q 62 48 63 46.5
              L 64.5 44
              Q 65.8 41.8 64 40.6
              L 14 12
              Q 11.8 10.8 10.5 10
              Z
            "
            fill="url(#cursorHighlightGradient)"
            opacity="0.90"
            filter="url(#cursorGlassBlur)"
          />

          {/* REFLEJOS ELÍPTICOS INTERNOS (gota de agua / bordes curvos) */}
          <ellipse
            cx="20"
            cy="22"
            rx="9"
            ry="14"
            fill="rgba(255,255,255,0.65)"
            filter="url(#cursorGlassBlur)"
            opacity="0.80"
          />
          <ellipse
            cx="30"
            cy="40"
            rx="7"
            ry="11"
            fill="rgba(255,255,255,0.40)"
            filter="url(#cursorGlassBlur)"
            opacity="0.85"
          />
          <ellipse
            cx="44"
            cy="32"
            rx="6"
            ry="10"
            fill="rgba(200,220,255,0.45)"
            filter="url(#cursorGlassBlur)"
            opacity="0.75"
          />

          {/* BORDE EXTERNO MUY SUTIL PARA REMATAR EL LOOK DE CRISTAL */}
          <path
            d="
              M 8 6
              L 8 72
              L 24 58
              L 32 80
              Q 33 83 36 82
              L 42 80
              Q 45 79 44 76
              L 36 54
              L 60 54
              Q 64 54 66 50
              L 68 46
              Q 70 42 66 40
              L 10 6
              Q 8 5 8 6
              Z
            "
            stroke="rgba(255,255,255,0.38)"
            strokeWidth="0.9"
            fill="none"
            strokeLinejoin="round"
          />
        </svg>

        {/* Capa de backdrop-filter para cristal real que refracta el fondo */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backdropFilter: 'blur(14px) saturate(1.4) brightness(1.06)',
            WebkitBackdropFilter: 'blur(14px) saturate(1.4) brightness(1.06)',
            clipPath: `path('M 8 6 L 8 72 L 24 58 L 32 80 Q 33 83 36 82 L 42 80 Q 45 79 44 76 L 36 54 L 60 54 Q 64 54 66 50 L 68 46 Q 70 42 66 40 L 10 6 Q 8 5 8 6 Z')`,
            opacity: 0.55,
          }}
        />
      </motion.div>
    </motion.div>
  );
}