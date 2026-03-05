import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, AlertCircle, Download, ArrowLeft } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabaseClient'
import { Part } from '../types'

const categoryColors: Record<string, string> = {
  brakes: 'from-red-500 to-red-600',
  tires: 'from-gray-500 to-gray-600',
  oils: 'from-yellow-500 to-yellow-600',
  electrical: 'from-blue-500 to-blue-600',
  suspension: 'from-purple-500 to-purple-600',
  exhaust: 'from-orange-500 to-orange-600',
  filters: 'from-green-500 to-green-600',
  other: 'from-slate-500 to-slate-600',
}

interface InventoryFilters {
  category?: string
  searchTerm: string
  showLowStock: boolean
}

interface InventoryPageProps {
  onNavigate?: (page: string) => void
}

const InventoryPage: React.FC<InventoryPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [parts, setParts] = useState<Part[]>([])
  const [filters, setFilters] = useState<InventoryFilters>({
    searchTerm: '',
    showLowStock: false,
  })
  const [_editingPart, setEditingPart] = useState<Part | null>(null)

  // Fetch parts from Supabase
  useEffect(() => {
    const fetchParts = async () => {
      try {
        const { data, error } = await supabase
          .from('parts')
          .select('*')
          .eq('shop_id', user?.shop_id)
          .order('name', { ascending: true })

        if (error) throw error
        setParts(data || [])
      } catch (err) {
        console.error('Error fetching parts:', err)
        // Fallback to empty array
        setParts([])
      }
    }

    if (user?.shop_id) {
      fetchParts()
    }
  }, [user?.shop_id])


  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      const matchesSearch =
        part.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        part.sku.toLowerCase().includes(filters.searchTerm.toLowerCase())

      const matchesCategory = !filters.category || part.category === filters.category

      const matchesLowStock = !filters.showLowStock || part.quantity_in_stock <= part.reorder_level

      return matchesSearch && matchesCategory && matchesLowStock
    })
  }, [parts, filters])

  const categories = Array.from(new Set(parts.map((p) => p.category)))

  const handleExportCSV = () => {
    const csv = [
      ['Part Name', 'SKU', 'Category', 'Unit Price', 'In Stock', 'Reorder Level', 'Status'].join(
        ','
      ),
      ...filteredParts.map((part) =>
        [
          part.name,
          part.sku,
          part.category,
          part.unit_price,
          part.quantity_in_stock,
          part.reorder_level,
          part.quantity_in_stock <= part.reorder_level ? 'LOW STOCK' : 'OK',
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => onNavigate && onNavigate('dashboard')}
        className="mb-6 flex items-center gap-2 text-moto-accent hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </motion.button>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{t('inventory.title')}</h1>
            <p className="text-slate-400">
              Manage {filteredParts.length} / {parts.length} parts in your inventory
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              title="Add part form coming soon"
            >
              <Plus className="w-5 h-5" />
              {t('inventory.add_part')}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-800 p-4 rounded-lg border border-slate-700">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={t('inventory.search')}
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              className="w-full bg-slate-700 text-white pl-10 pr-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          <select
            value={filters.category || ''}
            onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
            className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none transition"
          >
            <option value="">{t('inventory.category')} - All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition">
            <input
              type="checkbox"
              checked={filters.showLowStock}
              onChange={(e) => setFilters({ ...filters, showLowStock: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">{t('inventory.low_stock')}</span>
          </label>
        </div>
      </motion.div>

      {/* Parts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredParts.map((part, index) => {
            const isLowStock = part.quantity_in_stock <= part.reorder_level
            return (
              <motion.div
                key={part.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-slate-600 transition group"
              >
                {/* Image */}
                <div className={`relative h-40 bg-gradient-to-br ${categoryColors[part.category]} overflow-hidden`}>
                  <img
                    src={part.image_url}
                    alt={part.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                  {isLowStock && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white">{part.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">SKU: {part.sku}</p>
                    </div>
                    <span className={`text-xs bg-gradient-to-r ${categoryColors[part.category]} text-white px-2 py-1 rounded`}>
                      {part.category}
                    </span>
                  </div>

                  <p className="text-slate-300 text-sm mb-4 line-clamp-2">{part.description}</p>

                  {/* Stock Info */}
                  <div className="bg-slate-700 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">{t('inventory.stock')}</span>
                      <span className={isLowStock ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
                        {part.quantity_in_stock}
                      </span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition ${
                          isLowStock ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min((part.quantity_in_stock / part.reorder_level) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-400">
                      ₱{part.unit_price.toLocaleString()}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingPart(part)}
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setParts(parts.filter((p) => p.id !== part.id))
                        }
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredParts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <AlertCircle className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No parts found matching your filters</p>
        </motion.div>
      )}
    </div>
  )
}

export default InventoryPage
