'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaTimes } from 'react-icons/fa';

export default function AdminPanel() {
  const [isOpen, setIsOpen] = useState(false);
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

    console.log('Nueva foto añadida:', newPhoto);
    
    const photoCode = JSON.stringify(newPhoto, null, 2);
    alert(`Copia este código y añádelo manualmente a public/data/photos.json:\n\n${photoCode}`);
    
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
    
    setIsOpen(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      {/* Botón flotante para abrir panel */}
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
            {/* Header del modal */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-black text-white">
                <span style={{ color: 'var(--color-accent)' }}>Añadir</span> Foto
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="cursor-pointer w-10 h-10 rounded-full bg-gray-800 hover:bg-red-500 text-white transition-colors flex items-center justify-center"
              >
                <FaTimes />
              </button>
            </div>

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

              {/* Fila 2: Autor y Fecha */}
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

              {/* Fila 3: Ubicación y Cámara */}
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

              {/* Fila 4: Lente y Configuración */}
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

              {/* Botones de acción */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="cursor-pointer flex-1 px-8 py-4 bg-[var(--color-accent)] text-black font-bold text-lg rounded-full hover:shadow-2xl hover:shadow-[var(--color-accent)]/50 transition-all duration-300"
                >
                  Generar Código JSON
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
