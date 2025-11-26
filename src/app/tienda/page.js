'use client';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';

// ⭐ OPTIMIZACIÓN 1: Lazy load de componentes pesados
const ProductGrid = dynamic(() => import('@/components/shop/ProductGrid'), {
  loading: () => <div className="flex justify-center py-20"><div className="w-16 h-16 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" /></div>,
  ssr: false,
});

const CartButton = dynamic(() => import('@/components/shop/CartButton'), {
  loading: () => null,
  ssr: false,
});

const CartSidebar = dynamic(() => import('@/components/shop/CartSidebar'), {
  loading: () => null,
  ssr: false,
});

import Header from '@/components/Header';
import CustomCursor from '@/components/CustomCursor';
import { Toaster, toast } from 'react-hot-toast';
import { FaStore, FaPlus, FaTimes, FaUpload, FaLink } from 'react-icons/fa';

export default function TiendaPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [user, setUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // ⭐ OPTIMIZACIÓN 2: Memoizar checkUser
  const checkUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }, []);

  // ⭐ OPTIMIZACIÓN 3: Memoizar loadProducts
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUser();
    loadProducts();
  }, [checkUser, loadProducts]);

  // ⭐ OPTIMIZACIÓN 4: Memoizar handleEdit y handleDelete
  const handleEdit = useCallback((product) => {
    setEditingProduct(product);
  }, []);

  const handleDelete = useCallback(async (product) => {
    if (!confirm(`¿Eliminar "${product.name}"?`)) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      toast.success('Producto eliminado');
      
      // ⭐ Actualización optimista
      setProducts(prev => prev.filter(p => p.id !== product.id));
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar producto');
      loadProducts(); // Recargar si hay error
    }
  }, [loadProducts]);

  // ⭐ OPTIMIZACIÓN 5: Memoizar categorías y productos filtrados
  const categories = useMemo(() => 
    ['all', ...new Set(products.map(p => p.category).filter(Boolean))],
    [products]
  );

  const filteredProducts = useMemo(() => 
    selectedCategory === 'all' 
      ? products 
      : products.filter(p => p.category === selectedCategory),
    [selectedCategory, products]
  );

  return (
    <>
      <CustomCursor />
      <Header />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid var(--color-accent)',
          },
        }}
      />
      <CartButton />
      <CartSidebar />
      
      {/* ✅ FONDO ACTUALIZADO - Consistente con Inicio y Álbum */}
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
        {/* Elementos decorativos - Igual que en Álbum */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(183,255,0,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(183,255,0,.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000,transparent)]" />
          
          <div className="absolute top-20 right-20 w-96 h-96 bg-[var(--color-accent)] rounded-full blur-3xl opacity-10 hidden md:block" />
          <div className="absolute bottom-40 left-10 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-10 hidden md:block" />
        </div>

        {/* Contenido principal con z-index para estar sobre el fondo */}
        <div className="relative z-10 pt-24 pb-20 px-4 md:px-6">
          <div className="container mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-12"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center">
                    <FaStore className="text-2xl md:text-4xl text-[var(--color-accent)]" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black">
                      <span className="text-white">TIENDA</span>{' '}
                      <span className="text-[var(--color-accent)]">DEMO</span>
                    </h1>
                    <p className="text-sm md:text-base text-gray-400 mt-1">
                      Ejemplo de e-commerce funcional
                    </p>
                  </div>
                </div>
                
                {user && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] text-black font-bold rounded-xl hover:bg-white transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <FaPlus />
                    <span>Añadir Producto</span>
                  </button>
                )}
              </div>
            </motion.div>

            {/* Filtros */}
            {categories.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8 flex flex-wrap gap-3"
              >
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-3 rounded-full font-semibold text-sm uppercase tracking-wider transition-all duration-300 ${
                      selectedCategory === category
                        ? 'bg-[var(--color-accent)] text-black shadow-lg'
                        : 'bg-gray-900/80 border border-gray-800 text-gray-400 hover:text-white hover:border-[var(--color-accent)]'
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
                    className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] text-black font-bold rounded-xl hover:bg-white transition-colors"
                  >
                    <FaPlus />
                    <span>Añadir Primer Producto</span>
                  </button>
                )}
              </div>
            ) : (
              <ProductGrid
                products={filteredProducts}
                isAdmin={!!user}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <ProductFormModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadProducts();
          }}
        />
      )}

      {editingProduct && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={() => {
            setEditingProduct(null);
            loadProducts();
          }}
        />
      )}
    </>
  );
}

