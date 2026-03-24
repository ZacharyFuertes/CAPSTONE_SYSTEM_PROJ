import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Wallet,
  UserCircle,
  Car,
  Mail,
  Phone,
  Shield,
  Clock,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../services/supabaseClient";

interface VehicleData {
  id: string;
  make: string;
  model: string;
  year: number;
  plate_number: string;
  engine_number?: string;
}

interface CustomerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CustomerPortalModal: React.FC<CustomerPortalModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [memberSince, setMemberSince] = useState("");
  const [loading, setLoading] = useState(true);
  const fetchedRef = React.useRef(false);

  useEffect(() => {
    if (isOpen && user?.id && !fetchedRef.current) {
      fetchPortalData();
    }
  }, [isOpen, user?.id]);

  const fetchPortalData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);

      // Fetch appointment count
      const { data: appointments, error: aptError } = await supabase
        .from("appointments")
        .select("id")
        .eq("customer_id", user.id);
      if (!aptError) setTotalAppointments(appointments?.length || 0);

      // Fetch total spent from invoices
      const { data: invoices, error: invError } = await supabase
        .from("invoices")
        .select("total_amount")
        .eq("customer_id", user.id)
        .eq("payment_status", "paid");
      if (!invError && invoices) {
        setTotalSpent(invoices.reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0));
      }

      // Fetch vehicles
      const { data: vehicleData, error: vehError } = await supabase
        .from("vehicles")
        .select("id, make, model, year, plate_number, engine_number")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });
      if (!vehError) setVehicles(vehicleData || []);

      // Member since
      if (user.created_at) {
        setMemberSince(
          new Date(user.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        );
      }

      fetchedRef.current = true;
    } catch (err) {
      console.error("Error fetching portal data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const STATS = [
    { icon: Calendar, label: "Total Appointments", value: totalAppointments.toString(), color: "from-blue-500 to-indigo-600" },
    { icon: Wallet, label: "Total Spent", value: `₱${totalSpent.toFixed(2)}`, color: "from-emerald-500 to-emerald-600" },
    { icon: Clock, label: "Member Since", value: memberSince || "N/A", color: "from-purple-500 to-purple-600" },
  ];

  const ACCOUNT_FIELDS = [
    { icon: UserCircle, label: "Name", value: user?.name || "N/A" },
    { icon: Mail, label: "Email", value: user?.email || "N/A" },
    { icon: Phone, label: "Phone", value: user?.phone || "Not provided" },
    { icon: Shield, label: "Role", value: (user?.role || "Customer"), capitalize: true },
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
          className="bg-[#0f172a] rounded-t-3xl sm:rounded-3xl w-full sm:max-w-[900px] h-[95vh] sm:h-auto sm:max-h-[94vh] overflow-hidden border border-slate-700/40 shadow-2xl shadow-black/50 flex flex-col"
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 border-b border-slate-700/40 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <UserCircle size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-black text-white tracking-wide">My Account</h2>
                <p className="text-slate-500 text-[10px] sm:text-xs hidden sm:block">Welcome, {user?.name || "Customer"}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* ── Content ── */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {STATS.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-slate-800/30 rounded-2xl p-5 border border-slate-700/20"
                      >
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                            <Icon size={14} className="text-white" />
                          </div>
                          <span className="text-slate-500 text-xs font-semibold">{stat.label}</span>
                        </div>
                        <p className="text-2xl font-black text-white">{stat.value}</p>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Account Information */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/20"
                >
                  <h3 className="text-sm font-black text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                    <UserCircle size={16} className="text-blue-400" /> Account Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {ACCOUNT_FIELDS.map((field) => {
                      const Icon = field.icon;
                      return (
                        <div key={field.label} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800/60 border border-slate-700/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Icon size={14} className="text-slate-500" />
                          </div>
                          <div>
                            <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wide">{field.label}</p>
                            <p className={`text-white font-semibold text-sm ${field.capitalize ? "capitalize" : ""}`}>
                              {field.value}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Vehicles */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/20"
                >
                  <h3 className="text-sm font-black text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                    <Car size={16} className="text-blue-400" /> Your Vehicles
                  </h3>

                  {vehicles.length === 0 ? (
                    <div className="text-center py-8">
                      <Car className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">No vehicles registered yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {vehicles.map((vehicle, i) => (
                        <motion.div
                          key={vehicle.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.05 }}
                          className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/20 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700/80 to-slate-800/80 border border-slate-600/30 flex items-center justify-center">
                              <Car size={16} className="text-slate-400" />
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm">
                                {vehicle.make} {vehicle.model}
                              </p>
                              <p className="text-slate-500 text-xs">
                                {vehicle.year || "N/A"}
                                {vehicle.engine_number && ` • Engine: ${vehicle.engine_number}`}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs bg-slate-800/60 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-700/30 font-mono font-bold">
                            {vehicle.plate_number}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CustomerPortalModal;
