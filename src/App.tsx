import './globals.css'
import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import SystemNavbar from './components/SystemNavbar'
import EnhancedChatbotWidget from './components/EnhancedChatbotWidget'
import DatabaseStatus from './components/DatabaseStatus'
import Dashboard from './pages/Dashboard'
import InventoryPage from './pages/InventoryPage'
import AppointmentCalendarPage from './pages/AppointmentCalendarPage'
import CustomerPortal from './pages/CustomerPortal'
import LoginPage from './pages/LoginPage'

// Landing page imports (original)
import Navbar from './components/Navbar'
import HeroSlideshow from './components/HeroSlideshow'
import ChatAssistantWidget from './components/ChatAssistantWidget'
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
        <DatabaseStatus />
        {currentPage === 'landing' ? (
          <>
            <Navbar onShowAppointments={() => setCurrentPage('dashboard')} />
            <HeroSlideshow />
            <ChatAssistantWidget />
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
      <DatabaseStatus />
      <SystemNavbar currentPage={currentPage} onNavigate={(page: string) => setCurrentPage(page as PageType)} />

      <main className="pt-20">
        {currentPage === 'dashboard' && <Dashboard onNavigate={(page: string) => setCurrentPage(page as PageType)} />}
        {currentPage === 'inventory' && <InventoryPage onNavigate={(page: string) => setCurrentPage(page as PageType)} />}
        {currentPage === 'appointments' && <AppointmentCalendarPage onNavigate={(page: string) => setCurrentPage(page as PageType)} />}
        {currentPage === 'customers' && <CustomerPortal onNavigate={(page: string) => setCurrentPage(page as PageType)} />}
        {currentPage === 'customer-portal' && <CustomerPortal onNavigate={(page: string) => setCurrentPage(page as PageType)} />}
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
