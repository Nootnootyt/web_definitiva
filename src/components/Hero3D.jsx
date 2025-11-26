'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useRef, Suspense, useState, useEffect, useMemo, memo } from 'react';
import { FaCode, FaCamera } from 'react-icons/fa';
import { SiReact, SiNextdotjs, SiNodedotjs, SiPython, SiDocker } from 'react-icons/si';

// ⭐ OPTIMIZACIÓN 1: Memoizar componente 3D para evitar re-renders innecesarios
const Camera3D = memo(function Camera3D() {
  const cameraRef = useRef();
  
  useFrame(({ clock }) => {
    if (cameraRef.current) {
      // ⭐ OPTIMIZACIÓN 2: Reducir cálculos (multiplicadores más pequeños)
      const time = clock.getElapsedTime();
      cameraRef.current.position.x = Math.sin(time * 0.3) * 0.5;
      cameraRef.current.position.y = Math.cos(time * 0.2) * 0.3;
      cameraRef.current.rotation.z = Math.sin(time * 0.5) * 0.1;
    }
  });

  return (
    <group ref={cameraRef}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 1.5, 1]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.6]}>
        <cylinderGeometry args={[0.6, 0.6, 0.3, 32]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#333" metalness={1} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0, 0.8]}>
        <cylinderGeometry args={[0.5, 0.5, 0.05, 32]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial 
          color="#b7ff00" 
          metalness={0.9} 
          roughness={0.1}
        />
      </mesh>
      <mesh position={[0.8, 0.5, 0.3]}>
        <boxGeometry args={[0.3, 0.15, 0.1]} />
        <meshStandardMaterial emissive="#fff" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.15, 16]} />
        <meshStandardMaterial color="#ff0000" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
});

// ⭐ OPTIMIZACIÓN 4: Memoizar partículas y reducir cantidad en móvil
const FloatingParticles = memo(function FloatingParticles({ isMobile }) {
  const particlesRef = useRef();
  const particleCount = isMobile ? 50 : 100;
  
  // ⭐ OPTIMIZACIÓN 5: useMemo para evitar recrear array en cada render
  const particles = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, [particleCount]);

  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={isMobile ? 0.08 : 0.1}
        color="#b7ff00" 
        transparent 
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
});

