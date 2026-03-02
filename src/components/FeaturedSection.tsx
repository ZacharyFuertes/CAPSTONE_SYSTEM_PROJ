import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, ShoppingCart, Calendar, User, Mail, Phone, Clock, MapPin } from 'lucide-react'

interface Product {
  id: number
  name: string
  price: number
  rating: number
  image: string
  category: string
}

const FeaturedSection: React.FC = () => {
  const [appointmentData, setAppointmentData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    service: 'General Maintenance',
  })

  const products: Product[] = [
    {
      id: 1,
      name: 'Premium Exhaust System',
      price: 349.99,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1599950945-b8a2c6c3b5b0?w=500&h=500&fit=crop',
      category: 'Exhaust',
    },
    {
      id: 2,
      name: 'High-Performance Air Filter',
      price: 129.99,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop',
      category: 'Filters',
    },
    {
      id: 3,
      name: 'Racing Brake Pads',
      price: 199.99,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1587919904554-e3aa350908e8?w=500&h=500&fit=crop',
      category: 'Brakes',
    },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setAppointmentData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Create appointment object
    const newAppointment = {
      id: Date.now().toString(),
      name: appointmentData.name,
      email: appointmentData.email,
      phone: appointmentData.phone,
      date: appointmentData.date,
      service: appointmentData.service,
      status: 'pending' as const,
      createdAt: new Date().toLocaleString(),
    }

    // Get existing appointments from localStorage
    const existing = localStorage.getItem('motoshop_appointments')
    const appointments = existing ? JSON.parse(existing) : []
    
    // Add new appointment
    appointments.push(newAppointment)
    
    // Save to localStorage
    localStorage.setItem('motoshop_appointments', JSON.stringify(appointments))
    
    console.log('Appointment booked:', newAppointment)
    alert('✅ Appointment confirmed! Check your email for details.')
    setAppointmentData({ name: '', email: '', phone: '', date: '', service: 'General Maintenance' })
  }

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
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-moto-dark relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-0 w-96 h-96 bg-moto-accent-orange/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-moto-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-white">
            Featured <span className="bg-gradient-accent bg-clip-text text-transparent">Parts & Services</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Handpicked premium components and expert services to elevate your ride
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {/* Featured Products - Left Column (3 cards) */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {products.map((product) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                className="group relative bg-moto-darker border border-moto-gray-light/20 rounded-xl overflow-hidden hover:border-moto-accent-orange/50 transition-all duration-300"
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(230, 57, 70, 0.2)' }}
              >
                {/* Product Image */}
                <div className="relative h-64 overflow-hidden bg-moto-gray">
                  <motion.img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                  />
                  <div className="absolute inset-0 bg-gradient-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Category Badge */}
                  <div className="absolute top-3 right-3 px-3 py-1 bg-moto-accent-orange text-white text-xs font-bold rounded-full">
                    {product.category}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-moto-accent-orange transition-colors">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < Math.floor(product.rating) ? 'text-moto-accent-orange fill-current' : 'text-gray-600'}
                      />
                    ))}
                    <span className="text-xs text-gray-400 ml-2">({product.rating})</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-moto-accent-orange">
                      ${product.price.toFixed(2)}
                    </span>
                    <motion.button
                      className="p-2 rounded-lg bg-moto-accent-orange text-white hover:bg-moto-accent transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ShoppingCart size={20} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Book Appointment - Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-32 bg-gradient-to-br from-moto-darker via-moto-darker to-moto-gray border border-moto-gray-light/30 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="text-moto-accent-orange" size={24} />
                <h3 className="font-display text-2xl font-bold text-white">Book Now</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Full Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-3.5 text-gray-500" />
                    <input
                      type="text"
                      name="name"
                      value={appointmentData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Your name"
                      className="w-full pl-10 pr-4 py-2.5 bg-moto-gray border border-moto-gray-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-moto-accent-orange transition-colors text-sm"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-3.5 text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      value={appointmentData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="your@email.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-moto-gray border border-moto-gray-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-moto-accent-orange transition-colors text-sm"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Phone</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-3.5 text-gray-500" />
                    <input
                      type="tel"
                      name="phone"
                      value={appointmentData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-10 pr-4 py-2.5 bg-moto-gray border border-moto-gray-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-moto-accent-orange transition-colors text-sm"
                    />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Preferred Date</label>
                  <div className="relative">
                    <Clock size={18} className="absolute left-3 top-3.5 text-gray-500" />
                    <input
                      type="date"
                      name="date"
                      value={appointmentData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-moto-gray border border-moto-gray-light/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-moto-accent-orange transition-colors text-sm"
                    />
                  </div>
                </div>

                {/* Service Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Service</label>
                  <select
                    name="service"
                    value={appointmentData.service}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-moto-gray border border-moto-gray-light/30 rounded-lg text-white focus:outline-none focus:border-moto-accent-orange transition-colors text-sm"
                  >
                    <option>General Maintenance</option>
                    <option>Oil Change</option>
                    <option>Tire Service</option>
                    <option>Brake Service</option>
                    <option>Custom Work</option>
                  </select>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  className="w-full mt-6 px-6 py-3 bg-gradient-accent rounded-lg font-bold text-white uppercase tracking-wide hover:shadow-2xl hover:shadow-moto-accent/50 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Confirm Appointment
                </motion.button>
              </form>

              {/* Info Footer */}
              <div className="mt-6 pt-6 border-t border-moto-gray-light/30 flex items-center gap-2 text-xs text-gray-400">
                <MapPin size={16} />
                <span>Response within 24 hours</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default FeaturedSection
