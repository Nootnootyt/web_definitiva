'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import ProductGrid from '@/components/shop/ProductGrid';
import CartButton from '@/components/shop/CartButton';
import CartSidebar from '@/components/shop/CartSidebar';
import Header from '@/components/Header';
import { Toaster, toast } from 'react-hot-toast';
import { FaStore, FaPlus, FaTimes, FaUpload, FaLink } from 'react-icons/fa';

export default function TiendaPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [user, setUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(products.map((p) => p.category))];

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <>
      <Header />
      <Toaster position="top-right" />
      <CartButton />
      <CartSidebar />

      <div className="min-h-screen bg-black pt-24 pb-20 px-4 md:px-6">
        <div className="container mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <FaStore className="text-4xl text-[var(--color-accent)]" />
                <h1 className="text-5xl md:text-7xl font-black text-white">
                  TIENDA{' '}
                  <span className="text-[var(--color-accent)]">DEMO</span>
                </h1>
              </div>

              {/* Botón Añadir Producto (solo admin) */}
              {user && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] text-black font-bold rounded-xl hover:bg-white transition-all duration-300 hover:scale-105"
                >
                  <FaPlus />
                  <span>Añadir Producto</span>
                </button>
              )}
            </div>

            <p className="text-gray-400 text-lg md:text-xl max-w-3xl">
              Ejemplo de e-commerce funcional. Sistema completo de gestión de
              productos y pedidos.
            </p>
          </motion.div>

          {/* Filtros de categoría */}
          {categories.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-8 flex flex-wrap gap-3"
            >
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    px-6 py-3 rounded-full font-semibold text-sm uppercase tracking-wider
                    transition-all duration-300
                    ${
                      selectedCategory === category
                        ? 'bg-[var(--color-accent)] text-black'
                        : 'glass text-gray-400 hover:text-white hover:glass-accent'
                    }
                  `}
                >
                  {category === 'all' ? 'Todos' : category}
                </button>
              ))}
            </motion.div>
          )}

          {/* Grid de productos */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-16 h-16 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <FaStore className="text-6xl text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 text-xl mb-6">
                {products.length === 0
                  ? 'No hay productos disponibles'
                  : 'No hay productos en esta categoría'}
              </p>
              {products.length === 0 && user && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] text-black font-bold rounded-xl hover:bg-white transition-colors"
                >
                  <FaPlus />
                  <span>Añadir Primer Producto</span>
                </button>
              )}
            </div>
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </div>
      </div>

      {/* Modal Añadir Producto */}
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadProducts();
          }}
        />
      )}
    </>
  );
}

// Modal para añadir producto - VERSIÓN COMPLETA
function AddProductModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' o 'upload'
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    stock: 100,
    available: true, // ✅ AÑADIDO
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImageToSupabase = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()
        .toString(36)
        .substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('product-images').getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.image;

      // Si se subió una imagen, subirla a Supabase
      if (uploadMethod === 'upload' && imageFile) {
        imageUrl = await uploadImageToSupabase(imageFile);
      }

      // Validar que hay una imagen
      if (!imageUrl) {
        toast.error('Debes proporcionar una imagen');
        setLoading(false);
        return;
      }

      // ✅ CREAR PRODUCTO CON TODOS LOS CAMPOS
      const { error } = await supabase.from('products').insert([
        {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          image: imageUrl,
          category: formData.category || 'General',
          stock: parseInt(formData.stock),
          available: formData.available,
          // id y created_at se generan automáticamente
        },
      ]);

      if (error) throw error;

      toast.success('✅ Producto creado con éxito');
      onSuccess();
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('❌ Error al crear el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-strong rounded-3xl max-w-3xl w-full my-8"
        >
          {/* Header */}
          <div className="sticky top-0 glass-dark p-6 flex justify-between items-center border-b border-gray-800 z-10 rounded-t-3xl">
            <div>
              <h2 className="text-2xl font-black text-white">Nuevo Producto</h2>
              <p className="text-sm text-gray-400">
                Completa todos los campos del producto
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full glass-accent hover:bg-red-500 transition-colors flex items-center justify-center"
            >
              <FaTimes />
            </button>
          </div>
          {/* Formulario */}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* ========== CAMPO: IMAGEN ========== */}
            <div className="glass rounded-2xl p-6 border-2 border-[var(--color-accent)]/30">
              <label className="text-lg font-bold text-white mb-3 block flex items-center gap-2">
                📷 Imagen del producto *
              </label>

              <div className="flex gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setUploadMethod('url')}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    uploadMethod === 'url'
                      ? 'bg-[var(--color-accent)] text-black'
                      : 'glass text-gray-400 hover:glass-accent'
                  }`}
                >
                  <FaLink />
                  URL de Imagen
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod('upload')}
                  className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    uploadMethod === 'upload'
                      ? 'bg-[var(--color-accent)] text-black'
                      : 'glass text-gray-400 hover:glass-accent'
                  }`}
                >
                  <FaUpload />
                  Subir Imagen
                </button>
              </div>

              {uploadMethod === 'url' ? (
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              ) : (
                <div>
                  <label className="cursor-pointer block w-full px-4 py-8 glass rounded-xl border-2 border-dashed border-gray-700 hover:border-[var(--color-accent)] transition-colors text-center">
                    <FaUpload className="text-4xl text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 mb-1 font-semibold">
                      {imageFile
                        ? imageFile.name
                        : 'Click para seleccionar imagen'}
                    </p>
                    <p className="text-xs text-gray-600">
                      PNG, JPG, WEBP (máx 5MB)
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {imagePreview && (
                    <div className="mt-4 rounded-xl overflow-hidden border-2 border-[var(--color-accent)]">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ========== CAMPO: NOMBRE ========== */}
            <div className="glass rounded-2xl p-6">
              <label className="text-lg font-bold text-white mb-3 block flex items-center gap-2">
                🏷️ Nombre del producto *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 glass rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                placeholder="Ej: MacBook Pro M3"
              />
            </div>

            {/* ========== CAMPO: DESCRIPCIÓN ========== */}
            <div className="glass rounded-2xl p-6">
              <label className="text-lg font-bold text-white mb-3 block flex items-center gap-2">
                📝 Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
                placeholder="Descripción detallada del producto"
              />
            </div>

            {/* ========== CAMPOS: PRECIO y STOCK ========== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass rounded-2xl p-6">
                <label className="text-lg font-bold text-white mb-3 block flex items-center gap-2">
                  💰 Precio (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full px-4 py-3 glass rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  placeholder="19.99"
                />
              </div>

              <div className="glass rounded-2xl p-6">
                <label className="text-lg font-bold text-white mb-3 block flex items-center gap-2">
                  📦 Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  className="w-full px-4 py-3 glass rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  placeholder="100"
                />
              </div>
            </div>

            {/* ========== CAMPO: CATEGORÍA ========== */}
            <div className="glass rounded-2xl p-6">
              <label className="text-lg font-bold text-white mb-3 block flex items-center gap-2">
                🏪 Categoría
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-3 glass rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                placeholder="Ej: Electrónica, Ropa, Audio, Gaming..."
              />
            </div>

            {/* ========== CAMPO: DISPONIBLE (AVAILABLE) ========== */}
            <div className="glass rounded-2xl p-6">
              <label className="text-lg font-bold text-white mb-3 block flex items-center gap-2">
                👁️ Visibilidad del producto
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) =>
                      setFormData({ ...formData, available: e.target.checked })
                    }
                    className="w-6 h-6 rounded accent-[var(--color-accent)]"
                  />
                  <span className="text-white font-semibold">
                    Producto visible en tienda pública
                  </span>
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {formData.available
                  ? '✅ Los clientes podrán ver y comprar este producto'
                  : '❌ El producto estará oculto para los clientes'}
              </p>
            </div>

            {/* ========== RESUMEN DE DATOS ========== */}
            <div className="glass-accent rounded-2xl p-6 border-2 border-[var(--color-accent)]/50">
              <h3 className="text-lg font-bold text-white mb-4">
                📋 Resumen del producto:
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Nombre:</span>
                  <span className="text-white font-semibold">
                    {formData.name || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Precio:</span>
                  <span className="text-[var(--color-accent)] font-bold">
                    {formData.price ? `€${formData.price}` : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Stock:</span>
                  <span className="text-white font-semibold">
                    {formData.stock}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Categoría:</span>
                  <span className="text-white font-semibold">
                    {formData.category || 'General'}
                  </span>
                </div>
                <div className="flex justify-between col-span-2">
                  <span className="text-gray-400">Estado:</span>
                  <span
                    className={`font-semibold ${
                      formData.available ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {formData.available ? 'Visible' : 'Oculto'}
                  </span>
                </div>
              </div>
            </div>

            {/* ========== BOTÓN SUBMIT ==========  por que cojones no funciona*/}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-[var(--color-accent)] text-black font-black text-xl rounded-xl hover:bg-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-3 shadow-2xl shadow-[var(--color-accent)]/50"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Creando producto...</span>
                </>
              ) : (
                <>
                  <FaPlus className="text-2xl" />
                  <span>CREAR PRODUCTO</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
