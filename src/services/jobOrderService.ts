import { supabase } from './supabaseClient'
import { JobOrder } from '../types'

/**
 * Job Orders Service
 * Handles all job order database operations
 */

export const jobOrderService = {
  /**
   * Fetch all job orders for a shop
   */
  async getJobOrders(shopId: string): Promise<JobOrder[]> {
    try {
      const { data, error } = await supabase
        .from('job_orders')
        .select(`
          *,
          appointment:appointments(id, scheduled_date, scheduled_time, service_type),
          customer:users(id, name, email, phone),
          mechanic:users(id, name),
          vehicle:vehicles(id, make, model, plate_number)
        `)
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching job orders:', err)
      return []
    }
  },

  /**
   * Get job orders by status
   */
  async getJobOrdersByStatus(shopId: string, status: string): Promise<JobOrder[]> {
    try {
      const { data, error } = await supabase
        .from('job_orders')
        .select('*')
        .eq('shop_id', shopId)
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching job orders by status:', err)
      return []
    }
  },

  /**
   * Get a single job order by ID
   */
  async getJobOrderById(jobOrderId: string): Promise<JobOrder | null> {
    try {
      const { data, error } = await supabase
        .from('job_orders')
        .select('*')
        .eq('id', jobOrderId)
        .single()

      if (error) throw error
      return data || null
    } catch (err) {
      console.error('Error fetching job order:', err)
      return null
    }
  },

  /**
   * Create a new job order
   */
  async createJobOrder(jobOrder: Omit<JobOrder, 'id' | 'created_at'>): Promise<JobOrder | null> {
    try {
      const { data, error } = await supabase
        .from('job_orders')
        .insert([jobOrder])
        .select()
        .single()

      if (error) throw error
      console.log('✅ Job order created:', data)
      return data || null
    } catch (err) {
      console.error('Error creating job order:', err)
      return null
    }
  },

  /**
   * Update a job order
   */
  async updateJobOrder(jobOrderId: string, updates: Partial<JobOrder>): Promise<JobOrder | null> {
    try {
      const { data, error } = await supabase
        .from('job_orders')
        .update(updates)
        .eq('id', jobOrderId)
        .select()
        .single()

      if (error) throw error
      console.log('✅ Job order updated:', data)
      return data || null
    } catch (err) {
      console.error('Error updating job order:', err)
      return null
    }
  },

  /**
   * Update job order status
   */
  async updateJobOrderStatus(jobOrderId: string, status: string): Promise<boolean> {
    try {
      const updateData: any = { status }
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('job_orders')
        .update(updateData)
        .eq('id', jobOrderId)

      if (error) throw error
      console.log('✅ Job order status updated')
      return true
    } catch (err) {
      console.error('Error updating job order status:', err)
      return false
    }
  },

  /**
   * Delete a job order
   */
  async deleteJobOrder(jobOrderId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('job_orders')
        .delete()
        .eq('id', jobOrderId)

      if (error) throw error
      console.log('✅ Job order deleted')
      return true
    } catch (err) {
      console.error('Error deleting job order:', err)
      return false
    }
  },

  /**
   * Get job order statistics
   */
  async getJobOrderStats(shopId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('job_orders')
        .select('status, labor_hours, labor_rate')
        .eq('shop_id', shopId)

      if (error) throw error

      const stats = {
        total: data?.length || 0,
        completed: data?.filter((j: any) => j.status === 'completed').length || 0,
        in_progress: data?.filter((j: any) => j.status === 'in_progress').length || 0,
        draft: data?.filter((j: any) => j.status === 'draft').length || 0,
        cancelled: data?.filter((j: any) => j.status === 'cancelled').length || 0,
        totalLaborHours: data?.reduce((sum: number, j: any) => sum + (j.labor_hours || 0), 0) || 0,
      }

      return stats
    } catch (err) {
      console.error('Error fetching job order stats:', err)
      return null
    }
  },
}
