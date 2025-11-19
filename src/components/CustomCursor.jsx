'use client';
import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  
  // Motion values para el cursor
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  
  // ✅ Spring configuración - OPTIMIZADO para mejor performance
  const springConfig = { 
    damping: 25,
    stiffness: 400,
    mass: 0.5,
  };
  
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  // Tracking de velocidad para efectos dinámicos
  const lastX = useRef(0);
  const lastY = useRef(0);
  const [velocity, setVelocity] = useState(0);
  const [trails, setTrails] = useState([]);

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
      // Calcular velocidad del cursor
      const deltaX = e.clientX - lastX.current;
      const deltaY = e.clientY - lastY.current;
      const speed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      lastX.current = e.clientX;
      lastY.current = e.clientY;
      
      setVelocity(speed);

      // ✅ Reducir trails para mejor performance
      if (speed > 20) {
        setTrails(prev => [...prev.slice(-5), {
          id: Date.now(),
          x: e.clientX,
          y: e.clientY,
          velocity: speed
        }]);
      }

      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleHoverElements = () => {
      // Elementos interactivos normales
      const hoverableElements = document.querySelectorAll(
        'button, a, input, textarea, [role="button"], .cursor-pointer'
      );

      hoverableElements.forEach((el) => {
        el.addEventListener('mouseenter', () => setIsHovering(true));
        el.addEventListener('mouseleave', () => setIsHovering(false));
      });

      // Elementos de imagen (para el efecto de zoom) - Excluir videos
      const imageElements = document.querySelectorAll(
        '[class*="group"]:has(img):not(.video-container):not([class*="video"])'
      );

      imageElements.forEach((el) => {
        el.addEventListener('mouseenter', () => {
          setIsHovering(true);
          setIsHoveringImage(true);
        });
        el.addEventListener('mouseleave', () => {
          setIsHovering(false);
          setIsHoveringImage(false);
        });
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

  // Limpiar trails antiguos
  useEffect(() => {
    if (trails.length > 0) {
      const timer = setTimeout(() => {
        setTrails(prev => prev.slice(1));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [trails]);

  if (!isMounted || isTouchDevice) return null;

  return (
    <>
      {/* ======= PARTÍCULAS TRAIL (aparecen con velocidad alta) ======= */}
      {trails.map((trail, index) => (
        <motion.div
          key={trail.id}
          className="fixed top-0 left-0 pointer-events-none z-[9996]"
          style={{
            x: trail.x,
            y: trail.y,
            translateX: '-50%',
            translateY: '-50%',
          }}
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: 0, scale: 0.3 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: 'var(--color-accent)',
              boxShadow: '0 0 10px var(--color-accent)',
              opacity: 0.8 - (index * 0.1),
            }}
          />
        </motion.div>
      ))}

      {/* ======= PUNTO CENTRAL MAGNÉTICO ======= */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[10001]" // ✅ Z-index más alto que los modales
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          className="relative"
          animate={{
            scale: isClicking ? 0.6 : isHovering ? 0.8 : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
            mass: 0.3,
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, var(--color-accent) 0%, transparent 70%)`,
              filter: 'blur(8px)',
              width: '24px',
              height: '24px',
              transform: 'translate(-50%, -50%)',
              left: '50%',
              top: '50%',
            }}
            animate={{
              scale: isClicking ? 2 : isHovering ? 1.5 : 1,
              opacity: isClicking ? 0.8 : isHovering ? 0.6 : 0.4,
            }}
          />
          
          <div
            className="w-3 h-3 rounded-full relative z-10"
            style={{
              backgroundColor: 'var(--color-accent)',
              boxShadow: `0 0 15px var(--color-accent), 0 0 30px rgba(183, 255, 0, 0.3)`,
            }}
          />
        </motion.div>
      </motion.div>

      {/* ======= ANILLO EXTERIOR ======= */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[10000]" // ✅ Z-index más alto que los modales
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          className="relative"
          animate={{
            width: isHoveringImage ? '70px' : isHovering ? '55px' : '35px',
            height: isHoveringImage ? '70px' : isHovering ? '55px' : '35px',
            scale: isClicking ? 0.7 : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
            mass: 0.5,
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              border: `2px solid var(--color-accent)`,
              boxShadow: `
                0 0 20px var(--color-accent),
                inset 0 0 20px rgba(183, 255, 0, 0.1)
              `,
            }}
            animate={{
              rotate: velocity > 5 || isHoveringImage ? [0, 360] : 0,
              borderWidth: velocity > 15 ? '3px' : '2px',
            }}
            transition={{
              rotate: {
                duration: isHoveringImage ? 1.5 : 2,
                repeat: Infinity,
                ease: 'linear',
              },
              borderWidth: {
                duration: 0.3,
              },
            }}
          />

          {isHovering && (
            <motion.div
              className="absolute inset-0 rounded-full m-2"
              style={{
                border: `1px solid var(--color-accent)`,
                opacity: 0.5,
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 0.5,
                rotate: -360,
              }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                rotate: {
                  duration: isHoveringImage ? 2 : 3,
                  repeat: Infinity,
                  ease: 'linear',
                },
              }}
            />
          )}

          {isHoveringImage && (
            <>
              <motion.div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
              >
                <div
                  className="w-3 h-3 flex items-center justify-center text-[var(--color-accent)] font-bold text-xs"
                  style={{
                    textShadow: '0 0 10px var(--color-accent)',
                  }}
                >
                  +
                </div>
              </motion.div>

              <motion.div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
              >
                <div
                  className="w-3 h-3 flex items-center justify-center text-[var(--color-accent)] font-bold text-xs"
                  style={{
                    textShadow: '0 0 10px var(--color-accent)',
                  }}
                >
                  -
                </div>
              </motion.div>

              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[var(--color-accent)]" />
                <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-[var(--color-accent)]" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-[var(--color-accent)]" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[var(--color-accent)]" />
              </motion.div>
            </>
          )}

          {isHovering && !isHoveringImage && (
            <>
              <motion.div
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  boxShadow: '0 0 8px var(--color-accent)',
                  top: '0',
                  left: '50%',
                  translateX: '-50%',
                }}
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              <motion.div
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  boxShadow: '0 0 8px var(--color-accent)',
                  bottom: '0',
                  left: '50%',
                  translateX: '-50%',
                }}
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: 1,
                }}
              />
            </>
          )}
        </motion.div>
      </motion.div>

      {isClicking && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-[9997]"
          style={{
            x: cursorX,
            y: cursorY,
            translateX: '-50%',
            translateY: '-50%',
          }}
        >
          <motion.div
            className="rounded-full border-2"
            style={{
              borderColor: 'var(--color-accent)',
            }}
            initial={{ width: '35px', height: '35px', opacity: 1 }}
            animate={{ 
              width: '120px',
              height: '120px',
              opacity: 0,
            }}
            transition={{
              duration: 0.6,
              ease: 'easeOut',
            }}
          />
        </motion.div>
      )}

      {/* ✅ Efecto de velocidad reducido para mejor performance */}
      {velocity > 30 && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-[9997]"
          style={{
            x: smoothX,
            y: smoothY,
            translateX: '-50%',
            translateY: '-50%',
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.2, scale: 1.5 }}
          exit={{ opacity: 0, scale: 2 }}
          transition={{ 
            duration: 0.4,
            ease: "easeOut"
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: '60px',
              height: '60px',
              background: `radial-gradient(circle, var(--color-accent) 0%, transparent 70%)`,
              filter: 'blur(15px)',
            }}
          />
        </motion.div>
      )}

      {isHoveringImage && (
        <motion.div
          className="fixed pointer-events-none z-[10001]" // ✅ Z-index más alto
          style={{
            x: cursorX,
            y: cursorY,
            translateX: '-50%',
            translateY: '50px',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'var(--color-accent)',
              border: '1px solid var(--color-accent)',
              boxShadow: '0 0 20px rgba(183, 255, 0, 0.3)',
            }}
          >
            Click para zoom
          </div>
        </motion.div>
      )}
    </>
  );
}