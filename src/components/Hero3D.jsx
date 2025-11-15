'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useRef, Suspense, useState, useEffect } from 'react';
import { FaCode, FaCamera } from 'react-icons/fa';
import { SiReact, SiNextdotjs, SiNodedotjs, SiPython, SiDocker } from 'react-icons/si';

function Camera3D() {
  const cameraRef = useRef();
  
  useFrame(({ clock }) => {
    if (cameraRef.current) {
      cameraRef.current.position.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.5;
      cameraRef.current.position.y = Math.cos(clock.getElapsedTime() * 0.2) * 0.3;
      cameraRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
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
        <meshPhysicalMaterial 
          color="#b7ff00" 
          metalness={0.9} 
          roughness={0.1} 
          transmission={0.5}
          transparent={true}
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
}

function FloatingParticles() {
  const particlesRef = useRef();
  const particleCount = 100;
  
  const particles = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i++) {
    particles[i] = (Math.random() - 0.5) * 20;
  }

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
        size={0.1} 
        color="#b7ff00" 
        transparent 
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export default function Hero3D() {
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const roles = ['DESARROLLADOR', 'CREADOR', 'PILOTO FPV', 'FOTÓGRAFO'];
  const [currentRole, setCurrentRole] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const techStack = [
    { icon: SiReact, name: 'React' },
    { icon: SiNextdotjs, name: 'Next.js' },
    { icon: SiNodedotjs, name: 'Node.js' },
    { icon: SiPython, name: 'Python' },
    { icon: SiDocker, name: 'Docker' },
  ];

  // Configuración optimizada de transiciones
  const fastTransition = {
    type: 'tween',
    ease: [0.25, 0.1, 0.25, 1], // Cubic-bezier optimizado
    duration: 0.5,
  };

  const mediumTransition = {
    type: 'tween',
    ease: [0.25, 0.1, 0.25, 1],
    duration: 0.6,
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Canvas 3D en el fondo - OCULTO EN MÓVIL */}
      <div className="absolute inset-0 z-0 opacity-40 hidden md:block">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#b7ff00" />
          
          <Suspense fallback={null}>
            <Camera3D />
            <FloatingParticles />
          </Suspense>
          
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>

      {/* Contenido sobre el 3D */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={mediumTransition}
          className="pt-20 md:pt-0"
          style={{ 
            willChange: 'transform, opacity',
            transform: 'translateZ(0)',
          }}
        >
          {/* Tagline - RESPONSIVE */}
          <motion.div
            className="flex items-center justify-center gap-2 text-xs sm:text-sm md:text-base text-[var(--color-accent)] font-semibold mb-4 md:mb-6 uppercase tracking-widest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...fastTransition, delay: 0.2 }}
            style={{ 
              willChange: 'opacity',
              transform: 'translateZ(0)',
            }}
          >
            <FaCode className="text-base md:text-xl" />
            <span className="hidden sm:inline">Javier Jiménez |</span>
            <span>Full Stack Developer</span>
          </motion.div>

          {/* Título principal - TAMAÑOS AJUSTADOS */}
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black mb-4 md:mb-6 leading-tight"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...mediumTransition, delay: 0.1 }}
            style={{ 
              willChange: 'transform, opacity',
              transform: 'translateZ(0)',
            }}
          >
            <span className="text-white">PROGRAMADOR &</span>
            <br />
            <motion.span
              key={currentRole}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={fastTransition}
              style={{ 
                color: 'var(--color-accent)',
                willChange: 'transform, opacity',
                transform: 'translateZ(0)',
              }}
              className="inline-block"
            >
              {roles[currentRole]}
            </motion.span>
          </motion.h1>

          {/* Descripción - RESPONSIVE */}
          <motion.p
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-3 md:mb-4 max-w-3xl mx-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...fastTransition, delay: 0.3 }}
            style={{ 
              willChange: 'opacity',
              transform: 'translateZ(0)',
            }}
          >
            Desarrollador full-stack apasionado por crear experiencias web únicas.
          </motion.p>

          {/* Subtexto con cámara/dron */}
          <motion.div
            className="flex items-center justify-center gap-2 md:gap-3 mb-6 md:mb-8 text-gray-400 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...fastTransition, delay: 0.4 }}
            style={{ 
              willChange: 'opacity',
              transform: 'translateZ(0)',
            }}
          >
            <FaCamera className="text-lg md:text-2xl text-[var(--color-accent)] flex-shrink-0" />
            <p className="text-xs sm:text-sm md:text-base text-center">
              En mi tiempo libre, capturo lugares interesantes con mi{' '}
              <span className="text-white font-semibold">cámara</span> y mi{' '}
              <span className="text-white font-semibold">dron</span>
            </p>
          </motion.div>

          {/* Botones - RESPONSIVE */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mb-8 md:mb-12 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...mediumTransition, delay: 0.5 }}
            style={{ 
              willChange: 'transform, opacity',
              transform: 'translateZ(0)',
            }}
          >
            <button
              onClick={() => scrollToSection('portfolio')}
              className="cursor-pointer w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-[var(--color-accent)] text-black font-bold text-base md:text-lg rounded-full hover:scale-105 hover:shadow-2xl hover:shadow-[var(--color-accent)]/50 transition-all duration-300"
              style={{ 
                willChange: 'transform',
                transform: 'translateZ(0)',
              }}
            >
              Fotos destacadas
            </button>
            
            <button
              onClick={() => scrollToSection('contacto')}
              className="cursor-pointer w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 border-2 border-[var(--color-accent)] text-[var(--color-accent)] font-bold text-base md:text-lg rounded-full hover:bg-[var(--color-accent)] hover:text-black transition-all duration-300"
              style={{ 
                willChange: 'transform',
                transform: 'translateZ(0)',
              }}
            >
              Contactar
            </button>
          </motion.div>

          {/* Tech Stack - SCROLL HORIZONTAL EN MÓVIL */}
          <motion.div
            className="mb-8 md:mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...fastTransition, delay: 0.6 }}
            style={{ 
              willChange: 'opacity',
              transform: 'translateZ(0)',
            }}
          >
            <p className="text-xs md:text-sm text-gray-500 mb-3 md:mb-4 uppercase tracking-wider">Stack Tecnológico</p>
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 px-4">
              {techStack.map((tech, index) => (
                <motion.div
                  key={tech.name}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 glass rounded-lg hover:glass-accent transition-all duration-300 group"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    ...fastTransition,
                    delay: 0.7 + index * 0.05,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ 
                    willChange: 'transform, opacity',
                    transform: 'translateZ(0)',
                  }}
                >
                  <tech.icon className="text-base md:text-xl text-gray-400 group-hover:text-[var(--color-accent)] transition-colors" />
                  <span className="text-xs md:text-sm text-gray-400 group-hover:text-white transition-colors">{tech.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Stats - GRID RESPONSIVE */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-6 max-w-5xl mx-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...mediumTransition, delay: 0.8 }}
            style={{ 
              willChange: 'opacity',
              transform: 'translateZ(0)',
            }}
          >
            <div 
              className="text-center p-4 md:p-6 glass rounded-2xl"
              style={{ 
                willChange: 'transform',
                transform: 'translateZ(0)',
              }}
            >
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-[var(--color-accent)] mb-1 md:mb-2">15+</h3>
              <p className="text-gray-400 text-xs md:text-sm">Proyectos Web</p>
            </div>
            <div 
              className="text-center p-4 md:p-6 glass rounded-2xl"
              style={{ 
                willChange: 'transform',
                transform: 'translateZ(0)',
              }}
            >
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-[var(--color-accent)] mb-1 md:mb-2">2+</h3>
              <p className="text-gray-400 text-xs md:text-sm">Años Exp.</p>
            </div>
            <div 
              className="text-center p-4 md:p-6 glass rounded-2xl"
              style={{ 
                willChange: 'transform',
                transform: 'translateZ(0)',
              }}
            >
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-[var(--color-accent)] mb-1 md:mb-2">200+</h3>
              <p className="text-gray-400 text-xs md:text-sm">Fotos</p>
            </div>
            <div 
              className="text-center p-4 md:p-6 glass rounded-2xl"
              style={{ 
                willChange: 'transform',
                transform: 'translateZ(0)',
              }}
            >
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-[var(--color-accent)] mb-1 md:mb-2">∞</h3>
              <p className="text-gray-400 text-xs md:text-sm">Ideas</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator - OCULTO EN MÓVIL */}
      <motion.div
        className="absolute bottom-8 md:bottom-10 left-1/2 transform -translate-x-1/2 hidden md:block"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ 
          willChange: 'transform',
          transform: 'translateZ(0) translateX(-50%)',
        }}
      >
        <div className="w-6 h-10 border-2 border-[var(--color-accent)] rounded-full flex justify-center pt-2">
          <motion.div
            className="w-1.5 h-1.5 bg-[var(--color-accent)] rounded-full"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  );
}
