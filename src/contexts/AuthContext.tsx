import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, UserRole } from '../types'

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
    // Check if user is logged in (from localStorage in MVP, Supabase in production)
    const storedUser = localStorage.getItem('shop_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('shop_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, _password: string) => {
    setLoading(true)
    try {
      // TODO: Replace with Supabase auth
      // Mock login for MVP
      const mockUser: User = {
        id: 'user_' + Date.now(),
        email,
        name: email.split('@')[0],
        role: 'owner',
        shop_id: 'shop_' + Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setUser(mockUser)
      localStorage.setItem('shop_user', JSON.stringify(mockUser))
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setUser(null)
    localStorage.removeItem('shop_user')
  }

  const signup = async (email: string, _password: string, name: string, role: UserRole) => {
    setLoading(true)
    try {
      // TODO: Replace with Supabase auth
      const mockUser: User = {
        id: 'user_' + Date.now(),
        email,
        name,
        role,
        shop_id: role === 'customer' ? undefined : 'shop_' + Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setUser(mockUser)
      localStorage.setItem('shop_user', JSON.stringify(mockUser))
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
