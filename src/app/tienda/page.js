'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import ProductGrid from '@/components/shop/ProductGrid';
import CartButton from '@/components/shop/CartButton';
import CartSidebar from '@/components/shop/CartSidebar';
import Header from '@/components/Header';
import CustomCursor from '@/components/CustomCursor'; // ✅ AÑADIDO
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
    loadProducts();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

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

  const categories = ['all', ...new Set(products.map(p => p.category))];
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <>
      <CustomCursor /> {/* ✅ CURSOR PERSONALIZADO */}
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
                  TIENDA <span className="text-[var(--color-accent)]">DEMO</span>
                </h1>
              </div>
              
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
              Ejemplo de e-commerce funcional. Sistema completo de gestión de productos y pedidos.
            </p>
          </motion.div>

          {/* Filtros */}
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
                  className={`px-6 py-3 rounded-full font-semibold text-sm uppercase tracking-wider transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-[var(--color-accent)] text-black'
                      : 'glass text-gray-400 hover:text-white hover:glass-accent'
                  }`}
                >
                  {category === 'all' ? 'Todos' : category}
                </button>
              ))}
            </motion.div>
          )}

          {/* Grid productos */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-16 h-16 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <FaStore className="text-6xl text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 text-xl mb-6">
                {products.length === 0 ? 'No hay productos disponibles' : 'No hay productos en esta categoría'}
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

// Modal mejorado (igual que antes)
function AddProductModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('url');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    stock: 100,
    available: true,
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
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

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

      if (uploadMethod === 'upload' && imageFile) {
        imageUrl = await uploadImageToSupabase(imageFile);
      }

      if (!imageUrl) {
        toast.error('Debes proporcionar una imagen');
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('products')
        .insert([{
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          image: imageUrl,
          category: formData.category || 'General',
          stock: parseInt(formData.stock),
          available: formData.available,
        }]);

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
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-strong rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        >
          <div className="glass-dark p-4 flex justify-between items-center border-b border-gray-800 flex-shrink-0">
            <h2 className="text-xl font-black text-white">Nuevo Producto</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full glass-accent hover:bg-red-500 transition-colors flex items-center justify-center"
            >
              <FaTimes />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Imagen */}
              <div>
                <label className="text-sm font-bold text-white mb-2 block">📷 Imagen *</label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setUploadMethod('url')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      uploadMethod === 'url' ? 'bg-[var(--color-accent)] text-black' : 'glass text-gray-400'
                    }`}
                  >
                    <FaLink className="inline mr-1" /> URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod('upload')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      uploadMethod === 'upload' ? 'bg-[var(--color-accent)] text-black' : 'glass text-gray-400'
                    }`}
                  >
                    <FaUpload className="inline mr-1" /> Subir
                  </button>
                </div>

                {uploadMethod === 'url' ? (
                  <input
                    type="url"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3 py-2 glass rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                ) : (
                  <div>
                    <label className="cursor-pointer block w-full px-3 py-6 glass rounded-lg border-2 border-dashed border-gray-700 hover:border-[var(--color-accent)] transition-colors text-center">
                      <FaUpload className="text-3xl text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">{imageFile ? imageFile.name : 'Click para seleccionar'}</p>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    {imagePreview && (
                      <img src={imagePreview} alt="Preview" className="mt-3 w-full h-32 object-cover rounded-lg" />
                    )}
                  </div>
                )}
              </div>

              {/* Nombre */}
              <div>
                <label className="text-sm font-bold text-white mb-2 block">🏷️ Nombre *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 glass rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  placeholder="Ej: MacBook Pro M3"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="text-sm font-bold text-white mb-2 block">📝 Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 glass rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
                  placeholder="Descripción breve"
                />
              </div>

              {/* Precio y Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold text-white mb-2 block">💰 Precio (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 glass rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    placeholder="19.99"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-white mb-2 block">📦 Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 glass rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    placeholder="100"
                  />
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label className="text-sm font-bold text-white mb-2 block">🏪 Categoría</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 glass rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  placeholder="Electrónica, Ropa, etc."
                />
              </div>

              {/* Disponible */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="w-5 h-5 rounded accent-[var(--color-accent)]"
                />
                <label htmlFor="available" className="text-white font-semibold text-sm">
                  Visible en tienda pública
                </label>
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[var(--color-accent)] text-black font-bold rounded-xl hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Creando...</span>
                  </>
                ) : (
                  <>
                    <FaPlus />
                    <span>CREAR PRODUCTO</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
