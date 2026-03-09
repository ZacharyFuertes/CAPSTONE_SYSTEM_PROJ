import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Edit2,
  Save,
  X,
  Star,
  GripVertical,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Product, FeaturedProduct } from '../types/index'
import { productService, featuredProductService } from '../services/productService'

interface AdminProductsPageProps {
  onNavigate?: (page: string) => void
}

const AdminProductsPage: React.FC<AdminProductsPageProps> = () => {
  const { user } = useAuth()
  const shopId = user?.shop_id || ''

  // Products state
  const [products, setProducts] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([])
  const [loading, setLoading] = useState(false)

  // Form state for new product
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: 'other',
    sku: '',
    unit_price: 0,
    quantity_in_stock: 0,
    image_url: '',
    rating: 5,
  })

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Product>>({})

  // Featured products management
  const [showFeaturedForm, setShowFeaturedForm] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string>('')

  // Fetch data
  useEffect(() => {
    if (shopId) {
      fetchData()
    }
  }, [shopId])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [productsData, featuredData] = await Promise.all([
        productService.getAllProducts(shopId),
        featuredProductService.getAllFeaturedProducts(shopId),
      ])
      setProducts(productsData)
      setFeaturedProducts(featuredData)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Add new product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProduct.name || !newProduct.sku) {
      alert('Name and SKU are required')
      return
    }

    const product = await productService.createProduct({
      shop_id: shopId,
      name: newProduct.name,
      description: newProduct.description,
      category: newProduct.category,
      sku: newProduct.sku,
      unit_price: newProduct.unit_price,
      quantity_in_stock: newProduct.quantity_in_stock,
      image_url: newProduct.image_url,
      rating: newProduct.rating,
    })

    if (product) {
      setProducts([product, ...products])
      setNewProduct({
        name: '',
        description: '',
        category: 'other',
        sku: '',
        unit_price: 0,
        quantity_in_stock: 0,
        image_url: '',
        rating: 5,
      })
      setShowAddForm(false)
      alert('✅ Product added successfully!')
    }
  }

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return

    const success = await productService.deleteProduct(productId)
    if (success) {
      setProducts(products.filter(p => p.id !== productId))
      setFeaturedProducts(featuredProducts.filter(fp => fp.product_id !== productId))
      alert('✅ Product deleted!')
    }
  }

  // Update product
  const handleUpdateProduct = async (productId: string) => {
    if (!editData.name || !editData.sku) {
      alert('Name and SKU are required')
      return
    }

    const updated = await productService.updateProduct(productId, editData)
    if (updated) {
      setProducts(products.map(p => (p.id === productId ? updated : p)))
      setEditingId(null)
      alert('✅ Product updated!')
    }
  }

  // Add to featured products
  const handleAddFeaturedProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProductId) {
      alert('Please select a product')
      return
    }

    const displayOrder = Math.max(...featuredProducts.map(fp => fp.display_order), 0) + 1
    const featured = await featuredProductService.addFeaturedProduct(
      shopId,
      selectedProductId,
      displayOrder
    )

    if (featured) {
      setFeaturedProducts([...featuredProducts, featured])
      setSelectedProductId('')
      setShowFeaturedForm(false)
      alert('✅ Product added to featured!')
    }
  }

  // Remove from featured
  const handleRemoveFeatured = async (featuredId: string) => {
    if (!window.confirm('Remove from featured products?')) return

    const success = await featuredProductService.removeFeaturedProduct(featuredId)
    if (success) {
      setFeaturedProducts(featuredProducts.filter(fp => fp.id !== featuredId))
      alert('✅ Removed from featured!')
    }
  }

  // Toggle featured visibility
  const handleToggleFeatured = async (featuredId: string, isActive: boolean) => {
    const updated = await featuredProductService.toggleFeaturedProduct(featuredId, !isActive)
    if (updated) {
      setFeaturedProducts(featuredProducts.map(fp => (fp.id === featuredId ? updated : fp)))
    }
  }

  // Get available products for featured (not already featured)
  const availableProducts = products.filter(p => !featuredProducts.some(fp => fp.product_id === p.id))

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">📦 Manage Products</h1>
          <p className="text-gray-400">Create products and manage featured items</p>
        </div>
      </div>

      {/* Add Product Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Plus size={24} className="text-blue-400" />
            Add New Product
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {showAddForm ? 'Cancel' : 'Add Product'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddProduct} className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="SKU"
              value={newProduct.sku}
              onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <textarea
              placeholder="Description"
              value={newProduct.description}
              onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
            />
            <select
              value={newProduct.category}
              onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="brakes">Brakes</option>
              <option value="tires">Tires</option>
              <option value="oils">Oils</option>
              <option value="electrical">Electrical</option>
              <option value="suspension">Suspension</option>
              <option value="exhaust">Exhaust</option>
              <option value="filters">Filters</option>
              <option value="other">Other</option>
            </select>
            <input
              type="number"
              placeholder="Unit Price (₱)"
              value={newProduct.unit_price}
              onChange={e => setNewProduct({ ...newProduct, unit_price: parseFloat(e.target.value) })}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
            <input
              type="number"
              placeholder="Quantity in Stock"
              value={newProduct.quantity_in_stock}
              onChange={e => setNewProduct({ ...newProduct, quantity_in_stock: parseInt(e.target.value) })}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
            <input
              type="text"
              placeholder="Image URL"
              value={newProduct.image_url}
              onChange={e => setNewProduct({ ...newProduct, image_url: e.target.value })}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
            />
            <input
              type="number"
              placeholder="Rating (1-5)"
              value={newProduct.rating}
              onChange={e => setNewProduct({ ...newProduct, rating: parseFloat(e.target.value) })}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="5"
              step="0.1"
            />
            <button
              type="submit"
              className="md:col-span-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Create Product
            </button>
          </form>
        )}
      </motion.div>

      {/* Featured Products Management Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Star size={24} className="text-yellow-400" />
            Featured Products ({featuredProducts.filter(fp => fp.is_active).length})
          </h2>
          <button
            onClick={() => setShowFeaturedForm(!showFeaturedForm)}
            disabled={availableProducts.length === 0}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showFeaturedForm ? 'Cancel' : 'Add to Featured'}
          </button>
        </div>

        {showFeaturedForm && availableProducts.length > 0 && (
          <form onSubmit={handleAddFeaturedProduct} className="mb-6 flex gap-2">
            <select
              value={selectedProductId}
              onChange={e => setSelectedProductId(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            >
              <option value="">Select a product to feature...</option>
              {availableProducts.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} - ₱{p.unit_price.toLocaleString()}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-semibold"
            >
              Add
            </button>
          </form>
        )}

        {featuredProducts.length > 0 ? (
          <div className="space-y-3">
            {featuredProducts.map((fp) => (
              <motion.div
                key={fp.id}
                layout
                className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition group"
              >
                <GripVertical size={20} className="text-gray-400 cursor-grab" />
                <div className="font-semibold text-gray-400">#{fp.display_order}</div>
                <img
                  src={fp.product?.image_url || 'https://via.placeholder.com/50'}
                  alt={fp.product?.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold text-white">{fp.product?.name}</p>
                  <p className="text-sm text-gray-400">
                    ₱{fp.product?.unit_price.toLocaleString()} • Category: {fp.product?.category}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleFeatured(fp.id, fp.is_active)}
                    className={`p-2 rounded-lg transition ${
                      fp.is_active
                        ? 'bg-green-600/30 text-green-400 hover:bg-green-600/50'
                        : 'bg-gray-600/30 text-gray-400 hover:bg-gray-600/50'
                    }`}
                    title={fp.is_active ? 'Hide' : 'Show'}
                  >
                    {fp.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <button
                    onClick={() => handleRemoveFeatured(fp.id)}
                    className="p-2 rounded-lg bg-red-600/30 text-red-400 hover:bg-red-600/50 transition"
                    title="Remove from featured"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">No featured products yet. Add some to get started!</p>
        )}
      </motion.div>

      {/* All Products List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-6"
      >
        <h2 className="text-2xl font-bold text-white mb-6">All Products ({products.length})</h2>

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading products...</p>
        ) : products.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {products.map(product => (
              <motion.div
                key={product.id}
                layout
                className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition group"
              >
                <img
                  src={product.image_url || 'https://via.placeholder.com/50'}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  {editingId === product.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editData.name || ''}
                        onChange={e => setEditData({ ...editData, name: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-600 text-white rounded text-sm"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editData.sku || ''}
                          onChange={e => setEditData({ ...editData, sku: e.target.value })}
                          className="flex-1 px-2 py-1 bg-slate-600 text-white rounded text-sm"
                          placeholder="SKU"
                        />
                        <input
                          type="number"
                          value={editData.unit_price || 0}
                          onChange={e => setEditData({ ...editData, unit_price: parseFloat(e.target.value) })}
                          className="w-24 px-2 py-1 bg-slate-600 text-white rounded text-sm"
                          placeholder="Price"
                        />
                        <input
                          type="number"
                          value={editData.quantity_in_stock || 0}
                          onChange={e => setEditData({ ...editData, quantity_in_stock: parseInt(e.target.value) })}
                          className="w-24 px-2 py-1 bg-slate-600 text-white rounded text-sm"
                          placeholder="Qty"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="font-semibold text-white">{product.name}</p>
                      <p className="text-sm text-gray-400">
                        SKU: {product.sku} • ₱{product.unit_price.toLocaleString()} • Stock: {product.quantity_in_stock}
                      </p>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {editingId === product.id ? (
                    <>
                      <button
                        onClick={() => handleUpdateProduct(product.id)}
                        className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                      >
                        <Save size={18} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition"
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(product.id)
                          setEditData(product)
                        }}
                        className="p-2 rounded-lg bg-blue-600/30 text-blue-400 hover:bg-blue-600/50 transition"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 rounded-lg bg-red-600/30 text-red-400 hover:bg-red-600/50 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">No products yet. Create one to get started!</p>
        )}
      </motion.div>
    </div>
  )
}

export default AdminProductsPage
