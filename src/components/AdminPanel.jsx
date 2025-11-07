'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTimes, FaCheck } from 'react-icons/fa';

export default function AdminPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newId = Date.now();
    
    const newPhoto = {
      id: newId,
      ...formData
    };

    try {
      // Obtener fotos existentes del localStorage
      const existingPhotos = localStorage.getItem('albumPhotos');
      const photosArray = existingPhotos ? JSON.parse(existingPhotos) : [];
      
      // Añadir la nueva foto al inicio del array
      photosArray.unshift(newPhoto);
      
      // Guardar en localStorage
      localStorage.setItem('albumPhotos', JSON.stringify(photosArray));
      
      // Disparar evento para que el componente AlbumFotos se actualice
      window.dispatchEvent(new Event('albumUpdated'));
      
      console.log('Foto añadida al álbum:', newPhoto);
      
      // Mostrar mensaje de éxito
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setIsOpen(false);
      }, 2000);
      
      // Resetear formulario
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
      
    } catch (error) {
      console.error('Error guardando foto:', error);
      alert('Error al guardar la foto. Por favor, inténtalo de nuevo.');
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
      {/* Botón flotante */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setIsOpen(true)}
        className="cursor-pointer fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-[var(--color-accent)] text-black shadow-2xl hover:shadow-[var(--color-accent)]/50 flex items-center justify-center transition-all duration-300"
      >
        <FaPlus size={24} />
      </motion.button>

      {/* Panel modal */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="admin-panel-modal fixed inset-0 z-[9998] bg-black/90 flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-gray-900 rounded-3xl p-8 max-w-3xl w-full my-8"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-black text-white">
                <span style={{ color: 'var(--color-accent)' }}>Añadir</span> al Álbum
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="cursor-pointer w-10 h-10 rounded-full bg-gray-800 hover:bg-red-500 text-white transition-colors flex items-center justify-center"
              >
                <FaTimes />
              </button>
            </div>

            {/* Mensaje de éxito */}
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

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Fila 1: Título y Categoría */}
              <div className="grid md:grid-cols-2 gap-6">
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
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
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
                    placeholder="Ej: Retratos, Paisaje, Eventos"
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  />
                </div>
              </div>

              {/* URL de Imagen */}
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
                  placeholder="https://i.imgur.com/ejemplo.jpg"
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Sube tu imagen a Imgur y pega aquí la URL directa
                </p>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold text-[var(--color-accent)] mb-2">
                  Descripción *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>

              {/* Resto de campos (Autor, Fecha, etc.) */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-accent)] mb-2">
                    Autor
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
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
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-accent)] mb-2">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Ej: Sevilla, España"
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
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
                    placeholder="Ej: Canon EOS R6"
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-accent)] mb-2">
                    Lente
                  </label>
                  <input
                    type="text"
                    name="lens"
                    value={formData.lens}
                    onChange={handleChange}
                    placeholder="Ej: RF 85mm f/1.2"
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
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
                    placeholder="Ej: f/1.8, 1/200s, ISO 100"
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={showSuccess}
                  className="cursor-pointer flex-1 px-8 py-4 bg-[var(--color-accent)] text-black font-bold text-lg rounded-full hover:shadow-2xl hover:shadow-[var(--color-accent)]/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {showSuccess ? 'Guardado ✓' : 'Añadir al Álbum'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="cursor-pointer px-8 py-4 bg-gray-800 text-white font-bold text-lg rounded-full hover:bg-gray-700 transition-all duration-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
