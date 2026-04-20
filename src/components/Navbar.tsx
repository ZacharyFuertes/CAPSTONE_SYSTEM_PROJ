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
  ShoppingCart,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { usePartsList } from "../contexts/PartsListContext";
import { supabase } from "../services/supabaseClient";

interface NavbarProps {
  onShowAppointments?: () => void;
  onBookAppointment?: () => void;
  onBrowseParts?: () => void;
  onJoinSignIn?: () => void;
  onSignUp?: () => void;
  onMechanics?: () => void;
  onViewAccount?: () => void;
  onSettings?: () => void;
  onServiceHistory?: () => void;
  onAIChat?: () => void;
  onShowReceipts?: () => void;
  onShowPartsList?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  onShowAppointments,
  onBookAppointment,
  onBrowseParts,
  onJoinSignIn,
  onSignUp,
  onMechanics,
  onViewAccount,
  onSettings,
  onServiceHistory,
  onAIChat,
  onShowReceipts,
  onShowPartsList,
}) => {
  const { user, logout } = useAuth();
  const { cartCount } = usePartsList();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [receiptCount, setReceiptCount] = useState(0);
  const profileRef = useRef<HTMLDivElement>(null);

  // Track scroll for navbar style change
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Fetch receipt count
  useEffect(() => {
    if (user?.id) {
      const fetchReceiptCount = async () => {
        try {
          const { data, error } = await supabase
            .from("orders")
            .select("id", { count: "exact", head: true })
            .eq("customer_id", user.id);

          if (!error && data !== null) {
            setReceiptCount(data.length || 0);
          }
        } catch (error) {
          console.error("Error fetching receipt count:", error);
        }
      };

      fetchReceiptCount();
    }
  }, [user?.id]);

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

  const scrollToSection = (id: string) => {
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        // Get the header height (approx 80px) to offset the scroll
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }, 100); // 100ms delay helps prevent mobile layout shifting issues
  };

  const navItems = [
    { label: "AI CHAT", onClick: onAIChat },
    { label: "BROWSE PARTS", onClick: onBrowseParts },
    { label: "BOOK APPOINTMENT", onClick: onBookAppointment },
    { label: "SERVICES", onClick: () => scrollToSection("services") },
    { label: "ABOUT US", onClick: () => scrollToSection("about") },
    { label: "MECHANICS", onClick: onMechanics },
    ...(user
      ? [{ label: "MY APPOINTMENTS", onClick: onShowAppointments }]
      : []),
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-[#222] ${
        scrolled ? "bg-[#0a0a0a] shadow-2xl" : "bg-[#0a0a0a]"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Red accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#d63a2f]" />

      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-[72px] lg:h-[100px] gap-2 lg:gap-6">
          <motion.div
            className="flex items-center gap-3 lg:gap-4 cursor-pointer select-none shrink-0 group"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {/* Logo Image */}
            <div className="relative w-14 h-14 lg:w-[68px] lg:h-[68px] xl:w-[78px] xl:h-[78px] rounded-full bg-white flex items-center justify-center border-2 border-[#333] group-hover:border-[#d63a2f] shadow-[0_0_20px_rgba(0,0,0,0.8)] overflow-hidden shrink-0 transition-all duration-300">
              <div className="absolute inset-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] rounded-full pointer-events-none z-10" />
              <img
                src="/logo.png"
                alt="JBMS MotoShop Logo"
                className="w-[90%] h-[90%] object-contain scale-110 relative z-0"
              />
            </div>
            {/* Brand Text */}
            <div className="flex flex-col leading-none">
              <span
                className="text-lg lg:text-xl xl:text-2xl font-display font-black tracking-wider uppercase"
                style={{
                  background: 'linear-gradient(180deg, #ffffff 0%, #c0c0c0 40%, #888888 70%, #666666 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: 'none',
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))',
                }}
              >
                JBMS MOTOSHOP
              </span>
            </div>
          </motion.div>

          {/* ── Center Nav Items (Desktop) ── */}
          <div className="hidden lg:flex flex-1 justify-center items-center gap-1 xl:gap-2 overflow-hidden">
            {navItems.map((item, idx) => (
              <motion.button
                key={idx}
                onClick={() => {
                  item.onClick?.();
                  setMobileOpen(false);
                }}
                className="relative px-2 xl:px-3 py-2 text-[10px] xl:text-xs font-bold tracking-widest uppercase text-white hover:text-white transition-all duration-300 border border-transparent hover:border-[#333] hover:bg-[#111] group whitespace-nowrap shrink-0"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d63a2f] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                {item.label}
              </motion.button>
            ))}
          </div>

          {/* ── Right Side ── */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {user && (
              <>
                <motion.button
                  onClick={onShowPartsList}
                  className="relative p-3 border border-[#333] hover:border-[#d63a2f] text-[#6b6b6b] hover:text-white transition-all group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title="My Parts List"
                >
                  <ShoppingBag size={18} strokeWidth={1.5} />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-[#4ade80] text-[#0a0a0a] text-[10px] font-bold flex items-center justify-center rounded-full">
                      {cartCount}
                    </span>
                  )}
                </motion.button>
                <motion.button
                  onClick={onShowReceipts}
                  className="relative p-3 border border-[#333] hover:border-[#d63a2f] text-[#6b6b6b] hover:text-white transition-all group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title="My Receipts"
                >
                  <ShoppingCart size={18} strokeWidth={1.5} />
                  {receiptCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-[#d63a2f] text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                      {receiptCount}
                    </span>
                  )}
                </motion.button>
              </>
            )}
            {user ? (
              <div ref={profileRef} className="relative">
                {/* Profile Trigger */}
                <motion.button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-3 pl-2 pr-4 py-2 hover:bg-[#111111] border border-transparent hover:border-[#333] transition-all group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative w-10 h-10 bg-[#111111] border border-[#333] flex items-center justify-center">
                    <span className="text-white text-lg font-display font-black leading-none group-hover:text-[#d63a2f] transition-colors">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[10px] font-bold text-[#6b6b6b] uppercase tracking-widest group-hover:text-white truncate max-w-[120px] transition-colors leading-none">
                      {user.name}
                    </span>
                    <span className="text-[8px] font-bold text-[#d63a2f] uppercase tracking-widest leading-none">
                      ONLINE
                    </span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-[#6b6b6b] transition-transform duration-300 ml-2 ${profileOpen ? "rotate-180" : ""}`}
                    strokeWidth={2}
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
                      className="absolute right-0 top-full mt-3 w-64 bg-[#0a0a0a] border border-[#222] shadow-2xl py-2"
                    >
                      {/* User info */}
                      <div className="px-5 py-4 border-b border-[#222]">
                        <p className="text-white font-display text-lg tracking-wide uppercase truncate leading-none mb-1">
                          {user.name}
                        </p>
                        <p className="text-[#6b6b6b] text-[10px] font-bold tracking-widest uppercase truncate">
                          {user.email}
                        </p>
                      </div>

                      <div className="py-2">
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            onViewAccount?.();
                          }}
                          className="w-full text-left px-5 py-3 text-[10px] font-bold tracking-widest uppercase text-[#555] hover:text-white hover:bg-[#111111] transition flex items-center gap-3"
                        >
                          <User size={14} className="text-[#d63a2f]" /> VIEW
                          ACCOUNT
                        </button>
                        {user && (
                          <button
                            onClick={() => {
                              setProfileOpen(false);
                              onShowAppointments?.();
                            }}
                            className="w-full text-left px-5 py-3 text-[10px] font-bold tracking-widest uppercase text-[#555] hover:text-white hover:bg-[#111111] transition flex items-center gap-3"
                          >
                            <CalendarDays
                              size={14}
                              className="text-[#d63a2f]"
                            />{" "}
                            MY APPOINTMENTS
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            onSettings?.();
                          }}
                          className="w-full text-left px-5 py-3 text-[10px] font-bold tracking-widest uppercase text-[#555] hover:text-white hover:bg-[#111111] transition flex items-center gap-3"
                        >
                          <Settings size={14} className="text-[#d63a2f]" />{" "}
                          SETTINGS
                        </button>
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            onServiceHistory?.();
                          }}
                          className="w-full text-left px-5 py-3 text-[10px] font-bold tracking-widest uppercase text-[#555] hover:text-white hover:bg-[#111111] transition flex items-center gap-3"
                        >
                          <History size={14} className="text-[#d63a2f]" />{" "}
                          SERVICE HISTORY
                        </button>
                      </div>

                      <div className="border-t border-[#222] py-2">
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            logout().catch(() => window.location.reload());
                          }}
                          className="w-full text-left px-5 py-3 text-[10px] font-bold tracking-widest uppercase text-[#d63a2f] hover:text-white hover:bg-[#111111] transition flex items-center gap-3"
                        >
                          <LogOut size={14} /> LOGOUT
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={onSignUp || onJoinSignIn}
                  className="relative px-6 py-3 bg-transparent text-[10px] font-bold tracking-[0.2em] uppercase text-[#6b6b6b] border border-[#333] hover:border-[#666] hover:text-white transition-all whitespace-nowrap"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  SIGN UP
                </motion.button>
                <motion.button
                  onClick={onJoinSignIn}
                  className="relative px-8 py-3 bg-[#d63a2f] hover:bg-[#c0322a] font-bold tracking-[0.2em] uppercase text-white text-[10px] group transition-all whitespace-nowrap"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10 block">SIGN IN</span>
                </motion.button>
              </div>
            )}
          </div>

          {/* ── Mobile Menu Button ── */}
          <motion.button
            className="md:hidden p-3 text-[#6b6b6b] hover:text-white border border-[#333] hover:bg-[#111111] transition"
            onClick={() => setMobileOpen(!mobileOpen)}
            whileTap={{ scale: 0.9 }}
          >
            {mobileOpen ? (
              <X size={20} strokeWidth={2} />
            ) : (
              <Menu size={20} strokeWidth={2} />
            )}
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
              className="md:hidden overflow-hidden border-t border-[#222] bg-[#0a0a0a]"
            >
              <div className="py-4 px-4 space-y-2">
                {navItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      item.onClick?.();
                      setMobileOpen(false);
                    }}
                    className="w-full text-left px-5 py-4 text-[11px] font-bold tracking-[0.2em] text-[#6b6b6b] hover:text-white hover:bg-[#111] border border-transparent hover:border-[#333] transition-all uppercase"
                  >
                    {item.label}
                  </button>
                ))}
                <div className="pt-4 pb-2 border-t border-[#222] mt-4 space-y-2">
                  {user ? (
                    <>
                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          onViewAccount?.();
                        }}
                        className="w-full text-left px-5 py-4 text-[11px] font-bold tracking-[0.2em] text-[#555] hover:text-white hover:bg-[#111] border border-transparent hover:border-[#333] transition-all uppercase flex items-center gap-3"
                      >
                        <User size={14} className="text-[#d63a2f]" /> VIEW
                        ACCOUNT
                      </button>
                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          onSettings?.();
                        }}
                        className="w-full text-left px-5 py-4 text-[11px] font-bold tracking-[0.2em] text-[#555] hover:text-white hover:bg-[#111] border border-transparent hover:border-[#333] transition-all uppercase flex items-center gap-3"
                      >
                        <Settings size={14} className="text-[#d63a2f]" />{" "}
                        SETTINGS
                      </button>
                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          onServiceHistory?.();
                        }}
                        className="w-full text-left px-5 py-4 text-[11px] font-bold tracking-[0.2em] text-[#555] hover:text-white hover:bg-[#111] border border-transparent hover:border-[#333] transition-all uppercase flex items-center gap-3"
                      >
                        <History size={14} className="text-[#d63a2f]" /> SERVICE
                        HISTORY
                      </button>
                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          logout().catch(() => window.location.reload());
                        }}
                        className="w-full text-left px-5 py-4 text-[11px] font-bold tracking-[0.2em] text-[#d63a2f] hover:text-white hover:bg-[#111] border border-transparent hover:border-[#333] transition-all uppercase flex items-center gap-3 mt-4"
                      >
                        <LogOut size={14} /> LOGOUT
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-3 pt-2">
                      <button
                        onClick={() => {
                          (onSignUp || onJoinSignIn)?.();
                          setMobileOpen(false);
                        }}
                        className="w-full px-5 py-4 border border-[#333] hover:border-[#666] text-[#6b6b6b] hover:text-white font-bold tracking-[0.2em] text-[11px] transition-all uppercase"
                      >
                        SIGN UP
                      </button>
                      <button
                        onClick={() => {
                          onJoinSignIn?.();
                          setMobileOpen(false);
                        }}
                        className="w-full px-5 py-4 bg-[#d63a2f] hover:bg-[#c0322a] text-white font-bold tracking-[0.2em] text-[11px] transition-all uppercase"
                      >
                        SIGN IN
                      </button>
                    </div>
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
