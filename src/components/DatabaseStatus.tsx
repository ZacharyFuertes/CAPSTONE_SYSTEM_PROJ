import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Loader, ChevronDown } from 'lucide-react'
import { testDatabaseConnection } from '../services/supabaseClient'

type ConnectionStatus = 'testing' | 'connected' | 'error'

export const DatabaseStatus: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>('testing')
  const [message, setMessage] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    // Capture console logs
    const originalLog = console.log
    const originalError = console.error

    console.log = (...args) => {
      setLogs(prev => [...prev, '✓ ' + args.join(' ')])
      originalLog(...args)
    }

    console.error = (...args) => {
      setLogs(prev => [...prev, '✗ ' + args.join(' ')])
      originalError(...args)
    }

    const testConnection = async () => {
      try {
        const isConnected = await testDatabaseConnection()
        if (isConnected) {
          setStatus('connected')
          setMessage('✅ Database Connected')
        } else {
          setStatus('error')
          setMessage('❌ Database Not Connected - Check logs')
        }
      } catch (err) {
        setStatus('error')
        setMessage('❌ Connection Failed')
      }
    }

    testConnection()

    return () => {
      console.log = originalLog
      console.error = originalError
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 right-4 z-50"
    >
      {/* Main Status Card */}
      <motion.div
        className={`p-4 rounded-lg shadow-lg flex items-center gap-3 cursor-pointer border ${
          status === 'connected'
            ? 'bg-green-900 border-green-700'
            : status === 'error'
            ? 'bg-red-900 border-red-700'
            : 'bg-yellow-900 border-yellow-700'
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        {status === 'testing' && (
          <>
            <Loader className="animate-spin text-yellow-400" size={20} />
            <span className="text-yellow-300">Testing database...</span>
          </>
        )}
        {status === 'connected' && (
          <>
            <CheckCircle className="text-green-400" size={20} />
            <span className="text-green-300">{message}</span>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="text-red-400" size={20} />
            <span className="text-red-300">{message}</span>
            <ChevronDown
              size={18}
              className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </>
        )}
      </motion.div>

      {/* Expanded Logs */}
      {expanded && status === 'error' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 p-4 rounded-lg bg-slate-900 border border-red-700 max-w-md max-h-64 overflow-y-auto"
        >
          <p className="text-red-400 text-sm font-bold mb-3">Debug Logs:</p>
          <div className="space-y-1 text-xs font-mono">
            {logs.length > 0 ? (
              logs.map((log, idx) => (
                <div key={idx} className="text-slate-300">
                  {log}
                </div>
              ))
            ) : (
              <div className="text-slate-500">No logs captured yet...</div>
            )}
          </div>
          <div className="mt-3 text-xs text-slate-400">
            💡 <strong>Tip:</strong> Open DevTools (F12) → Console to see full error details
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default DatabaseStatus
