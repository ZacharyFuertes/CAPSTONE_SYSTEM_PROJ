import { supabase } from './supabaseClient'
import { User, Vehicle } from '../types'

/**
 * Customers Service
 * Handles all customer and vehicle database operations
 */

export const customerService = {
  /**
   * Fetch all customers for a shop
   */
  async getCustomers(shopId: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('shop_id', shopId)
        .eq('role', 'customer')
        .order('name', { ascending: true })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching customers:', err)
      return []
    }
  },

  /**
   * Get a single customer by ID
   */
  async getCustomerById(customerId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', customerId)
        .single()

      if (error) throw error
      return data || null
    } catch (err) {
      console.error('Error fetching customer:', err)
      return null
    }
  },

  /**
   * Create a new customer
   */
  async createCustomer(customer: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{ ...customer, role: 'customer' }])
        .select()
        .single()

      if (error) throw error
      console.log('✅ Customer created:', data)
      return data || null
    } catch (err) {
      console.error('Error creating customer:', err)
      return null
    }
  },

  /**
   * Update a customer
   */
  async updateCustomer(customerId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', customerId)
        .select()
        .single()

      if (error) throw error
      console.log('✅ Customer updated:', data)
      return data || null
    } catch (err) {
      console.error('Error updating customer:', err)
      return null
    }
  },

  /**
   * Delete a customer
   */
  async deleteCustomer(customerId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', customerId)

      if (error) throw error
      console.log('✅ Customer deleted')
      return true
    } catch (err) {
      console.error('Error deleting customer:', err)
      return false
    }
  },

  /**
   * Get customer with appointment count
   */
  async getCustomerStats(customerId: string): Promise<any> {
    try {
      const customer = await this.getCustomerById(customerId)
      if (!customer) return null

      const { data: appointments, error: appointmentError } = await supabase
        .from('appointments')
        .select('id')
        .eq('customer_id', customerId)

      const { data: vehicles, error: vehicleError } = await supabase
        .from('vehicles')
        .select('id')
        .eq('customer_id', customerId)

      if (appointmentError) throw appointmentError
      if (vehicleError) throw vehicleError

      return {
        ...customer,
        total_visits: appointments?.length || 0,
        total_vehicles: vehicles?.length || 0,
      }
    } catch (err) {
      console.error('Error fetching customer stats:', err)
      return null
    }
  },
}

/**
 * Vehicles Service
 * Handles all vehicle database operations
 */

export const vehicleService = {
  /**
   * Fetch all vehicles for a customer
   */
  async getCustomerVehicles(customerId: string): Promise<Vehicle[]> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching vehicles:', err)
      return []
    }
  },

  /**
   * Get a single vehicle by ID
   */
  async getVehicleById(vehicleId: string): Promise<Vehicle | null> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', vehicleId)
        .single()

      if (error) throw error
      return data || null
    } catch (err) {
      console.error('Error fetching vehicle:', err)
      return null
    }
  },

  /**
   * Create a new vehicle
   */
  async createVehicle(vehicle: Omit<Vehicle, 'id' | 'created_at'>): Promise<Vehicle | null> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert([vehicle])
        .select()
        .single()

      if (error) throw error
      console.log('✅ Vehicle created:', data)
      return data || null
    } catch (err) {
      console.error('Error creating vehicle:', err)
      return null
    }
  },

  /**
   * Update a vehicle
   */
  async updateVehicle(vehicleId: string, updates: Partial<Vehicle>): Promise<Vehicle | null> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .update(updates)
        .eq('id', vehicleId)
        .select()
        .single()

      if (error) throw error
      console.log('✅ Vehicle updated:', data)
      return data || null
    } catch (err) {
      console.error('Error updating vehicle:', err)
      return null
    }
  },

  /**
   * Delete a vehicle
   */
  async deleteVehicle(vehicleId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId)

      if (error) throw error
      console.log('✅ Vehicle deleted')
      return true
    } catch (err) {
      console.error('Error deleting vehicle:', err)
      return false
    }
  },
}
