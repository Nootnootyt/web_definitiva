'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import PhotoModal from './PhotoModal';
import { FaTrash, FaSpinner } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';

export default function AlbumFotos() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [albumPhotos, setAlbumPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Verificar usuario autenticado
  useEffect(() => {
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  // Cargar fotos desde Supabase
  useEffect(() => {
    loadPhotos();

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel('photos_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photos' }, () => {
        loadPhotos();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlbumPhotos(data || []);
    } catch (error) {
      console.error('Error cargando fotos:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = async (photoId) => {
    if (!user) {
      alert('Debes iniciar sesión para eliminar fotos');
      return;
    }

    if (!confirm('¿Estás seguro de que quieres eliminar esta foto?')) return;

    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;
      
      // Actualizar lista local
      setAlbumPhotos(albumPhotos.filter(photo => photo.id !== photoId));
    } catch (error) {
      console.error('Error eliminando foto:', error);
      alert('Error al eliminar la foto. Asegúrate de estar autenticado.');
    }
  };

  const openModal = (photo) => {
    setSelectedPhoto(photo);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedPhoto(null), 300);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut'
      }
    }
  };

  if (loading) {
    return (
      <section className="py-32 px-6 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto text-center">
          <FaSpinner className="animate-spin text-[var(--color-accent)] text-6xl mx-auto" />
          <p className="text-gray-400 mt-4">Cargando álbum...</p>
        </div>
      </section>
    );
  }

  if (albumPhotos.length === 0) {
    return null;
  }

  return (
    <>
      <section id="album" className="py-32 px-6 bg-gradient-to-b from-black to-gray-900" ref={ref}>
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="container mx-auto"
        >
          <h2 className="text-6xl md:text-8xl font-black mb-4">
            <span className="text-white">MI</span>{' '}
            <span style={{ color: 'var(--color-accent)' }}>ÁLBUM</span>
          </h2>
          <p className="text-gray-400 text-xl mb-16 max-w-2xl">
            Fotos personalizadas añadidas recientemente ({albumPhotos.length} {albumPhotos.length === 1 ? 'foto' : 'fotos'})
          </p>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {albumPhotos.map((photo) => (
              <motion.div
                key={photo.id}
                variants={itemVariants}
                className="relative group overflow-hidden rounded-2xl aspect-square"
              >
                {/* Botón de eliminar - solo visible si está autenticado */}
                {user && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePhoto(photo.id);
                    }}
                    className="cursor-pointer absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <FaTrash size={16} />
                  </button>
                )}

                <motion.div
                  whileHover={{ y: -10, scale: 1.05 }}
                  onClick={() => openModal(photo)}
                  className="cursor-pointer w-full h-full"
                >
                  <div
                    className="absolute inset-0 transition-all duration-500 group-hover:scale-110"
                    style={{
                      backgroundImage: `url(${photo.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />

                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300" />

                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300"
                    >
                      <span className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-2 block">
                        {photo.category}
                      </span>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {photo.title}
                      </h3>
                      <div className="w-12 h-1 bg-[var(--color-accent)] group-hover:w-full transition-all duration-500" />
                    </motion.div>
                  </div>

                  <motion.div
                    className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--color-accent)] transition-all duration-300 rounded-2xl"
                  />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <PhotoModal 
        photo={selectedPhoto} 
        isOpen={isModalOpen} 
        onClose={closeModal} 
      />
    </>
  );
}
