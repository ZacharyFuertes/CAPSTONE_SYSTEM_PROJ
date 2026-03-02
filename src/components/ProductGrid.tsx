import React from 'react'
import { motion } from 'framer-motion'
import ProductCard from './ProductCard'

/**
 * ProductGrid Component
 * 
 * Displays featured products in a responsive grid layout
 * Features:
 * - 4-6 featured motorcycle/gear products
 * - Responsive grid (1 col mobile, 2 cols tablet, 3 cols desktop)
 * - Staggered animation on load
 * - Filter/category view (future enhancement)
 */

interface Product {
  id: string
  name: string
  category: string
  price: number
  image: string
  rating: number
  inStock: boolean
}

const ProductGrid: React.FC = () => {
  // Sample product data - realistic motorcycle shop inventory
  const products: Product[] = [
    {
      id: '1',
      name: 'Yamaha MT-07',
      category: 'Motorcycles',
      price: 7299,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
      rating: 5,
      inStock: true,
    },
    {
      id: '2',
      name: 'AGV K6 Helmet',
      category: 'Helmets',
      price: 599,
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b83ad38?w=500&h=500&fit=crop',
      rating: 4,
      inStock: true,
    },
    {
      id: '3',
      name: 'Alpinestars Leather Gloves',
      category: 'Gloves',
      price: 249,
      image: 'https://images.unsplash.com/photo-1589362613540-3c2ca126b3c3?w=500&h=500&fit=crop',
      rating: 5,
      inStock: true,
    },
    {
      id: '4',
      name: 'Michelin Pilot Sport 4',
      category: 'Tires',
      price: 189,
      image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=500&h=500&fit=crop',
      rating: 4,
      inStock: true,
    },
    {
      id: '5',
      name: 'Kawasaki Ninja H2 SX',
      category: 'Motorcycles',
      price: 15700,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
      rating: 5,
      inStock: false,
    },
    {
      id: '6',
      name: 'REVIT Racing Suit',
      category: 'Protective Gear',
      price: 899,
      image: 'https://images.unsplash.com/photo-1507035896870-6d47a3e3a6ab?w=500&h=500&fit=crop',
      rating: 4,
      inStock: true,
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section
      id="products"
      className="w-full py-16 sm:py-20 lg:py-24 bg-moto-dark border-t border-moto-gray"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mb-4">
            Featured <span className="text-moto-accent">Products</span>
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Handpicked selection of bikes, helmets, gloves, and protective gear from top brands.
          </p>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
            >
              <ProductCard {...product} />
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          className="text-center mt-12 sm:mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <button
            className="px-8 py-3 bg-moto-accent hover:bg-moto-accent-dark text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            aria-label="View all products in catalog"
          >
            View All Products
          </button>
        </motion.div>
      </div>
    </section>
  )
}

export default ProductGrid
