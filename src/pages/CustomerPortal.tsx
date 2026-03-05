import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Wrench, Phone, Mail, Download, ArrowLeft } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

interface ServiceRecord {
  id: string
  date: string
  vehicle: string
  service: string
  cost: number
  status: 'completed' | 'pending'
  parts_used: string[]
}

interface CustomerProfile {
  id: string
  name: string
  phone: string
  email: string
  vehicles: Array<{ id: string; make: string; model: string; plate: string }>
  total_visits: number
  member_since: string
}

// Mock data
const mockCustomer: CustomerProfile = {
  id: 'cust_1',
  name: 'Juan Dela Cruz',
  phone: '+63 912 345 6789',
  email: 'juan@example.com',
  vehicles: [
    { id: 'v1', make: 'Honda', model: 'Click', plate: 'ABC 1234' },
    { id: 'v2', make: 'Yamaha', model: 'Mio', plate: 'XYZ 5678' },
  ],
  total_visits: 12,
  member_since: '2023-01-15',
}

const mockServiceRecords: ServiceRecord[] = [
  {
    id: 'sr_1',
    date: '2024-03-01',
    vehicle: 'Honda Click',
    service: 'Oil Change & Filter Replacement',
    cost: 1500,
    status: 'completed',
    parts_used: ['Oil Filter', 'Engine Oil (1L)', 'Spark Plug'],
  },
  {
    id: 'sr_2',
    date: '2024-02-15',
    vehicle: 'Honda Click',
    service: 'Brake Inspection & Pad Replacement',
    cost: 3200,
    status: 'completed',
    parts_used: ['Brake Pads (Front)', 'Brake Cleaner'],
  },
  {
    id: 'sr_3',
    date: '2024-02-01',
    vehicle: 'Yamaha Mio',
    service: 'Tire Rotation & Balancing',
    cost: 800,
    status: 'completed',
    parts_used: ['Labor Only'],
  },
]

interface SelectedRecord {
  record: ServiceRecord | null
  showDetails: boolean
}

interface CustomerPortalProps {
  onNavigate?: (page: string) => void
}

const CustomerPortal: React.FC<CustomerPortalProps> = ({ onNavigate }) => {
  const { } = useLanguage()
  const [selectedRecord, setSelectedRecord] = useState<SelectedRecord>({
    record: null,
    showDetails: false,
  })

  const totalSpent = mockServiceRecords.reduce((sum, record) => sum + record.cost, 0)

  const handleGeneratePDF = (record: ServiceRecord) => {
    // Mock PDF generation - In production, use jsPDF or similar
    alert(`Generating PDF for Service Record #${record.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => onNavigate && onNavigate('dashboard')}
        className="mb-6 flex items-center gap-2 text-moto-accent hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </motion.button>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Customer Portal</h1>
        <p className="text-slate-400">View your service history and manage your vehicles</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Profile Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white shadow-lg">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl font-bold">
                {mockCustomer.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{mockCustomer.name}</h2>
            <p className="text-blue-100 mb-4">Member since {mockCustomer.member_since}</p>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4" />
                <span>{mockCustomer.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4" />
                <span>{mockCustomer.email}</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="space-y-3">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-sm mb-2">Total Visits</p>
              <p className="text-3xl font-bold text-white">{mockCustomer.total_visits}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-sm mb-2">Total Spent</p>
              <p className="text-3xl font-bold text-green-400">₱{totalSpent.toLocaleString()}</p>
            </div>
          </div>

          {/* Vehicles */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">Registered Vehicles</h3>
            <div className="space-y-3">
              {mockCustomer.vehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-slate-700 rounded-lg p-3">
                  <p className="text-white font-semibold">
                    {vehicle.make} {vehicle.model}
                  </p>
                  <p className="text-slate-400 text-sm">Plate: {vehicle.plate}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Service History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Service History</h2>
              <span className="text-slate-400">
                {mockServiceRecords.length} services
              </span>
            </div>

            <div className="space-y-3">
              {mockServiceRecords.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-slate-700 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition cursor-pointer"
                  onClick={() =>
                    setSelectedRecord({ record, showDetails: !selectedRecord.showDetails })
                  }
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Wrench className="w-5 h-5 text-blue-400" />
                        <span className="font-semibold text-white">{record.service}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded font-semibold ${
                            record.status === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {record.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        {record.date} • {record.vehicle}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400">
                        ₱{record.cost.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Details Expanded */}
                  {selectedRecord.record?.id === record.id && selectedRecord.showDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-slate-600 space-y-3"
                    >
                      <div>
                        <p className="text-slate-400 text-sm mb-2">Parts Used:</p>
                        <div className="flex flex-wrap gap-2">
                          {record.parts_used.map((part, i) => (
                            <span
                              key={i}
                              className="text-xs bg-slate-600 text-slate-200 px-2 py-1 rounded"
                            >
                              {part}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleGeneratePDF(record)
                        }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download Invoice
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mt-6">
            <h2 className="text-2xl font-bold text-white mb-6">Upcoming Appointments</h2>
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No upcoming appointments</p>
              <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition">
                Book Service Now
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default CustomerPortal
