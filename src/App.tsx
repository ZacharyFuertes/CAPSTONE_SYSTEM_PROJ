import './globals.css'
import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import SystemNavbar from './components/SystemNavbar'
import EnhancedChatbotWidget from './components/EnhancedChatbotWidget'
import Dashboard from './pages/Dashboard'
import InventoryPage from './pages/InventoryPage'
import AppointmentCalendarPage from './pages/AppointmentCalendarPage'
import CustomerPortal from './pages/CustomerPortal'
import LoginPage from './pages/LoginPage'

// Landing page imports (original)
import HeroSlideshow from './components/HeroSlideshow'
import FeaturedSection from './components/FeaturedSection'
import TrustSection from './components/TrustSection'
import Footer from './components/Footer'

type PageType = 'landing' | 'dashboard' | 'inventory' | 'appointments' | 'customers' | 'customer-portal'

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth()
  const [currentPage, setCurrentPage] = useState<PageType>('landing')

  // If not authenticated, show landing page or login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-moto-dark overflow-x-hidden">
        {currentPage === 'landing' ? (
          <>
            <div className="flex justify-center items-center py-4">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
              >
                Login to Dashboard
              </button>
            </div>
            <HeroSlideshow />
            <FeaturedSection />
            <TrustSection />
            <Footer />
          </>
        ) : (
          <LoginPage onLoginSuccess={() => setCurrentPage('dashboard')} />
        )}
      </div>
    )
  }

  // Render dashboard system
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <SystemNavbar currentPage={currentPage} onNavigate={(page: string) => setCurrentPage(page as PageType)} />

      <main className="pt-20">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'inventory' && <InventoryPage />}
        {currentPage === 'appointments' && <AppointmentCalendarPage />}
        {currentPage === 'customers' && <CustomerPortal />}
      </main>

      {/* Contextual AI Support */}
      <EnhancedChatbotWidget
        userRole={user?.role === 'mechanic' ? 'mechanic' : 'customer'}
      />
    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
