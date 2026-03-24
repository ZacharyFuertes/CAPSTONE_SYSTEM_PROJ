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
}

interface ViewAppointmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  pending: {
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    icon: <Clock size={14} />,
    label: "Pending",
  },
  confirmed: {
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: <CheckCircle size={14} />,
    label: "Confirmed",
  },
  in_progress: {
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    icon: <Wrench size={14} />,
    label: "In Progress",
  },
  completed: {
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    icon: <CheckCircle size={14} />,
    label: "Completed",
  },
  cancelled: {
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: <XCircle size={14} />,
    label: "Cancelled",
  },
};

const ViewAppointmentsModal: React.FC<ViewAppointmentsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"upcoming" | "past" | "all">("upcoming");

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchAppointments();
    }
  }, [isOpen, user?.id]);

  const fetchAppointments = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("appointments")
        .select("id, scheduled_date, scheduled_time, service_type, status, notes, description")
        .eq("customer_id", user.id)
        .order("scheduled_date", { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === "upcoming") return apt.scheduled_date >= today && apt.status !== "cancelled";
    if (filter === "past") return apt.scheduled_date < today || apt.status === "cancelled" || apt.status === "completed";
    return true;
  });

  const formatTime = (time: string) => {
    const [h] = time.split(":");
    const hour = parseInt(h);
    return hour >= 12 ? `${hour === 12 ? 12 : hour - 12}:00 PM` : `${hour}:00 AM`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden border border-slate-700 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <h2 className="text-2xl font-black text-white">My Appointments</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 px-6 py-3 border-b border-slate-700/50">
            {(["upcoming", "past", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                  filter === f
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Appointments List */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(85vh - 160px)" }}>
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-400 mt-3 text-sm">Loading appointments...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">
                  {filter === "upcoming" ? "No upcoming appointments" : filter === "past" ? "No past appointments" : "No appointments found"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAppointments.map((apt, index) => {
                  const status = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending;
                  return (
                    <motion.div
                      key={apt.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-slate-700/50 rounded-xl p-4 border border-slate-600 hover:border-slate-500 transition"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-white font-bold">{apt.service_type}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                              <Calendar size={12} />
                              {new Date(apt.scheduled_date + "T00:00:00").toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                              <Clock size={12} />
                              {formatTime(apt.scheduled_time)}
                            </span>
                          </div>
                        </div>
                        <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-semibold ${status.color}`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </div>
                      {apt.description && (
                        <p className="text-slate-400 text-xs mt-2">{apt.description}</p>
                      )}
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
