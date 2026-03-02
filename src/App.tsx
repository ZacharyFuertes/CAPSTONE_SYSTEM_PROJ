import './globals.css'
import { useState } from 'react'
import Navbar from './components/Navbar'
import HeroSlideshow from './components/HeroSlideshow'
import ChatAssistantWidget from './components/ChatAssistantWidget'
import FeaturedSection from './components/FeaturedSection'
import TrustSection from './components/TrustSection'
import Footer from './components/Footer'
import AppointmentsPage from './components/AppointmentsPage'

function App() {
  const [showAppointments, setShowAppointments] = useState(false)

  return (
    <div className="min-h-screen bg-moto-dark overflow-x-hidden">
      {showAppointments ? (
        <AppointmentsPage onBack={() => setShowAppointments(false)} />
      ) : (
        <>
          <Navbar onShowAppointments={() => setShowAppointments(true)} />
          <HeroSlideshow />
          <ChatAssistantWidget />
          <FeaturedSection />
          <TrustSection />
          <Footer />
        </>
      )}
    </div>
  )
}

export default App
