import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, Plus, Trash2, AlertCircle, CheckCircle, X } from 'lucide-react'

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

      // Cascade-delete related records
      try {
        const { error: jobOrderError } = await supabase
          .from('job_orders')
          .delete()
          .eq('mechanic_id', deleteConfirm.id)
        if (jobOrderError) console.warn('Could not delete job_orders (non-blocking):', jobOrderError.message)
      } catch (e) {
        console.warn('job_orders cleanup skipped:', e)
      }

      try {
        const { error: availError } = await supabase
          .from('mechanic_availability')
          .delete()
          .eq('mechanic_id', deleteConfirm.id)
        if (availError) console.warn('Could not delete mechanic_availability (non-blocking):', availError.message)
      } catch (e) {
        console.warn('mechanic_availability cleanup skipped:', e)
      }

      try {
        const { error: appointmentError } = await supabase
          .from('appointments')
          .delete()
          .eq('mechanic_id', deleteConfirm.id)
        if (appointmentError) console.warn('Could not delete appointments (non-blocking):', appointmentError.message)
      } catch (e) {
        console.warn('appointments cleanup skipped:', e)
      }

      // Delete the mechanic user record — this one MUST succeed
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
      <div className="min-h-screen bg-[#0f0f0f] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#d63a2f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6b6b6b] text-[10px] uppercase tracking-widest font-bold">Loading mechanic availability...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-6 sm:p-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 text-[#d63a2f] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">
          <div className="w-6 h-[1px] bg-[#d63a2f]" /> MANAGE MECHANICS
        </div>
        <h1 className="font-display text-3xl sm:text-4xl text-white uppercase tracking-wide mb-2">
          MECHANIC AVAILABILITY
        </h1>
        <p className="text-[#6b6b6b] text-sm">Add, remove, and toggle availability slots for mechanics</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Mechanics List (Sidebar) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#111111] border border-[#222] p-6 h-fit"
        >
          <h2 className="text-[10px] font-bold text-[#6b6b6b] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#d63a2f]" />
            MECHANICS
          </h2>

          <div className="space-y-2 mb-6">
            <button
              onClick={() => setSelectedMechanic(null)}
              className={`w-full p-3 transition text-left text-[10px] font-bold uppercase tracking-widest border ${
                selectedMechanic === null
                  ? 'bg-[#1a1a1a] text-white border-[#d63a2f]'
                  : 'bg-[#0f0f0f] text-[#6b6b6b] border-[#222] hover:border-[#333] hover:text-white'
              }`}
            >
              All Mechanics
            </button>
            {mechanics.map((mechanic) => (
              <div key={mechanic.id} className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedMechanic(mechanic.id)}
                  className={`flex-1 p-3 transition text-left border ${
                    selectedMechanic === mechanic.id
                      ? 'bg-[#1a1a1a] text-white border-[#d63a2f]'
                      : 'bg-[#0f0f0f] text-[#6b6b6b] border-[#222] hover:border-[#333] hover:text-white'
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-wider">{mechanic.name}</p>
                  <p className="text-[9px] text-[#555] mt-0.5">{mechanic.email}</p>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteConfirm(mechanic)
                  }}
                  className="p-2.5 bg-[#1a1010] hover:bg-[#221515] text-[#d63a2f] border border-[#d63a2f]/20 hover:border-[#d63a2f]/50 transition"
                  title="Remove Mechanic"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full bg-[#d63a2f] hover:bg-[#b82e25] text-white font-bold py-3 transition text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <Plus size={14} />
            ADD AVAILABILITY
          </button>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3"
        >
          {/* Add Form Modal */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="bg-[#111111] border border-[#d63a2f]/30 border-t-2 border-t-[#d63a2f] p-6">
                  <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                    <Plus size={14} className="text-[#d63a2f]" />
                    ADD NEW AVAILABILITY SLOT
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[#6b6b6b] text-[10px] font-bold uppercase tracking-widest mb-2">Mechanic</label>
                      <select
                        value={formData.mechanic_id}
                        onChange={(e) => setFormData({ ...formData, mechanic_id: e.target.value })}
                        className="w-full bg-[#0a0a0a] text-white px-4 py-3 border border-[#333] focus:border-[#d63a2f] focus:outline-none transition text-xs font-bold uppercase tracking-widest"
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
                      <label className="block text-[#6b6b6b] text-[10px] font-bold uppercase tracking-widest mb-2">Day of Week</label>
                      <select
                        value={formData.day_of_week}
                        onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                        className="w-full bg-[#0a0a0a] text-white px-4 py-3 border border-[#333] focus:border-[#d63a2f] focus:outline-none transition text-xs font-bold uppercase tracking-widest"
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
                        <label className="block text-[#6b6b6b] text-[10px] font-bold uppercase tracking-widest mb-2">Start Time</label>
                        <input
                          type="time"
                          value={formData.start_time}
                          onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                          className="w-full bg-[#0a0a0a] text-white px-4 py-3 border border-[#333] focus:border-[#d63a2f] focus:outline-none transition text-xs font-bold uppercase tracking-widest"
                        />
                      </div>
                      <div>
                        <label className="block text-[#6b6b6b] text-[10px] font-bold uppercase tracking-widest mb-2">End Time</label>
                        <input
                          type="time"
                          value={formData.end_time}
                          onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                          className="w-full bg-[#0a0a0a] text-white px-4 py-3 border border-[#333] focus:border-[#d63a2f] focus:outline-none transition text-xs font-bold uppercase tracking-widest"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleAddAvailability}
                        className="flex-1 bg-[#d63a2f] hover:bg-[#b82e25] text-white font-bold py-3 transition uppercase tracking-widest text-[10px]"
                      >
                        SAVE
                      </button>
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="flex-1 bg-transparent hover:bg-[#222] text-[#6b6b6b] hover:text-white font-bold py-3 border border-[#333] transition uppercase tracking-widest text-[10px]"
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Availability List */}
          <div className="space-y-3">
            {selectedMechanic && (
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#222]">
                <div className="text-[#d63a2f] text-[10px] font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                  <div className="w-6 h-[1px] bg-[#d63a2f]" />
                  Showing availability for
                </div>
                <span className="text-white text-xs font-bold uppercase tracking-widest">{selectedMechanicData?.name}</span>
              </div>
            )}

            {filteredAvailability.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-[#111111] border border-[#222]">
                <AlertCircle className="w-12 h-12 text-[#333] mb-4" strokeWidth={1} />
                <p className="text-[#6b6b6b] text-[10px] tracking-widest uppercase font-bold">
                  {selectedMechanic ? `No availability slots set for ${selectedMechanicData?.name}` : 'No availability slots added yet'}
                </p>
                <p className="text-[#444] text-[9px] tracking-widest uppercase mt-2">
                  Click "Add Availability" to create one
                </p>
              </div>
            ) : (
              filteredAvailability.map((slot) => (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#111111] border border-[#222] hover:border-[#333] transition p-5"
                >
                  <div className="flex items-start justify-between mb-4 pb-4 border-b border-[#1a1a1a]">
                    <div>
                      <h3 className="text-white font-bold uppercase tracking-widest text-sm flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-[#d63a2f]" />
                        {slot.day_of_week}
                      </h3>
                      <p className="text-[#6b6b6b] text-[10px] font-bold uppercase tracking-widest">
                        Mechanic: <span className="text-[#ccc]">{slot.mechanic_name}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {slot.is_available ? (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-[#112211] border border-green-500/30 text-green-400">
                          <CheckCircle size={12} />
                          Available
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-[#111] border border-[#333] text-[#555]">
                          Unavailable
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-4 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#d63a2f]" />
                    <span className="text-white font-bold text-xs uppercase tracking-widest">
                      {slot.start_time} — {slot.end_time}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleToggleAvailability(slot.id, slot.is_available)}
                      className={`flex-1 px-3 py-2.5 font-bold transition text-[10px] uppercase tracking-widest border ${
                        slot.is_available
                          ? 'bg-[#1a1010] hover:bg-[#221515] text-[#d63a2f] border-[#d63a2f]/20 hover:border-[#d63a2f]/50'
                          : 'bg-[#101a10] hover:bg-[#152215] text-green-400 border-green-500/20 hover:border-green-500/50'
                      }`}
                    >
                      {slot.is_available ? 'Mark Unavailable' : 'Mark Available'}
                    </button>
                    <button
                      onClick={() => handleDeleteAvailability(slot.id)}
                      className="px-4 py-2.5 bg-[#1a1010] hover:bg-[#221515] text-[#d63a2f] border border-[#d63a2f]/20 hover:border-[#d63a2f]/50 transition flex items-center justify-center"
                    >
                      <Trash2 size={14} />
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0a0a] border border-[#222] border-t-2 border-t-[#d63a2f] max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#222] bg-[#111111]">
                <h3 className="text-white font-bold uppercase tracking-widest text-sm">Delete Mechanic</h3>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="text-[#6b6b6b] hover:text-white transition"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-6 py-6">
                <p className="text-[#ccc] text-sm mb-2">
                  Are you sure you want to delete{' '}
                  <span className="font-bold text-white">{deleteConfirm.name}</span>?
                </p>
                <p className="text-[#6b6b6b] text-xs mb-6">
                  This action cannot be undone. All mechanic data and associated records will be permanently removed.
                </p>

                <p className="text-[#6b6b6b] text-[10px] uppercase tracking-widest font-bold mb-2">
                  To confirm, type{' '}
                  <span className="text-white">CONFIRM</span>
                </p>
                <input
                  type="text"
                  placeholder="Type CONFIRM to delete"
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  className="w-full bg-[#0f0f0f] text-white px-4 py-3 border border-[#333] focus:border-[#d63a2f] focus:outline-none transition text-xs font-bold uppercase tracking-widest placeholder:text-[#555]"
                />
              </div>

              <div className="px-6 py-5 border-t border-[#222] bg-[#111111] flex gap-3">
                <button
                  onClick={() => {
                    setDeleteConfirm(null)
                    setConfirmationInput('')
                  }}
                  disabled={deleting}
                  className="flex-1 bg-transparent hover:bg-[#222] text-[#6b6b6b] hover:text-white font-bold py-3 border border-[#333] transition uppercase tracking-widest text-[10px] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteMechanic}
                  disabled={deleting || confirmationInput !== 'CONFIRM'}
                  className="flex-1 bg-[#d63a2f] hover:bg-[#b82e25] text-white font-bold py-3 transition uppercase tracking-widest text-[10px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      DELETING...
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      DELETE
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
