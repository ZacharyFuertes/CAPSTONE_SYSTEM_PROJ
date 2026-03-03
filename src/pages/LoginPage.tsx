import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Loader } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface LoginPageProps {
  onLoginSuccess: () => void
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login, signup } = useAuth()
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'owner' as const,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignup) {
        await signup(formData.email, formData.password, formData.name, formData.role)
      } else {
        await login(formData.email, formData.password)
      }
      onLoginSuccess()
    } catch (error) {
      console.error('Auth error:', error)
      alert('Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-3xl">M</span>
          </div>
          <h1 className="text-3xl font-bold text-white">MotoShop</h1>
          <p className="text-slate-400 mt-2">Auto Shop Management System</p>
        </div>

        {/* Forms */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800 rounded-lg p-8 border border-slate-700 shadow-2xl"
        >
          <h2 className="text-2xl font-bold text-white mb-6">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-700 text-white pl-10 pr-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none transition"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Name (Signup only) */}
            {isSignup && (
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none transition"
                  placeholder="Juan Dela Cruz"
                  required={isSignup}
                />
              </div>
            )}

            {/* Role (Signup only) */}
            {isSignup && (
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as typeof formData.role,
                    })
                  }
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none transition"
                >
                  <option value="owner">Shop Owner/Admin</option>
                  <option value="mechanic">Mechanic/Staff</option>
                  <option value="customer">Customer</option>
                </select>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-700 text-white pl-10 pr-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-5 h-5 animate-spin" />}
              {isSignup ? 'Create Account' : 'Sign In'}
            </motion.button>

            {/* Demo Credentials (Remove in production) */}
            {!isSignup && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-xs text-blue-400">
                <p className="font-semibold mb-1">Demo Credentials:</p>
                <p>Email: demo@motoshop.com</p>
                <p>Password: demo123</p>
              </div>
            )}
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="ml-2 text-blue-400 hover:text-blue-300 font-semibold transition"
              >
                {isSignup ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center text-slate-400 text-sm"
        >
          <p>Built for Filipino auto shops • Secure & Bilingual</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default LoginPage
