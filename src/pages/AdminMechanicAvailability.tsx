import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, Plus, Trash2, ArrowLeft, AlertCircle, CheckCircle, X } from 'lucide-react'

import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabaseClient'

interface Mechanic {
  id: string
  name: string
  email: string
}

interface Availability {
  id: string
  mechanic_id: string
  mechanic_name: string
  day_of_week: string
  start_time: string
  end_time: string
  is_available: boolean
}

interface AdminMechanicAvailabilityProps {
  onNavigate?: (page: string) => void
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const AdminMechanicAvailability: React.FC<AdminMechanicAvailabilityProps> = ({ onNavigate }) => {

  const { user } = useAuth()
  const [mechanics, setMechanics] = useState<Mechanic[]>([])
  const [availability, setAvailability] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMechanic, setSelectedMechanic] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Mechanic | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [confirmationInput, setConfirmationInput] = useState('')
  const [formData, setFormData] = useState({
    mechanic_id: '',
    day_of_week: 'Monday',
    start_time: '08:00',
    end_time: '17:00',
  })

  // Check if user is admin/owner
  useEffect(() => {
    if (user?.role !== 'owner') {
      onNavigate && onNavigate('dashboard')
    }
  }, [user?.role])

  // Fetch mechanics and availability
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch all mechanics
      const { data: mechanicsData, error: mechanicsError } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('role', 'mechanic')

      if (mechanicsError) throw mechanicsError

      setMechanics(mechanicsData || [])

      // Fetch availability (table may not exist yet — gracefully handle 404)
      let availabilityData: any[] = []
      try {
        const { data, error: availabilityError } = await supabase
          .from('mechanic_availability')
          .select('*')
          .order('day_of_week', { ascending: true })

        if (availabilityError && availabilityError.code !== 'PGRST116') {
          console.warn('Could not fetch mechanic_availability:', availabilityError.message)
        } else {
          availabilityData = data || []
        }
      } catch (e) {
        console.warn('mechanic_availability table may not exist:', e)
      }

      // Enhance availability with mechanic names
      const enhancedAvailability: Availability[] = availabilityData.map((av: any) => {
        const mechanic = mechanicsData?.find((m) => m.id === av.mechanic_id)
        return {
          ...av,
          mechanic_name: mechanic?.name || 'Unknown',
        }
      })

      setAvailability(enhancedAvailability)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAvailability = async () => {
    if (!formData.mechanic_id) {
      alert('Please select a mechanic')
      return
    }

    try {
      const { data, error } = await supabase
        .from('mechanic_availability')
        .insert([
          {
            mechanic_id: formData.mechanic_id,
            day_of_week: formData.day_of_week,
            start_time: formData.start_time,
            end_time: formData.end_time,
            is_available: true,
          },
        ])
        .select()
        .single()

      if (error) throw error

      // Add to local state
      const mechanic = mechanics.find((m) => m.id === formData.mechanic_id)
      setAvailability([
        ...availability,
        {
          ...data,
          mechanic_name: mechanic?.name || 'Unknown',
        },
      ])

      // Reset form
      setFormData({
        mechanic_id: '',
        day_of_week: 'Monday',
        start_time: '08:00',
        end_time: '17:00',
      })
      setShowAddForm(false)
    } catch (err) {
      console.error('Error adding availability:', err)
      alert('Failed to add availability')
    }
  }

  const handleDeleteAvailability = async (availabilityId: string) => {
    if (!confirm('Are you sure you want to delete this availability slot?')) return

    try {
      const { error } = await supabase
        .from('mechanic_availability')
        .delete()
        .eq('id', availabilityId)

      if (error) throw error

      // Remove from local state
      setAvailability(availability.filter((a) => a.id !== availabilityId))
    } catch (err) {
      console.error('Error deleting availability:', err)
      alert('Failed to delete availability')
    }
  }

