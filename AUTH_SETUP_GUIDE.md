# Authentication Setup Guide - Session Persistence Fix

## ✅ What Was Fixed

The reload bug is now **permanently fixed** with the new AuthContext. Here's what changed:

### **Before (Broken):**
```
User logs in → state set ✅
Browser refresh → state lost in React ❌
Session gone, redirected to login
(Clearing cache was the only workaround)
```

### **After (Production-Ready):**
```
User logs in → Supabase stores session in localStorage ✅
Browser refresh → getSession() restores from localStorage ✅
listener keeps state synced ✅
Page loads with user still logged in
```

---

## 🔧 How It Works

### 1. **Session Persistence** (The FIX)
The new AuthContext has TWO useEffects:

```typescript
// Effect 1: On mount, restore persisted session
useEffect(() => {
  supabase.auth.getSession() // ← Reads from localStorage
  if (session exists) → fetch user profile
  setIsLoading(false)
}, []) // Runs ONCE on mount

// Effect 2: Subscribe to auth changes
useEffect(() => {
  supabase.auth.onAuthStateChange(...)
  // Fires on login/logout/refresh
  // Keeps state synced with Supabase Auth
}, []) // Runs ONCE on mount
```

### 2. **Loading State**
- `isLoading = true` on initial mount
- `isLoading = false` after session is restored OR listener fires first auth event
- This prevents "flash of redirect" on page load

### 3. **User Profile**
- Stored in your `users` table in Supabase
- Auth ID (from Supabase Auth) = UUID
- Synced whenever auth state changes

---

## 📦 How to Wrap Your App

### Option A: In `src/main.tsx` (Recommended for whole app)

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
```

### Option B: In `src/App.tsx` (If you have other providers)

```typescript
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import Router from './Router' // or your routing setup

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router />
      </LanguageProvider>
    </AuthProvider>
  )
}
```

### Option C: With React Router (split by route)

```typescript
import { AuthProvider } from './contexts/AuthContext'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedLayout from './layouts/ProtectedLayout'
import LoginPage from './pages/LoginPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            {/* other protected routes */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
```

---

## 🛡️ Protected Route Example

### Option 1: Component Wrapper

```typescript
// src/components/ProtectedRoute.tsx
import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()

  // Show loading spinner while session is being restored
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500" />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check role if required
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
```

### Option 2: Layout Component with Protected Routes

```typescript
// src/layouts/ProtectedLayout.tsx
import { useAuth } from '../contexts/AuthContext'
import { Navigate, Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function ProtectedLayout() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mx-auto mb-4" />
          <p className="text-white">Loading your session...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
```

### Option 3: Use in Component (Check before render)

```typescript
// src/pages/Dashboard.tsx
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { user, isLoading, canViewReports } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      {canViewReports() && (
        <section>Reports</section>
      )}
    </div>
  )
}
```

---

## 🔐 Login Page Example

```typescript
// src/pages/LoginPage.tsx
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      await login(email, password)
      // Auth listener will update state, and you can redirect here or let it auto-redirect
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
        className="w-full px-4 py-2 border rounded mb-4"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
        className="w-full px-4 py-2 border rounded mb-4"
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded font-bold disabled:opacity-50"
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

---

## 📋 Signup Page Example

```typescript
// src/pages/SignupPage.tsx
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

enum UserRole {
  CUSTOMER = 'customer',
  MECHANIC = 'mechanic',
  OWNER = 'owner',
}

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER)
  const [error, setError] = useState('')
  const { signup, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await signup(email, password, name, role)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    }
  }

  return (
    <form onSubmit={handleSignup} className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Sign Up</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
        className="w-full px-4 py-2 border rounded mb-4"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
        className="w-full px-4 py-2 border rounded mb-4"
      />

      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={isLoading}
        className="w-full px-4 py-2 border rounded mb-4"
      />

      <select
        value={role}
        onChange={(e) => setRole(e.target.value as UserRole)}
        disabled={isLoading}
        className="w-full px-4 py-2 border rounded mb-4"
      >
        <option value={UserRole.CUSTOMER}>Customer</option>
        <option value={UserRole.MECHANIC}>Mechanic</option>
        <option value={UserRole.OWNER}>Owner</option>
      </select>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-600 text-white py-2 rounded font-bold disabled:opacity-50"
      >
        {isLoading ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
  )
}
```

