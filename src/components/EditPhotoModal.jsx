'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCheck, FaSpinner, FaStar } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';

export default function EditPhotoModal({ photo, isOpen, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    author: '',
    date: '',
    location: '',
    camera: '',
    lens: '',
    settings: '',
    in_portfolio: false
  });

  useEffect(() => {
    if (photo) {
      setFormData({
        title: photo.title || '',
        description: photo.description || '',
        category: photo.category || '',
        author: photo.author || '',
        date: photo.date || '',
        location: photo.location || '',
        camera: photo.camera || '',
        lens: photo.lens || '',
        settings: photo.settings || '',
        in_portfolio: photo.in_portfolio || false
      });
    }
  }, [photo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('photos')
        .update(formData)
        .eq('id', photo.id);

      if (error) throw error;

      alert('Foto actualizada correctamente');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error actualizando foto:', error);
      alert('Error al actualizar la foto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  if (!isOpen || !photo) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
        style={{ overflow: 'hidden' }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          className="bg-gray-900 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-8 pb-4 flex-shrink-0">
            <h2 className="text-3xl font-black text-white">
              <span style={{ color: 'var(--color-accent)' }}>Editar</span> Foto
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="cursor-pointer w-10 h-10 rounded-full bg-gray-800 hover:bg-red-500 text-white transition-colors flex items-center justify-center"
            >
              <FaTimes />
            </button>
          </div>

          {/* Contenido con scroll */}
          <div className="overflow-y-auto px-8 pb-8 flex-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Toggle Portfolio */}
              <div className="p-4 bg-gray-800 rounded-lg">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <FaStar className="text-[var(--color-accent)]" size={20} />
                    <div>
                      <p className="font-semibold text-white">Mostrar en Portfolio</p>
                      <p className="text-sm text-gray-400">Esta foto aparecerá en la página principal</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    name="in_portfolio"
                    checked={formData.in_portfolio}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-6 h-6 rounded bg-gray-700 border-gray-600 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                  />
                </label>
              </div>

              {/* Campos del formulario */}
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
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer flex-1 px-8 py-4 bg-[var(--color-accent)] text-black font-bold text-lg rounded-full hover:shadow-2xl hover:shadow-[var(--color-accent)]/50 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      Guardar Cambios
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="cursor-pointer px-8 py-4 bg-gray-800 text-white font-bold text-lg rounded-full hover:bg-gray-700 transition-all duration-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
