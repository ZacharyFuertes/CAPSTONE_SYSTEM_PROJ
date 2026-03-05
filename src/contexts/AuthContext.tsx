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
    // Check current Supabase session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          // Fetch user data from users table
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single()

          if (!error && userData) {
            const appUser: User = {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              role: userData.role as UserRole,
              shop_id: userData.shop_id,
              created_at: userData.created_at,
              updated_at: userData.updated_at,
            }
            setUser(appUser)
          }
        }
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        // Fetch user data when auth state changes
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('email', session.user.email)
          .single()

        if (userData) {
          const appUser: User = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role as UserRole,
            shop_id: userData.shop_id,
            created_at: userData.created_at,
            updated_at: userData.updated_at,
          }
          setUser(appUser)
        }
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw new Error(error.message)
      }

      // User data will be fetched by auth state listener
    } catch (error) {
      console.error('Login error:', error)
      throw error
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
      // Sign up with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        console.error('Supabase signup error:', signUpError)
        throw new Error(signUpError.message)
      }

      if (!authData.user) {
        throw new Error('User creation failed - no user returned')
      }

      console.log('Auth user created:', authData.user.id)

      // Insert user profile into users table
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          name,
          role,
          shop_id: role === 'customer' ? null : 'shop_' + Date.now(),
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
        shop_id: role === 'customer' ? undefined : 'shop_' + Date.now(),
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
