import "./globals.css";
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import {
  AppPage,
  getDefaultPageByRole,
  getPagesByRole,
  isPageAllowedForRole,
} from "./utils/roleAccess";
import SystemNavbar from "./components/SystemNavbar";
import EnhancedChatbotWidget from "./components/EnhancedChatbotWidget";
import DatabaseStatus from "./components/DatabaseStatus";
import AccessDenied from "./components/AccessDenied";
import Dashboard from "./pages/Dashboard";
import InventoryPage from "./pages/InventoryPage";
import AppointmentCalendarPage from "./pages/AppointmentCalendarPage";
import CustomerPortal from "./pages/CustomerPortal";
import CustomersListPage from "./pages/CustomersListPage";
import MechanicPortal from "./pages/MechanicPortal";
import BrowsePartsPage from "./pages/BrowsePartsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
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

type PageType = AppPage;

type LoginType = "landing" | "choice" | "customer" | "mechanic" | "owner";

const AppContent: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<AppPage>(() => {
    // Restore the last visited page from localStorage
    const savedPage = localStorage.getItem("lastVisitedPage") as AppPage;
    return isAuthenticated && savedPage ? savedPage : "landing";
  });
  const [currentLoginType, setCurrentLoginType] =
    useState<LoginType>("landing");

  // Save current page to localStorage whenever it changes
  const handlePageChange = (page: AppPage | string) => {
    const newPage = page as AppPage;

    if (!isAuthenticated) {
      setCurrentPage("landing");
      return;
    }

    if (!user?.role) {
      // role is still resolving (network/role fetch in progress)
      setCurrentPage("dashboard");
      return;
    }

    if (!isPageAllowedForRole(newPage, user.role)) {
      const fallbackPage = getDefaultPageByRole(user.role);
      setCurrentPage(fallbackPage);
      localStorage.setItem("lastVisitedPage", fallbackPage);
      return;
    }

    setCurrentPage(newPage);
    localStorage.setItem("lastVisitedPage", newPage);
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

  // Ensure the current page is valid for the current role whenever auth / role / page changes
  useEffect(() => {
    if (!isAuthenticated) return;

    const allowedPages = getPagesByRole(user?.role);
    const defaultPage = getDefaultPageByRole(user?.role);

    if (!allowedPages.includes(currentPage)) {
      setCurrentPage(defaultPage);
      localStorage.setItem("lastVisitedPage", defaultPage);
    }
  }, [isAuthenticated, user?.role, currentPage]);

  // Handle going back to landing page (resets to default state)
  const handleBackToLanding = () => {
    setCurrentPage("landing");
    // Clear session cache on logout
    localStorage.removeItem("lastVisitedPage");
  };

  // If auth loading, show a spinner placeholder
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">
            Checking authentication and role permissions...
          </p>
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    );
  }

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

  // While user object is authenticated but role is not yet resolved, show loader
  if (isAuthenticated && !user?.role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">
            Loading role permissions...
          </p>
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
        </div>
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

  const allowedPages = getPagesByRole(user?.role);
  const defaultPage = getDefaultPageByRole(user?.role);

  // If user tries to access unauthorized page, show AccessDenied
  if (user && !allowedPages.includes(currentPage)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <SystemNavbar
          currentPage={defaultPage}
          onNavigate={(page: string) => handlePageChange(page as AppPage)}
        />
        <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
          <AccessDenied
            requestedPage={currentPage}
            onNavigate={(page: string) => handlePageChange(page as AppPage)}
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
          <CustomersListPage
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
        {currentPage === "reports" && (
          <ReportsPage
            onNavigate={(page: string) => handlePageChange(page as PageType)}
          />
        )}
        {currentPage === "settings" && (
          <SettingsPage
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
