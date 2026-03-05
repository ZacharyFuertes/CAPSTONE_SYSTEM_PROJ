import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { testDatabaseConnection } from '../services/supabaseClient'

type ConnectionStatus = 'idle' | 'connected' | 'error'

export const DatabaseStatus: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let isMounted = true
    let retryCount = 0
    const maxRetries = 3

    const testConnection = async () => {
      try {
        const isConnected = await testDatabaseConnection()
        if (isMounted) {
          if (isConnected) {
            setStatus('connected')
            setMessage('✅ Database Connected')
          } else {
            setStatus('error')
            setMessage('❌ Database Error')
          }
        }
      } catch (err) {
        if (isMounted) {
          retryCount++
          if (retryCount < maxRetries) {
            // Retry silently
            setTimeout(testConnection, 3000)
          } else {
            setStatus('error')
            setMessage('❌ Connection Failed')
          }
        }
      }
    }

    // Delay initial test to not block auth
    setTimeout(testConnection, 2000)

    return () => {
      isMounted = false
    }
  }, [])

  if (status === 'idle') return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 z-50"
    >
      <div
        className={`p-3 rounded-lg shadow-lg flex items-center gap-2 ${
          status === 'connected'
            ? 'bg-green-900 border border-green-700'
            : 'bg-red-900 border border-red-700'
        }`}
      >
        {status === 'connected' && (
          <>
            <CheckCircle className="text-green-400" size={18} />
            <span className="text-green-300 text-sm">{message}</span>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="text-red-400" size={18} />
            <span className="text-red-300 text-sm">{message}</span>
          </>
        )}
      </div>
    </motion.div>
  )
}

export default DatabaseStatus
