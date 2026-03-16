import React, { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Menu, X } from "lucide-react";

interface NavbarProps {
  onShowAppointments?: () => void;
  onBrowseParts?: () => void;
  onBookAppointment?: () => void;
  onJoinSignIn?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  onShowAppointments,
  onBrowseParts,
  onBookAppointment,
  onJoinSignIn,
}) => {
  const [isOpen, setIsOpen] = useState(false);

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

          {/* Sign In / Join Button */}
          <motion.button
            onClick={onJoinSignIn}
            className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-gradient-accent rounded-lg font-bold text-white uppercase tracking-wide text-sm hover:shadow-lg hover:shadow-moto-accent/50"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Join / Sign In
          </motion.button>

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
            <button
              onClick={() => {
                onJoinSignIn?.();
                setIsOpen(false);
              }}
              className="w-full mt-4 px-6 py-2.5 bg-gradient-accent rounded-lg font-bold text-white uppercase tracking-wide text-sm"
            >
              Join / Sign In
            </button>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
