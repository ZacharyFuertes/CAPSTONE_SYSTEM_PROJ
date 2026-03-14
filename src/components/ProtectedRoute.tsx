import React from 'react'
import { UserRole } from '../types'
import { useAuth } from '../contexts/AuthContext'

/**
 * ProtectedRoute Component
 * Restricts access to components based on user role.
 */
interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles: UserRole | UserRole[]
  fallback?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles,
  fallback = null,
}) => {
  const { user } = useAuth()
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]

  if (!user || !roles.includes(user.role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * ProtectedFeature Component
 * Hides a UI feature (button, menu item, etc.) based on user role.
 * Optional onUnauthorized callback for handling attempts to access restricted features.
 */
interface ProtectedFeatureProps {
  children: React.ReactNode
  requiredRoles: UserRole | UserRole[]
  fallback?: React.ReactNode
  onClick?: (e: React.MouseEvent) => void
  onUnauthorized?: () => void
}

export const ProtectedFeature: React.FC<ProtectedFeatureProps> = ({
  children,
  requiredRoles,
  fallback = null,
  onClick,
  onUnauthorized,
}) => {
  const { user } = useAuth()
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]

  const handleClick = (e: React.MouseEvent) => {
    if (!user || !roles.includes(user.role)) {
      onUnauthorized?.()
      e.preventDefault()
      return
    }
    onClick?.(e)
  }

  if (!user || !roles.includes(user.role)) {
    return <>{fallback}</>
  }

  return (
    <div onClick={handleClick}>
      {children}
    </div>
  )
}

/**
 * Custom hook for role checking
 * Provides utility functions to check user permissions
 */
export const useRoleCheck = () => {
  const { user } = useAuth()

  return {
    isOwner: user?.role === 'owner',
    isMechanic: user?.role === 'mechanic',
    isCustomer: user?.role === 'customer',
    hasRole: (role: UserRole | UserRole[]) => {
      const roles = Array.isArray(role) ? role : [role]
      return user ? roles.includes(user.role) : false
    },
    canManageInventory: user?.role === 'owner', // Only owners can add/edit/delete
    canViewInventory: user?.role === 'owner' || user?.role === 'mechanic', // Owners and mechanics can view
    canManageAppointments: user?.role === 'owner', // Only owners can manage all appointments
    canViewOwnAppointments: user?.role !== 'owner', // Mechanics and customers see their own
    canManageUsers: user?.role === 'owner', // Only owners can manage users
    canViewReports: user?.role === 'owner', // Only owners can see reports
    canAccessAdminDashboard: user?.role === 'owner' || user?.role === 'mechanic', // Both can see dashboard
    canRecordServiceProgress: user?.role === 'mechanic', // Only mechanics
  }
}