  // Handle mechanic deletion (same pattern as customer delete)
  const handleDeleteMechanic = async () => {
    if (!deleteConfirm) return

    try {
      setDeleting(true)

      // Cascade-delete related records — each step is non-blocking so that
      // a missing table (404) or RLS restriction won't abort the whole flow.

      // 1. Delete job orders for this mechanic (may not exist)
      try {
        const { error: jobOrderError } = await supabase
          .from('job_orders')
          .delete()
          .eq('mechanic_id', deleteConfirm.id)
        if (jobOrderError) console.warn('Could not delete job_orders (non-blocking):', jobOrderError.message)
      } catch (e) {
        console.warn('job_orders cleanup skipped:', e)
      }

      // 2. Delete availability records for this mechanic (may not exist)
      try {
        const { error: availError } = await supabase
          .from('mechanic_availability')
          .delete()
          .eq('mechanic_id', deleteConfirm.id)
        if (availError) console.warn('Could not delete mechanic_availability (non-blocking):', availError.message)
      } catch (e) {
        console.warn('mechanic_availability cleanup skipped:', e)
      }

      // 3. Delete appointments assigned to this mechanic (may not exist)
      try {
        const { error: appointmentError } = await supabase
          .from('appointments')
          .delete()
          .eq('mechanic_id', deleteConfirm.id)
        if (appointmentError) console.warn('Could not delete appointments (non-blocking):', appointmentError.message)
      } catch (e) {
        console.warn('appointments cleanup skipped:', e)
      }

      // 4. Delete the mechanic user record — this one MUST succeed
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', deleteConfirm.id)

      if (userError) throw userError

      // Update local state
      setMechanics(mechanics.filter((m) => m.id !== deleteConfirm.id))
      setAvailability(availability.filter((a) => a.mechanic_id !== deleteConfirm.id))
      if (selectedMechanic === deleteConfirm.id) setSelectedMechanic(null)
      setDeleteConfirm(null)
      setConfirmationInput('')
      alert('Mechanic deleted successfully!')
    } catch (err) {
      console.error('Error deleting mechanic:', err)
      alert('Error deleting mechanic. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleAvailability = async (availabilityId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('mechanic_availability')
        .update({ is_available: !currentStatus })
        .eq('id', availabilityId)

      if (error) throw error

      // Update local state
      setAvailability(
        availability.map((a) => (a.id === availabilityId ? { ...a, is_available: !currentStatus } : a))
      )
    } catch (err) {
      console.error('Error updating availability:', err)
      alert('Failed to update availability')
    }
  }

  const selectedMechanicData = mechanics.find((m) => m.id === selectedMechanic)
  const filteredAvailability = selectedMechanic
    ? availability.filter((a) => a.mechanic_id === selectedMechanic)
    : availability

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading mechanic availability...</p>
        </div>
      </div>
    )
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
        <h1 className="text-4xl font-bold text-white mb-2">Mechanic Availability</h1>
        <p className="text-slate-400">Manage when mechanics are available to work</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Mechanics List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-800 rounded-lg p-6 border border-slate-700 h-fit"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Mechanics
          </h2>

          <div className="space-y-2 mb-6">
            <button
              onClick={() => setSelectedMechanic(null)}
              className={`w-full p-3 rounded-lg transition text-left ${
                selectedMechanic === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              All Mechanics
            </button>
            {mechanics.map((mechanic) => (
              <div key={mechanic.id} className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedMechanic(mechanic.id)}
                  className={`flex-1 p-3 rounded-lg transition text-left ${
                    selectedMechanic === mechanic.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <p className="font-semibold">{mechanic.name}</p>
                  <p className="text-xs">{mechanic.email}</p>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteConfirm(mechanic)
                  }}
                  className="p-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-400 transition"
                  title="Remove Mechanic"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Add Availability
          </button>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3"
        >
          {/* Add Form */}
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800 rounded-lg p-6 border border-blue-500/30 mb-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Add New Availability Slot</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Mechanic</label>
                  <select
                    value={formData.mechanic_id}
                    onChange={(e) => setFormData({ ...formData, mechanic_id: e.target.value })}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select a mechanic</option>
                    {mechanics.map((mechanic) => (
                      <option key={mechanic.id} value={mechanic.id}>
                        {mechanic.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">Day of Week</label>
                  <select
                    value={formData.day_of_week}
                    onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                  >
                    {daysOfWeek.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Start Time</label>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">End Time</label>
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddAvailability}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Availability List */}
          <div className="space-y-4">
            {filteredAvailability.length === 0 ? (
              <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
                <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">
                  {selectedMechanic ? `No availability slots set for ${selectedMechanicData?.name}` : 'No availability slots added yet'}
                </p>
              </div>
            ) : (
              filteredAvailability.map((slot) => (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        {slot.day_of_week}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Mechanic: <span className="text-white font-semibold">{slot.mechanic_name}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {slot.is_available ? (
                        <span className="flex items-center gap-1 text-green-400 text-sm font-semibold">
                          <CheckCircle size={16} />
                          Available
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm font-semibold">Unavailable</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-700/50 rounded p-4 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-semibold">
                      {slot.start_time} - {slot.end_time}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleToggleAvailability(slot.id, slot.is_available)}
                      className={`flex-1 px-3 py-2 rounded font-semibold transition ${
                        slot.is_available
                          ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400'
                          : 'bg-green-600/20 hover:bg-green-600/30 text-green-400'
                      }`}
                    >
                      {slot.is_available ? 'Mark Unavailable' : 'Mark Available'}
                    </button>
                    <button
                      onClick={() => handleDeleteAvailability(slot.id)}
                      className="px-3 py-2 rounded bg-red-600/20 hover:bg-red-600/30 text-red-400 transition font-semibold flex items-center justify-center"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Delete Mechanic Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-lg border border-slate-700 max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Delete Mechanic</h3>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="text-slate-400 hover:text-white transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-300 mb-2">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-white">{deleteConfirm.name}</span>?
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  This action cannot be undone. All mechanic data and associated
                  records will be permanently removed.
                </p>

                <p className="text-sm text-gray-400 mb-2">
                  To confirm, type{' '}
                  <span className="font-mono font-semibold text-gray-300">CONFIRM</span>
                </p>
                <input
                  type="text"
                  placeholder="Type CONFIRM to delete"
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-red-500 focus:outline-none mb-4"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDeleteConfirm(null)
                    setConfirmationInput('')
                  }}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteMechanic}
                  disabled={deleting || confirmationInput !== 'CONFIRM'}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminMechanicAvailability
