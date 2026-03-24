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
  Hammer
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
  { id: "oil_change", label: "Oil Change", icon: Droplet, desc: "Full synthetic or conventional oil change", color: "text-orange-500" },
  { id: "brake_service", label: "Brake Service", icon: Wrench, desc: "Brake pad replacement and inspection", color: "text-gray-300" },
  { id: "tire_replacement", label: "Tire Replacement", icon: CircleDashed, desc: "Tire mounting, balancing, and alignment", color: "text-gray-400" },
  { id: "engine_diagnostic", label: "Engine Diagnostic", icon: Settings, desc: "Full engine scan and diagnosis", color: "text-blue-400" },
  { id: "general_maintenance", label: "General Maintenance", icon: Hammer, desc: "Routine checkup and maintenance", color: "text-yellow-500" },
  { id: "custom_work", label: "Custom Work", icon: Sparkles, desc: "Custom modifications and upgrades", color: "text-purple-400" },
];

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
];

const STEPS = ["Service", "Mechanic", "Date & Time", "Confirm"];

const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  isOpen,
  onClose,
}) => {
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

  // Fetch mechanics
  useEffect(() => {
    if (isOpen) {
      fetchMechanics();
    }
  }, [isOpen]);

  // Reset on close
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
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email")
        .eq("role", "mechanic");
      if (error) throw error;
      setMechanics(data || []);
    } catch (err) {
      console.error("Error fetching mechanics:", err);
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
      const { error } = await supabase.from("appointments").insert([
        {
          customer_id: user.id,
          scheduled_date: selectedDate,
          scheduled_time: selectedTime,
          service_type: serviceLabel,
          description: `${vehicleInfo} - ${serviceLabel}`,
          status: "pending",
          mechanic_id: selectedMechanic || null,
          notes: notes || null,
        },
      ]);
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      console.error("Error booking appointment:", err);
      alert("Failed to book appointment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Generate dates for the next 14 days
  const getAvailableDates = () => {
    const dates = [];
    for (let i = 1; i <= 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      if (d.getDay() !== 0) { // Skip Sundays
        dates.push(d.toISOString().split("T")[0]);
      }
    }
    return dates;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return {
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.getDate(),
      month: d.toLocaleDateString("en-US", { month: "short" }),
    };
  };

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
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-slate-700 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <h2 className="text-2xl font-black text-white font-display uppercase tracking-widest">
              {success ? "🎉 BOOKED!" : "BOOK APPOINTMENT"}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {!success ? (
            <>
              {/* Step Indicator */}
              <div className="flex items-center justify-center gap-1 px-6 py-4 border-b border-slate-700/50">
                {STEPS.map((step, i) => (
                  <React.Fragment key={step}>
                    <button
                      onClick={() => { if (i < currentStep) setCurrentStep(i); }}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        i === currentStep
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                          : i < currentStep
                            ? "bg-green-600/30 text-green-400 cursor-pointer hover:bg-green-600/40"
                            : "bg-slate-700 text-slate-500"
                      }`}
                    >
                      {i < currentStep ? "✓" : i + 1}. {step}
                    </button>
                    {i < STEPS.length - 1 && (
                      <ChevronRight size={14} className="text-slate-600" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Step Content */}
              <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 220px)" }}>
                <AnimatePresence mode="wait">
                  {/* Step 1: Service */}
                  {currentStep === 0 && (
                    <motion.div key="service" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <p className="text-slate-400 mb-4">What service do you need?</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {SERVICE_TYPES.map((svc) => {
                          const Icon = svc.icon;
                          return (
                            <motion.button
                              key={svc.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setSelectedService(svc.id)}
                              className={`p-4 rounded-xl border text-left transition-all ${
                                selectedService === svc.id
                                  ? "border-blue-500 bg-blue-600/20 shadow-lg shadow-blue-600/20"
                                  : "border-slate-600 bg-slate-700/50 hover:border-slate-500"
                              }`}
                            >
                              <Icon className={`w-8 h-8 mb-3 ${svc.color || "text-blue-400"}`} />
                              <p className="text-white font-bold text-sm">{svc.label}</p>
                              <p className="text-slate-400 text-xs mt-1">{svc.desc}</p>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Mechanic */}
                  {currentStep === 1 && (
                    <motion.div key="mechanic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <p className="text-slate-400 mb-4">Choose your preferred mechanic</p>
                      {loadingMechanics ? (
                        <div className="text-center py-8">
                          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                          <p className="text-slate-400 mt-3 text-sm">Loading mechanics...</p>
                        </div>
                      ) : mechanics.length === 0 ? (
                        <p className="text-slate-400 text-center py-8">No mechanics available at the moment.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {mechanics.map((mech) => (
                            <motion.button
                              key={mech.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setSelectedMechanic(mech.id)}
                              className={`p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${
                                selectedMechanic === mech.id
                                  ? "border-blue-500 bg-blue-600/20 shadow-lg shadow-blue-600/20"
                                  : "border-slate-600 bg-slate-700/50 hover:border-slate-500"
                              }`}
                            >
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-lg">
                                  {mech.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-bold">{mech.name}</p>
                                <p className="text-slate-400 text-xs">{mech.email}</p>
                              </div>
                              {selectedMechanic === mech.id && (
                                <CheckCircle size={20} className="text-blue-400 ml-auto" />
                              )}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 3: Date & Time */}
                  {currentStep === 2 && (
                    <motion.div key="datetime" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <p className="text-slate-400 mb-4">Pick a date</p>
                      <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
                        {getAvailableDates().map((date) => {
                          const f = formatDate(date);
                          return (
                            <motion.button
                              key={date}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedDate(date)}
                              className={`flex-shrink-0 w-16 py-3 rounded-xl border text-center transition-all ${
                                selectedDate === date
                                  ? "border-blue-500 bg-blue-600/20 shadow-lg shadow-blue-600/20"
                                  : "border-slate-600 bg-slate-700/50 hover:border-slate-500"
                              }`}
                            >
                              <p className="text-slate-400 text-xs">{f.day}</p>
                              <p className="text-white font-bold text-lg">{f.date}</p>
                              <p className="text-slate-400 text-xs">{f.month}</p>
                            </motion.button>
                          );
                        })}
                      </div>

                      <p className="text-slate-400 mb-3">Pick a time</p>
                      <div className="grid grid-cols-5 gap-2">
                        {TIME_SLOTS.map((time) => (
                          <motion.button
                            key={time}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedTime(time)}
                            className={`py-2.5 rounded-lg border text-sm font-semibold transition-all ${
                              selectedTime === time
                                ? "border-blue-500 bg-blue-600/20 text-blue-400 shadow-lg shadow-blue-600/20"
                                : "border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500"
                            }`}
                          >
                            {formatTime(time)}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Confirm */}
                  {currentStep === 3 && (
                    <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <p className="text-slate-400 mb-4">Review and confirm your booking</p>

                      {/* Summary */}
                      <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600 mb-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <Wrench size={16} className="text-blue-400" />
                          <span className="text-slate-400 text-sm">Service:</span>
                          <span className="text-white font-semibold text-sm">
                            {SERVICE_TYPES.find((s) => s.id === selectedService)?.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <User size={16} className="text-blue-400" />
                          <span className="text-slate-400 text-sm">Mechanic:</span>
                          <span className="text-white font-semibold text-sm">
                            {mechanics.find((m) => m.id === selectedMechanic)?.name || "Any available"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar size={16} className="text-blue-400" />
                          <span className="text-slate-400 text-sm">Date:</span>
                          <span className="text-white font-semibold text-sm">{selectedDate}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock size={16} className="text-blue-400" />
                          <span className="text-slate-400 text-sm">Time:</span>
                          <span className="text-white font-semibold text-sm">{formatTime(selectedTime)}</span>
                        </div>
                      </div>

                      {/* Vehicle Info */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-slate-400 mb-1 block">Vehicle (Make / Model) *</label>
                          <input
                            type="text"
                            value={vehicleInfo}
                            onChange={(e) => setVehicleInfo(e.target.value)}
                            placeholder="e.g. Honda Click 150i"
                            className="w-full bg-slate-700/50 text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none transition text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-400 mb-1 block">Notes (optional)</label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any additional details..."
                            rows={2}
                            className="w-full bg-slate-700/50 text-white px-4 py-2.5 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none transition text-sm resize-none"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer with Nav Buttons */}
              <div className="flex items-center justify-between p-6 border-t border-slate-700">
                <button
                  onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : onClose()}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition text-sm font-semibold"
                >
                  <ChevronLeft size={16} />
                  {currentStep > 0 ? "Back" : "Cancel"}
                </button>

                {currentStep < STEPS.length - 1 ? (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!canGoNext()}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg transition text-sm font-semibold ${
                      canGoNext()
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30"
                        : "bg-slate-700 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!canGoNext() || submitting}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg transition text-sm font-semibold ${
                      canGoNext() && !submitting
                        ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30"
                        : "bg-slate-700 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    {submitting ? "Booking..." : "Confirm Booking"}
                    <CheckCircle size={16} />
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Success State */
            <div className="p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle size={40} className="text-green-400" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">Appointment Booked!</h3>
              <p className="text-slate-400 mb-6">
                Your appointment has been scheduled. You'll receive a confirmation soon.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
              >
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
