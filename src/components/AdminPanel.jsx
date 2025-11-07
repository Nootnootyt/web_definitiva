'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTimes, FaCheck, FaSpinner, FaUpload, FaLink, FaSignOutAlt, FaLock } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import LoginModal from './LoginModal';

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState('url');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    image: '',
    author: 'Javier Jiménez',
    date: new Date().toISOString().split('T')[0],
    location: '',
    camera: '',
    lens: '',
    settings: ''
  });

  // Verificar sesión al cargar
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsOpen(false);
  };

  const handleButtonClick = () => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      setIsOpen(true);
    }
  };

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 5MB');
      return;
    }

    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('album-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('album-photos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let imageUrl = formData.image;

      if (uploadMode === 'upload') {
        if (!selectedFile) {
          alert('Por favor, selecciona una imagen');
          setLoading(false);
          return;
        }

        setUploadProgress(50);
        imageUrl = await uploadImage(selectedFile);
        setUploadProgress(100);
      }

      if (!imageUrl) {
        alert('Por favor, proporciona una imagen (URL o archivo)');
        setLoading(false);
        return;
      }

      const photoData = {
        ...formData,
        image: imageUrl
      };

      const { data, error } = await supabase
        .from('photos')
        .insert([photoData])
        .select();

      if (error) throw error;

      console.log('Foto añadida:', data);
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setIsOpen(false);
        setLoading(false);
        setUploadProgress(0);
      }, 2000);
      
      setFormData({
        title: '',
        description: '',
        category: '',
        image: '',
        author: 'Javier Jiménez',
        date: new Date().toISOString().split('T')[0],
        location: '',
        camera: '',
        lens: '',
        settings: ''
      });
      setSelectedFile(null);
      setPreviewUrl('');
      
    } catch (error) {
      console.error('Error guardando foto:', error);
      alert('Error al guardar la foto: ' + error.message);
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      {/* Botón flotante principal */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={handleButtonClick}
        className="cursor-pointer fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-[var(--color-accent)] text-black shadow-2xl hover:shadow-[var(--color-accent)]/50 flex items-center justify-center transition-all duration-300"
        title={user ? "Añadir foto" : "Iniciar sesión para añadir fotos"}
      >
        <FaPlus size={24} />
      </motion.button> 




      

      {/* Modal de login */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={(user) => {
          setUser(user);
          setShowLoginModal(false);
          setIsOpen(true);
        }}
      />

            {/* Modal de añadir foto (solo si está autenticado) */}
      {isOpen && user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="admin-panel-modal fixed inset-0 z-[9998] bg-black/90 flex items-center justify-center p-4"
          style={{ 
            overflow: 'hidden',
            touchAction: 'none'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-gray-900 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col"
            style={{ 
              touchAction: 'auto'
            }}
          >
            {/* Header fijo */}
            <div className="flex justify-between items-center p-8 pb-4 flex-shrink-0">
              <h2 className="text-3xl md:text-4xl font-black text-white">
                <span style={{ color: 'var(--color-accent)' }}>Añadir</span> al Álbum
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="cursor-pointer w-10 h-10 rounded-full bg-gray-800 hover:bg-red-500 text-white transition-colors flex items-center justify-center disabled:opacity-50 flex-shrink-0"
              >
                <FaTimes />
              </button>
            </div>

            {/* Contenido con scroll */}
            <div 
              className="overflow-y-auto px-8 pb-8 flex-1"
              style={{
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain'
              }}
            >
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-green-500 text-white rounded-lg flex items-center gap-3"
                >
                  <FaCheck />
                  <span className="font-semibold">¡Foto añadida al álbum exitosamente!</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Selector de modo */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-accent)] mb-3">
                    Método de Imagen *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setUploadMode('url')}
                      disabled={loading}
                      className={`cursor-pointer p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                        uploadMode === 'url'
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                          : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                      } disabled:opacity-50`}
                    >
                      <FaLink />
                      <span className="font-semibold text-sm">URL</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUploadMode('upload')}
                      disabled={loading}
                      className={`cursor-pointer p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                        uploadMode === 'upload'
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                          : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                      } disabled:opacity-50`}
                    >
                      <FaUpload />
                      <span className="font-semibold text-sm">Subir</span>
                    </button>
                  </div>
                </div>

                {/* Campo de imagen */}
                {uploadMode === 'url' ? (
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-accent)] mb-2">
                      URL de la Imagen *
                    </label>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      placeholder="https://i.imgur.com/ejemplo.jpg"
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-accent)] mb-2">
                      Subir Imagen *
                    </label>
                    
                    {previewUrl && (
                      <div className="mb-4 relative aspect-video rounded-lg overflow-hidden bg-gray-800">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl('');
                          }}
                          className="cursor-pointer absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center"
                        >
                          <FaTimes size={14} />
                        </button>
                      </div>
                    )}

                    <label className="cursor-pointer block">
                      <div className="border-2 border-dashed border-gray-600 hover:border-[var(--color-accent)] rounded-lg p-6 text-center transition-all">
                        <FaUpload className="text-3xl text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-400 mb-1 text-sm">
                          {selectedFile ? selectedFile.name : 'Seleccionar imagen'}
                        </p>
                        <p className="text-xs text-gray-600">
                          PNG, JPG, WEBP (máx 5MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={loading}
                        className="hidden"
                      />
                    </label>

                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-4">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-[var(--color-accent)] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-400 mt-2 text-center">
                          Subiendo... {uploadProgress}%
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Resto de campos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-accent)] mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-accent)] mb-2">
                      Categoría *
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      placeholder="Ej: Retratos, Paisaje"
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--color-accent)] mb-2">
                    Descripción *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    rows="3"
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-accent)] mb-2">
                      Autor
                    </label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-accent)] mb-2">
                      Fecha
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-accent)] mb-2">
                      Ubicación
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="Ej: Sevilla, España"
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-accent)] mb-2">
                      Cámara
                    </label>
                    <input
                      type="text"
                      name="camera"
                      value={formData.camera}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="Ej: Canon EOS R6"
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-accent)] mb-2">
                      Lente
                    </label>
                    <input
                      type="text"
                      name="lens"
                      value={formData.lens}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="Ej: RF 85mm f/1.2"
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-accent)] mb-2">
                      Configuración
                    </label>
                    <input
                      type="text"
                      name="settings"
                      value={formData.settings}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="Ej: f/1.8, 1/200s, ISO 100"
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Botones */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading || showSuccess}
                    className="cursor-pointer flex-1 px-8 py-4 bg-[var(--color-accent)] text-black font-bold text-lg rounded-full hover:shadow-2xl hover:shadow-[var(--color-accent)]/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        {uploadProgress > 0 ? 'Subiendo...' : 'Guardando...'}
                      </>
                    ) : showSuccess ? (
                      <>
                        <FaCheck />
                        Guardado
                      </>
                    ) : (
                      'Añadir al Álbum'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={loading}
                    className="cursor-pointer px-8 py-4 bg-gray-800 text-white font-bold text-lg rounded-full hover:bg-gray-700 transition-all duration-300 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

