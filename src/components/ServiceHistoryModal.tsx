import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  History,
  Wrench,
  Calendar,
  Clock,
  CheckCircle,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Package,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../services/supabaseClient";

interface ServiceRecord {
  id: string;
  service_type: string;
  description?: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  notes?: string;
  mechanic_name?: string;
  job_order?: {
    id: string;
    status: string;
    labor_hours: number;
    labor_rate: number;
    parts_used: { part_id: string; quantity_used: number; unit_price: number }[];
    notes?: string;
    completed_at?: string;
  };
  invoice?: {
    id: string;
    total_amount: number;
    payment_status: string;
    payment_method?: string;
    paid_date?: string;
  };
}

interface ServiceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  completed: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Completed" },
  in_progress: { color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", label: "In Progress" },
  confirmed: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", label: "Confirmed" },
  pending: { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", label: "Pending" },
  cancelled: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", label: "Cancelled" },
  draft: { color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/20", label: "Draft" },
};

const FILTER_TABS = [
  { key: "all" as const, label: "All" },
  { key: "completed" as const, label: "Completed" },
  { key: "in_progress" as const, label: "In Progress" },
  { key: "cancelled" as const, label: "Cancelled" },
];

const ServiceHistoryModal: React.FC<ServiceHistoryModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "completed" | "in_progress" | "cancelled">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user?.id) fetchHistory();
  }, [isOpen, user?.id]);

  const fetchHistory = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);

      // Fetch all appointments (completed, in_progress, cancelled)
      const { data: appointments, error: aptErr } = await supabase
        .from("appointments")
        .select("id, service_type, description, scheduled_date, scheduled_time, status, notes, mechanic_id")
        .eq("customer_id", user.id)
        .in("status", ["completed", "in_progress", "cancelled", "confirmed", "pending"])
        .order("scheduled_date", { ascending: false });

      if (aptErr) throw aptErr;

      // Fetch job orders for these appointments
      const aptIds = (appointments || []).map((a) => a.id);
      let jobOrders: any[] = [];
      if (aptIds.length > 0) {
        const { data: jobs } = await supabase
          .from("job_orders")
          .select("id, appointment_id, status, labor_hours, labor_rate, parts_used, notes, completed_at")
          .in("appointment_id", aptIds);
        jobOrders = jobs || [];
      }

      // Fetch invoices
      let invoices: any[] = [];
      const jobIds = jobOrders.map((j) => j.id);
      if (jobIds.length > 0) {
        const { data: invs } = await supabase
          .from("invoices")
          .select("id, job_order_id, total_amount, payment_status, payment_method, paid_date")
          .in("job_order_id", jobIds);
        invoices = invs || [];
      }

      // Fetch mechanic names
      const mechanicIds = [...new Set((appointments || []).filter((a) => a.mechanic_id).map((a) => a.mechanic_id))];
      let mechanicMap: Record<string, string> = {};
      if (mechanicIds.length > 0) {
        const { data: mechanics } = await supabase
          .from("users")
          .select("id, name")
          .in("id", mechanicIds);
        (mechanics || []).forEach((m: any) => { mechanicMap[m.id] = m.name; });
      }

      // Combine data
      const combined: ServiceRecord[] = (appointments || []).map((apt) => {
        const job = jobOrders.find((j) => j.appointment_id === apt.id);
        const inv = job ? invoices.find((i) => i.job_order_id === job.id) : null;
        return {
          id: apt.id,
          service_type: apt.service_type,
          description: apt.description,
          scheduled_date: apt.scheduled_date,
          scheduled_time: apt.scheduled_time,
          status: apt.status,
          notes: apt.notes,
          mechanic_name: apt.mechanic_id ? mechanicMap[apt.mechanic_id] : undefined,
          job_order: job || undefined,
          invoice: inv || undefined,
        };
      });

      setRecords(combined);
    } catch (err) {
      console.error("Error fetching service history:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = records.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  const formatTime = (time: string) => {
    if (!time) return "";
    const hour = parseInt(time.split(":")[0]);
    return hour >= 12 ? `${hour === 12 ? 12 : hour - 12}:00 PM` : `${hour}:00 AM`;
  };

  const totalSpent = records
    .filter((r) => r.invoice?.payment_status === "paid")
    .reduce((sum, r) => sum + (r.invoice?.total_amount || 0), 0);

  const completedCount = records.filter((r) => r.status === "completed").length;

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <History size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-black text-white tracking-wide">Service History</h2>
                <p className="text-slate-500 text-[10px] sm:text-xs hidden sm:block">Your past repairs and services</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* ── Summary Stats ── */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 px-4 sm:px-8 py-2 sm:py-3 border-b border-slate-700/30 flex-shrink-0">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle size={13} className="text-emerald-400" />
              <span className="text-slate-500">Completed:</span>
              <span className="text-white font-bold">{completedCount}</span>
            </div>
            <div className="w-px h-4 bg-slate-700/50" />
            <div className="flex items-center gap-2 text-xs">
              <DollarSign size={13} className="text-emerald-400" />
              <span className="text-slate-500">Total Spent:</span>
              <span className="text-white font-bold">₱{totalSpent.toLocaleString()}</span>
            </div>
            <div className="w-px h-4 bg-slate-700/50" />
            <div className="flex items-center gap-2 text-xs">
              <FileText size={13} className="text-blue-400" />
              <span className="text-slate-500">Total Records:</span>
              <span className="text-white font-bold">{records.length}</span>
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
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-500 hover:text-slate-300 border border-transparent hover:bg-slate-800/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
            <div className="ml-auto text-xs text-slate-600">
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* ── History List ── */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-8 py-4 sm:py-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <AlertCircle className="w-14 h-14 text-slate-700 mb-4" />
                <p className="text-slate-500 text-sm">No service records found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((record, index) => {
                  const status = STATUS_STYLES[record.status] || STATUS_STYLES.pending;
                  const isExpanded = expandedId === record.id;
                  const laborTotal = record.job_order
                    ? record.job_order.labor_hours * record.job_order.labor_rate
                    : 0;
                  const partsTotal = record.job_order
                    ? (record.job_order.parts_used || []).reduce((s, p) => s + p.quantity_used * p.unit_price, 0)
                    : 0;

                  return (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="bg-slate-800/30 rounded-2xl border border-slate-700/20 hover:border-slate-600/40 transition-all overflow-hidden"
                    >
                      {/* Main Row */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : record.id)}
                        className="w-full p-3 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between text-left gap-2 sm:gap-0"
                      >
                        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                          {/* Date Badge */}
                          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-800/60 border border-slate-700/30 flex flex-col items-center justify-center flex-shrink-0">
                            <span className="text-[10px] text-slate-500 font-semibold leading-none">
                              {new Date(record.scheduled_date + "T00:00:00").toLocaleDateString("en-US", { month: "short" })}
                            </span>
                            <span className="text-base sm:text-lg font-black text-white leading-tight">
                              {new Date(record.scheduled_date + "T00:00:00").getDate()}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-white font-bold text-sm mb-1">{record.service_type}</h4>
                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                              <span className="flex items-center gap-1.5 text-slate-500 text-xs">
                                <Calendar size={11} />
                                {new Date(record.scheduled_date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                              </span>
                              <span className="flex items-center gap-1.5 text-slate-500 text-xs">
                                <Clock size={11} />
                                {formatTime(record.scheduled_time)}
                              </span>
                              {record.mechanic_name && (
                                <span className="flex items-center gap-1.5 text-slate-500 text-xs">
                                  <Wrench size={11} />
                                  {record.mechanic_name}
                                </span>
                              )}
                            </div>
                            {record.description && (
                              <p className="text-slate-600 text-xs mt-1.5 line-clamp-1">{record.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 self-end sm:self-auto">
                          {record.invoice && (
                            <span className="text-sm font-bold text-white">
                              ₱{record.invoice.total_amount.toLocaleString()}
                            </span>
                          )}
                          <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border font-bold ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                          {isExpanded ? (
                            <ChevronUp size={16} className="text-slate-500" />
                          ) : (
                            <ChevronDown size={16} className="text-slate-500" />
                          )}
                        </div>
                      </button>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 sm:px-5 pb-3 sm:pb-5 pt-0 border-t border-slate-700/20 space-y-3 sm:space-y-4">
                              <div className="pt-3 sm:pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {/* Job Order Details */}
                                {record.job_order && (
                                  <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/20">
                                    <h5 className="text-xs font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                      <Wrench size={13} className="text-emerald-400" /> Job Details
                                    </h5>
                                    <div className="space-y-2 text-xs">
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Status</span>
                                        <span className="text-white font-semibold capitalize">{record.job_order.status.replace("_", " ")}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Labor</span>
                                        <span className="text-white font-semibold">{record.job_order.labor_hours}h × ₱{record.job_order.labor_rate} = ₱{laborTotal.toLocaleString()}</span>
                                      </div>
                                      {(record.job_order.parts_used || []).length > 0 && (
                                        <div className="flex justify-between">
                                          <span className="text-slate-500">Parts ({record.job_order.parts_used.length})</span>
                                          <span className="text-white font-semibold">₱{partsTotal.toLocaleString()}</span>
                                        </div>
                                      )}
                                      {record.job_order.completed_at && (
                                        <div className="flex justify-between">
                                          <span className="text-slate-500">Completed</span>
                                          <span className="text-white font-semibold">
                                            {new Date(record.job_order.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                          </span>
                                        </div>
                                      )}
                                      {record.job_order.notes && (
                                        <div className="pt-2 border-t border-slate-700/20">
                                          <p className="text-slate-400 text-xs">{record.job_order.notes}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Invoice Details */}
                                {record.invoice && (
                                  <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/20">
                                    <h5 className="text-xs font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                      <DollarSign size={13} className="text-emerald-400" /> Invoice
                                    </h5>
                                    <div className="space-y-2 text-xs">
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Total</span>
                                        <span className="text-white font-bold text-sm">₱{record.invoice.total_amount.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Payment Status</span>
                                        <span className={`font-semibold capitalize ${
                                          record.invoice.payment_status === "paid" ? "text-emerald-400" :
                                          record.invoice.payment_status === "partial" ? "text-yellow-400" : "text-red-400"
                                        }`}>
                                          {record.invoice.payment_status}
                                        </span>
                                      </div>
                                      {record.invoice.payment_method && (
                                        <div className="flex justify-between">
                                          <span className="text-slate-500">Method</span>
                                          <span className="text-white font-semibold uppercase">{record.invoice.payment_method}</span>
                                        </div>
                                      )}
                                      {record.invoice.paid_date && (
                                        <div className="flex justify-between">
                                          <span className="text-slate-500">Paid On</span>
                                          <span className="text-white font-semibold">
                                            {new Date(record.invoice.paid_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* No job order or invoice */}
                                {!record.job_order && !record.invoice && (
                                  <div className="sm:col-span-2 bg-slate-800/40 rounded-xl p-4 border border-slate-700/20 flex items-center gap-3">
                                    <Package size={16} className="text-slate-600" />
                                    <p className="text-slate-500 text-xs">No detailed job order or invoice available for this service.</p>
                                  </div>
                                )}
                              </div>

                              {/* Notes */}
                              {record.notes && (
                                <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/20">
                                  <p className="text-xs text-slate-500 font-semibold mb-1">Notes</p>
                                  <p className="text-xs text-slate-400">{record.notes}</p>
                                </div>
                              )}
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

export default ServiceHistoryModal;
