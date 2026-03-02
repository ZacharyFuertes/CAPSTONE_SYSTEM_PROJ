import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Star } from 'lucide-react'

/**
 * ProductCard Component
 * 
 * Reusable card component for displaying motorcycle products
 * Features:
 * - Product image with hover overlay
 * - Product name, category, price
 * - Star rating
 * - Add to cart button
 * - Smooth animations and interactions
 */

interface ProductCardProps {
  id: string
  name: string
  category: string
  price: number
  image: string
  rating: number
  inStock: boolean
}

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  category,
  price,
  image,
  rating,
  inStock,
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isAdded, setIsAdded] = useState(false)

  const handleAddToCart = () => {
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <motion.div
      className="bg-moto-gray rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative h-56 sm:h-64 overflow-hidden bg-moto-darker">
        <motion.img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.4 }}
        />
        {/* Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-overlay flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all ${
              isAdded
                ? 'bg-green-500 text-white'
                : inStock
                  ? 'bg-moto-accent hover:bg-moto-accent-dark text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
            aria-label={`Add ${name} to cart`}
          >
            <ShoppingCart size={18} />
            <span>{isAdded ? 'Added!' : inStock ? 'Add' : 'Out'}</span>
          </button>
        </motion.div>
        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              inStock
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {/* Category */}
        <p className="text-moto-accent text-sm font-semibold uppercase tracking-wide mb-1">
          {category}
        </p>

        {/* Product Name */}
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2 line-clamp-2">
          {name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className={i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'}
            />
          ))}
          <span className="text-xs text-gray-400 ml-2">({rating}/5)</span>
        </div>

        {/* Price */}
        <div className="flex justify-between items-center">
          <span className="text-2xl sm:text-3xl font-bold text-white">
            ${price.toLocaleString()}
          </span>
          <motion.div
            whileHover={{ rotate: 15 }}
            whileTap={{ scale: 0.9 }}
          >
            <ShoppingCart
              size={20}
              className="text-moto-accent hover:text-moto-accent-dark cursor-pointer"
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard
