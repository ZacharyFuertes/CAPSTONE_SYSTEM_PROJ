import "./globals.css";
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import SystemNavbar from "./components/SystemNavbar";
import EnhancedChatbotWidget from "./components/EnhancedChatbotWidget";
import DatabaseStatus from "./components/DatabaseStatus";
import AccessDenied from "./components/AccessDenied";
import Dashboard from "./pages/Dashboard";
import InventoryPage from "./pages/InventoryPage";
import AppointmentCalendarPage from "./pages/AppointmentCalendarPage";
import CustomerPortal from "./pages/CustomerPortal";
import MechanicPortal from "./pages/MechanicPortal";
import BrowsePartsPage from "./pages/BrowsePartsPage";
import AdminMechanicAvailability from "./pages/AdminMechanicAvailability";
import LoginPage from "./pages/LoginPage";
import MechanicLoginPage from "./pages/MechanicLoginPage";
import OwnerLoginPage from "./pages/OwnerLoginPage";
import LoginChoicePage from "./pages/LoginChoicePage";
import AdminProductsPage from "./pages/AdminProductsPage";

// Landing page imports (original)
import Navbar from "./components/Navbar";
import HeroSlideshow from "./components/HeroSlideshow";
import ChatAssistantWidget from "./components/ChatAssistantWidget";
import FeaturedSection from "./components/FeaturedSection";
import TrustSection from "./components/TrustSection";
import Footer from "./components/Footer";

type PageType =
  | "landing"
  | "dashboard"
  | "inventory"
  | "appointments"
  | "customers"
  | "customer-portal"
  | "browse-parts"
  | "products"
  | "mechanic-portal"
  | "mechanic-availability";
