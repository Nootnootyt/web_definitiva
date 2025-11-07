'use client';
import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaTrash, FaSpinner, FaEdit, FaStar, FaHome, FaCamera, FaImages } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import PhotoModal from '@/components/PhotoModal';
import EditPhotoModal from '@/components/EditPhotoModal';
import CustomCursor from '@/components/CustomCursor';
import AdminPanel from '@/components/AdminPanel';
import Link from 'next/link';

export default function AlbumPage() {
  const [ref, inView] = useInView({
    triggerOnce: true, // ✅ Solo animar una vez
    threshold: 0.1,
  });

  const prefersReducedMotion = useReducedMotion(); // ✅ Detectar preferencias de animación

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [albumPhotos, setAlbumPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // ... (resto del código de efectos igual)
  
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

  useEffect(() => {
    loadPhotos();
    const subscription = supabase
      .channel('photos_changes_album')
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
    if (!confirm('¿Estás seguro de que quieres eliminar esta foto del álbum? Se borrará permanentemente.')) return;
    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId);
      if (error) throw error;
      setAlbumPhotos(albumPhotos.filter(photo => photo.id !== photoId));
    } catch (error) {
      console.error('Error eliminando foto:', error);
      alert('Error al eliminar la foto.');
    }
  };

  const openModal = (photo) => {
    setSelectedPhoto(photo);
    setIsModalOpen(true);
  };

  const openEditModal = (photo) => {
    setSelectedPhoto(photo);
    setIsEditModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditModalOpen(false);
    setTimeout(() => setSelectedPhoto(null), 300);
  };

  // ✅ Animaciones más ligeras
  const containerVariants = prefersReducedMotion ? {} : {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05, // Reducido de 0.1 a 0.05
      }
    }
  };

  const itemVariants = prefersReducedMotion ? {} : {
    hidden: { opacity: 0, y: 20 }, // Reducido de y: 30
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3, // Reducido de 0.5
        ease: 'easeOut'
      }
    }
  };

  if (loading) {
    return (
      <>
        <CustomCursor />
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
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
        {/* ✅ Elementos decorativos SIMPLIFICADOS (sin animaciones pesadas en móvil) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(183,255,0,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(183,255,0,.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
          
          {/* ✅ Gradientes SIN animación en móvil */}
          <div className="absolute top-20 right-20 w-96 h-96 bg-[var(--color-accent)] rounded-full blur-3xl opacity-10 hidden md:block" />
          <div className="absolute bottom-40 left-10 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-10 hidden md:block" />
        </div>

        {/* Header mejorado */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md shadow-lg border-b border-gray-800">
          <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Título con ícono - OPTIMIZADO PARA MÓVIL */}
              <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center">
                  <FaImages className="text-lg md:text-2xl text-[var(--color-accent)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg md:text-2xl lg:text-3xl font-black truncate">
                    <span style={{ color: 'var(--color-accent)' }}>ÁLBUM</span>{' '}
                    <span className="hidden sm:inline">COMPLETO</span>
                  </h1>
                  <p className="text-xs text-gray-500 hidden md:block">Todas mis capturas</p>
                </div>
              </div>

              {/* Botón volver - OPTIMIZADO */}
              <Link href="/">
                <button className="cursor-pointer flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full bg-[var(--color-accent)] hover:bg-white text-black font-semibold transition-colors text-sm md:text-base whitespace-nowrap">
                  <FaHome className="flex-shrink-0" />
                  <span className="hidden sm:inline">Volver</span>
                </button>
              </Link>
            </div>
          </div>
        </header>

        {/* Contenido principal */}
        <section className="pt-24 md:pt-32 pb-20 px-4 md:px-6 relative z-10" ref={ref}>
          <div className="container mx-auto">
            {/* Stats - SIMPLIFICADOS */}
            <div className="flex flex-wrap gap-3 md:gap-4 mb-8 md:mb-12">
              <div className="p-3 md:p-4 bg-gray-900/80 border border-gray-800 rounded-xl backdrop-blur-sm flex-1 min-w-[120px]">
                <p className="text-gray-400 text-xs md:text-sm mb-1">Total</p>
                <p className="text-2xl md:text-3xl font-black text-[var(--color-accent)]">
                  {albumPhotos.length}
                </p>
              </div>
              
              {user && (
                <div className="p-3 md:p-4 bg-gray-900/80 border border-gray-800 rounded-xl backdrop-blur-sm flex-1 min-w-[120px]">
                  <p className="text-gray-400 text-xs md:text-sm mb-1">Portfolio</p>
                  <p className="text-2xl md:text-3xl font-black text-[var(--color-accent)]">
                    {albumPhotos.filter(p => p.in_portfolio).length}
                  </p>
                </div>
              )}

              {user && (
                <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-full flex-shrink-0">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-400 text-xs md:text-sm font-semibold whitespace-nowrap">Edición activa</span>
                </div>
              )}
            </div>

            {/* Grid de fotos - ✅ SIN whileHover en móvil */}
            {albumPhotos.length === 0 ? (
              <div className="text-center py-20 md:py-32">
                <FaCamera className="text-5xl md:text-6xl text-gray-700 mx-auto mb-4 md:mb-6" />
                <p className="text-gray-500 text-xl md:text-2xl mb-2">No hay fotos</p>
                <p className="text-gray-600 text-sm">Añade fotos con el botón +</p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6"
              >
                {albumPhotos.map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    variants={itemVariants}
                    className="relative group overflow-hidden rounded-lg md:rounded-xl aspect-square bg-gray-900 border border-gray-800 hover:border-[var(--color-accent)] transition-all"
                  >
                    {/* Badge */}
                    {photo.in_portfolio && (
                      <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-[var(--color-accent)] text-black rounded-full text-xs font-bold flex items-center gap-1">
                        <FaStar size={8} />
                        <span className="hidden sm:inline">Portfolio</span>
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
                          className="cursor-pointer w-8 h-8 md:w-9 md:h-9 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors"
                        >
                          <FaEdit size={12} className="md:text-sm" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePhoto(photo.id);
                          }}
                          className="cursor-pointer w-8 h-8 md:w-9 md:h-9 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                        >
                          <FaTrash size={12} className="md:text-sm" />
                        </button>
                      </div>
                    )}

                    {/* Imagen */}
                    <div
                      onClick={() => openModal(photo)}
                      className="cursor-pointer w-full h-full relative"
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 md:group-hover:scale-110"
                        style={{ backgroundImage: `url(${photo.image})` }}
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
            )}
          </div>
        </section>
      </div>

      <PhotoModal 
        photo={selectedPhoto} 
        isOpen={isModalOpen} 
        onClose={closeModal} 
      />

      <EditPhotoModal
        photo={selectedPhoto}
        isOpen={isEditModalOpen}
        onClose={closeModal}
        onUpdate={loadPhotos}
      />

      <AdminPanel />
    </>
  );
}
