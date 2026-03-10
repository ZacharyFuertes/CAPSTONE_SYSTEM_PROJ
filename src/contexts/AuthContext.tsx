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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let isMounted = true

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return
      
      try {
        if (session?.user) {
          // Only set loading if we're actually checking the database
          setLoading(true)
          
          // Fetch user profile from database
          let { data: userData, error: selectError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single()

          // If user not found in database, create a minimal record
          if (selectError?.code === 'PGRST116' || !userData) {
            console.log('User record not found, creating default user record...')
            const { data: newUser, error: insertError } = await supabase
              .from('users')
              .insert({
                id: session.user.id,
                email: session.user.email || 'unknown',
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                role: 'customer',
              })
              .select()
              .single()

            if (!insertError && newUser) {
              userData = newUser
            }
          }

          if (isMounted && userData) {
            setUser(userData)
          }
        } else {
          if (isMounted) setUser(null)
        }
      } catch (err) {
        console.error('Error updating user on auth state change:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    })

    // Check session in background - no timeout
    const checkSessionOnMount = async () => {
      try {
        await supabase.auth.getSession()
      } catch (err) {
        console.debug('Background session check error:', err)
      }
    }

    checkSessionOnMount()

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data: { user: authUser }, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

      if (signInError) {
        throw new Error(signInError.message)
      }

      if (authUser?.id) {
        // Fetch user data immediately
        let { data: userData, error: selectError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        // If user not found in database, create a minimal record
        if (selectError?.code === 'PGRST116' || !userData) {
          console.log('User record not found in database, creating one...')
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              id: authUser.id,
              email: authUser.email || email,
              name: authUser.user_metadata?.name || email.split('@')[0],
              role: 'customer',
            })
            .select()
            .single()

          if (insertError) {
            console.error('Failed to create user record:', insertError)
            throw new Error('Account created but profile setup failed. Please contact support.')
          }

          userData = newUser
        }

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
      const { data: authData, error: signUpError } = await supabase.auth.signUp({ email, password })

      if (signUpError) {
        console.error('Supabase signup error:', signUpError)
        // Provide more helpful error messages
        if (signUpError.message.includes('already registered')) {
          throw new Error('This email is already registered. Please login instead or use a different email.')
        }
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
