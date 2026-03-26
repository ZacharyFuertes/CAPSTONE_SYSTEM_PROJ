import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader, ArrowLeft, Home, User, Phone, MapPin } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../services/supabaseClient";
import usersIcon from "../icons/users.png";

interface CustomerLoginPageProps {
  onLoginSuccess: () => void;
  onBack: () => void;
  onHome?: () => void;
}

const LoginPage: React.FC<CustomerLoginPageProps> = ({
  onLoginSuccess,
  onBack,
  onHome,
}) => {
  const { login, signup, user, isLoading } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    address: "",
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
      if (isSignup) {
        // Check if email already exists with a different role
        const { data: existingUser } = await supabase
          .from("users")
          .select("email, role")
          .eq("email", formData.email)
          .single();

        if (existingUser && existingUser.role !== "customer") {
          const portalMap: { [key: string]: string } = {
            mechanic: "Mechanic Portal",
            admin: "Admin Portal",
            owner: "Admin Portal",
          };
          const correctPortal =
            portalMap[existingUser.role] || "appropriate portal";
          setError(
            `❌ This email is registered as a ${existingUser.role}. Please use the ${correctPortal} instead.`,
          );
          setLoading(false);
          return;
        }

        await signup(
          formData.email,
          formData.password,
          formData.name,
          "customer",
          formData.phone,
          formData.address,
        );
      } else {
        await login(formData.email, formData.password);
      }

      // Signal that login attempt has completed
      // AuthContext will be updated in the background via onAuthStateChange
      setLoginAttempted(true);
    } catch (err) {
      let errorMessage = "Authentication failed. Please try again.";

      if (err instanceof Error) {
        const message = err.message.toLowerCase();

        if (message.includes("invalid login credentials")) {
          errorMessage = isSignup
            ? "Email already registered or invalid credentials. Please use a different email or sign in instead."
            : "❌ Invalid email or password. Please check and try again.";
        } else if (message.includes("user already registered")) {
          errorMessage =
            "This email is already registered. Please sign in instead.";
        } else if (message.includes("email not confirmed")) {
          errorMessage =
            "⚠️ Email not confirmed. Please check your email for the verification link.";
        } else if (message.includes("too many requests")) {
          errorMessage =
            "⏳ Too many login attempts. Please try again in a few minutes.";
        } else if (message.includes("invalid email")) {
          errorMessage =
            "❌ Invalid email format. Please enter a valid email address.";
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

    // User profile is loaded and role is available from AuthContext
    if (user.role !== "customer") {
      let portalURL = "";

      if (user.role === "mechanic") {
        portalURL =
          "Your account is registered as a Mechanic. Please use the Mechanic Portal to login.";
      } else if (user.role === "owner") {
        portalURL =
          "Your account is registered as Admin/Owner. Please use the Admin Portal to login.";
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

  // Input field style shared between login and signup
  const inputClass =
    "w-full pl-11 pr-4 py-3.5 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/70 focus:bg-slate-800/80 transition-all duration-300 text-sm";

  const iconClass = "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
      </div>

      {/* Error Notification at Top */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-md px-6 py-4 bg-red-500/90 backdrop-blur-md border border-red-400/50 rounded-xl shadow-2xl shadow-red-500/20"
          >
            <div className="flex items-start gap-3">
              <div className="text-red-200 text-xl mt-0.5">⚠️</div>
              <div>
                <p className="text-white font-semibold text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError("")}
                className="ml-2 text-red-200 hover:text-white transition text-lg leading-none"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back Button */}
      <motion.button
        onClick={onBack}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-6 left-6 flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 backdrop-blur-sm rounded-xl text-slate-300 hover:text-white transition-all z-30"
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
          className="fixed top-6 right-6 flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 backdrop-blur-sm rounded-xl text-slate-300 hover:text-white transition-all z-30"
          whileHover={{ scale: 1.05, x: 4 }}
        >
          <span className="hidden sm:inline text-sm font-medium">Home</span>
          <Home size={18} />
        </motion.button>
      )}

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div
          className="rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 100%)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Card inner glow */}
          <div className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
            style={{
              background: isSignup
                ? "radial-gradient(ellipse at top, rgba(245,158,11,0.08) 0%, transparent 60%)"
                : "radial-gradient(ellipse at top, rgba(34,197,94,0.08) 0%, transparent 60%)",
            }}
          />

          <div className="relative p-8 sm:p-10">
            {/* Logo */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div
                className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-5 shadow-lg ${
                  isSignup
                    ? "bg-gradient-to-br from-amber-600 to-amber-500 shadow-amber-500/20"
                    : "bg-gradient-to-br from-green-600 to-green-400 shadow-green-500/20"
                }`}
              >
                <img
                  src={usersIcon}
                  alt="Customer Icon"
                  className="w-10 h-10 object-contain brightness-0 invert drop-shadow-md"
                />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={isSignup ? "signup" : "login"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                    {isSignup ? "Create account" : "Welcome back"}
                  </h1>
                  <p className="text-slate-400 text-sm">
                    {isSignup
                      ? "Register to book appointments & track repairs"
                      : "Sign in to your account"}
                  </p>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isSignup ? "signup-fields" : "login-fields"}
                  initial={{ opacity: 0, x: isSignup ? 30 : -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isSignup ? -30 : 30 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-4"
                >
                  {/* Name (Signup only) */}
                  {isSignup && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                    >
                      <div className="relative">
                        <User size={18} className={iconClass} />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Full Name"
                          required
                          className={inputClass}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Email */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: isSignup ? 0.1 : 0.05 }}
                  >
                    <div className="relative">
                      <Mail size={18} className={iconClass} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        required
                        className={inputClass}
                      />
                    </div>
                  </motion.div>

                  {/* Password */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: isSignup ? 0.15 : 0.1 }}
                  >
                    <div className="relative">
                      <Lock size={18} className={iconClass} />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password"
                        required
                        className={inputClass}
                      />
                    </div>
                  </motion.div>

                  {/* Phone (Signup only) */}
                  {isSignup && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="relative">
                        <Phone size={18} className={iconClass} />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Phone Number"
                          required
                          className={inputClass}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Address (Signup only) */}
                  {isSignup && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      <div className="relative">
                        <MapPin size={18} className={iconClass} />
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Address"
                          required
                          className={inputClass}
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className={`w-full mt-6 px-6 py-3.5 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-base shadow-lg ${
                  isSignup
                    ? "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-amber-500/20"
                    : "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-green-500/20"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading && <Loader size={18} className="animate-spin" />}
                {isSignup ? "Create Account" : "Sign In"}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-slate-700/50" />
              <span className="text-slate-500 text-xs uppercase tracking-wider font-medium">
                or
              </span>
              <div className="flex-1 h-px bg-slate-700/50" />
            </div>

            {/* Toggle */}
            <div className="text-center">
              <p className="text-slate-400 text-sm">
                {isSignup
                  ? "Already have an account?"
                  : "Don't have an account?"}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setError("");
                    setFormData({
                      email: "",
                      password: "",
                      name: "",
                      phone: "",
                      address: "",
                    });
                  }}
                  className={`ml-2 font-semibold transition-colors ${
                    isSignup
                      ? "text-amber-400 hover:text-amber-300"
                      : "text-green-400 hover:text-green-300"
                  }`}
                >
                  {isSignup ? "Sign In" : "Create Account"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