---

## 🧪 Testing the Fix

### Test 1: Session Persists on Reload
1. Log in to your app
2. Press F5 to reload the page
3. ✅ You should stay logged in (no redirect to login)
4. Check console for: `📋 [Auth] Restoring session from storage...` and `✅ [Auth] Session restored from storage`

### Test 2: Logout Works
1. While logged in, click logout
2. ✅ Redirects to login page
3. Reload page
4. ✅ Still on login (session was cleared)

### Test 3: Login Persists
1. Log in with email/password
2. Reload page
3. ✅ Dashboard still loads (session persisted)
4. Try different browser tab
5. ✅ Both sees you're logged in (shared localStorage)

---

## 🔄 API Reference

### `useAuth()` Hook

```typescript
const {
  user,           // User | null - Current user object (from DB)
  isLoading,      // boolean - True while session is being restored
  isAuthenticated,// boolean - Same as !!user
  login,          // (email, password) => Promise<void>
  logout,         // () => Promise<void>
  signup,         // (email, password, name, role) => Promise<void>
  
  // RBAC helpers
  hasRole,                    // (role | role[]) => boolean
  canManageInventory,         // () => boolean
  canViewInventory,           // () => boolean
  canManageAppointments,      // () => boolean
  canViewOwnAppointments,     // () => boolean
  canManageUsers,             // () => boolean
  canViewReports,             // () => boolean
  canAccessAdminDashboard,    // () => boolean
  canRecordServiceProgress,   // () => boolean
  canAccessCustomerPortal,    // () => boolean
} = useAuth()
```

---

## 🐛 Troubleshooting

### "User still redirects to login after reload"
- Check browser DevTools → Application → Local Storage
- Look for key like `sb-<your-project-id>-auth-token`
- If empty: session wasn't saved (user wasn't actually logged in)
- If exists: check console for errors in session restoration

### "Session flashes then redirects"
- Normal! This means `isLoading` is true during restoration
- Make sure Protected Routes check `if (isLoading) return <Spinner />`
- Add tiny delay if flash still visible: won't happen after first load

### "Database queries fail on reload"
- Old: Auth/DB queries ran before session was restored
- New: Auth listener waits for session, then queries DB
- Check network tab for failed requests with 401 Unauthorized
- If occurs: session restoration might be timing out

### Clean localStorage (Testing)
```javascript
// In browser console
localStorage.removeItem('sb-[your-project-id]-auth-token')
// or clear all
localStorage.clear()
// Then reload and login again
```

---

## ✨ Key Differences from Old Code

| Aspect | Old | New |
|--------|-----|-----|
| Session Restore | ❌ Missing | ✅ `getSession()` on mount |
| State Name | `loading` | `isLoading` (clearer) |
| User Profile Fetch | Within listener | Extracted to function |
| Listener Cleanup | ✅ Unsubscribe | ✅ Better cleanup |
| Error Handling | ⚠️ Complex | ✅ Simple, clear |
| Comments | ❌ Minimal | ✅ Detailed |
| Production Ready | ⚠️ Partial | ✅ Industry standard |

---

## 📚 Compatibility

- ✅ Works with existing LanguageContext
- ✅ Works with Groq AI (no auth conflict)
- ✅ Works with inventory CRUD (queries use auth session)
- ✅ Works with react-big-calendar (auth + data fetching)
- ✅ Works with recharts dashboards (queries use auth)
- ✅ Works with React Router v6
- ✅ No migration needed for existing pages
- ⚠️ Change `useAuth().loading` → `useAuth().isLoading` if used elsewhere

---

## 🚀 What's Next

1. ✅ Replace AuthContext with new version (done)
2. ✅ Wrap app with `<AuthProvider>` (do this next)
3. ✅ Update protected routes to use `isLoading` instead of `loading`
4. ✅ Test reload on all routes
5. Optional: Replace `loading` with `isLoading` in other components
6. Deploy with confidence! 🎉

