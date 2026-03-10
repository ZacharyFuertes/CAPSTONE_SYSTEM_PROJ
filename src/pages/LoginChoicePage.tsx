import React from 'react'
import { motion } from 'framer-motion'
import { Users, Shield, ChevronRight, Home } from 'lucide-react'

interface LoginChoicePageProps {
  onChooseCustomer: () => void
  onChooseAdmin: () => void
  onBack: () => void
}

const LoginChoicePage: React.FC<LoginChoicePageProps> = ({
  onChooseCustomer,
  onChooseAdmin,
  onBack,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Home Button */}
      <motion.button
        onClick={onBack}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-6 left-6 flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition"
        whileHover={{ scale: 1.05, x: -4 }}
      >
        <Home size={18} />
        <span className="hidden sm:inline text-sm font-medium">Home</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="w-16 h-16 bg-gradient-to-br from-moto-accent-orange to-moto-accent rounded-lg flex items-center justify-center mx-auto mb-4"
          >
            <span className="text-white font-bold text-3xl">M</span>
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">MotoShop</h1>
          <p className="text-slate-400">Select your login type</p>
        </div>

        {/* Login Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Customer Login */}
          <motion.button
            onClick={onChooseCustomer}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative p-8 bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700 hover:border-moto-accent-neon rounded-xl overflow-hidden transition-all"
          >
            {/* Background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-moto-accent-neon/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Content */}
            <div className="relative z-10">
              <motion.div
                className="w-16 h-16 bg-moto-accent-neon/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-moto-accent-neon/30 transition"
              >
                <Users className="w-8 h-8 text-moto-accent-neon" />
              </motion.div>

              <h3 className="text-xl font-bold text-white mb-2">Customer Login</h3>
              <p className="text-slate-400 text-sm mb-6">
                View your bookings, book appointments, and track your service history
              </p>

              <div className="flex items-center justify-center gap-2 text-moto-accent-neon font-semibold group-hover:gap-3 transition-all">
                Login
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </motion.button>

          {/* Admin Login */}
          <motion.button
            onClick={onChooseAdmin}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative p-8 bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700 hover:border-moto-accent rounded-xl overflow-hidden transition-all"
          >
            {/* Background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-moto-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Content */}
            <div className="relative z-10">
              <motion.div
                className="w-16 h-16 bg-moto-accent/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-moto-accent/30 transition"
              >
                <Shield className="w-8 h-8 text-moto-accent" />
              </motion.div>

              <h3 className="text-xl font-bold text-white mb-2">Admin/Staff Login</h3>
              <p className="text-slate-400 text-sm mb-6">
                Manage appointments, inventory, customers, and shop operations
              </p>

              <div className="flex items-center justify-center gap-2 text-moto-accent font-semibold group-hover:gap-3 transition-all">
                Login
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </motion.button>
        </div>

        {/* Back Button */}
        <motion.button
          onClick={onBack}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full py-3 text-slate-400 hover:text-slate-300 font-semibold transition"
        >
          ← Back to Home
        </motion.button>
      </motion.div>
    </div>
  )
}

export default LoginChoicePage
