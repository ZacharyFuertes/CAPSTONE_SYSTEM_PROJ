import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'

/**
 * Newsletter Component
 * 
 * Email signup form for newsletter subscription
 * Features:
 * - Simple email input with validation
 * - Success/error feedback
 * - Loading state with button animation
 * - Accessible form with ARIA labels
 */

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Simple email validation
    if (!email || !email.includes('@')) {
      setStatus('error')
      setMessage('Please enter a valid email address')
      setTimeout(() => setStatus('idle'), 3000)
      return
    }

    setStatus('loading')

    try {
      // Simulate API call - in production, connect to your backend/service
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setStatus('success')
      setMessage('Thank you for signing up! Check your email.')
      setEmail('')

      // Auto-reset after 3 seconds
      setTimeout(() => setStatus('idle'), 3000)
    } catch (error) {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <section className="w-full py-16 sm:py-20 lg:py-24 bg-moto-darker border-t border-moto-gray">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-10 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
            Stay in the <span className="text-moto-accent">Loop</span>
          </h2>
          <p className="text-gray-300 text-lg">
            Get exclusive deals, new product drops, and riding tips delivered to your inbox.
          </p>
        </motion.div>

        {/* Newsletter Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          {/* Email Input Container */}
          <div className="relative">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-moto-accent" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={status === 'loading'}
                  className="w-full pl-12 pr-4 py-3 bg-moto-gray border-2 border-moto-gray hover:border-moto-accent focus:border-moto-accent focus:outline-none rounded-lg text-white placeholder-gray-500 transition-colors"
                  aria-label="Email address for newsletter"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 sm:px-8 py-3 bg-moto-accent hover:bg-moto-accent-dark disabled:bg-gray-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                aria-label="Subscribe to newsletter"
              >
                {status === 'loading' ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    </motion.div>
                    <span>Subscribing...</span>
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    <span>Subscribe</span>
                  </>
                )}
              </button>
            </div>

            {/* Feedback Messages */}
            {status === 'success' && (
              <motion.div
                className="mt-4 flex items-center gap-2 text-green-400 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CheckCircle size={18} />
                <p>{message}</p>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                className="mt-4 flex items-center gap-2 text-red-400 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle size={18} />
                <p>{message}</p>
              </motion.div>
            )}
          </div>

          {/* Privacy Note */}
          <p className="text-center text-gray-500 text-sm">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </motion.form>
      </div>
    </section>
  )
}

export default Newsletter
