import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Award, Users, TrendingUp, Mail, Send } from 'lucide-react'

interface Testimonial {
  id: number
  name: string
  role: string
  content: string
  rating: number
  avatar: string
}

const TrustSection: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const testimonials: Testimonial[] = [
    
  ]

  const stats = [
    { icon: Users, label: 'Happy Customers', value: '15K+' },
    { icon: Award, label: 'Premium Brands', value: '200+' },
    { icon: TrendingUp, label: 'Parts Shipped', value: '50K+' },
    { icon: Star, label: 'Avg Rating', value: '4.9/5' },
  ]

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
      setEmail('')
      setTimeout(() => setIsSubscribed(false), 3000)
    }
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-moto-dark to-moto-darker relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-moto-accent/5 rounded-full blur-2xl sm:blur-3xl opacity-50 sm:opacity-100" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-moto-accent-orange/5 rounded-full blur-2xl sm:blur-3xl opacity-50 sm:opacity-100" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24 py-12"
        >
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-moto-gray">
                    <Icon className="text-moto-accent-orange" size={32} />
                  </div>
                </div>
                <p className="text-3xl font-display font-bold text-white mb-2">{stat.value}</p>
                <p className="text-gray-400 font-medium">{stat.label}</p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-24"
        >
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-white">
              Trusted ng <span className="bg-gradient-accent bg-clip-text text-transparent">Filipino Riders</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Makikita kung ano ang sinasabi ng mga rider mula sa buong Pilipinas tungkol sa MotoShop
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="bg-moto-darker border border-moto-gray-light/20 rounded-xl p-8 hover:border-moto-accent-orange/50 transition-all duration-300 group"
                whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(230, 57, 70, 0.1)' }}
              >
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className="text-moto-accent-orange fill-current"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-300 mb-6 text-base leading-relaxed italic">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-6 border-t border-moto-gray-light/20">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-moto-accent-orange"
                  />
                  <div>
                    <p className="font-bold text-white text-sm">{testimonial.name}</p>
                    <p className="text-xs text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-r from-moto-accent to-moto-accent-orange rounded-2xl p-12 text-center relative overflow-hidden group"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

          <div className="relative z-10">
            <Mail className="w-12 h-12 mx-auto mb-4 text-white opacity-90" />
            <h3 className="font-display text-3xl font-bold text-white mb-3">
              Stay in the Garage
            </h3>
            <p className="text-white/90 mb-6 max-w-md mx-auto">
              Get exclusive deals, new product launches, and expert motorcycle tips delivered to your inbox
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-5 py-3 rounded-lg bg-white text-moto-dark placeholder-gray-400 font-medium focus:outline-none focus:ring-2 focus:ring-moto-dark transition-all"
              />
              <motion.button
                type="submit"
                className="px-6 py-3 bg-moto-dark text-white font-bold rounded-lg hover:bg-moto-darker transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Send size={20} />
                <span className="hidden sm:inline">Subscribe</span>
              </motion.button>
            </form>

            {isSubscribed && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white/90 mt-4 font-medium"
              >
                ✓ Thanks for subscribing! Check your email.
              </motion.p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default TrustSection
