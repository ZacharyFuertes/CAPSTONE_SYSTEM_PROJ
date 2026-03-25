import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Wrench,
  XCircle,
  CalendarDays,
  RefreshCw,
  Ban,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../services/supabaseClient";

interface AppointmentItem {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  service_type: string;
  status: string;
  notes?: string;
  description?: string;
  mechanic_name?: string;
}

interface ViewAppointmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  pending: {
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    icon: <Clock size={13} />,
    label: "Pending",
  },
  confirmed: {
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    icon: <CheckCircle size={13} />,
    label: "Confirmed",
  },
  in_progress: {
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
    icon: <Wrench size={13} />,
    label: "In Progress",
  },
  completed: {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    icon: <CheckCircle size={13} />,
    label: "Completed",
  },
  cancelled: {
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    icon: <XCircle size={13} />,
    label: "Cancelled",
  },
};

const FILTER_TABS = [
  { key: "upcoming" as const, label: "Upcoming" },
  { key: "past" as const, label: "Past" },
  { key: "all" as const, label: "All" },
];

const ViewAppointmentsModal: React.FC<ViewAppointmentsModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"upcoming" | "past" | "all">("upcoming");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isOpen && user?.id) fetchAppointments();
  }, [isOpen, user?.id]);

  const fetchAppointments = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);

      // Fetch appointments with mechanic info
      const { data: aptData, error } = await supabase
        .from("appointments")
        .select("id, scheduled_date, scheduled_time, service_type, status, notes, description, mechanic_id")
        .eq("customer_id", user.id)
        .order("scheduled_date", { ascending: false });

      if (error) throw error;

      // Fetch mechanic names for all appointments that have mechanic_id
      const mechanicIds = [...new Set((aptData || []).filter((a: any) => a.mechanic_id).map((a: any) => a.mechanic_id))];
      let mechanicMap: Record<string, string> = {};

      if (mechanicIds.length > 0) {
        const { data: mechanics } = await supabase
          .from("users")
          .select("id, name")
          .in("id", mechanicIds);
        (mechanics || []).forEach((m: any) => { mechanicMap[m.id] = m.name; });
      }

      const enriched: AppointmentItem[] = (aptData || []).map((apt: any) => ({
        id: apt.id,
        scheduled_date: apt.scheduled_date,
        scheduled_time: apt.scheduled_time,
        service_type: apt.service_type,
        status: apt.status,
        notes: apt.notes,
        description: apt.description,
        mechanic_name: apt.mechanic_id ? mechanicMap[apt.mechanic_id] : undefined,
      }));

      setAppointments(enriched);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      setCancellingId(appointmentId);
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", appointmentId)
        .eq("customer_id", user?.id); // Safety: only cancel own appointments
      if (error) throw error;

      // Update locally
      setAppointments((prev) =>
        prev.map((a) => a.id === appointmentId ? { ...a, status: "cancelled" } : a)
      );
      setConfirmCancelId(null);
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      alert("Failed to cancel appointment. Please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const filteredAppointments = appointments.filter((apt) => {
    if (filter === "upcoming") return apt.scheduled_date >= today && apt.status !== "cancelled" && apt.status !== "completed";
    if (filter === "past") return apt.scheduled_date < today || apt.status === "cancelled" || apt.status === "completed";
    return true;
  });

  const formatTime = (time: string) => {
    if (!time) return "";
    const hour = parseInt(time.split(":")[0]);
    return hour >= 12 ? `${hour === 12 ? 12 : hour - 12}:00 PM` : `${hour}:00 AM`;
  };

  const canCancel = (apt: AppointmentItem) => {
    return (apt.status === "pending" || apt.status === "confirmed") && apt.scheduled_date >= today;
  };

  if (!isOpen) return null;

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <CalendarDays size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-black text-white tracking-wide">My Appointments</h2>
                <p className="text-slate-500 text-[10px] sm:text-xs hidden sm:block">View and manage your service appointments</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white"
                title="Refresh"
              >
                <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
              </button>
              <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* ── Filter Tabs ── */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-8 py-2 sm:py-3 border-b border-slate-700/30 flex-shrink-0">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filter === tab.key
                    ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                    : "text-slate-500 hover:text-slate-300 border border-transparent hover:bg-slate-800/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
            <div className="ml-auto text-xs text-slate-600">
              {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* ── Appointments List ── */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-8 py-4 sm:py-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <AlertCircle className="w-14 h-14 text-slate-700 mb-4" />
                <p className="text-slate-500 text-sm">
                  {filter === "upcoming" ? "No upcoming appointments" : filter === "past" ? "No past appointments" : "No appointments found"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAppointments.map((apt, index) => {
                  const status = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending;
                  const showCancel = canCancel(apt);
                  const isCancelling = cancellingId === apt.id;
                  const isConfirmingCancel = confirmCancelId === apt.id;

                  return (
                    <motion.div
                      key={apt.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="bg-slate-800/30 rounded-2xl p-3 sm:p-5 border border-slate-700/20 hover:border-slate-600/40 transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                          {/* Date Badge */}
                          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-800/60 border border-slate-700/30 flex flex-col items-center justify-center flex-shrink-0">
                            <span className="text-[10px] text-slate-500 font-semibold leading-none">
                              {new Date(apt.scheduled_date + "T00:00:00").toLocaleDateString("en-US", { month: "short" })}
                            </span>
                            <span className="text-base sm:text-lg font-black text-white leading-tight">
                              {new Date(apt.scheduled_date + "T00:00:00").getDate()}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-bold text-sm mb-1">{apt.service_type}</h4>
                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                              <span className="flex items-center gap-1.5 text-slate-500 text-xs">
                                <Calendar size={11} />
                                {new Date(apt.scheduled_date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                              </span>
                              <span className="flex items-center gap-1.5 text-slate-500 text-xs">
                                <Clock size={11} />
                                {formatTime(apt.scheduled_time)}
                              </span>
                              {apt.mechanic_name && (
                                <span className="flex items-center gap-1.5 text-slate-500 text-xs">
                                  <Wrench size={11} />
                                  {apt.mechanic_name}
                                </span>
                              )}
                            </div>
                            {apt.description && (
                              <p className="text-slate-600 text-xs mt-2">{apt.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          {/* Status Badge */}
                          <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border font-bold ${status.bg} ${status.color}`}>
                            {status.icon}
                            {status.label}
                          </span>

                          {/* Cancel Button */}
                          {showCancel && !isConfirmingCancel && (
                            <motion.button
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              onClick={() => setConfirmCancelId(apt.id)}
                              className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-red-400 transition px-2 py-1 rounded-lg hover:bg-red-500/10"
                            >
                              <Ban size={11} /> Cancel
                            </motion.button>
                          )}
                        </div>
                      </div>

                      {/* Cancel Confirmation */}
                      <AnimatePresence>
                        {isConfirmingCancel && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 pt-3 border-t border-slate-700/20 flex items-center justify-between">
                              <p className="text-xs text-red-400 font-semibold">Are you sure you want to cancel this appointment?</p>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setConfirmCancelId(null)}
                                  className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 rounded-lg transition border border-slate-700/30"
                                >
                                  No, Keep
                                </button>
                                <button
                                  onClick={() => handleCancelAppointment(apt.id)}
                                  disabled={isCancelling}
                                  className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-lg shadow-red-600/25 flex items-center gap-1"
                                >
                                  {isCancelling ? (
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <XCircle size={12} />
                                  )}
                                  {isCancelling ? "Cancelling..." : "Yes, Cancel"}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ViewAppointmentsModal;
