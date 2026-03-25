import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Settings,
  User,
  Mail,
  Phone,
  Save,
  CheckCircle,
  Loader,
  Car,
  Plus,
  Trash2,
  MapPin,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../services/supabaseClient";

interface VehicleData {
  id: string;
  make: string;
  model: string;
  year: number | string;
  plate_number: string;
  engine_number?: string;
}

interface CustomerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CustomerSettingsModal: React.FC<CustomerSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshUser } = useAuth();

  // Profile fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Password change
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Vehicles
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ make: "", model: "", year: "", plate_number: "", engine_number: "" });

  // UI state
  const [saving, setSaving] = useState(false);
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "vehicles" | "security">("profile");

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
      fetchVehicles();
      setActiveTab("profile");
      setError("");
      setSuccess("");
    }
  }, [isOpen, user?.id]);

  const fetchVehicles = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, make, model, year, plate_number, engine_number")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });
      if (!error) setVehicles(data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      const { error: updateError } = await supabase
        .from("users")
        .update({
          name: name.trim(),
          phone: phone.trim() || null,
          address: address.trim() || null,
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      await refreshUser();
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      setError("Enter a new password.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      setChangingPassword(true);
      setError("");
      const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
      if (pwError) throw pwError;

      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordChange(false);
      setSuccess("Password changed successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Error changing password:", err);
      setError(err?.message || "Failed to change password. Please try again.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleAddVehicle = async () => {
    if (!user?.id) return;
    if (!newVehicle.make.trim() || !newVehicle.model.trim() || !newVehicle.plate_number.trim()) {
      setError("Make, Model, and Plate Number are required.");
      return;
    }
    try {
      setSavingVehicle(true);
      setError("");
      const { error: insertError } = await supabase
        .from("vehicles")
        .insert({
          customer_id: user.id,
          make: newVehicle.make.trim(),
          model: newVehicle.model.trim(),
          year: parseInt(newVehicle.year) || new Date().getFullYear(),
          plate_number: newVehicle.plate_number.trim().toUpperCase(),
          engine_number: newVehicle.engine_number.trim() || null,
        });

      if (insertError) throw insertError;

      setNewVehicle({ make: "", model: "", year: "", plate_number: "", engine_number: "" });
      setShowAddVehicle(false);
      setSuccess("Vehicle added successfully!");
      setTimeout(() => setSuccess(""), 3000);
      await fetchVehicles();
    } catch (err) {
      console.error("Error adding vehicle:", err);
      setError("Failed to add vehicle. Please try again.");
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm("Are you sure you want to remove this vehicle?")) return;
    try {
      const { error: deleteError } = await supabase.from("vehicles").delete().eq("id", vehicleId);
      if (deleteError) throw deleteError;
      setVehicles(vehicles.filter((v) => v.id !== vehicleId));
      setSuccess("Vehicle removed.");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to remove vehicle.");
    }
  };

  if (!isOpen) return null;

  const TABS = [
    { key: "profile" as const, label: "Profile", icon: User },
    { key: "vehicles" as const, label: "Vehicles", icon: Car },
    { key: "security" as const, label: "Security", icon: Lock },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-3 z-50"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-[#0f172a] rounded-t-3xl sm:rounded-3xl w-full sm:max-w-[700px] h-[95vh] sm:h-auto sm:max-h-[94vh] overflow-hidden border border-slate-700/40 shadow-2xl shadow-black/50 flex flex-col"
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 border-b border-slate-700/40 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center shadow-lg">
                <Settings size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-black text-white tracking-wide">Settings</h2>
                <p className="text-slate-500 text-[10px] sm:text-xs hidden sm:block">Manage your profile, vehicles & security</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* ── Tabs ── */}
          <div className="flex items-center gap-1 px-4 sm:px-8 py-2 sm:py-3 border-b border-slate-700/30 flex-shrink-0">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setError(""); setSuccess(""); }}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.key
                      ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                      : "text-slate-500 hover:text-slate-300 border border-transparent hover:bg-slate-800/40"
                  }`}
                >
                  <Icon size={13} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── Notifications ── */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="mx-4 sm:mx-8 mt-3 sm:mt-4 px-3 sm:px-4 py-2.5 sm:py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 text-xs sm:text-sm font-semibold"
              >
                <CheckCircle size={16} /> {success}
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="mx-4 sm:mx-8 mt-3 sm:mt-4 px-3 sm:px-4 py-2.5 sm:py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs sm:text-sm font-semibold"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Content ── */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
            <AnimatePresence mode="wait">
              {/* ── Profile Tab ── */}
              {activeTab === "profile" && (
                <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/20">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                      <User size={16} className="text-blue-400" /> Profile Information
                    </h3>

                    <div className="space-y-4">
                      {/* Name */}
                      <div>
                        <label className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mb-1.5">
                          <User size={12} /> Full Name *
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-slate-800/40 text-white px-4 py-3 rounded-xl border border-slate-700/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition text-sm placeholder-slate-600"
                          placeholder="Your full name"
                        />
                      </div>

                      {/* Email (read-only) */}
                      <div>
                        <label className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mb-1.5">
                          <Mail size={12} /> Email
                        </label>
                        <input
                          type="email"
                          value={user?.email || ""}
                          disabled
                          className="w-full bg-slate-800/20 text-slate-500 px-4 py-3 rounded-xl border border-slate-700/20 text-sm cursor-not-allowed"
                        />
                        <p className="text-[10px] text-slate-600 mt-1">Email cannot be changed</p>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mb-1.5">
                          <Phone size={12} /> Phone Number
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-slate-800/40 text-white px-4 py-3 rounded-xl border border-slate-700/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition text-sm placeholder-slate-600"
                          placeholder="09XX XXX XXXX"
                        />
                      </div>

                      {/* Address */}
                      <div>
                        <label className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mb-1.5">
                          <MapPin size={12} /> Address
                        </label>
                        <textarea
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          rows={2}
                          className="w-full bg-slate-800/40 text-white px-4 py-3 rounded-xl border border-slate-700/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition text-sm resize-none placeholder-slate-600"
                          placeholder="Your home or office address"
                        />
                      </div>

                      {/* Save Button */}
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          saving
                            ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25"
                        }`}
                      >
                        {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Vehicles Tab ── */}
              {activeTab === "vehicles" && (
                <motion.div key="vehicles" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/20">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Car size={16} className="text-blue-400" /> My Vehicles
                      </h3>
                      <button
                        onClick={() => setShowAddVehicle(!showAddVehicle)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold transition border border-blue-500/20"
                      >
                        <Plus size={14} /> Add Vehicle
                      </button>
                    </div>

                    {/* Add Vehicle Form */}
                    <AnimatePresence>
                      {showAddVehicle && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                          className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/20 mb-4 space-y-3 overflow-hidden"
                        >
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text" placeholder="Make (e.g. Honda)" value={newVehicle.make} onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                              className="bg-slate-800/60 text-white px-3 py-2.5 rounded-lg border border-slate-700/30 focus:border-blue-500/50 focus:outline-none text-sm placeholder-slate-600"
                            />
                            <input
                              type="text" placeholder="Model (e.g. Click 150i)" value={newVehicle.model} onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                              className="bg-slate-800/60 text-white px-3 py-2.5 rounded-lg border border-slate-700/30 focus:border-blue-500/50 focus:outline-none text-sm placeholder-slate-600"
                            />
                            <input
                              type="number" placeholder="Year" value={newVehicle.year} onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })}
                              className="bg-slate-800/60 text-white px-3 py-2.5 rounded-lg border border-slate-700/30 focus:border-blue-500/50 focus:outline-none text-sm placeholder-slate-600"
                            />
                            <input
                              type="text" placeholder="Plate Number" value={newVehicle.plate_number} onChange={(e) => setNewVehicle({ ...newVehicle, plate_number: e.target.value })}
                              className="bg-slate-800/60 text-white px-3 py-2.5 rounded-lg border border-slate-700/30 focus:border-blue-500/50 focus:outline-none text-sm placeholder-slate-600 uppercase"
                            />
                          </div>
                          <input
                            type="text" placeholder="Engine Number (optional)" value={newVehicle.engine_number} onChange={(e) => setNewVehicle({ ...newVehicle, engine_number: e.target.value })}
                            className="w-full bg-slate-800/60 text-white px-3 py-2.5 rounded-lg border border-slate-700/30 focus:border-blue-500/50 focus:outline-none text-sm placeholder-slate-600"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleAddVehicle}
                              disabled={savingVehicle}
                              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition"
                            >
                              {savingVehicle ? <Loader size={13} className="animate-spin" /> : <Plus size={13} />}
                              {savingVehicle ? "Adding..." : "Add Vehicle"}
                            </button>
                            <button
                              onClick={() => { setShowAddVehicle(false); setNewVehicle({ make: "", model: "", year: "", plate_number: "", engine_number: "" }); }}
                              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-400 rounded-lg text-xs font-bold transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Vehicle List */}
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : vehicles.length === 0 ? (
                      <div className="text-center py-8">
                        <Car className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">No vehicles registered yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {vehicles.map((vehicle) => (
                          <div
                            key={vehicle.id}
                            className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/20 flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-slate-800/60 border border-slate-700/30 flex items-center justify-center">
                                <Car size={14} className="text-slate-400" />
                              </div>
                              <div>
                                <p className="text-white font-bold text-sm">{vehicle.make} {vehicle.model}</p>
                                <p className="text-slate-500 text-xs">
                                  {vehicle.year}{vehicle.engine_number && ` • ${vehicle.engine_number}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-slate-800/60 text-slate-400 px-2.5 py-1 rounded-lg border border-slate-700/30 font-mono font-bold">
                                {vehicle.plate_number}
                              </span>
                              <button
                                onClick={() => handleDeleteVehicle(vehicle.id)}
                                className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── Security Tab ── */}
              {activeTab === "security" && (
                <motion.div key="security" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/20">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                      <Lock size={16} className="text-blue-400" /> Password & Security
                    </h3>

                    {!showPasswordChange ? (
                      <button
                        onClick={() => setShowPasswordChange(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 rounded-xl transition text-sm font-semibold border border-slate-700/30"
                      >
                        <Lock size={14} /> Change Password
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mb-1.5">
                            <Lock size={12} /> New Password *
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="w-full bg-slate-800/40 text-white px-4 py-3 pr-12 rounded-xl border border-slate-700/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition text-sm placeholder-slate-600"
                              placeholder="At least 6 characters"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mb-1.5">
                            <Lock size={12} /> Confirm Password *
                          </label>
                          <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-slate-800/40 text-white px-4 py-3 rounded-xl border border-slate-700/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition text-sm placeholder-slate-600"
                            placeholder="Re-enter new password"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleChangePassword}
                            disabled={changingPassword}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                              changingPassword
                                ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25"
                            }`}
                          >
                            {changingPassword ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                            {changingPassword ? "Changing..." : "Update Password"}
                          </button>
                          <button
                            onClick={() => { setShowPasswordChange(false); setNewPassword(""); setConfirmPassword(""); }}
                            className="px-4 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-slate-400 rounded-xl text-sm font-bold transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CustomerSettingsModal;