type LoginType = "landing" | "choice" | "customer" | "mechanic" | "owner";

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    // Restore the last visited page from localStorage
    const savedPage = localStorage.getItem("lastVisitedPage") as PageType;
    return isAuthenticated && savedPage ? savedPage : "landing";
  });
  const [currentLoginType, setCurrentLoginType] =
    useState<LoginType>("landing");

  // Save current page to localStorage whenever it changes
  const handlePageChange = (page: PageType | string) => {
    const newPage = page as PageType;
    setCurrentPage(newPage);
    if (isAuthenticated) {
      localStorage.setItem("lastVisitedPage", newPage);
    }
  };

  // Reset page to landing when user logs out - use useEffect to avoid render conflicts
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentPage("landing");
      setCurrentLoginType("landing");
      // Clear session cache on logout
      localStorage.removeItem("lastVisitedPage");
    }
  }, [isAuthenticated]);

  // Handle going back to landing page (resets to default state)
  const handleBackToLanding = () => {
    setCurrentPage("landing");
    // Clear session cache on logout
    localStorage.removeItem("lastVisitedPage");
  };

  // If not authenticated, show landing page or login
  if (!isAuthenticated) {
    const handleLoginSuccess = () => {
      // All roles can access appointments, so redirect there
      // Customers will stay there (it's in their allowed pages)
      // Mechanics/owners can navigate to other pages from the navbar
      handlePageChange("appointments");
    };

    const handleOpenLogin = () => {
      setCurrentLoginType("choice");
    };

    return (
      <div className="min-h-screen bg-moto-dark overflow-x-hidden">
        <DatabaseStatus />
        {currentLoginType === "landing" ? (
          <>
            <Navbar
              onBrowseParts={handleOpenLogin}
              onBookAppointment={handleOpenLogin}
              onJoinSignIn={handleOpenLogin}
            />
            <HeroSlideshow
              onBookNow={handleOpenLogin}
              onShopNow={handleOpenLogin}
            />
            <ChatAssistantWidget />
            <FeaturedSection />
            <TrustSection />
            <Footer />
          </>
        ) : currentLoginType === "choice" ? (
          <LoginChoicePage
            onChooseCustomer={() => setCurrentLoginType("customer")}
            onChooseMechanic={() => setCurrentLoginType("mechanic")}
            onChooseOwner={() => setCurrentLoginType("owner")}
            onBack={() => setCurrentLoginType("landing")}
          />
        ) : currentLoginType === "customer" ? (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onBack={() => setCurrentLoginType("choice")}
            onHome={() => setCurrentLoginType("landing")}
          />
        ) : currentLoginType === "mechanic" ? (
          <MechanicLoginPage
            onLoginSuccess={handleLoginSuccess}
            onBack={() => setCurrentLoginType("choice")}
            onHome={() => setCurrentLoginType("landing")}
          />
        ) : (
          <OwnerLoginPage
            onLoginSuccess={handleLoginSuccess}
            onBack={() => setCurrentLoginType("choice")}
            onHome={() => setCurrentLoginType("landing")}
          />
        )}
      </div>
    );
  }

  // Render dashboard system or landing page if user navigates back
  if (currentPage === "landing") {
    return (
      <div className="min-h-screen bg-moto-dark overflow-x-hidden">
        <DatabaseStatus />
        <Navbar
          onBrowseParts={() => handlePageChange("products")}
          onBookAppointment={() => handlePageChange("appointments")}
          onJoinSignIn={() => handleBackToLanding()}
        />
        <HeroSlideshow
          onBookNow={() => handlePageChange("appointments")}
          onShopNow={() => handlePageChange("products")}
        />
        <ChatAssistantWidget />
        <FeaturedSection />
        <TrustSection />
        <Footer />
      </div>
    );
  }

  // Role-based access control: Define allowed pages by role
  // Owner: Full access to all pages
  // Mechanic: Dashboard, Appointments (own), Inventory (view-only)
  // Customer: Appointments (own), Customer Portal only
  const getDefaultPage = (role?: string): PageType => {
    if (role === "customer") return "appointments";
    if (role === "mechanic") return "dashboard";
    if (role === "owner") return "dashboard";
    return "landing";
  };

  const getAllowedPages = (role?: string): PageType[] => {
    switch (role) {
      case "customer":
        // Customers: Only view own appointments, portal, and browse parts
        return ["appointments", "customer-portal", "browse-parts"];
      case "mechanic":
        // Mechanics: Dashboard, own appointments, view inventory, mechanic portal
        return ["dashboard", "appointments", "inventory", "mechanic-portal"];
      case "owner":
        // Owners: Full access to everything
        return [
          "dashboard",
          "inventory",
          "appointments",
          "customers",
          "products",
          "mechanic-availability",
        ];
      default:
        return ["landing"];
    }
  };

  const allowedPages = getAllowedPages(user?.role);
  const defaultPage = getDefaultPage(user?.role);

  // If user tries to access unauthorized page, show AccessDenied
  if (user && !allowedPages.includes(currentPage)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <DatabaseStatus />
        <SystemNavbar
          currentPage={defaultPage}
          onNavigate={(page: string) => handlePageChange(page as PageType)}
        />
        <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
          <AccessDenied
            requestedPage={currentPage}
            onNavigate={(page: string) => handlePageChange(page as PageType)}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <DatabaseStatus />
      <SystemNavbar
        currentPage={currentPage}
        onNavigate={(page: string) => handlePageChange(page as PageType)}
      />

      <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
        {currentPage === "dashboard" && (
          <Dashboard
            onNavigate={(page: string) => handlePageChange(page as PageType)}
          />
        )}
        {currentPage === "inventory" && (
          <InventoryPage
            onNavigate={(page: string) => handlePageChange(page as PageType)}
          />
        )}
        {currentPage === "appointments" && (
          <AppointmentCalendarPage
            onNavigate={(page: string) => handlePageChange(page as PageType)}
          />
        )}
        {currentPage === "customers" && (
          <CustomerPortal
            onNavigate={(page: string) => handlePageChange(page as PageType)}
          />
        )}
        {currentPage === "customer-portal" && (
          <CustomerPortal
            onNavigate={(page: string) => handlePageChange(page as PageType)}
          />
        )}
        {currentPage === "mechanic-portal" && (
          <MechanicPortal
            onNavigate={(page: string) => handlePageChange(page as PageType)}
          />
        )}
        {currentPage === "mechanic-availability" && (
          <AdminMechanicAvailability
            onNavigate={(page: string) => handlePageChange(page as PageType)}
          />
        )}
        {currentPage === "products" && (
          <AdminProductsPage
            onNavigate={(page: string) => handlePageChange(page as PageType)}
          />
        )}
        {currentPage === "browse-parts" && (
          <BrowsePartsPage
            onNavigate={(page: string) => handlePageChange(page as PageType)}
          />
        )}
      </main>

      {/* Contextual AI Support */}
      <EnhancedChatbotWidget
        userRole={user?.role === "mechanic" ? "mechanic" : "customer"}
      />
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
