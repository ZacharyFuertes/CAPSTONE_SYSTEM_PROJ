import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Wrench,
  Calendar,
  Clock,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  User,
  Droplet,
  Settings,
  CircleDashed,
  Sparkles,
  Hammer,
  Car,
  FileText,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../services/supabaseClient";

interface Mechanic {
  id: string;
  name: string;
  email: string;
}

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SERVICE_TYPES = [
  { id: "oil_change", label: "Oil Change", icon: Droplet, desc: "Full synthetic or conventional oil change", color: "from-orange-500 to-amber-600" },
  { id: "brake_service", label: "Brake Service", icon: Wrench, desc: "Brake pad replacement and inspection", color: "from-slate-400 to-slate-500" },
  { id: "tire_replacement", label: "Tire Replacement", icon: CircleDashed, desc: "Tire mounting, balancing, and alignment", color: "from-blue-500 to-blue-600" },
  { id: "engine_diagnostic", label: "Engine Diagnostic", icon: Settings, desc: "Full engine scan and diagnosis", color: "from-purple-500 to-purple-600" },
  { id: "general_maintenance", label: "General Maintenance", icon: Hammer, desc: "Routine checkup and maintenance", color: "from-emerald-500 to-emerald-600" },
  { id: "custom_work", label: "Custom Work", icon: Sparkles, desc: "Custom modifications and upgrades", color: "from-pink-500 to-rose-600" },
];

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
];

const STEPS = ["Service", "Mechanic", "Date & Time", "Confirm"];

