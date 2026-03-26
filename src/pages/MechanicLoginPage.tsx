import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader, ArrowLeft, Home, Info } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../services/supabaseClient";
import mechanicIcon from "../icons/mechanic.png";

interface MechanicLoginPageProps {
  onLoginSuccess: () => void;
  onBack: () => void;
  onHome?: () => void;
}

const MechanicLoginPage: React.FC<MechanicLoginPageProps> = ({
  onLoginSuccess,
  onBack,
  onHome,
}) => {
  const { login, user, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setLoginAttempted(false);

    try {
      await login(formData.email, formData.password);
      setLoginAttempted(true);
    } catch (err) {
      let errorMessage = "Authentication failed. Please try again.";
      if (err instanceof Error) {
        const message = err.message.toLowerCase();
        if (message.includes("invalid login credentials")) {
          errorMessage = "❌ Invalid email or password. Please check and try again.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      console.error("Auth error:", err);
      setLoading(false);
    }
  };

  // Poll for user role after login completes
  useEffect(() => {
    if (!loginAttempted || isLoading || !user) {
      return;
    }

    if (user.role !== "mechanic") {
      let portalURL = "";

      if (user.role === "customer") {
        portalURL = "Your account is registered as a Customer. Please use the Customer Portal to login.";
      } else if (user.role === "owner") {
        portalURL = "Your account is registered as Admin/Owner. Please use the Admin Portal to login.";
      }

      setError(`❌ Wrong Portal! ${portalURL}`);
      supabase.auth.signOut();
      setLoading(false);
      setLoginAttempted(false);
      return;
    }

    // Role is correct, login succeeded
    setLoading(false);
    setLoginAttempted(false);
    onLoginSuccess();
  }, [loginAttempted, isLoading, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Error Notification at Top */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-md px-6 py-4 bg-red-500/90 backdrop-blur-sm border border-red-400/50 rounded-lg shadow-lg"
        >
          <div className="flex items-start gap-3">
            <div className="text-red-200 text-xl mt-0.5">⚠️</div>
            <div>
              <p className="text-white font-semibold text-sm">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Back Button */}
      <motion.button
        onClick={onBack}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-6 left-6 flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition"
        whileHover={{ scale: 1.05, x: -4 }}
      >
        <ArrowLeft size={18} />
        <span className="hidden sm:inline text-sm font-medium">Back</span>
      </motion.button>

      {/* Home Button */}
      {onHome && (
        <motion.button
          onClick={onHome}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed top-6 right-12 flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition"
          whileHover={{ scale: 1.05, x: 4 }}
        >
          <span className="hidden sm:inline text-sm font-medium">Home</span>
          <Home size={18} />
        </motion.button>
      )}

      {!user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center mx-auto mb-4">
              <img src={mechanicIcon} alt="Mechanic Icon" className="w-10 h-10 object-contain brightness-0 invert drop-shadow-md" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Mechanic Portal
            </h1>
            <p className="text-slate-400">
              Sign in to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="mechanic@motoshop.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading && <Loader size={18} className="animate-spin" />}
              Sign In
            </motion.button>
          </form>

          {/* Info Section for Registration */}
          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-200">
              Mechanic accounts are invitation-only. Please contact your shop administrator to receive an invitation link if you don't have an account.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MechanicLoginPage;
