import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader, ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../services/supabaseClient";
import adminIcon from "../icons/admin.png";

interface OwnerLoginPageProps {
  onLoginSuccess: () => void;
  onBack: () => void;
  onHome?: () => void;
}

const OwnerLoginPage: React.FC<OwnerLoginPageProps> = ({
  onLoginSuccess,
  onBack,
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

        if (existingUser && existingUser.role !== "owner" && existingUser.role !== "admin") {
          const portalMap: { [key: string]: string } = {
            customer: "Customer Portal",
            mechanic: "Mechanic Portal",
          };
          const correctPortal =
            portalMap[existingUser.role] || "appropriate portal";
          setError(
            `❌ This email is registered as a ${existingUser.role}. Please use the ${correctPortal} instead.`,
          );
          setLoading(false);
          return;
        }

        await signup(formData.email, formData.password, formData.name, "owner");
      } else {
        await login(formData.email, formData.password);
      }
      setLoginAttempted(true);
    } catch (err) {
      let errorMessage = "Authentication failed. Please try again.";

      if (err instanceof Error) {
        const message = err.message.toLowerCase();

        if (message.includes("invalid login credentials")) {
          errorMessage = isSignup
            ? "Email already registered or invalid credentials."
            : "❌ Invalid email or password. Please check and try again.";
        } else if (message.includes("user already registered")) {
          errorMessage =
            "This email is already registered. Please sign in instead.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      console.error("Auth error:", err);
      setLoading(false);
    }
  };

  // Check role after login completes
  useEffect(() => {
    if (!loginAttempted || isLoading || !user) {
      return;
    }

    if (user.role !== "owner" && user.role !== "admin") {
      let portalURL = "";

      if (user.role === "customer") {
        portalURL =
          "Your account is registered as a Customer. Please use the Customer Portal to login.";
      } else if (user.role === "mechanic") {
        portalURL =
          "Your account is registered as a Mechanic. Please use the Mechanic Portal to login.";
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-400 rounded-lg flex items-center justify-center mx-auto mb-4">
            <img src={adminIcon} alt="Admin Icon" className="w-10 h-10 object-contain brightness-0 invert drop-shadow-md" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-slate-400">
            {isSignup ? "Create your account" : "Sign in to your account"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

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
                placeholder="owner@motoshop.com"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition"
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
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>
          </div>

          {/* Name (Signup only) */}
          {isSignup && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Shop Owner Name"
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>
          )}

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 disabled:opacity-50 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading && <Loader size={18} className="animate-spin" />}
            {isSignup ? "Create Account" : "Sign In"}
          </motion.button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            {isSignup ? "Already have an account?" : "Don't have an account?"}
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
                setFormData({ email: "", password: "", name: "" });
              }}
              className="ml-2 text-red-400 hover:text-red-300 font-semibold transition"
            >
              {isSignup ? "Sign In" : "Create Account"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default OwnerLoginPage;
