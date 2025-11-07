'use client';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const requestRef = useRef();

  // Detectar si es dispositivo táctil
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
    // No ejecutar en dispositivos táctiles
    if (isTouchDevice) return;

    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const handleMouseOver = (e) => {
      const interactiveElement = e.target.closest('a, button, input, textarea, select, [role="button"]');
      setIsHovering(!!interactiveElement);
    };

    const animate = () => {
      const lerp = 0.15;
      currentX += (targetX - currentX) * lerp;
      currentY += (targetY - currentY) * lerp;

      setMousePosition({ x: currentX, y: currentY });
      requestRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isTouchDevice]);

  // No renderizar en dispositivos táctiles
  if (isTouchDevice) return null;

  return (
    <>
      <motion.div
        className="cursor-dot hidden md:block"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
          scale: isHovering ? 1.5 : 1,
          opacity: isHovering ? 0.8 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 15,
          mass: 0.1
        }}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '2px solid var(--color-accent)',
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 99999,
          mixBlendMode: 'difference',
          willChange: 'transform',
        }}
      />
      
      <motion.div
        className="cursor-outline hidden md:block"
        style={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4,
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-accent)',
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 99999,
          willChange: 'transform',
        }}
      />
    </>
  );
}
