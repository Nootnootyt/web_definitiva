'use client';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'; // ⭐ AÑADIDO: useCallback, useMemo, useRef
import { motion } from 'framer-motion';
import { FaPlus, FaTimes, FaCheck, FaSpinner, FaUpload, FaLink } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import LoginModal from './LoginModal';
import Image from 'next/image'; // ✅ IMPORTAR

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
  
  // ⭐ OPTIMIZACIÓN 1: useRef para tracking de URLs creadas
  const previewUrlRef = useRef(null);
  
  // ⭐ OPTIMIZACIÓN 2: useMemo para formData inicial
  const initialFormData = useMemo(() => ({
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
  }), []);

  const [formData, setFormData] = useState(initialFormData);

  // ⭐ OPTIMIZACIÓN 3: Memoizar checkUser con useCallback
  const checkUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }, []);

  // Verificar sesión al cargar
  useEffect(() => {
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [checkUser]);

  // ⭐ OPTIMIZACIÓN 4: Memoizar handleLogout
  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsOpen(false);
  }, []);

  // ⭐ OPTIMIZACIÓN 5: Memoizar handleButtonClick
  const handleButtonClick = useCallback(() => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      setIsOpen(true);
    }
  }, [user]);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  // ⭐ OPTIMIZACIÓN 6: useCallback + URL.createObjectURL (más eficiente que FileReader)
  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona una imagen válida');
      return;
    }

    // ⭐ OPTIMIZACIÓN 7: Compresión de imagen si es muy grande
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 5MB');
      return;
    }

    setSelectedFile(file);
    
    // ⭐ CRÍTICO: Limpiar URL anterior para evitar memory leaks
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    
    // ⭐ OPTIMIZACIÓN 8: Usar createObjectURL en vez de FileReader (mucho más rápido)
    const objectUrl = URL.createObjectURL(file);
    previewUrlRef.current = objectUrl;
    setPreviewUrl(objectUrl);
  }, []);

  // ⭐ OPTIMIZACIÓN 9: Limpiar URLs cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  // ⭐ OPTIMIZACIÓN 10: Memoizar uploadImage
  const uploadImage = useCallback(async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error } = await supabase.storage
        .from('album-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          // ⭐ OPTIMIZACIÓN 11: Añadir contentType para mejor compresión
          contentType: file.type,
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
  }, []);

  // ⭐ OPTIMIZACIÓN 12: Memoizar handleSubmit
  const handleSubmit = useCallback(async (e) => {
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
      
      // ⭐ OPTIMIZACIÓN 13: Usar Promise en vez de setTimeout anidado
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowSuccess(false);
      setIsOpen(false);
      setLoading(false);
      setUploadProgress(0);
      
      // ⭐ Resetear formulario
      setFormData(initialFormData);
      setSelectedFile(null);
      
      // ⭐ Limpiar preview URL
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
      setPreviewUrl('');
      
    } catch (error) {
      console.error('Error guardando foto:', error);
      alert('Error al guardar la foto: ' + error.message);
      setLoading(false);
      setUploadProgress(0);
    }
  }, [formData, uploadMode, selectedFile, uploadImage, initialFormData]);

  // ⭐ OPTIMIZACIÓN 14: Memoizar handleChange
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // ⭐ OPTIMIZACIÓN 15: Memoizar función para limpiar preview
  const clearPreview = useCallback(() => {
    setSelectedFile(null);
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl('');
  }, []);

  // ⭐ OPTIMIZACIÓN 16: Memoizar variantes de animación
  const modalVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }), []);

  const contentVariants = useMemo(() => ({
    hidden: { scale: 0.9, y: 50 },
    visible: { scale: 1, y: 0 }
  }), []);

  return (
    <>
      {/* Botón flotante principal */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }} // ⭐ AÑADIDO: feedback táctil
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
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="admin-panel-modal fixed inset-0 z-[9998] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)} // ⭐ AÑADIDO: cerrar al hacer click fuera
        >
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            onClick={(e) => e.stopPropagation()} // ⭐ Evitar cerrar al click dentro
            className="bg-gray-900 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl"
          >
            {/* Header fijo */}
            <div className="flex justify-between items-center p-6 md:p-8 pb-4 flex-shrink-0 border-b border-gray-800">
              <h2 className="text-2xl md:text-4xl font-black text-white">
                <span style={{ color: 'var(--color-accent)' }}>Añadir</span> al Álbum
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="cursor-pointer w-10 h-10 rounded-full bg-gray-800 hover:bg-red-500 text-white transition-colors flex items-center justify-center disabled:opacity-50 flex-shrink-0"
                aria-label="Cerrar modal"
              >
                <FaTimes />
              </button>
            </div>

            {/* Contenido con scroll */}
            <div 
              className="overflow-y-auto px-6 md:px-8 pb-8 flex-1"
              style={{
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain'
              }}
            >
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-green-500 text-white rounded-lg flex items-center gap-3 shadow-lg"
                >
                  <FaCheck />
                  <span className="font-semibold">¡Foto añadida al álbum exitosamente!</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 mt-6">
                {/* Selector de modo */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-accent)] mb-3">
                    Método de Imagen *
                  </label>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <button
                      type="button"
                      onClick={() => setUploadMode('url')}
                      disabled={loading}
                      className={`cursor-pointer p-3 md:p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                        uploadMode === 'url'
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                          : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <FaLink />
                      <span className="font-semibold text-sm">URL</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUploadMode('upload')}
                      disabled={loading}
                      className={`cursor-pointer p-3 md:p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                        uploadMode === 'upload'
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                          : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
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
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50 transition-all"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-accent)] mb-2">
                      Subir Imagen *
                    </label>
                    
                    
                    {previewUrl && (
                      <div className="mb-4 relative aspect-video rounded-lg overflow-hidden bg-gray-800 shadow-lg">
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          fill
                          sizes="(max-width: 768px) 100vw, 600px"
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={clearPreview}
                          className="cursor-pointer absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-lg"
                          aria-label="Eliminar imagen"
                        >
                          <FaTimes size={14} />
                        </button>
                      </div>
                    )}

                    <label className="cursor-pointer block">
                      <div className="border-2 border-dashed border-gray-600 hover:border-[var(--color-accent)] rounded-lg p-6 text-center transition-all hover:bg-gray-800/50">
                        <FaUpload className="text-3xl text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-400 mb-1 text-sm font-medium">
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
                        aria-label="Seleccionar archivo de imagen"
                      />
                    </label>

                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-4">
                        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[var(--color-accent)] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-400 mt-2 text-center font-medium">
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
                      placeholder="Título de la foto"
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50 transition-all"
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
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50 transition-all"
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
                    placeholder="Describe tu foto..."
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50 resize-none transition-all"
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
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50 transition-all"
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
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50 transition-all"
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
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50 transition-all"
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
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50 transition-all"
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
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50 transition-all"
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
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50 transition-all"
                    />
                  </div>
                </div>

                {/* Botones */}
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading || showSuccess}
                    className="cursor-pointer flex-1 px-6 md:px-8 py-3 md:py-4 bg-[var(--color-accent)] text-black font-bold text-base md:text-lg rounded-full hover:shadow-2xl hover:shadow-[var(--color-accent)]/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin text-xl" />
                        <span>{uploadProgress > 0 ? 'Subiendo...' : 'Guardando...'}</span>
                      </>
                    ) : showSuccess ? (
                      <>
                        <FaCheck className="text-xl" />
                        <span>Guardado</span>
                      </>
                    ) : (
                      'Añadir al Álbum'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={loading}
                    className="cursor-pointer px-6 md:px-8 py-3 md:py-4 bg-gray-800 text-white font-bold text-base md:text-lg rounded-full hover:bg-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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