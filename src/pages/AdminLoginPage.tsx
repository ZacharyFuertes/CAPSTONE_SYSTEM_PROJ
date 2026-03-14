import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader, ArrowLeft, Home } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { UserRole } from "../types";

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onBack: () => void;
  onHome?: () => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onBack,
  onHome,
}) => {
  const { login, signup, logout, user } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<{
    email: string;
    password: string;
    name: string;
    role: UserRole;
  }>({
    email: "",
    password: "",
    name: "",
    role: "owner",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        if (formData.role === "customer") {
          setError("Please use Customer Login for customer accounts");
          setLoading(false);
          return;
        }
        await signup(
          formData.email,
          formData.password,
          formData.name,
          formData.role,
        );
      } else {
        await login(formData.email, formData.password);
      }

      // Check if user role is allowed for admin portal
      if (user && user.role !== "admin" && user.role !== "owner") {
        setError(
          `Access Denied: This portal is for Admin and Owner only. Your account is registered as '${user.role}'.`,
        );
        await logout();
        setLoading(false);
        return;
      }

      onLoginSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Authentication failed. Please try again.";
      setError(errorMessage);
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Home Button */}
      <motion.button
        onClick={onHome || onBack}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-6 left-6 flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition"
        whileHover={{ scale: 1.05, x: -4 }}
      >
        <Home size={18} />
        <span className="hidden sm:inline text-sm font-medium">Home</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 hover:text-white mb-6 font-medium transition"
          whileHover={{ scale: 1.05, x: -4 }}
        >
          <ArrowLeft size={18} />
          Back to Login Choice
        </motion.button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-moto-accent to-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-3xl">M</span>
          </div>
          <h1 className="text-3xl font-bold text-white">MotoShop</h1>
          <p className="text-slate-400 mt-2">Admin & Staff Portal</p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800 rounded-lg p-8 border border-slate-700 shadow-2xl"
        >
          <h2 className="text-2xl font-bold text-white mb-6">
            {isSignup ? "Create Admin Account" : "Admin Login"}
          </h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-slate-700 text-white pl-10 pr-4 py-2 rounded border border-slate-600 focus:border-moto-accent focus:outline-none transition"
                  placeholder="admin@motoshop.com"
                  required
                />
              </div>
            </div>

            {/* Name (Signup only) */}
            {isSignup && (
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-moto-accent focus:outline-none transition"
                  placeholder="Manager Name"
                  required={isSignup}
                />
              </div>
            )}

            {/* Role (Signup only) */}
            {isSignup && (
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as UserRole,
                    })
                  }
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-moto-accent focus:outline-none transition"
                >
                  <option value="owner">Shop Owner</option>
                  <option value="mechanic">Mechanic/Staff</option>
                </select>
                <p className="text-slate-500 text-xs mt-1">
                  Customer accounts must use the Customer Login
                </p>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full bg-slate-700 text-white pl-10 pr-4 py-2 rounded border border-slate-600 focus:border-moto-accent focus:outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-moto-accent to-red-600 hover:from-moto-accent-dark hover:to-red-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-5 h-5 animate-spin" />}
              {isSignup ? "Create Admin Account" : "Sign In"}
            </motion.button>
          </form>

          {/* Toggle Signup/Login */}
          <p className="text-center text-slate-400 text-sm mt-6">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
              }}
              className="text-moto-accent hover:text-moto-accent-dark font-semibold transition"
            >
              {isSignup ? "Sign In" : "Create Account"}
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
