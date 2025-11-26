'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaImages, FaEdit, FaTimes } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import PhotoModal from './PhotoModal';
import EditPhotoModal from './EditPhotoModal';
import Image from 'next/image'; // ✅ IMPORTAR

export default function PortfolioFotos() {
  const [portfolioPhotos, setPortfolioPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Verificar sesión
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const loadPortfolioPhotos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('in_portfolio', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPortfolioPhotos(data || []);
    } catch (error) {
      console.error('Error cargando fotos del portfolio:', error);
    }
  }, []);

  useEffect(() => {
    loadPortfolioPhotos();

    const subscription = supabase
      .channel('photos_changes_portfolio')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'photos'
      }, () => {
        loadPortfolioPhotos();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [loadPortfolioPhotos]);

  const removeFromPortfolio = async (photoId) => {
    if (!user) {
      alert('Debes iniciar sesión');
      return;
    }

    if (!confirm('¿Quitar esta foto del portfolio destacado?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('photos')
        .update({ in_portfolio: false })
        .eq('id', photoId);

      if (error) throw error;
      loadPortfolioPhotos();
    } catch (error) {
      console.error('Error quitando del portfolio:', error);
      alert('Error al quitar del portfolio.');
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

  return (
    <>
      <section id="destacado" className="py-16 md:py-24 px-4 md:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(183,255,0,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(183,255,0,.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000,transparent)] pointer-events-none" />
        
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 md:mb-12">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center">
                <FaImages className="text-2xl md:text-3xl text-[var(--color-accent)]" />
              </div>
              <div>
                <h2 className="text-3xl md:text-5xl font-black">
                  <span className="text-white">FOTOS</span>{' '}
                  <span style={{ color: 'var(--color-accent)' }}>DESTACADAS</span>
                </h2>
                <p className="text-sm md:text-base text-gray-400 mt-1">Mi mejor trabajo fotográfico</p>
              </div>
            </div>
          </div>

          {portfolioPhotos.length === 0 ? (
            <div className="text-center py-20">
              <FaImages className="text-6xl text-gray-700 mx-auto mb-6" />
              <p className="text-gray-500 text-xl md:text-2xl">No hay fotos destacadas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {portfolioPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="relative group rounded-xl md:rounded-2xl overflow-hidden cursor-pointer bg-gray-900"
                  style={{ aspectRatio: '1/1' }}
                  onClick={() => openModal(photo)}
                >
                  {/* Botones admin */}
                  {user && (
                    <div className="absolute top-3 right-3 z-20 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(photo);
                        }}
                        className="w-9 h-9 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-lg"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromPortfolio(photo.id);
                        }}
                        className="w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg"
                      >
                        <FaTimes size={16} />
                      </button>
                    </div>
                  )}

                  {/* ✅ IMAGEN OPTIMIZADA CON NEXT.JS IMAGE */}
                  <Image
                    src={photo.image}
                    alt={photo.title || 'Destacado'}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    priority={index < 3} // ✅ Priorizar las primeras 3 imágenes
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

                  {/* Texto */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6 pointer-events-none">
                    <div className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-2 block">
                        {photo.category}
                      </span>
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2">
                        {photo.title}
                      </h3>
                      <div className="w-12 h-1 bg-[var(--color-accent)] group-hover:w-full transition-all duration-500" />
                    </div>
                  </div>

                  {/* Borde hover */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--color-accent)] transition-all duration-300 rounded-xl md:rounded-2xl pointer-events-none" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <PhotoModal 
        photo={selectedPhoto} 
        isOpen={isModalOpen} 
        onClose={closeModal} 
      />

      <EditPhotoModal
        photo={selectedPhoto}
        isOpen={isEditModalOpen}
        onClose={closeModal}
        onUpdate={loadPortfolioPhotos}
      />
    </>
  );
}