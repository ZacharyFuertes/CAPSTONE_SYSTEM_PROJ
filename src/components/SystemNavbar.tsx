import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Globe, LogOut, BarChart3, Package, Calendar, Users } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

interface NavbarProps {
  currentPage: string
  onNavigate: (page: string) => void
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: BarChart3 },
    { id: 'inventory', label: t('nav.inventory'), icon: Package },
    { id: 'appointments', label: t('nav.appointments'), icon: Calendar },
    { id: 'customers', label: 'Customers', icon: Users },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
            onClick={() => onNavigate('dashboard')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">MotoShop</h1>
              <p className="text-xs text-slate-400">Management System</p>
            </div>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLanguage(language === 'en' ? 'tl' : 'en')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition"
              title={language === 'en' ? 'Switch to Tagalog' : 'Switch to English'}
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">{language.toUpperCase()}</span>
            </motion.button>

            {/* User Info */}
            {user && (
              <div className="hidden sm:flex items-center gap-3 px-3 py-2 bg-slate-700/50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <p className="text-white font-semibold">{user.name}</p>
                  <p className="text-slate-400 text-xs capitalize">{user.role}</p>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => logout()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Logout</span>
            </motion.button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-700 transition text-white"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-700 py-4 space-y-2"
            >
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = currentPage === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id)
                      setIsMenuOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

export default Navbar
