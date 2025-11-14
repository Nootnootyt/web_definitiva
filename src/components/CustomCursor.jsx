'use client';
import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  
  // Motion values para el cursor
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  
  // Spring más RÁPIDO y DINÁMICO
  const springConfig = { 
    damping: 25,      // Antes: 30 (menos amortiguamiento = más rápido)
    stiffness: 400,   // Antes: 200 (más rigidez = más responsive)
    mass: 0.2,        // Antes: 0.5 (menos masa = más ágil)
  };
  
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  // Tracking de velocidad para efectos dinámicos
  const lastX = useRef(0);
  const lastY = useRef(0);
  const [velocity, setVelocity] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    
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
      // Calcular velocidad del cursor
      const deltaX = e.clientX - lastX.current;
      const deltaY = e.clientY - lastY.current;
      const speed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      lastX.current = e.clientX;
      lastY.current = e.clientY;
      
      setVelocity(speed);

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

    // Observer para nuevos elementos dinámicos
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
    <>
      {/* Punto central (cursor real) - MÁS RÁPIDO */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: 'var(--color-accent)',
          }}
          animate={{
            scale: isClicking ? 0.5 : isHovering ? 1.5 : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 20,
            mass: 0.1,
          }}
        />
      </motion.div>

      {/* Círculo exterior - MÁS DINÁMICO */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] mix-blend-difference"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          className="rounded-full border-2"
          style={{
            borderColor: 'var(--color-accent)',
            width: isHovering ? '60px' : '40px',
            height: isHovering ? '60px' : '40px',
          }}
          animate={{
            scale: isClicking ? 0.8 : 1,
            rotate: velocity > 5 ? velocity * 2 : 0, // Rotación basada en velocidad
            borderWidth: velocity > 10 ? '3px' : '2px', // Borde más grueso con velocidad
          }}
          transition={{
            scale: {
              type: 'spring',
              stiffness: 300,
              damping: 20,
            },
            rotate: {
              type: 'spring',
              stiffness: 100,
              damping: 10,
            },
            borderWidth: {
              duration: 0.1,
            },
          }}
        />
      </motion.div>

      {/* Estela de velocidad (trail effect) */}
      {velocity > 15 && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-[9997] mix-blend-difference"
          style={{
            x: smoothX,
            y: smoothY,
            translateX: '-50%',
            translateY: '-50%',
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.4, scale: 1.5 }}
          exit={{ opacity: 0, scale: 2 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="w-24 h-24 rounded-full border"
            style={{
              borderColor: 'var(--color-accent)',
              opacity: 0.3,
            }}
          />
        </motion.div>
      )}
    </>
  );
}
