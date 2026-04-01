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
  MapPin,
  RefreshCw,
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
  const [pendingAppointments, setPendingAppointments] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [memberSince, setMemberSince] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Always re-fetch when modal opens
  useEffect(() => {
    if (isOpen && user?.id) {
      fetchPortalData();
    }
  }, [isOpen, user?.id]);

  const fetchPortalData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);

      // Fetch all appointment data
      const { data: appointments, error: aptError } = await supabase
        .from("appointments")
        .select("id, status")
        .eq("customer_id", user.id);

      if (!aptError && appointments) {
        setTotalAppointments(appointments.length);
        setPendingAppointments(appointments.filter((a: any) => a.status === "pending" || a.status === "confirmed").length);
      }

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
    } catch (err) {
      console.error("Error fetching portal data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPortalData();
    setRefreshing(false);
  };

  if (!isOpen) return null;

  const STATS = [
    { icon: Calendar, label: "TOTAL APPOINTMENTS", value: totalAppointments.toString() },
    { icon: Clock, label: "PENDING", value: pendingAppointments.toString() },
    { icon: Wallet, label: "TOTAL SPENT", value: `₱${totalSpent.toLocaleString("en-PH", { minimumFractionDigits: 2 })}` },
    { icon: Car, label: "VEHICLES", value: vehicles.length.toString() },
  ];

  const ACCOUNT_FIELDS = [
    { icon: UserCircle, label: "Name", value: user?.name || "N/A" },
    { icon: Mail, label: "Email", value: user?.email || "N/A" },
    { icon: Phone, label: "Phone", value: user?.phone || "Not provided" },
    { icon: MapPin, label: "Address", value: user?.address || "Not provided" },
    { icon: Shield, label: "Role", value: user?.role || "Customer", capitalize: true },
    { icon: Clock, label: "Member Since", value: memberSince || "N/A" },
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
          className="bg-[#0a0a0a] rounded-none border border-[#222] border-t-2 border-t-[#d63a2f] w-full sm:max-w-[900px] h-[95vh] sm:h-auto sm:max-h-[94vh] overflow-hidden shadow-2xl flex flex-col"
        >
          {/* ── Header ── */}
          <div className="flex items-start justify-between px-6 sm:px-10 py-6 border-b border-[#222] flex-shrink-0 bg-[#111111]">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-[#d63a2f] flex items-center justify-center shrink-0">
                <UserCircle size={28} className="text-white" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3 text-[#d63a2f] text-[10px] font-bold tracking-[0.2em] uppercase">
                  <div className="w-6 h-[1px] bg-[#d63a2f]" /> DASHBOARD
                </div>
                <h2 className="font-display text-3xl sm:text-4xl text-white uppercase leading-none tracking-wide">
                  MY ACCOUNT
                </h2>
                <p className="text-[#6b6b6b] text-xs font-light tracking-wide hidden sm:block">
                  Welcome, {user?.name || "Customer"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 border border-[#333] hover:bg-[#222] transition text-[#6b6b6b] hover:text-white shrink-0"
                title="Refresh"
              >
                <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} strokeWidth={1} />
              </button>
              <button onClick={onClose} className="p-2 border border-[#333] hover:bg-[#222] transition text-[#6b6b6b] hover:text-white shrink-0">
                <X size={20} strokeWidth={1} />
              </button>
            </div>
          </div>

          {/* ── Content ── */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 bg-[#0a0a0a]">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-3 border-[#d63a2f] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-[#222]">
                  {STATS.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-[#111111] p-5 sm:p-6 border-b sm:border-b-0 sm:border-r border-[#222] last:border-b-0 sm:last:border-r-0"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <Icon size={14} className="text-[#d63a2f]" />
                          <span className="text-[#555] text-[10px] font-bold tracking-widest uppercase">{stat.label}</span>
                        </div>
                        <p className="font-display text-3xl sm:text-4xl text-white leading-none">{stat.value}</p>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Account Information */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-[#111111] border border-[#222] p-6 sm:p-10 rounded-none"
                >
                  <h3 className="text-[10px] font-bold text-[#6b6b6b] uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                    <UserCircle size={14} className="text-[#d63a2f]" /> ACCOUNT INFORMATION
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {ACCOUNT_FIELDS.map((field) => {
                      const Icon = field.icon;
                      return (
                        <div key={field.label} className="flex flex-col gap-2 border-l border-[#222] pl-4">
                          <div className="flex items-center gap-2 text-[#555] text-[10px] font-bold tracking-widest uppercase mb-1">
                            <Icon size={12} /> {field.label}
                          </div>
                          <p className={`font-display text-lg sm:text-xl text-white leading-tight uppercase ${field.capitalize ? "capitalize" : ""}`}>
                            {field.value}
                          </p>
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
                  className="bg-[#111111] border border-[#222] p-6 sm:p-10 rounded-none"
                >
                  <h3 className="text-[10px] font-bold text-[#6b6b6b] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Car size={14} className="text-[#d63a2f]" /> YOUR VEHICLES
                  </h3>

                  {vehicles.length === 0 ? (
                    <div className="text-center py-12 border border-[#222] bg-[#0a0a0a]">
                      <Car className="w-12 h-12 text-[#333] mx-auto mb-4" strokeWidth={1} />
                      <p className="text-[#6b6b6b] text-[10px] font-bold tracking-widest uppercase mb-2">NO VEHICLES REGISTERED YET.</p>
                      <p className="text-[#444] text-[10px] font-bold tracking-widest uppercase">ADD VEHICLES IN SETTINGS</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {vehicles.map((vehicle, i) => (
                        <motion.div
                          key={vehicle.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.05 }}
                          className="bg-[#0a0a0a] border border-[#222] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-start sm:items-center gap-4">
                            <div className="w-14 h-14 bg-[#111] border border-[#333] flex items-center justify-center shrink-0">
                              <Car size={20} className="text-[#6b6b6b]" strokeWidth={1} />
                            </div>
                            <div>
                              <p className="font-display text-xl text-white uppercase tracking-wide leading-none mb-2">
                                {vehicle.make} {vehicle.model}
                              </p>
                              <p className="text-[#6b6b6b] text-[10px] font-bold tracking-widest uppercase">
                                {vehicle.year || "N/A"}
                                {vehicle.engine_number && ` • ENGINE: ${vehicle.engine_number}`}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] tracking-widest bg-[#111] text-[#d63a2f] px-3 py-1.5 border border-[#333] font-bold uppercase self-end sm:self-auto">
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