// ⭐ OPTIMIZACIÓN 6: Modal optimizado con memoización
function ProductFormModal({ product, onClose, onSuccess }) {
  const isEditing = !!product;
  const [loading, setLoading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('url');
  
  // ⭐ useRef para preview URL
  const previewUrlRef = useRef(null);
  
  // ⭐ OPTIMIZACIÓN 7: useMemo para formData inicial
  const initialFormData = useMemo(() => ({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    image: product?.image || '',
    category: product?.category || '',
    stock: product?.stock || 100,
    available: product?.available ?? true,
  }), [product]);

  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.image || '');

  // ⭐ OPTIMIZACIÓN 8: useCallback para handleImageUpload
  const handleImageUpload = useCallback((e) => {
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
    
    // ⭐ Limpiar URL anterior
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    
    // ⭐ Usar createObjectURL (más rápido que FileReader)
    const objectUrl = URL.createObjectURL(file);
    previewUrlRef.current = objectUrl;
    setImagePreview(objectUrl);
  }, []);

  // ⭐ Limpiar URL al desmontar
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  // ⭐ OPTIMIZACIÓN 9: useCallback para uploadImageToSupabase
  const uploadImageToSupabase = useCallback(async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir imagen: ' + error.message);
      throw error;
    }
  }, []);

  // ⭐ OPTIMIZACIÓN 10: useCallback para handleSubmit
  const handleSubmit = useCallback(async (e) => {
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

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        image: imageUrl,
        category: formData.category.trim() || 'General',
        stock: parseInt(formData.stock),
        available: formData.available,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
        toast.success('✅ Producto actualizado');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        toast.success('✅ Producto creado');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('❌ Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  }, [formData, uploadMethod, imageFile, uploadImageToSupabase, isEditing, product, onSuccess]);

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
          className="bg-[#0A0F1C] border-2 border-[var(--color-accent)] rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="bg-[#050A14] p-4 flex justify-between items-center border-b border-[var(--color-accent)]/30 flex-shrink-0">
            <h2 className="text-xl md:text-2xl font-black text-[var(--color-accent)]">
              {isEditing ? '✏️ Editar Producto' : '✨ Nuevo Producto'}
            </h2>
            <button
              onClick={onClose}
              className="cursor-pointer w-10 h-10 rounded-full bg-[#1A1F2E] hover:bg-red-500 transition-colors flex items-center justify-center text-white"
              aria-label="Cerrar modal"
            >
              <FaTimes />
            </button>
          </div>

          {/* Contenido con scroll */}
          <div className="overflow-y-auto flex-1 p-4 md:p-6 bg-[#0A0F1C]">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              {/* Método de imagen */}
              <div>
                <label className="text-sm font-bold text-[var(--color-accent)] mb-3 block">
                  📷 Método de Imagen *
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setUploadMethod('url')}
                    disabled={loading}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                      uploadMethod === 'url'
                        ? 'bg-[var(--color-accent)] text-black border-[var(--color-accent)]'
                        : 'bg-[#1A1F2E] text-gray-400 border-gray-700 hover:border-[var(--color-accent)]'
                    } disabled:opacity-50`}
                  >
                    <FaLink className="inline mr-2" /> URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod('upload')}
                    disabled={loading}
                    className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                      uploadMethod === 'upload'
                        ? 'bg-[var(--color-accent)] text-black border-[var(--color-accent)]'
                        : 'bg-[#1A1F2E] text-gray-400 border-gray-700 hover:border-[var(--color-accent)]'
                    } disabled:opacity-50`}
                  >
                    <FaUpload className="inline mr-2" /> Subir
                  </button>
                </div>
              </div>

              {/* Input de imagen */}
              {uploadMethod === 'url' ? (
                <div>
                  <label className="text-sm font-bold text-[var(--color-accent)] mb-2 block">
                    🔗 URL de la Imagen *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-[#1A1F2E] border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-accent)] transition-colors disabled:opacity-50"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-bold text-[var(--color-accent)] mb-2 block">
                    📤 Subir Imagen {!isEditing && '*'}
                  </label>
                  <label className="cursor-pointer block w-full px-4 py-6 md:py-8 bg-[#1A1F2E] rounded-xl border-2 border-dashed border-gray-700 hover:border-[var(--color-accent)] transition-colors text-center">
                    <FaUpload className="text-3xl md:text-4xl text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 font-semibold mb-1 text-sm md:text-base">
                      {imageFile ? imageFile.name : 'Click para seleccionar imagen'}
                    </p>
                    <p className="text-xs text-gray-600">PNG, JPG, WEBP (máx 5MB)</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      disabled={loading}
                      className="hidden" 
                    />
                  </label>
                  {imagePreview && (
                    <div className="mt-4 relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        loading="lazy"
                        className="w-full h-40 object-cover rounded-xl border-2 border-[var(--color-accent)]" 
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          if (previewUrlRef.current) {
                            URL.revokeObjectURL(previewUrlRef.current);
                            previewUrlRef.current = null;
                          }
                          setImagePreview('');
                        }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg"
                      >
                        <FaTimes size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Nombre */}
              <div>
                <label className="text-sm font-bold text-[var(--color-accent)] mb-2 block">
                  🏷️ Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-[#1A1F2E] border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-accent)] transition-colors disabled:opacity-50"
                  placeholder="Ej: MacBook Pro M3"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="text-sm font-bold text-[var(--color-accent)] mb-2 block">
                  📝 Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={loading}
                  rows={3}
                  className="w-full px-4 py-3 bg-[#1A1F2E] border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-accent)] resize-none transition-colors disabled:opacity-50"
                  placeholder="Descripción breve del producto"
                />
              </div>

              {/* Precio y Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-[var(--color-accent)] mb-2 block">
                    💰 Precio (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-[#1A1F2E] border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-accent)] transition-colors disabled:opacity-50"
                    placeholder="19.99"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-[var(--color-accent)] mb-2 block">
                    📦 Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-[#1A1F2E] border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-accent)] transition-colors disabled:opacity-50"
                    placeholder="100"
                  />
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label className="text-sm font-bold text-[var(--color-accent)] mb-2 block">
                  🏪 Categoría
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-[#1A1F2E] border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-accent)] transition-colors disabled:opacity-50"
                  placeholder="Ej: Electrónica, Ropa, Audio..."
                />
              </div>

              {/* Disponible */}
              <div className="flex items-center gap-3 p-4 bg-[#1A1F2E] rounded-xl border-2 border-gray-700">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  disabled={loading}
                  className="w-6 h-6 rounded accent-[var(--color-accent)] disabled:opacity-50"
                />
                <label htmlFor="available" className="text-white font-semibold text-sm md:text-base">
                  👁️ Producto visible en tienda pública
                </label>
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 md:py-4 bg-[var(--color-accent)] text-black font-black text-base md:text-lg rounded-xl hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 md:w-6 md:h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
                    <span>{isEditing ? 'Actualizando...' : 'Creando...'}</span>
                  </>
                ) : (
                  <>
                    <FaPlus className="text-lg md:text-xl" />
                    <span>{isEditing ? 'ACTUALIZAR PRODUCTO' : 'CREAR PRODUCTO'}</span>
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