export default function Hero3D() {
  // ⭐ OPTIMIZACIÓN 6: Detectar dispositivo móvil
  const [isMobile, setIsMobile] = useState(false);
  const [canvasLoaded, setCanvasLoaded] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // ⭐ OPTIMIZACIÓN 7: Cargar Canvas después de 500ms
    const timer = setTimeout(() => setCanvasLoaded(true), 500);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(timer);
    };
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const roles = ['DESARROLLADOR', 'DISEÑADOR', 'PILOTO DE DRONES', 'VIDEÓGRAFO'];
  const [currentRole, setCurrentRole] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // ⭐ OPTIMIZACIÓN 8: useMemo para evitar recrear este array
  const techStack = useMemo(() => [
    { icon: SiReact, name: 'React' },
    { icon: SiNextdotjs, name: 'Next.js' },
    { icon: SiNodedotjs, name: 'Node.js' },
    { icon: SiPython, name: 'Python' },
    { icon: SiDocker, name: 'Docker' },
  ], []);

  // ⭐ OPTIMIZACIÓN 9: Memoizar transiciones
  const fastTransition = useMemo(() => ({
    type: 'tween',
    ease: [0.25, 0.1, 0.25, 1],
    duration: 0.3,
  }), []);

  const mediumTransition = useMemo(() => ({
    type: 'tween',
    ease: [0.25, 0.1, 0.25, 1],
    duration: 0.5,
  }), []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black">
      {/* ⭐ OPTIMIZACIÓN 10: Canvas con lazy load y configuración optimizada */}
      {!isMobile && canvasLoaded && (
        <div className="absolute inset-0 z-0 opacity-40">
          <Canvas
            shadows={false}
            dpr={[1, 1.5]}
            performance={{ min: 0.5 }}
            gl={{ 
              antialias: false,
              powerPreference: 'high-performance',
              alpha: true,
              stencil: false,
              depth: true,
            }}
            frameloop="demand"
          >
            <PerspectiveCamera makeDefault position={[0, 0, 8]} />
            
            <ambientLight intensity={0.3} />
            <spotLight 
              position={[10, 10, 10]} 
              angle={0.15} 
              penumbra={1} 
              intensity={0.7}
              castShadow={false}
            />
            <pointLight 
              position={[-10, -10, -10]} 
              intensity={0.3}
              color="#b7ff00" 
            />
            
            <Suspense fallback={null}>
              <Camera3D />
              <FloatingParticles isMobile={isMobile} />
            </Suspense>
            
            <OrbitControls 
              enableZoom={false} 
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.3}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 2}
              enableDamping={true}
              dampingFactor={0.05}
            />
          </Canvas>
        </div>
      )}

      {/* Contenido sobre el 3D */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={mediumTransition}
          className="pt-20 md:pt-0"
        >
          {/* Tagline */}
          <motion.div
            className="flex items-center justify-center gap-2 text-xs sm:text-sm md:text-base text-[var(--color-accent)] font-semibold mb-4 md:mb-6 uppercase tracking-widest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...fastTransition, delay: 0.1 }}
          >
            <FaCode className="text-base md:text-xl" />
            <span className="hidden sm:inline">Javier Jiménez |</span>
            <span>Full Stack Developer</span>
          </motion.div>

          {/* Título principal */}
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black mb-4 md:mb-6 leading-tight"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...mediumTransition, delay: 0.05 }}
          >
            <span className="text-white">PROGRAMADOR &</span>
            <br />
            <motion.span
              key={currentRole}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={fastTransition}
              style={{ 
                color: 'var(--color-accent)',
              }}
              className="inline-block"
            >
              {roles[currentRole]}
            </motion.span>
          </motion.h1>

          {/* Descripción */}
          <motion.p
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-3 md:mb-4 max-w-3xl mx-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...fastTransition, delay: 0.15 }}
          >
            Desarrollador full-stack apasionado por crear experiencias web únicas.
          </motion.p>

          {/* Subtexto con cámara/dron */}
          <motion.div
            className="flex items-center justify-center gap-2 md:gap-3 mb-6 md:mb-8 text-gray-400 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...fastTransition, delay: 0.2 }}
          >
            <FaCamera className="text-lg md:text-2xl text-[var(--color-accent)] flex-shrink-0" />
            <p className="text-xs sm:text-sm md:text-base text-center">
              En mi tiempo libre, capturo lugares interesantes con mi{' '}
              <span className="text-white font-semibold">dron</span>
            </p>
          </motion.div>

          {/* Botones */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mb-8 md:mb-12 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...mediumTransition, delay: 0.25 }}
          >
            <button
              onClick={() => scrollToSection('portfolio')}
              className="cursor-pointer w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-[var(--color-accent)] text-black font-bold text-base md:text-lg rounded-full hover:scale-105 hover:shadow-2xl transition-all duration-300"
            >
              Fotos destacadas
            </button>
            
            <button
              onClick={() => scrollToSection('contacto')}
              className="cursor-pointer w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 border-2 border-[var(--color-accent)] text-[var(--color-accent)] font-bold text-base md:text-lg rounded-full hover:bg-[var(--color-accent)] hover:text-black transition-all duration-300"
            >
              Contactar
            </button>
          </motion.div>

          {/* Tech Stack */}
          <motion.div
            className="mb-8 md:mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...fastTransition, delay: 0.3 }}
          >
            <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4 uppercase tracking-wider">Stack Tecnológico</p>
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 px-4">
              {techStack.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 glass rounded-lg hover:glass-accent transition-all duration-300 group"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    ...fastTransition,
                    delay: 0.35 + index * 0.03,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <tech.icon className="text-base md:text-xl text-gray-400 group-hover:text-[var(--color-accent)] transition-colors" />
                  <span className="text-xs md:text-sm text-gray-400 group-hover:text-white transition-colors">{tech.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-6 max-w-5xl mx-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...mediumTransition, delay: 0.4 }}
          >
            <div className="text-center p-4 md:p-6 glass rounded-2xl">
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-[var(--color-accent)] mb-1 md:mb-2">15+</h3>
              <p className="text-gray-400 text-xs md:text-sm">Proyectos Web</p>
            </div>
            <div className="text-center p-4 md:p-6 glass rounded-2xl">
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-[var(--color-accent)] mb-1 md:mb-2">2+</h3>
              <p className="text-gray-400 text-xs md:text-sm">Años Exp.</p>
            </div>
            <div className="text-center p-4 md:p-6 glass rounded-2xl">
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-[var(--color-accent)] mb-1 md:mb-2">200+</h3>
              <p className="text-gray-400 text-xs md:text-sm">Fotos</p>
            </div>
            <div className="text-center p-4 md:p-6 glass rounded-2xl">
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-[var(--color-accent)] mb-1 md:mb-2">∞</h3>
              <p className="text-gray-400 text-xs md:text-sm">Ideas</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator - OCULTO EN MÓVIL */}
      {!isMobile && (
        <motion.div
          className="absolute bottom-8 md:bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-6 h-10 border-2 border-[var(--color-accent)] rounded-full flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-1.5 bg-[var(--color-accent)] rounded-full"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      )}
    </section>
  );
}