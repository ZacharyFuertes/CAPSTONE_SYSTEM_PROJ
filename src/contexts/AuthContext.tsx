import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, UserRole } from '../types'
import { supabase } from '../services/supabaseClient'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>
  isAuthenticated: boolean
  hasRole: (role: UserRole | UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in via Supabase session
    let isMounted = true
    
    const checkSession = async () => {
      try {
        setLoading(true)
        
        // Add timeout to prevent hanging indefinitely
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session check timed out')), 10000)
        )
        
        const sessionPromise = supabase.auth.getSession()
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as Awaited<typeof sessionPromise>
        
        if (!isMounted) return

        if (session?.user) {
          // Fetch user profile from database
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (isMounted && userData) {
            setUser(userData)
          }
        }
      } catch (err) {
        console.error('Session check error:', err)
        // Don't treat as fatal - onAuthStateChange will handle state updates
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    checkSession()

    // Listen for auth state changes - this handles all auth events including login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return
      
      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (isMounted && userData) {
          setUser(userData)
        }
      } else {
        if (isMounted) setUser(null)
      }
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Login timed out. Please check your connection.')), 15000)
      )
      
      const loginPromise = supabase.auth.signInWithPassword({ email, password })
      
      const { data: { user: authUser }, error: signInError } = await Promise.race([loginPromise, timeoutPromise]) as Awaited<typeof loginPromise>

      if (signInError) {
        throw new Error(signInError.message)
      }

      if (authUser?.id) {
        // Fetch user data immediately
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (userData) {
          setUser(userData)
        }
      }
    } catch (err) {
      console.error('Login error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const signup = async (email: string, password: string, name: string, role: UserRole) => {
    setLoading(true)
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Signup timed out. Please check your connection.')), 15000)
      )
      
      const signupPromise = supabase.auth.signUp({ email, password })
      
      const { data: authData, error: signUpError } = await Promise.race([signupPromise, timeoutPromise]) as Awaited<typeof signupPromise>

      if (signUpError) {
        console.error('Supabase signup error:', signUpError)
        throw new Error(signUpError.message)
      }

      if (!authData.user) {
        throw new Error('User creation failed - no user returned')
      }

      console.log('Auth user created:', authData.user.id)

      // Insert user profile into users table
      // Generate a proper UUID for shop_id (v4 format: 8-4-4-4-12 hex digits)
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = (Math.random() * 16) | 0
          const v = c === 'x' ? r : (r & 0x3) | 0x8
          return v.toString(16)
        })
      }

      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          name,
          role,
          shop_id: role === 'customer' ? null : generateUUID(),
        })
        .select()

      if (insertError) {
        console.error('Users table insert error:', insertError)
        throw new Error(`Failed to create user profile: ${insertError.message}`)
      }

      console.log('User profile created:', insertData)

      // Create app user object
      const appUser: User = {
        id: authData.user.id,
        email,
        name,
        role,
        shop_id: role === 'customer' ? undefined : insertData?.[0]?.shop_id,
      }

      setUser(appUser)
    } catch (error) {
      console.error('Full signup error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(user.role)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        signup,
        isAuthenticated: !!user,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
