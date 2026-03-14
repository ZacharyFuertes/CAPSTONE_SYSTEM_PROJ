import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ArrowLeft, Lock, Info, Wrench } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabaseClient'
import { Appointment, AppointmentStatus } from '../types'

interface Mechanic {
  id: string
  name: string
  email: string
}

const statusConfig: Record<AppointmentStatus, { color: string; label: string }> = {
  pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Pending' },
  confirmed: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Confirmed' },
  in_progress: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'In Progress' },
  completed: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Completed' },
  cancelled: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Cancelled' },
}

interface TimeSlot {
  time: string
  available: boolean
  appointment?: Appointment
}

const generateTimeSlots = (date: string, appointments: Appointment[]): TimeSlot[] => {
  const slots: TimeSlot[] = []
  for (let hour = 8; hour < 18; hour++) {
    const time = `${String(hour).padStart(2, '0')}:00`
    const appointment = appointments.find(
      (apt) => apt.scheduled_date === date && apt.scheduled_time === time
    )
    slots.push({
      time,
      available: !appointment,
      appointment,
    })
  }
  return slots
}

interface AppointmentCalendarPageProps {
  onNavigate?: (page: string) => void
}

const AppointmentCalendarPage: React.FC<AppointmentCalendarPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [mechanics, setMechanics] = useState<Mechanic[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [loadingMechanics, setLoadingMechanics] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    vehicle_make: '',
    service_type: 'Oil Change',
    mechanic_id: '',
  })

  // Fetch appointments from Supabase
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .order('scheduled_date', { ascending: true })

        if (error) throw error
        setAppointments(data || [])
      } catch (err) {
        console.error('Error fetching appointments:', err)
        setAppointments([])
      }
    }

    fetchAppointments()
  }, [])

  // Fetch available mechanics when booking form opens
  useEffect(() => {
    if (showBookingForm && mechanics.length === 0) {
      fetchMechanics()
    }
  }, [showBookingForm])

  const fetchMechanics = async () => {
    try {
      setLoadingMechanics(true)
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('role', 'mechanic')

      if (error) throw error
      setMechanics(data || [])
    } catch (err) {
      console.error('Error fetching mechanics:', err)
      setMechanics([])
    } finally {
      setLoadingMechanics(false)
    }
  }

  // Filter appointments based on user role
  const getFilteredAppointments = (): Appointment[] => {
    if (user?.role === 'owner') {
      // Owners see all appointments
      return appointments
    } else if (user?.role === 'mechanic') {
      // Mechanics see only appointments assigned to them
      return appointments.filter((apt) => apt.mechanic_id === user.id)
    } else if (user?.role === 'customer') {
      // Customers see only their own appointments
      return appointments.filter((apt) => apt.customer_id === user.id)
    }
    return []
  }

  const filteredAppointments = getFilteredAppointments()
  const timeSlots = generateTimeSlots(selectedDate, filteredAppointments)

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const renderCalendarDays = () => {
    const date = new Date()
    const daysInMonth = getDaysInMonth(date)
    const firstDay = getFirstDayOfMonth(date)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const handleStatusChange = (appointmentId: string, newStatus: AppointmentStatus) => {
    // Only owners and mechanics can change status, and mechanics can only update their own appointments
    if (user?.role === 'owner' || user?.role === 'mechanic') {
      setAppointments(
        appointments.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: newStatus, updated_at: new Date().toISOString() } : apt
        )
      )
    }
  }

  const handleBookAppointment = async () => {
    if (!selectedSlot || !formData.customer_name || !formData.customer_phone || !formData.vehicle_make) {
      alert('Please fill in all required fields')
      return
    }

    try {
      // For customers, use their authenticated user ID
      // For admins/owners booking on behalf, generate a new customer record
      const customerId = user?.role === 'customer' ? user.id : undefined

      const appointmentData = {
        customer_id: customerId,
        vehicle_id: undefined, // We'll need to create this or select existing
        scheduled_date: selectedDate,
        scheduled_time: selectedSlot,
        service_type: formData.service_type,
        description: `${formData.vehicle_make} - ${formData.service_type}`,
        status: 'pending',
        notes: `Customer: ${formData.customer_name}, Phone: ${formData.customer_phone}`,
        mechanic_id: formData.mechanic_id || null,
      }

      // Save to database
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select()
        .single()

      if (error) throw error

      // Add to local state
      setAppointments([...appointments, data])
      setShowBookingForm(false)
      setFormData({ customer_name: '', customer_phone: '', vehicle_make: '', service_type: 'Oil Change', mechanic_id: '' })
      setSelectedSlot(null)
      
      // Show success message
      alert('Appointment booked successfully!')
    } catch (err) {
      console.error('Error booking appointment:', err)
      alert('Failed to book appointment. Please try again.')
    }
  }

  const calendarDays = renderCalendarDays()
  const isOwner = user?.role === 'owner'
  const isMechanic = user?.role === 'mechanic'
  const isCustomer = user?.role === 'customer'
  const canBookAppointments = isOwner || isCustomer
  const canUpdateStatus = isOwner || isMechanic

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

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">{t('appointments.title')}</h1>
        <p className="text-slate-400">
          {isMechanic 
            ? `View your assigned appointments (${filteredAppointments.length} total)`
            : isCustomer
            ? `View your appointments (${filteredAppointments.length} total)`
            : `View and manage ${filteredAppointments.length} appointments`
          }
        </p>
      </motion.div>

      {/* Role Info Banner */}
      {isMechanic && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3"
        >
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-300 mb-1">Mechanic View</h3>
            <p className="text-blue-200 text-sm">
              You can only see appointments assigned to you. Update appointment status to track service progress.
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-800 rounded-lg p-6 border border-slate-700 h-fit"
        >
          <h2 className="text-xl font-bold text-white mb-6">Calendar</h2>

          {/* Mini Calendar */}
          <div className="mb-8 space-y-4">
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-xs font-semibold text-slate-400 py-2">
                  {day.slice(0, 1)}
                </div>
              ))}
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (day) {
                      const newDate = new Date()
                      newDate.setDate(day)
                      setSelectedDate(newDate.toISOString().split('T')[0])
                    }
                  }}
                  className={`p-2 rounded text-sm transition ${
                    day === null
                      ? ''
                      : selectedDate.endsWith(`-${String(day).padStart(2, '0')}`)
                      ? 'bg-blue-600 text-white font-bold'
                      : 'hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Booking Button - Only for Owners and Customers */}
          {canBookAppointments ? (
            <button
              onClick={() => setShowBookingForm(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
            >
              {t('appointments.new')}
            </button>
          ) : (
            <button
              disabled
              className="w-full bg-slate-600 text-slate-400 font-semibold py-2 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
              title="Only owners and customers can book appointments"
            >
              <Lock className="w-4 h-4" />
              {t('appointments.new')}
            </button>
          )}
        </motion.div>

        {/* Time Slots & Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Time Slots */}
          {isOwner && (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">
                Available Slots - {selectedDate}
              </h2>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => {
                      if (slot.available) {
                        setSelectedSlot(slot.time)
                        setShowBookingForm(true)
                      }
                    }}
                    disabled={!slot.available}
                    className={`p-3 rounded-lg font-semibold transition ${
                      slot.available
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 cursor-pointer'
                        : 'bg-red-500/20 text-red-400 cursor-not-allowed opacity-50'
                    } ${selectedSlot === slot.time ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Appointments List */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">
              Appointments for {selectedDate}
            </h2>
            <div className="space-y-3">
              <AnimatePresence>
                {filteredAppointments
                  .filter((apt) => apt.scheduled_date === selectedDate)
                  .map((apt, index) => (
                    <motion.div
                      key={apt.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-slate-700 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <span className="text-white font-semibold">{apt.scheduled_time}</span>
                            <span className={`text-xs px-2 py-1 rounded border ${statusConfig[apt.status].color}`}>
                              {statusConfig[apt.status].label}
                            </span>
                          </div>
                          <p className="text-slate-300">{apt.service_type}</p>
                          <p className="text-slate-400 text-sm mt-1">{apt.notes}</p>
                        </div>
                        {/* Status Change - Only for Owners and Mechanics */}
                        {canUpdateStatus && (
                          <select
                            value={apt.status}
                            onChange={(e) => handleStatusChange(apt.id, e.target.value as AppointmentStatus)}
                            className="bg-slate-600 text-white text-sm px-2 py-1 rounded border border-slate-500 focus:outline-none"
                          >
                            {Object.entries(statusConfig).map(([status, config]) => (
                              <option key={status} value={status}>
                                {config.label}
                              </option>
                            ))}
                          </select>
                        )}
                        {/* Disabled Status for Customers */}
                        {isCustomer && (
                          <span className={`text-xs px-2 py-1 rounded border ${statusConfig[apt.status].color}`}>
                            {statusConfig[apt.status].label}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
              {filteredAppointments.filter((apt) => apt.scheduled_date === selectedDate).length === 0 && (
                <p className="text-slate-400 text-center py-4">No appointments scheduled for this date</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Booking Form Modal */}
      <AnimatePresence>
        {showBookingForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Book New Appointment</h3>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Vehicle (Make/Model)"
                  value={formData.vehicle_make}
                  onChange={(e) => setFormData({ ...formData, vehicle_make: e.target.value })}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
                <select
                  value={formData.service_type}
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                >
                  <option>Oil Change</option>
                  <option>Brake Service</option>
                  <option>Tire Replacement</option>
                  <option>Engine Diagnostic</option>
                  <option>General Maintenance</option>
                </select>

                {/* Mechanic Selection */}
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <label className="flex items-center gap-2 text-white font-semibold mb-3">
                    <Wrench className="w-4 h-4" />
                    Assign Mechanic
                  </label>
                  {loadingMechanics ? (
                    <p className="text-slate-400 text-sm">Loading mechanics...</p>
                  ) : mechanics.length === 0 ? (
                    <p className="text-slate-400 text-sm">No mechanics available</p>
                  ) : (
                    <select
                      value={formData.mechanic_id}
                      onChange={(e) => setFormData({ ...formData, mechanic_id: e.target.value })}
                      className="w-full bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select a mechanic (optional)</option>
                      {mechanics.map((mechanic) => (
                        <option key={mechanic.id} value={mechanic.id}>
                          {mechanic.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {selectedSlot && (
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-blue-400 font-semibold">
                      Selected: {selectedDate} at {selectedSlot}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowBookingForm(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded transition"
                >
                  {t('form.cancel')}
                </button>
                <button
                  onClick={handleBookAppointment}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
                >
                  {t('form.submit')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AppointmentCalendarPage
