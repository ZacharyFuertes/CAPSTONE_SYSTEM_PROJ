import React, { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Menu, X, User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface NavbarProps {
  onShowAppointments?: () => void;
  onBrowseParts?: () => void;
  onBookAppointment?: () => void;
  onJoinSignIn?: () => void;
  onViewAccount?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  onShowAppointments,
  onBrowseParts,
  onBookAppointment,
  onJoinSignIn,
  onViewAccount,
}) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const navItems = [
    { label: "Browse Parts", href: "#parts", onClick: onBrowseParts },
    {
      label: "Book Appointment",
      href: "#appointments",
      onClick: onBookAppointment,
    },
    {
      label: "My Appointments",
      href: "#my-appointments",
      onClick: onShowAppointments,
    },
  ];

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-moto-dark/95 backdrop-blur-lg border-b border-moto-gray-light/20"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2 group cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <Zap
                className="w-8 h-8 text-moto-accent-orange"
                fill="currentColor"
              />
              <div className="absolute inset-0 bg-moto-accent-orange blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />
            </div>
            <span className="font-display text-2xl font-black tracking-tight">
              MOTOSHOP
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item, idx) => (
              <motion.button
                key={idx}
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
                className="text-gray-300 hover:text-moto-accent-orange font-medium text-sm uppercase tracking-wide relative group"
                whileHover={{ y: -2 }}
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-accent group-hover:w-full transition-all duration-300" />
              </motion.button>
            ))}
          </div>

          {/* Sign In / Join or Profile Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 rounded-lg font-bold text-white text-sm hover:bg-slate-700 transition"
              >
                <div className="w-7 h-7 rounded-full bg-moto-accent-neon/20 text-moto-accent-neon flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="truncate max-w-[120px]">{user.name}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      if (onViewAccount) onViewAccount();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 transition"
                  >
                    <User className="inline w-4 h-4 mr-2" /> View Account
                  </button>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      logout().catch(() => window.location.reload());
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 transition"
                  >
                    <LogOut className="inline w-4 h-4 mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <motion.button
              onClick={onJoinSignIn}
              className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-gradient-accent rounded-lg font-bold text-white uppercase tracking-wide text-sm hover:shadow-lg hover:shadow-moto-accent/50"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Join / Sign In
            </motion.button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-moto-accent-orange hover:bg-moto-gray rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={isOpen ? { height: "auto" } : { height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden border-t border-moto-gray-light/20"
        >
          <div className="px-4 py-4 space-y-3">
            {navItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
                className="w-full text-left text-gray-300 hover:text-moto-accent-orange font-medium text-sm uppercase tracking-wide py-2 px-3 rounded-lg hover:bg-moto-gray transition-colors"
              >
                {item.label}
              </button>
            ))}
            {user ? (
              <>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    if (onViewAccount) onViewAccount();
                  }}
                  className="w-full px-6 py-2.5 bg-blue-600 rounded-lg font-bold text-white uppercase tracking-wide text-sm"
                >
                  View Account
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    logout().catch(() => window.location.reload());
                  }}
                  className="w-full mt-2 px-6 py-2.5 bg-red-600 rounded-lg font-bold text-white uppercase tracking-wide text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onJoinSignIn?.();
                  setIsOpen(false);
                }}
                className="w-full mt-4 px-6 py-2.5 bg-gradient-accent rounded-lg font-bold text-white uppercase tracking-wide text-sm"
              >
                Join / Sign In
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