const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedService, setSelectedService] = useState("");
  const [selectedMechanic, setSelectedMechanic] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [vehicleInfo, setVehicleInfo] = useState("");
  const [notes, setNotes] = useState("");
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loadingMechanics, setLoadingMechanics] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) fetchMechanics();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setCurrentStep(0);
        setSelectedService("");
        setSelectedMechanic("");
        setSelectedDate("");
        setSelectedTime("");
        setVehicleInfo("");
        setNotes("");
        setSuccess(false);
      }, 300);
    }
  }, [isOpen]);

  const fetchMechanics = async () => {
    try {
      setLoadingMechanics(true);
      const { data, error } = await supabase.from("users").select("id, name, email").eq("role", "mechanic");
      if (error) throw error;
      setMechanics(data || []);
    } catch {
      setMechanics([]);
    } finally {
      setLoadingMechanics(false);
    }
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 0: return !!selectedService;
      case 1: return !!selectedMechanic;
      case 2: return !!selectedDate && !!selectedTime;
      case 3: return !!vehicleInfo;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) return;
    try {
      setSubmitting(true);
      const serviceLabel = SERVICE_TYPES.find((s) => s.id === selectedService)?.label || selectedService;
      const { error } = await supabase.from("appointments").insert([{
        customer_id: user.id,
        scheduled_date: selectedDate,
        scheduled_time: selectedTime,
        service_type: serviceLabel,
        description: `${vehicleInfo} - ${serviceLabel}`,
        status: "pending",
        mechanic_id: selectedMechanic || null,
        notes: notes || null,
      }]);
      if (error) throw error;
      setSuccess(true);
    } catch {
      alert("Failed to book appointment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getAvailableDates = () => {
    const dates = [];
    for (let i = 1; i <= 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      if (d.getDay() !== 0) dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return { day: d.toLocaleDateString("en-US", { weekday: "short" }), date: d.getDate(), month: d.toLocaleDateString("en-US", { month: "short" }) };
  };

  const formatTime = (time: string) => {
    const hour = parseInt(time.split(":")[0]);
    return hour >= 12 ? `${hour === 12 ? 12 : hour - 12}:00 PM` : `${hour}:00 AM`;
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Calendar size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-black text-white tracking-wide">
                  {success ? "Appointment Booked!" : "Book Appointment"}
                </h2>
                <p className="text-slate-500 text-[10px] sm:text-xs hidden sm:block">Schedule your service appointment</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {!success ? (
            <>
              {/* ── Step Indicator ── */}
              <div className="flex items-center justify-start sm:justify-center gap-1 sm:gap-2 px-4 sm:px-8 py-2 sm:py-3 border-b border-slate-700/30 flex-shrink-0 overflow-x-auto">
                {STEPS.map((step, i) => (
                  <React.Fragment key={step}>
                    <button
                      onClick={() => { if (i < currentStep) setCurrentStep(i); }}
                      className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                        i === currentStep
                          ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                          : i < currentStep
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 cursor-pointer"
                            : "text-slate-600 border border-transparent"
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black ${
                        i < currentStep ? "bg-emerald-500 text-white" : i === currentStep ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-600"
                      }`}>
                        {i < currentStep ? "✓" : i + 1}
                      </span>
                      <span className="hidden sm:inline">{step}</span>
                    </button>
                    {i < STEPS.length - 1 && <ChevronRight size={12} className="text-slate-700" />}
                  </React.Fragment>
                ))}
              </div>

              {/* ── Step Content (scrollable) ── */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6">
                <AnimatePresence mode="wait">
                  {/* Step 1: Select Service */}
                  {currentStep === 0 && (
                    <motion.div key="service" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <p className="text-slate-400 text-sm mb-5">What service do you need?</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                        {SERVICE_TYPES.map((svc) => {
                          const Icon = svc.icon;
                          const isActive = selectedService === svc.id;
                          return (
                            <motion.button
                              key={svc.id}
                              whileHover={{ y: -3 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setSelectedService(svc.id)}
                              className={`relative p-3 sm:p-5 rounded-2xl border text-left transition-all overflow-hidden ${
                                isActive
                                  ? "border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                                  : "border-slate-700/30 bg-slate-800/30 hover:border-slate-600/50"
                              }`}
                            >
                              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${svc.color} flex items-center justify-center mb-2 sm:mb-3 shadow-lg`}>
                                <Icon size={18} className="text-white" />
                              </div>
                              <p className="text-white font-bold text-xs sm:text-sm mb-0.5 sm:mb-1">{svc.label}</p>
                              <p className="text-slate-500 text-[10px] sm:text-xs leading-relaxed hidden sm:block">{svc.desc}</p>
                              {isActive && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3">
                                  <CheckCircle size={18} className="text-blue-400" />
                                </motion.div>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Select Mechanic */}
                  {currentStep === 1 && (
                    <motion.div key="mechanic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <p className="text-slate-400 text-sm mb-5">Choose your preferred mechanic</p>
                      {loadingMechanics ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : mechanics.length === 0 ? (
                        <p className="text-slate-500 text-center py-12 text-sm">No mechanics available.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {mechanics.map((mech) => {
                            const isActive = selectedMechanic === mech.id;
                            return (
                              <motion.button
                                key={mech.id}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setSelectedMechanic(mech.id)}
                                className={`p-5 rounded-2xl border text-left transition-all flex items-center gap-4 ${
                                  isActive
                                    ? "border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                                    : "border-slate-700/30 bg-slate-800/30 hover:border-slate-600/50"
                                }`}
                              >
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                                  <span className="text-white font-black text-lg">{mech.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-bold text-sm truncate">{mech.name}</p>
                                  <p className="text-slate-500 text-xs truncate">{mech.email}</p>
                                </div>
                                {isActive && <CheckCircle size={18} className="text-blue-400 flex-shrink-0" />}
                              </motion.button>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 3: Date & Time */}
                  {currentStep === 2 && (
                    <motion.div key="datetime" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <p className="text-slate-400 text-sm mb-4">Pick a date</p>
                      <div className="flex gap-2.5 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                        {getAvailableDates().map((date) => {
                          const f = formatDate(date);
                          const isActive = selectedDate === date;
                          return (
                            <motion.button
                              key={date}
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedDate(date)}
                              className={`flex-shrink-0 w-[68px] py-3 rounded-2xl border text-center transition-all ${
                                isActive
                                  ? "border-blue-500/50 bg-blue-500/15 shadow-lg shadow-blue-500/10"
                                  : "border-slate-700/30 bg-slate-800/30 hover:border-slate-600/50"
                              }`}
                            >
                              <p className={`text-[10px] font-semibold ${isActive ? "text-blue-400" : "text-slate-500"}`}>{f.day}</p>
                              <p className={`text-xl font-black ${isActive ? "text-white" : "text-slate-300"}`}>{f.date}</p>
                              <p className={`text-[10px] ${isActive ? "text-blue-400" : "text-slate-500"}`}>{f.month}</p>
                            </motion.button>
                          );
                        })}
                      </div>

                      <p className="text-slate-400 text-sm mb-3">Pick a time</p>
                      <div className="grid grid-cols-5 sm:grid-cols-5 gap-2 sm:gap-2.5">
                        {TIME_SLOTS.map((time) => {
                          const isActive = selectedTime === time;
                          return (
                            <motion.button
                              key={time}
                              whileHover={{ y: -1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedTime(time)}
                              className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                                isActive
                                  ? "border-blue-500/50 bg-blue-500/15 text-blue-400 shadow-lg shadow-blue-500/10"
                                  : "border-slate-700/30 bg-slate-800/30 text-slate-400 hover:border-slate-600/50"
                              }`}
                            >
                              {formatTime(time)}
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Confirm */}
                  {currentStep === 3 && (
                    <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <p className="text-slate-400 text-sm mb-5">Review and confirm your booking</p>

                      <div className="bg-slate-800/40 rounded-2xl p-5 border border-slate-700/30 mb-5 space-y-3">
                        <div className="flex items-center gap-3">
                          <Wrench size={15} className="text-blue-400" />
                          <span className="text-slate-500 text-sm w-20">Service</span>
                          <span className="text-white font-semibold text-sm">{SERVICE_TYPES.find((s) => s.id === selectedService)?.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <User size={15} className="text-blue-400" />
                          <span className="text-slate-500 text-sm w-20">Mechanic</span>
                          <span className="text-white font-semibold text-sm">{mechanics.find((m) => m.id === selectedMechanic)?.name || "Any"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar size={15} className="text-blue-400" />
                          <span className="text-slate-500 text-sm w-20">Date</span>
                          <span className="text-white font-semibold text-sm">{selectedDate}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock size={15} className="text-blue-400" />
                          <span className="text-slate-500 text-sm w-20">Time</span>
                          <span className="text-white font-semibold text-sm">{formatTime(selectedTime)}</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-slate-500 mb-1.5 flex items-center gap-1.5 font-semibold">
                            <Car size={12} /> Vehicle (Make / Model) *
                          </label>
                          <input
                            type="text"
                            value={vehicleInfo}
                            onChange={(e) => setVehicleInfo(e.target.value)}
                            placeholder="e.g. Honda Click 150i"
                            className="w-full bg-slate-800/40 text-white px-4 py-3 rounded-xl border border-slate-700/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition text-sm placeholder-slate-600"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 mb-1.5 flex items-center gap-1.5 font-semibold">
                            <FileText size={12} /> Notes (optional)
                          </label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any additional details..."
                            rows={2}
                            className="w-full bg-slate-800/40 text-white px-4 py-3 rounded-xl border border-slate-700/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition text-sm resize-none placeholder-slate-600"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Footer ── */}
              <div className="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 border-t border-slate-700/30 flex-shrink-0">
                <button
                  onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : onClose()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 rounded-xl transition text-sm font-semibold border border-slate-700/30"
                >
                  <ChevronLeft size={16} />
                  {currentStep > 0 ? "Back" : "Cancel"}
                </button>
                {currentStep < STEPS.length - 1 ? (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!canGoNext()}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition text-sm font-bold ${
                      canGoNext()
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25"
                        : "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700/30"
                    }`}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!canGoNext() || submitting}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition text-sm font-bold ${
                      canGoNext() && !submitting
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25"
                        : "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700/30"
                    }`}
                  >
                    {submitting ? "Booking..." : "Confirm Booking"} <CheckCircle size={16} />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
                className="w-20 h-20 bg-emerald-500/15 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30">
                <CheckCircle size={36} className="text-emerald-400" />
              </motion.div>
              <h3 className="text-2xl font-black text-white mb-2">Appointment Booked!</h3>
              <p className="text-slate-500 mb-8 text-sm text-center max-w-sm">Your appointment has been scheduled. You'll receive a confirmation soon.</p>
              <button onClick={onClose} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition text-sm shadow-lg shadow-blue-600/25">
                Done
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookAppointmentModal;
