// src/components/ProtectedRoute.tsx
// Example: How to use the new useAuth() hook with isLoading

import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

/**
 * Protected Route Component
 *
 * KEY FIX: Checks isLoading before rendering
 * This prevents "flash of redirect" while session is being restored
 */
export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // ✅ FIX: Show loading state while session is restored
  // This ensures user doesn't get redirected while getSession() is running
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading your session...</p>
        </div>
      </div>
    );
  }

  // ✅ FIX: After loading completes, check if authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ FIX: Optionally check role
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
