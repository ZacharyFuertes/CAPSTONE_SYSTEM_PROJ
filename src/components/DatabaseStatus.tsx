import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { testDatabaseConnection } from '../services/supabaseClient'

type ConnectionStatus = 'testing' | 'connected' | 'error'

export const DatabaseStatus: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>('testing')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const testConnection = async () => {
      try {
        const isConnected = await testDatabaseConnection()
        if (isConnected) {
          setStatus('connected')
          setMessage('✅ Database Connected')
        } else {
          setStatus('error')
          setMessage('❌ Database Not Connected')
        }
      } catch (err) {
        setStatus('error')
        setMessage('❌ Connection Failed')
      }
    }

    testConnection()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 p-4 rounded-lg bg-slate-800 border border-slate-700 shadow-lg flex items-center gap-3 z-50"
    >
      {status === 'testing' && (
        <>
          <Loader className="animate-spin text-yellow-500" size={20} />
          <span className="text-slate-300">Testing database...</span>
        </>
      )}
      {status === 'connected' && (
        <>
          <CheckCircle className="text-green-500" size={20} />
          <span className="text-green-400">{message}</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="text-red-500" size={20} />
          <span className="text-red-400">{message}</span>
        </>
      )}
    </motion.div>
  )
}

export default DatabaseStatus
