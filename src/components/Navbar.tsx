import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Menu, X, User, LogOut, Settings, ChevronDown, CalendarDays, History } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface NavbarProps {
  onShowAppointments?: () => void;
  onBookAppointment?: () => void;
  onBrowseParts?: () => void;
  onJoinSignIn?: () => void;
  onViewAccount?: () => void;
  onSettings?: () => void;
  onServiceHistory?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  onShowAppointments,
  onBookAppointment,
  onBrowseParts,
  onJoinSignIn,
  onViewAccount,
  onSettings,
  onServiceHistory,
}) => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navItems = [
    { label: "Browse Parts", onClick: onBrowseParts },
    { label: "Book Appointment", onClick: onBookAppointment },
    ...(user ? [{ label: "My Appointments", onClick: onShowAppointments }] : []),
  ];

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/95 backdrop-blur-xl border-b border-slate-800/60"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <motion.div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md shadow-orange-500/20">
              <Zap size={16} className="text-white" fill="currentColor" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">
              MOTOSHOP
            </span>
          </motion.div>

          {/* ── Center Nav Items (Desktop) ── */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  item.onClick?.();
                  setMobileOpen(false);
                }}
                className="relative px-4 py-2 text-[13px] font-semibold text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* ── Right Side ── */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div ref={profileRef} className="relative">
                {/* Profile Trigger */}
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl hover:bg-slate-800/50 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-md">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-slate-300 group-hover:text-white truncate max-w-[110px] transition-colors">
                    {user.name}
                  </span>
                  <ChevronDown size={14} className={`text-slate-500 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-[#1e293b] border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden py-1.5"
                    >
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-slate-700/30">
                        <p className="text-white font-bold text-sm truncate">{user.name}</p>
                        <p className="text-slate-500 text-xs truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => { setProfileOpen(false); onViewAccount?.(); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/40 transition flex items-center gap-3"
                        >
                          <User size={15} className="text-slate-500" /> View Account
                        </button>
                        {user && (
                          <button
                            onClick={() => { setProfileOpen(false); onShowAppointments?.(); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/40 transition flex items-center gap-3"
                          >
                            <CalendarDays size={15} className="text-slate-500" /> My Appointments
                          </button>
                        )}
                        <button
                          onClick={() => { setProfileOpen(false); onSettings?.(); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/40 transition flex items-center gap-3"
                        >
                          <Settings size={15} className="text-slate-500" /> Settings
                        </button>
                        <button
                          onClick={() => { setProfileOpen(false); onServiceHistory?.(); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/40 transition flex items-center gap-3"
                        >
                          <History size={15} className="text-slate-500" /> Service History
                        </button>
                      </div>

                      <div className="border-t border-slate-700/30 py-1">
                        <button
                          onClick={() => { setProfileOpen(false); logout().catch(() => window.location.reload()); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition flex items-center gap-3"
                        >
                          <LogOut size={15} /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                onClick={onJoinSignIn}
                className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl font-bold text-white text-sm hover:shadow-lg hover:shadow-orange-500/25 transition-shadow"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Sign In
              </motion.button>
            )}
          </div>

          {/* ── Mobile Menu Button ── */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* ── Mobile Navigation ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden border-t border-slate-800/60"
            >
              <div className="py-3 space-y-1">
                {navItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => { item.onClick?.(); setMobileOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition"
                  >
                    {item.label}
                  </button>
                ))}
                <div className="pt-2 border-t border-slate-800/60 mt-2">
                  {user ? (
                    <>
                      <button
                        onClick={() => { setMobileOpen(false); onViewAccount?.(); }}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition"
                      >
                        View Account
                      </button>
                      <button
                        onClick={() => { setMobileOpen(false); onSettings?.(); }}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition"
                      >
                        Settings
                      </button>
                      <button
                        onClick={() => { setMobileOpen(false); onServiceHistory?.(); }}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition"
                      >
                        Service History
                      </button>
                      <button
                        onClick={() => { setMobileOpen(false); logout().catch(() => window.location.reload()); }}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => { onJoinSignIn?.(); setMobileOpen(false); }}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg font-bold text-white text-sm"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
