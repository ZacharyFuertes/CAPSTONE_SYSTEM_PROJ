import { createClient } from '@supabase/supabase-js'

// @ts-ignore - Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// @ts-ignore - Vite environment variables
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is not set in .env.local')
}
if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not set in .env.local')
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

/**
 * Test database connection
 * Use this to verify Supabase is properly connected
 */
export const testDatabaseConnection = async () => {
  try {
    console.log('🔄 Testing Supabase connection...')
    
    // Try to fetch from users table
    const { error } = await supabase
      .from('users')
      .select('count(*)', { count: 'exact' })
      .limit(1)

    if (error) {
      console.error('❌ Database Error:', error.message)
      return false
    }

    console.log('✅ Supabase connected successfully!')
    console.log('📊 Users table accessible')
    return true
  } catch (err) {
    console.error('❌ Connection failed:', err)
    return false
  }
}

/**
 * Get all users from database
 */
export const getUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }
  return data || []
}

/**
 * Get all parts (inventory) from database
 */
export const getParts = async () => {
  const { data, error } = await supabase
    .from('parts')
    .select('*')

  if (error) {
    console.error('Error fetching parts:', error)
    return []
  }
  return data || []
}

/**
 * Get all appointments from database
 */
export const getAppointments = async () => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')

  if (error) {
    console.error('Error fetching appointments:', error)
    return []
  }
  return data || []
}

export default supabase
