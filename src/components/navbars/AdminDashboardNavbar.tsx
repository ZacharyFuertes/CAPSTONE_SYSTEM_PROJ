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
  Settings,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";

interface AdminDashboardNavbarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const AdminDashboardNavbar: React.FC<AdminDashboardNavbarProps> = ({
  currentPage = "dashboard",
  onNavigate = () => {},
}) => {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Menu items for admin/owner
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      tooltip: "View main dashboard",
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: Package,
      tooltip: "Manage inventory",
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: Calendar,
      tooltip: "Manage appointments",
    },
    {
      id: "customers",
      label: "Customers",
      icon: Users,
      tooltip: "Manage customers",
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
      tooltip: "View reports",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      tooltip: "System settings",
    },
  ];

  const handleMenuItemClick = (itemId: string) => {
    onNavigate(itemId);
    setIsMenuOpen(false);
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
            onClick={() => onNavigate("dashboard")}
          >
            <img
              src="/logo.png"
              alt="JSBM MotoShop Logo"
              className="w-10 h-10 object-contain rounded-full"
            />
            <div>
              <h1 className="text-xl font-bold text-white">JSBM MotoShop</h1>
              <p className="text-xs text-slate-400">Management System</p>
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
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
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
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <p className="text-white font-semibold">{user.name}</p>
                  <p className="text-slate-400 text-xs capitalize bg-slate-800 px-2 py-1 rounded mt-1">
                    {user.role === "owner" ? "Owner" : "Admin"}
                  </p>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                logout().catch((error) => {
                  console.error("Logout failed:", error);
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
              className="md:hidden border-t border-slate-700 bg-slate-800/50 backdrop-blur"
            >
              <div className="px-4 py-4 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleMenuItemClick(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-slate-300 hover:text-white hover:bg-slate-700"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default AdminDashboardNavbar;
