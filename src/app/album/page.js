'use client';
import { useState, useEffect, useCallback, useMemo } from 'react'; // ⭐ AÑADIDO useCallback, useMemo
import { motion, useReducedMotion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  FaTrash,
  FaSpinner,
  FaEdit,
  FaStar,
  FaCamera,
  FaImages,
} from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic'; // ⭐ AÑADIDO para lazy loading
import Image from 'next/image'; // ✅ IMPORTAR

// ⭐ OPTIMIZACIÓN 1: Lazy load de modales (solo cargan cuando se usan)
const PhotoModal = dynamic(() => import('@/components/PhotoModal'), {
  loading: () => null,
  ssr: false,
});

const EditPhotoModal = dynamic(() => import('@/components/EditPhotoModal'), {
  loading: () => null,
  ssr: false,
});

const AdminPanel = dynamic(() => import('@/components/AdminPanel'), {
  loading: () => null,
  ssr: false,
});

import CustomCursor from '@/components/CustomCursor';
import Header from '@/components/Header';

export default function AlbumPage() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const prefersReducedMotion = useReducedMotion();

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [albumPhotos, setAlbumPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // ⭐ OPTIMIZACIÓN 2: Paginación para evitar cargar todas las fotos
  const [page, setPage] = useState(1);
  const PHOTOS_PER_PAGE = 20;

  // ⭐ OPTIMIZACIÓN 3: Memoizar checkUser
  const checkUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }, []);

  useEffect(() => {
    checkUser();
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [checkUser]);

  // ⭐ OPTIMIZACIÓN 4: Memoizar loadPhotos
  const loadPhotos = useCallback(async () => {
    try {
      setLoading(true);
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
  }, []);

  useEffect(() => {
    loadPhotos();
    
    // ⭐ OPTIMIZACIÓN 5: Suscripción en tiempo real optimizada
    const subscription = supabase
      .channel('photos_changes_album')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'photos' 
      }, () => {
        loadPhotos();
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [loadPhotos]);

  // ⭐ OPTIMIZACIÓN 6: Memoizar deletePhoto
  const deletePhoto = useCallback(async (photoId) => {
    if (!user) {
      alert('Debes iniciar sesión para eliminar fotos');
      return;
    }
    
    if (!confirm('¿Estás seguro de que quieres eliminar esta foto del álbum? Se borrará permanentemente.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId);
      
      if (error) throw error;
      
      // ⭐ Actualización optimista del estado
      setAlbumPhotos(prev => prev.filter(photo => photo.id !== photoId));
    } catch (error) {
      console.error('Error eliminando foto:', error);
      alert('Error al eliminar la foto.');
      loadPhotos(); // Recargar si hubo error
    }
  }, [user, loadPhotos]);

  // ⭐ OPTIMIZACIÓN 7: Memoizar funciones de modal
  const openModal = useCallback((photo) => {
    setSelectedPhoto(photo);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((photo) => {
    setSelectedPhoto(photo);
    setIsEditModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setIsEditModalOpen(false);
    setTimeout(() => setSelectedPhoto(null), 300);
  }, []);

  // ⭐ OPTIMIZACIÓN 8: Memoizar variantes de animación
  const containerVariants = useMemo(() => 
    prefersReducedMotion ? {} : {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.03, // ⭐ Reducido de 0.05 a 0.03
        }
      }
    }, [prefersReducedMotion]
  );

  const itemVariants = useMemo(() =>
    prefersReducedMotion ? {} : {
      hidden: { opacity: 0, y: 15 }, // ⭐ Reducido de 20 a 15
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.25, // ⭐ Reducido de 0.3 a 0.25
          ease: 'easeOut'
        }
      }
    }, [prefersReducedMotion]
  );

  // ⭐ OPTIMIZACIÓN 9: Mostrar solo las fotos de la página actual
  const visiblePhotos = useMemo(() => 
    albumPhotos.slice(0, page * PHOTOS_PER_PAGE),
    [albumPhotos, page]
  );

  const hasMorePhotos = albumPhotos.length > visiblePhotos.length;

  if (loading) {
    return (
      <>
        <CustomCursor />
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-[var(--color-accent)] text-6xl mx-auto mb-4" />
            <p className="text-gray-400 text-xl">Cargando álbum...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CustomCursor />
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(183,255,0,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(183,255,0,.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

          <div className="absolute top-20 right-20 w-96 h-96 bg-[var(--color-accent)] rounded-full blur-3xl opacity-10 hidden md:block" />
          <div className="absolute bottom-40 left-10 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-10 hidden md:block" />
        </div>

        {/* Título de la página */}
        <div className="pt-24 md:pt-32 pb-8 px-4 md:px-6 relative z-10">
          <div className="container mx-auto">
            <div className="flex items-center gap-3 md:gap-4 mb-4">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center">
                <FaImages className="text-2xl md:text-4xl text-[var(--color-accent)]" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black">
                  <span style={{ color: 'var(--color-accent)' }}>ÁLBUM</span>{' '}
                  <span className="text-white">COMPLETO</span>
                </h1>
                <p className="text-sm md:text-base text-gray-400 mt-1">
                  Todas mis capturas fotográficas
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-3 md:gap-4 mb-8">
              <div className="p-3 md:p-4 bg-gray-900/80 border border-gray-800 rounded-xl backdrop-blur-sm flex-1 min-w-[120px]">
                <p className="text-gray-400 text-xs md:text-sm mb-1">
                  Total fotos
                </p>
                <p className="text-2xl md:text-3xl font-black text-[var(--color-accent)]">
                  {albumPhotos.length}
                </p>
              </div>

              {user && (
                <div className="p-3 md:p-4 bg-gray-900/80 border border-gray-800 rounded-xl backdrop-blur-sm flex-1 min-w-[120px]">
                  <p className="text-gray-400 text-xs md:text-sm mb-1">
                    En Portfolio
                  </p>
                  <p className="text-2xl md:text-3xl font-black text-[var(--color-accent)]">
                    {albumPhotos.filter((p) => p.in_portfolio).length}
                  </p>
                </div>
              )}

              {user && (
                <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-full flex-shrink-0">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-400 text-xs md:text-sm font-semibold whitespace-nowrap">
                    Edición activa
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <section className="pb-20 px-4 md:px-6 relative z-10" ref={ref}>
          <div className="container mx-auto">
            {/* Grid de fotos */}
            {albumPhotos.length === 0 ? (
              <div className="text-center py-20 md:py-32">
                <FaCamera className="text-5xl md:text-6xl text-gray-700 mx-auto mb-4 md:mb-6" />
                <p className="text-gray-500 text-xl md:text-2xl mb-2">
                  No hay fotos en el álbum
                </p>
                <p className="text-gray-600 text-sm">
                  Añade fotos con el panel de administración
                </p>
              </div>
            ) : (
              <>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                  className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6"
                >
                  {visiblePhotos.map((photo) => (
                    <motion.div
                      key={photo.id}
                      variants={itemVariants}
                      className="relative group overflow-hidden rounded-lg md:rounded-xl aspect-square bg-gray-900 border border-gray-800 hover:border-[var(--color-accent)] transition-all"
                    >
                      {/* Badge */}
                      {photo.in_portfolio && (
                        <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-[var(--color-accent)] text-black rounded-full text-xs font-bold flex items-center gap-1">
                          <FaStar size={8} />
                          <span className="hidden sm:inline">Destacada</span>
                        </div>
                      )}

                      {/* Botones admin */}
                      {user && (
                        <div className="absolute top-2 right-2 z-10 flex gap-1 md:gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(photo);
                            }}
                            className="cursor-pointer w-8 h-8 md:w-9 md:h-9 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors shadow-lg"
                            aria-label="Editar foto"
                          >
                            <FaEdit size={12} className="md:text-sm" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePhoto(photo.id);
                            }}
                            className="cursor-pointer w-8 h-8 md:w-9 md:h-9 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-lg"
                            aria-label="Eliminar foto"
                          >
                            <FaTrash size={12} className="md:text-sm" />
                          </button>
                        </div>
                      )}

                      
                      {/* ✅ IMAGEN OPTIMIZADA */}
                      <div
                        onClick={() => openModal(photo)}
                        className="cursor-pointer w-full h-full relative"
                      >
                        <Image
                          src={photo.image}
                          alt={photo.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition-transform duration-300 md:group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 md:group-hover:opacity-80 transition-opacity" />
                        
                        <div className="absolute inset-0 flex flex-col justify-end p-2 md:p-4">
                          <div className="transform md:translate-y-4 md:group-hover:translate-y-0 transition-transform md:opacity-0 md:group-hover:opacity-100">
                            <span className="text-xs text-[var(--color-accent)] font-semibold mb-1 block uppercase tracking-wider line-clamp-1">
                              {photo.category}
                            </span>
                            <h3 className="text-sm md:text-lg font-bold text-white line-clamp-2">
                              {photo.title}
                            </h3>
                          </div>
                        </div>
                      </div>

                    </motion.div>
                  ))}
                </motion.div>

                {/* ⭐ OPTIMIZACIÓN 11: Botón "Cargar más" */}
                {hasMorePhotos && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center mt-12"
                  >
                    <button
                      onClick={() => setPage(p => p + 1)}
                      className="px-8 py-4 bg-[var(--color-accent)] text-black font-bold rounded-full hover:bg-white hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-[var(--color-accent)]/50 flex items-center gap-3"
                    >
                      <span>Cargar más fotos</span>
                      <span className="text-sm opacity-75">
                        ({albumPhotos.length - visiblePhotos.length} restantes)
                      </span>
                    </button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      {/* Modales con lazy loading */}
      {isModalOpen && (
        <PhotoModal 
          photo={selectedPhoto} 
          isOpen={isModalOpen} 
          onClose={closeModal} 
        />
      )}

      {isEditModalOpen && (
        <EditPhotoModal
          photo={selectedPhoto}
          isOpen={isEditModalOpen}
          onClose={closeModal}
          onUpdate={loadPhotos}
        />
      )}

      <AdminPanel />
    </>
  );
}