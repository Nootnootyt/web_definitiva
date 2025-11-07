'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const mouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e) => {
      // Detectar hover sobre elementos interactivos
      const isInteractive = e.target.tagName === 'A' || 
                           e.target.tagName === 'BUTTON' || 
                           e.target.closest('a') || 
                           e.target.closest('button') ||
                           e.target.classList.contains('cursor-pointer');
      
      setIsHovering(isInteractive);
    };

    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <>
      {/* Círculo grande exterior */}
      <motion.div
        className="cursor-dot"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
          scale: isHovering ? 2 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          mass: 0.3
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
        }}
      />
      
      {/* Punto interior */}
      <motion.div
        className="cursor-outline"
        animate={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4,
        }}
        transition={{
          type: "spring",
          stiffness: 600,
          damping: 30,
          mass: 0.1
        }}
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-accent)',
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 99999,
        }}
      />
    </>
  );
}
