// MIGRATION GUIDE: Updating components to use new AuthContext
// Key change: loading → isLoading

// ============================================
// BEFORE (Old Pattern)
// ============================================
/*
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { user, loading } = useAuth()  // ❌ Old: was called 'loading'

  if (loading) {
    return <Spinner />
  }

  return <div>{user?.name}</div>
}
*/

// ============================================
// AFTER (New Pattern)
// ============================================
/*
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { user, isLoading } = useAuth()  // ✅ New: now called 'isLoading'

  if (isLoading) {
    return <Spinner />
  }

  return <div>{user?.name}</div>
}
*/

// ============================================
// QUICK MIGRATION STEPS
// ============================================

/*
1. In any component using useAuth():
   
   FIND:    const { user, loading } = useAuth()
   REPLACE: const { user, isLoading } = useAuth()
   
   FIND:    if (loading)
   REPLACE: if (isLoading)

2. Examples where to look:
   - src/pages/*.tsx  (LoginPage, Dashboard, etc)
   - src/components/SystemNavbar.tsx
   - src/components/Navbar.tsx
   - src/components/ProtectedRoute.tsx
   
3. Search project for 'loading' + 'useAuth' to find all uses
   Ctrl+Shift+F → loading.*useAuth (regex)

4. Test after each file change
*/

// ============================================
// EXAMPLE: Dashboard with isLoading
// ============================================
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

export default function DashboardExample() {
  const { user, isLoading, canViewReports } = useAuth()
  const [data, setData] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  // Fetch data only after user is loaded
  useEffect(() => {
    if (!isLoading && user) {
      fetchData()
    }
  }, [isLoading, user])

  const fetchData = async () => {
    try {
      setDataLoading(true)
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .limit(10)

      if (error) throw error
      setData(data || [])
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setDataLoading(false)
    }
  }

  // ✅ KEY: Check isLoading first (prevents redirect flash)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mx-auto mb-4" />
          <p>Restoring your session...</p>
        </div>
      </div>
    )
  }

  // ✅ Then check authentication
  if (!user) {
    return <p>Error: User not found. Please log in.</p>
  }

  return (
    <div className="p-8">
      <h1>Welcome, {user.name}</h1>
      <p>Role: {user.role}</p>

      {/* Data section with its own loading state */}
      {dataLoading ? (
        <p>Loading data...</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* RBAC Example */}
      {canViewReports() && (
        <section className="mt-8">
          <h2>Reports</h2>
          {/* Reports content */}
        </section>
      )}
    </div>
  )
}

// ============================================
// EXAMPLE: Login Page (no change needed, but shown for ref)
// ============================================
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LoginPageExample() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      // Call login - auth listener will auto-update state
      await login(email, password)
      
      // Navigate after successful login
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Login</h1>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isLoading}
        className="w-full px-4 py-2 border border-gray-300 rounded mb-4 disabled:opacity-50"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
        className="w-full px-4 py-2 border border-gray-300 rounded mb-4 disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white font-bold py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}

// ============================================
// EXAMPLE: SystemNavbar with logout
// ============================================
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function SystemNavbarExample() {
  const { user, logout, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  if (isLoading) {
    return <nav className="bg-slate-800 h-16 flex items-center">Loading...</nav>
  }

  return (
    <nav className="bg-slate-800 text-white p-4 flex justify-between items-center">
      <div>
        <h1 className="font-bold">MotorShop</h1>
      </div>
      {user && (
        <div className="flex items-center gap-4">
          <span>{user.name}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}

// ============================================
// CHECKLIST: Files to update
// ============================================
/*
☐ src/pages/LoginPage.tsx
  - Change: const { user, loading } → const { user, isLoading }
  - Change: if (loading) → if (isLoading)

☐ src/pages/Dashboard.tsx (if any)
  - Change: const { user, loading } → const { user, isLoading }
  - Change: if (loading) → if (isLoading)

☐ src/pages/ProtectedRoute.tsx
  - Change: const { loading } → const { isLoading }
  - Change: if (loading) → if (isLoading)

☐ src/components/SystemNavbar.tsx
  - Change: const { user, loading } → const { user, isLoading }
  - Change: if (loading) → if (isLoading)

☐ src/components/Navbar.tsx
  - Change: const { user, loading } → const { user, isLoading }
  - Change: if (loading) → if (isLoading)

☐ Any other component using useAuth()
  - Search for pattern: const.*loading.*useAuth
  - Replace all with: const { ..., isLoading } = useAuth()

HINT: Use Find & Replace (Ctrl+H)
  Find: loading } = useAuth
  Replace: isLoading } = useAuth
  Replace All in project
*/

export default DashboardExample
