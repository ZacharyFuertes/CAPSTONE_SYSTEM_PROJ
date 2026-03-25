import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Globe,
  LogOut,
  BarChart3,
  Package,
  Calendar,
  Users,
  Lock,
  Wrench,
  Clock,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { AppPage, getPagesByRole } from "../utils/roleAccess";

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredRole?: string[];
  tooltip?: string;
}

const SystemNavbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [disabledTooltip, setDisabledTooltip] = useState<string | null>(null);

  // Define all available menu items with role requirements
  const allMenuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: t("nav.dashboard"),
      icon: BarChart3,
      requiredRole: ["owner", "mechanic"],
      tooltip: "Owners and Mechanics only",
    },
    {
      id: "mechanic-dashboard",
      label: "Dashboard",
      icon: BarChart3,
      requiredRole: ["mechanic"],
      tooltip: "View your performance and customer metrics",
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: Package,
      requiredRole: ["owner", "mechanic"],
      tooltip: "Owners and Mechanics only (read-only for Mechanics)",
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: Calendar,
      requiredRole: ["owner", "mechanic", "customer"],
    },
    {
      id: "mechanic-portal",
      label: "My Appointments",
      icon: Wrench,
      requiredRole: ["mechanic"],
      tooltip: "View your assigned appointments",
    },
    {
      id: "customer-portal",
      label: "My Portal",
      icon: Users,
      requiredRole: ["customer"],
      tooltip: "View your service history and profile",
    },
    {
      id: "customers",
      label: "Customers",
      icon: Users,
      requiredRole: ["owner"],
      tooltip: "Owner only",
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
      requiredRole: ["owner"],
      tooltip: "Owner only",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Lock,
      requiredRole: ["owner"],
      tooltip: "Owner only",
    },
    {
      id: "mechanic-availability",
      label: "Manage Mechanics",
      icon: Clock,
      requiredRole: ["owner"],
      tooltip: "Set mechanic availability",
    },
    {
      id: "browse-parts",
      label: "Browse Parts",
      icon: Package,
      requiredRole: ["customer"],
      tooltip: "Browse available parts to reserve",
    },
  ];

  // Filter menu items based on role-based access control mapping
  const getMenuItems = (): MenuItem[] => {
    if (!user) return [];

    const allowedPages = getPagesByRole(user.role);
    return allMenuItems.filter((item) => {
      if (!item.requiredRole) return true;
      // Allow menu items only if they are part of role's allowed pages
      return allowedPages.includes(item.id as AppPage);
    });
  };

  // Get custom label for customer portal
  const getMenuItemLabel = (item: MenuItem): string => {
    if (user?.role === "customer" && item.id === "appointments") {
      return "My Appointments";
    }
    if (user?.role === "customer" && item.id === "browse-parts") {
      return "Browse Parts";
    }
    return item.label;
  };

  const menuItems = getMenuItems();

  const handleMenuItemClick = (itemId: string) => {
    const item = allMenuItems.find((m) => m.id === itemId);
    const allowedPages = getPagesByRole(user?.role);

    if (!allowedPages.includes(itemId as AppPage)) {
      setDisabledTooltip(item?.tooltip || "Access denied");
      setTimeout(() => setDisabledTooltip(null), 3000);
    } else {
      onNavigate(itemId);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
            onClick={() =>
              onNavigate(
                user?.role === "customer" ? "appointments" : "dashboard",
              )
            }
          >
            <img src="/logo.png" alt="MotoShop Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-white">MotoShop</h1>
              <p className="text-xs text-slate-400">
                {user?.role === "customer"
                  ? "Customer Portal"
                  : user?.role === "mechanic"
                    ? "Mechanic Dashboard"
                    : "Management System"}
              </p>
            </div>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMenuItemClick(item.id)}
                  title={item.tooltip}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                      : "text-slate-300 hover:text-white hover:bg-slate-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {getMenuItemLabel(item)}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Disabled Tooltip */}
            <AnimatePresence>
              {disabledTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-24 right-4 bg-red-600/90 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 whitespace-nowrap"
                >
                  <Lock className="w-4 h-4" />
                  {disabledTooltip}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Language Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLanguage(language === "en" ? "tl" : "en")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition"
              title={
                language === "en" ? "Switch to Tagalog" : "Switch to English"
              }
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">
                {language.toUpperCase()}
              </span>
            </motion.button>

            {/* User Info */}
            {user && (
              <div className="hidden sm:flex items-center gap-3 px-3 py-2 bg-slate-700/50 rounded-lg border border-slate-600">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <p className="text-white font-semibold">{user.name}</p>
                  <p className="text-slate-400 text-xs capitalize bg-slate-800 px-2 py-1 rounded mt-1">
                    {user.role === "owner"
                      ? "Owner"
                      : user.role === "mechanic"
                        ? "Mechanic"
                        : "Customer"}
                  </p>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                console.log("🔴 Logout button clicked");
                logout().catch((error) => {
                  console.error("🔴 Logout failed:", error);
                  // Even if logout fails, force redirect to landing
                  window.location.href = "/";
                });
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 transition border border-red-600/30"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">
                Logout
              </span>
            </motion.button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-700 transition text-white"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-700 py-4 space-y-2"
            >
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      handleMenuItemClick(item.id);
                      setIsMenuOpen(false);
                    }}
                    title={item.tooltip}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                        : "text-slate-300 hover:text-white hover:bg-slate-700"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {getMenuItemLabel(item)}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default SystemNavbar;
