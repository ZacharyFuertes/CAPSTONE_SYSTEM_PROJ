import { supabase } from './supabaseClient'
import { Appointment, AppointmentStatus } from '../types'

/**
 * Appointments Service
 * Handles all appointment database operations
 */

export const appointmentService = {
  /**
   * Fetch all appointments for a shop
   */
  async getAppointments(shopId: string): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          customer:users(id, name, email, phone),
          vehicle:vehicles(id, make, model, plate_number)
        `)
        .eq('shop_id', shopId)
        .order('scheduled_date', { ascending: true })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching appointments:', err)
      return []
    }
  },

  /**
   * Get appointments for a specific date
   */
  async getAppointmentsByDate(shopId: string, date: string): Promise<Appointment[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('shop_id', shopId)
        .eq('scheduled_date', date)
        .order('scheduled_time', { ascending: true })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching appointments by date:', err)
      return []
    }
  },

  /**
   * Get a single appointment by ID
   */
  async getAppointmentById(appointmentId: string): Promise<Appointment | null> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single()

      if (error) throw error
      return data || null
    } catch (err) {
      console.error('Error fetching appointment:', err)
      return null
    }
  },

  /**
   * Create a new appointment
   */
  async createAppointment(
    appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Appointment | null> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointment])
        .select()
        .single()

      if (error) throw error
      console.log('✅ Appointment created:', data)
      return data || null
    } catch (err) {
      console.error('Error creating appointment:', err)
      return null
    }
  },

  /**
   * Update an appointment
   */
  async updateAppointment(
    appointmentId: string,
    updates: Partial<Appointment>
  ): Promise<Appointment | null> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', appointmentId)
        .select()
        .single()

      if (error) throw error
      console.log('✅ Appointment updated:', data)
      return data || null
    } catch (err) {
      console.error('Error updating appointment:', err)
      return null
    }
  },

  /**
   * Update appointment status
   */
  async updateAppointmentStatus(
    appointmentId: string,
    status: AppointmentStatus
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', appointmentId)

      if (error) throw error
      console.log('✅ Appointment status updated')
      return true
    } catch (err) {
      console.error('Error updating appointment status:', err)
      return false
    }
  },

  /**
   * Cancel an appointment
   */
  async cancelAppointment(appointmentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', appointmentId)

      if (error) throw error
      console.log('✅ Appointment cancelled')
      return true
    } catch (err) {
      console.error('Error cancelling appointment:', err)
      return false
    }
  },

  /**
   * Delete an appointment
   */
  async deleteAppointment(appointmentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId)

      if (error) throw error
      console.log('✅ Appointment deleted')
      return true
    } catch (err) {
      console.error('Error deleting appointment:', err)
      return false
    }
  },

  /**
   * Get available time slots for a date
   */
  async getAvailableSlots(shopId: string, date: string): Promise<string[]> {
    try {
      // Fetch all appointments for the date
      const appointments = await this.getAppointmentsByDate(shopId, date)

      // Generate time slots
      const allSlots = []
      for (let hour = 8; hour < 18; hour++) {
        allSlots.push(`${String(hour).padStart(2, '0')}:00`)
      }

      // Filter out booked slots
      const bookedTimes = appointments.map((apt) => apt.scheduled_time)
      const availableSlots = allSlots.filter((slot) => !bookedTimes.includes(slot))

      return availableSlots
    } catch (err) {
      console.error('Error getting available slots:', err)
      return []
    }
  },
}
