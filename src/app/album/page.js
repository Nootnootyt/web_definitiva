'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaTrash, FaSpinner, FaEdit, FaStar, FaHome } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import PhotoModal from '@/components/PhotoModal';
import EditPhotoModal from '@/components/EditPhotoModal';
import CustomCursor from '@/components/CustomCursor';
import Link from 'next/link';
import AdminPanel from '@/components/AdminPanel';  // ✅ Añade este import al principio

export default function AlbumPage() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  // Cargar fotos
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  if (loading) {
    return (
      <>
        <CustomCursor />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <FaSpinner className="animate-spin text-[var(--color-accent)] text-6xl" />
        </div>
      </>
    );
  }

  return (
    <>
      <CustomCursor />
      <div className="min-h-screen bg-black text-white">
        {/* Header con botón volver */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md shadow-lg">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-black">
              <span style={{ color: 'var(--color-accent)' }}>ÁLBUM</span> COMPLETO
            </h1>
            <Link href="/">
              <button className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-accent)] hover:bg-white text-black font-semibold transition-all">
                <FaHome />
                Volver al Inicio
              </button>
            </Link>
          </div>
        </header>

        {/* Contenido principal */}
        <section className="pt-32 pb-20 px-6" ref={ref}>
          <div className="container mx-auto">
            <p className="text-gray-400 text-xl mb-12">
              {albumPhotos.length} {albumPhotos.length === 1 ? 'foto' : 'fotos'} en total
            </p>

            {albumPhotos.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-2xl">No hay fotos en el álbum</p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {albumPhotos.map((photo) => (
                  <motion.div
                    key={photo.id}
                    variants={itemVariants}
                    className="relative group overflow-hidden rounded-xl aspect-square bg-gray-900"
                  >
                    {/* Badge de portfolio */}
                    {photo.in_portfolio && (
                      <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-[var(--color-accent)] text-black rounded-full text-xs font-bold flex items-center gap-1">
                        <FaStar size={10} />
                        Portfolio
                      </div>
                    )}

                    {/* Botones de admin */}
                    {user && (
                      <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(photo);
                          }}
                          className="cursor-pointer w-9 h-9 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-all"
                          title="Editar"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePhoto(photo.id);
                          }}
                          className="cursor-pointer w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all"
                          title="Eliminar"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    )}

                    {/* Imagen */}
                    <div
                      onClick={() => openModal(photo)}
                      className="cursor-pointer w-full h-full relative"
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundImage: `url(${photo.image})` }}
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                      
                      <div className="absolute inset-0 flex flex-col justify-end p-4">
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform opacity-0 group-hover:opacity-100">
                          <span className="text-xs text-[var(--color-accent)] font-semibold mb-1 block">
                            {photo.category}
                          </span>
                          <h3 className="text-lg font-bold text-white">
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
