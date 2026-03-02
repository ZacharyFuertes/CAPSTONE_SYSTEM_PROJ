import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Trash2, AlertCircle, Download } from 'lucide-react'

interface Appointment {
  id: string
  name: string
  email: string
  phone: string
  date: string
  service: string
  status: 'pending' | 'confirmed' | 'completed'
  createdAt: string
}

interface AppointmentsPageProps {
  onBack: () => void
}

const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ onBack }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all')

  useEffect(() => {
    // Load appointments from localStorage
    const saved = localStorage.getItem('motoshop_appointments')
    if (saved) {
      setAppointments(JSON.parse(saved))
    }
  }, [])

  const deleteAppointment = (id: string) => {
    const updated = appointments.filter(a => a.id !== id)
    setAppointments(updated)
    localStorage.setItem('motoshop_appointments', JSON.stringify(updated))
  }

  const updateStatus = (id: string, newStatus: Appointment['status']) => {
    const updated = appointments.map(a => 
      a.id === id ? { ...a, status: newStatus } : a
    )
    setAppointments(updated)
    localStorage.setItem('motoshop_appointments', JSON.stringify(updated))
  }

  const filteredAppointments = filter === 'all' 
    ? appointments 
    : appointments.filter(a => a.status === filter)

  const downloadCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Service', 'Date', 'Status', 'Created']
    const rows = appointments.map(a => [
      a.name,
      a.email,
      a.phone,
      a.service,
      a.date,
      a.status,
      a.createdAt
    ])
    
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'motoshop-appointments.csv'
    a.click()
  }

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-900/30 border-yellow-700/50 text-yellow-300'
      case 'confirmed': return 'bg-blue-900/30 border-blue-700/50 text-blue-300'
      case 'completed': return 'bg-green-900/30 border-green-700/50 text-green-300'
      default: return 'bg-gray-900/30 border-gray-700/50 text-gray-300'
    }
  }

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  }

  return (
    <div className="min-h-screen bg-moto-dark pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-moto-darker to-moto-gray border-b border-moto-gray-light/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-moto-accent-orange hover:text-moto-accent-neon transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="font-display text-4xl font-bold text-white mb-2">Appointments Dashboard</h1>
          <p className="text-gray-400">Manage all service appointments</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-moto-darker border border-moto-gray-light/20 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Total Appointments</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-moto-darker border border-yellow-700/30 rounded-lg p-4">
            <p className="text-yellow-300 text-sm mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-300">{stats.pending}</p>
          </div>
          <div className="bg-moto-darker border border-blue-700/30 rounded-lg p-4">
            <p className="text-blue-300 text-sm mb-1">Confirmed</p>
            <p className="text-3xl font-bold text-blue-300">{stats.confirmed}</p>
          </div>
          <div className="bg-moto-darker border border-green-700/30 rounded-lg p-4">
            <p className="text-green-300 text-sm mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-300">{stats.completed}</p>
          </div>
        </motion.div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-start sm:items-center">
          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'confirmed', 'completed'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === status
                    ? 'bg-moto-accent-orange text-white'
                    : 'bg-moto-gray text-gray-300 hover:bg-moto-gray-light'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <motion.button
            onClick={downloadCSV}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-moto-accent-neon text-moto-dark font-bold rounded-lg hover:bg-opacity-90 transition-all"
          >
            <Download size={18} />
            Export CSV
          </motion.button>
        </div>

        {/* Appointments Table */}
        {filteredAppointments.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-moto-darker border border-moto-gray-light/20 rounded-lg overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-moto-gray-light/20 bg-moto-gray/50">
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-300">Customer</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-300">Service</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-300">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-300">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-bold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment, idx) => (
                    <motion.tr
                      key={appointment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-moto-gray-light/10 hover:bg-moto-gray/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-white">{appointment.name}</p>
                          <p className="text-xs text-gray-400">{appointment.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white text-sm">{appointment.service}</td>
                      <td className="px-6 py-4 text-white text-sm">{new Date(appointment.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <select
                          value={appointment.status}
                          onChange={(e) => updateStatus(appointment.id, e.target.value as any)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${getStatusColor(appointment.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteAppointment(appointment.id)}
                          className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete appointment"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-moto-darker border border-moto-gray-light/20 rounded-lg"
          >
            <AlertCircle size={48} className="mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400 text-lg">No appointments found</p>
            <p className="text-gray-500 text-sm">Appointments will appear here when customers book services</p>
          </motion.div>
        )}

        {/* Details */}
        {filteredAppointments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="bg-moto-darker border border-moto-gray-light/20 rounded-lg p-6">
              <h3 className="font-bold text-white mb-4">Recent Appointments</h3>
              <div className="space-y-3">
                {appointments.slice(-3).reverse().map(apt => (
                  <div key={apt.id} className="p-3 bg-moto-gray/30 rounded border border-moto-gray-light/10">
                    <p className="text-white font-semibold text-sm">{apt.name}</p>
                    <p className="text-xs text-gray-400">{apt.service} - {apt.date}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-moto-darker border border-moto-gray-light/20 rounded-lg p-6">
              <h3 className="font-bold text-white mb-4">Contact Info for Status Updates</h3>
              <p className="text-gray-300 text-sm mb-4">
                Send confirmation emails to customers at these addresses:
              </p>
              <div className="space-y-2">
                {appointments.slice(0, 3).map(apt => (
                  <a
                    key={apt.id}
                    href={`mailto:${apt.email}`}
                    className="block text-moto-accent-orange hover:text-moto-accent-neon text-sm truncate"
                    title={apt.email}
                  >
                    {apt.email}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default AppointmentsPage
