import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  RefreshCw,
  CheckCircle,
  Phone,
  Clock,
  ArrowLeft,
  User,
  Car,
  Wrench,
  Calendar,
  Inbox,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import AccessDenied from "../components/AccessDenied";

interface AIInquiry {
  id: string;
  customer_name: string;
  vehicle_info: string | null;
  service_type: string | null;
  preferred_date: string | null;
  contact_info: string | null;
  status: "new" | "contacted" | "converted";
  created_at: string;
}

interface AIInquiriesPageProps {
  onNavigate?: (page: string) => void;
}

const STATUS_CONFIG = {
  new: {
    label: "New",
    color: "bg-[#d63a2f]/20 text-[#d63a2f] border-[#d63a2f]/30",
    dot: "bg-[#d63a2f]",
  },
  contacted: {
    label: "Contacted",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    dot: "bg-yellow-400",
  },
  converted: {
    label: "Converted",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    dot: "bg-emerald-400",
  },
};

const AIInquiriesPage: React.FC<AIInquiriesPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<AIInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "new" | "contacted" | "converted">("all");
  const [error, setError] = useState("");

  // Only owners can view this page
  if (user && user.role !== "owner") {
    return <AccessDenied requestedPage="ai-inquiries" onNavigate={onNavigate} />;
  }

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let query = supabase
        .from("ai_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setInquiries(data ?? []);
    } catch (err: any) {
      setError(`Failed to load inquiries: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const updateStatus = async (id: string, status: AIInquiry["status"]) => {
    setUpdatingId(id);
    try {
      const { error: updateError } = await supabase
        .from("ai_inquiries")
        .update({ status })
        .eq("id", id);

      if (updateError) throw updateError;

      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
      );
    } catch (err: any) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const counts = {
    all: inquiries.length,
    new: inquiries.filter((i) => i.status === "new").length,
    contacted: inquiries.filter((i) => i.status === "contacted").length,
    converted: inquiries.filter((i) => i.status === "converted").length,
  };

  const displayedInquiries =
    filter === "all" ? inquiries : inquiries.filter((i) => i.status === filter);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => onNavigate?.("dashboard")}
          className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#d63a2f] flex items-center justify-center">
              <MessageSquare size={24} className="text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">AI Chat Inquiries</h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Booking requests submitted through the MotoMech AI chatbot
              </p>
            </div>
          </div>
          <button
            onClick={fetchInquiries}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition text-sm disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
      >
        {(["all", "new", "contacted", "converted"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`p-4 rounded-lg border text-left transition ${
              filter === s
                ? "bg-[#d63a2f]/10 border-[#d63a2f]/50"
                : "bg-slate-800 border-slate-700 hover:border-slate-500"
            }`}
          >
            <p className="text-2xl font-bold text-white">{counts[s]}</p>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">
              {s === "all" ? "Total" : s}
            </p>
          </button>
        ))}
      </motion.div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-[#221515] border border-[#d63a2f]/30 rounded-lg px-4 py-3 flex items-center gap-3 text-[#d63a2f] text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Inquiries List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-[#d63a2f] border-t-transparent rounded-full" />
          </div>
        ) : displayedInquiries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Inbox size={48} className="text-slate-600 mb-4" />
            <p className="text-slate-400 text-lg font-medium">No inquiries yet</p>
            <p className="text-slate-500 text-sm mt-1">
              {filter === "all"
                ? "AI chat booking requests will appear here."
                : `No ${filter} inquiries found.`}
            </p>
          </div>
        ) : (
          displayedInquiries.map((inq, idx) => {
            const statusCfg = STATUS_CONFIG[inq.status] ?? STATUS_CONFIG.new;
            return (
              <motion.div
                key={inq.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-500 transition"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center shrink-0">
                      <User size={18} className="text-slate-300" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-base">
                        {inq.customer_name}
                      </p>
                      <p className="text-slate-500 text-xs font-mono mt-0.5">
                        #{inq.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${statusCfg.color}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </span>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                  <div className="flex items-start gap-2">
                    <Car size={14} className="text-slate-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Vehicle</p>
                      <p className="text-sm text-slate-200">
                        {inq.vehicle_info || <span className="text-slate-500 italic">Not provided</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Wrench size={14} className="text-slate-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Service</p>
                      <p className="text-sm text-slate-200">
                        {inq.service_type || <span className="text-slate-500 italic">Not specified</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar size={14} className="text-slate-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Preferred Date</p>
                      <p className="text-sm text-slate-200">
                        {inq.preferred_date
                          ? new Date(inq.preferred_date).toLocaleDateString("en-PH", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : <span className="text-slate-500 italic">Not specified</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone size={14} className="text-slate-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Contact</p>
                      <p className="text-sm text-slate-200">
                        {inq.contact_info || <span className="text-slate-500 italic">Not provided</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <Clock size={12} />
                    Received{" "}
                    {new Date(inq.created_at).toLocaleString("en-PH", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>

                  {/* Status actions */}
                  <div className="flex items-center gap-2">
                    {inq.status === "new" && (
                      <button
                        onClick={() => updateStatus(inq.id, "contacted")}
                        disabled={updatingId === inq.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 rounded-lg text-xs font-bold transition disabled:opacity-50"
                      >
                        <Phone size={12} />
                        Mark Contacted
                      </button>
                    )}
                    {inq.status === "contacted" && (
                      <button
                        onClick={() => updateStatus(inq.id, "converted")}
                        disabled={updatingId === inq.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-xs font-bold transition disabled:opacity-50"
                      >
                        <CheckCircle size={12} />
                        Mark Converted
                      </button>
                    )}
                    {inq.status !== "new" && (
                      <button
                        onClick={() => updateStatus(inq.id, "new")}
                        disabled={updatingId === inq.id}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-400 rounded-lg text-xs transition disabled:opacity-50"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </div>
  );
};

export default AIInquiriesPage;
