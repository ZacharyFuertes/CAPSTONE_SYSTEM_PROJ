import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  ChevronDown,
  CalendarDays,
  History,
} from "lucide-react";
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
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Track scroll for navbar style change
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navItems = [
    { label: "Browse Parts", onClick: onBrowseParts },
    { label: "Book Appointment", onClick: onBookAppointment },
    ...(user
      ? [{ label: "My Appointments", onClick: onShowAppointments }]
      : []),
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0f172a]/98 backdrop-blur-xl shadow-2xl shadow-black/30"
          : "bg-[#0f172a]/80 backdrop-blur-md"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Animated gradient border at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
        <motion.div
          className="h-full w-[200%]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #f97316 15%, #f59e0b 30%, #22c55e 50%, #f59e0b 70%, #f97316 85%, transparent 100%)",
          }}
          animate={{ x: ["-50%", "0%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-[72px]">
          {/* ── Logo ── */}
          <motion.div
            className="flex items-center gap-3 cursor-pointer select-none"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <img
              src="/logo.png"
              alt="MotoShop Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="text-xl font-black tracking-tight text-white">
              MOTOSHOP
            </span>
          </motion.div>

          {/* ── Center Nav Items (Desktop) ── */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item, idx) => (
              <motion.button
                key={idx}
                onClick={() => {
                  item.onClick?.();
                  setMobileOpen(false);
                }}
                className="relative px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-white transition-all duration-300 rounded-xl hover:bg-white/[0.06] group"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                {/* Hover underline glow */}
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 group-hover:w-6 h-[2px] bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-300" />
                {item.label}
              </motion.button>
            ))}
          </div>

          {/* ── Right Side ── */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div ref={profileRef} className="relative">
                {/* Profile Trigger */}
                <motion.button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-3 pl-2 pr-4 py-2 rounded-xl hover:bg-white/[0.06] transition-all group border border-transparent hover:border-slate-700/50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-blue-500/20"
                    animate={{
                      boxShadow: [
                        "0 4px 14px rgba(59,130,246,0.2)",
                        "0 4px 20px rgba(59,130,246,0.35)",
                        "0 4px 14px rgba(59,130,246,0.2)",
                      ],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </motion.div>
                  <span className="text-sm font-semibold text-slate-300 group-hover:text-white truncate max-w-[120px] transition-colors">
                    {user.name}
                  </span>
                  <ChevronDown
                    size={15}
                    className={`text-slate-500 transition-transform duration-300 ${profileOpen ? "rotate-180" : ""}`}
                  />
                </motion.button>

                {/* Dropdown */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-3 w-56 bg-[#1e293b]/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden py-1.5"
                    >
                      {/* User info */}
                      <div className="px-4 py-3.5 border-b border-slate-700/30">
                        <p className="text-white font-bold text-sm truncate">
                          {user.name}
                        </p>
                        <p className="text-slate-500 text-xs truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>

                      <div className="py-1.5">
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            onViewAccount?.();
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] transition flex items-center gap-3"
                        >
                          <User size={16} className="text-slate-500" /> View
                          Account
                        </button>
                        {user && (
                          <button
                            onClick={() => {
                              setProfileOpen(false);
                              onShowAppointments?.();
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] transition flex items-center gap-3"
                          >
                            <CalendarDays
                              size={16}
                              className="text-slate-500"
                            />{" "}
                            My Appointments
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            onSettings?.();
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] transition flex items-center gap-3"
                        >
                          <Settings size={16} className="text-slate-500" />{" "}
                          Settings
                        </button>
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            onServiceHistory?.();
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] transition flex items-center gap-3"
                        >
                          <History size={16} className="text-slate-500" />{" "}
                          Service History
                        </button>
                      </div>

                      <div className="border-t border-slate-700/30 py-1.5">
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            logout().catch(() => window.location.reload());
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition flex items-center gap-3"
                        >
                          <LogOut size={16} /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                onClick={onJoinSignIn}
                className="relative px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl font-bold text-white text-sm overflow-hidden group"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                {/* Animated shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  animate={{ x: ["-200%", "200%"] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "easeInOut",
                  }}
                />
                <span className="relative z-10">Sign In</span>
              </motion.button>
            )}
          </div>

          {/* ── Mobile Menu Button ── */}
          <motion.button
            className="md:hidden p-2.5 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition"
            onClick={() => setMobileOpen(!mobileOpen)}
            whileTap={{ scale: 0.9 }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>

        {/* ── Mobile Navigation ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden border-t border-slate-700/30"
            >
              <div className="py-3 space-y-1">
                {navItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      item.onClick?.();
                      setMobileOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition"
                  >
                    {item.label}
                  </button>
                ))}
                <div className="pt-2 border-t border-slate-700/30 mt-2">
                  {user ? (
                    <>
                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          onViewAccount?.();
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition"
                      >
                        View Account
                      </button>
                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          onSettings?.();
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition"
                      >
                        Settings
                      </button>
                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          onServiceHistory?.();
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition"
                      >
                        Service History
                      </button>
                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          logout().catch(() => window.location.reload());
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        onJoinSignIn?.();
                        setMobileOpen(false);
                      }}
                      className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl font-bold text-white text-sm"
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
