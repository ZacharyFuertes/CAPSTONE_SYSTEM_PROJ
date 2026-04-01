import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Lock, Info, Wrench } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../services/supabaseClient";
import { Appointment, AppointmentStatus } from "../types";

interface Mechanic {
  id: string;
  name: string;
  email: string;
}

const statusConfig: Record<
  AppointmentStatus,
  { color: string; label: string }
> = {
  pending: {
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    label: "Pending",
  },
  confirmed: {
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    label: "Confirmed",
  },
  in_progress: {
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    label: "In Progress",
  },
  completed: {
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    label: "Completed",
  },
  cancelled: {
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    label: "Cancelled",
  },
};

interface AppointmentCalendarPageProps {
  onNavigate?: (page: string) => void;
}

const AppointmentCalendarPage: React.FC<AppointmentCalendarPageProps> = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [loadingMechanics, setLoadingMechanics] = useState(false);
  const fetchAbortRef = React.useRef<AbortController | null>(null);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    vehicle_make: "",
    service_type: "Oil Change",
    mechanic_id: "",
  });

  // Fetch appointments from Supabase
  const fetchAppointments = async () => {
    // Cancel any previous fetch
    if (fetchAbortRef.current) {
      fetchAbortRef.current.abort();
    }

    // Create new abort controller for this fetch
    fetchAbortRef.current = new AbortController();

    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
            *,
            customer:users!customer_id (name, phone)
          `)
        .order("scheduled_date", { ascending: true });

      if (fetchAbortRef.current?.signal.aborted) return;

      if (error) throw error;

      setAppointments(data || []);
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      console.error("Error fetching appointments:", err);
      if (!fetchAbortRef.current?.signal.aborted) {
        setAppointments([]);
      }
    }
  };

  useEffect(() => {
    fetchAppointments();

    // Cleanup: abort fetch if component unmounts
    return () => {
      if (fetchAbortRef.current) {
        fetchAbortRef.current.abort();
      }
    };
  }, []);

  // Fetch available mechanics when booking form opens
  useEffect(() => {
    if (showBookingForm && mechanics.length === 0) {
      fetchMechanics();
    }
  }, [showBookingForm]);

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
      setMechanics([]);
    } finally {
      setLoadingMechanics(false);
    }
  };

  // Filter appointments based on user role
  const getFilteredAppointments = (): Appointment[] => {
    if (user?.role === "owner") {
      // Owners and admins see all appointments
      return appointments;
    } else if (user?.role === "mechanic") {
      // Mechanics see only appointments assigned to them
      return appointments.filter((apt) => apt.mechanic_id === user.id);
    } else if (user?.role === "customer") {
      // Customers see only their own appointments
      return appointments.filter((apt) => apt.customer_id === user.id);
    }
    return [];
  };

  const filteredAppointments = getFilteredAppointments();

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendarDays = () => {
    const date = new Date();
    const daysInMonth = getDaysInMonth(date);
    const firstDay = getFirstDayOfMonth(date);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const handleStatusChange = async (
    appointmentId: string,
    newStatus: AppointmentStatus,
  ) => {
    // Only owners/admins and mechanics can change status
    if (user?.role === "owner" || user?.role === "mechanic") {
      try {
        const { error } = await supabase
          .from("appointments")
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq("id", appointmentId);

        if (error) throw error;

        setAppointments(
          appointments.map((apt) =>
            apt.id === appointmentId
              ? {
                  ...apt,
                  status: newStatus,
                  updated_at: new Date().toISOString(),
                }
              : apt,
          ),
        );
      } catch (err) {
        console.error("Error updating appointment status:", err);
        alert("Failed to update status. Please try again.");
      }
    }
  };

  const handleBookAppointment = async () => {
    if (
      !selectedSlot ||
      !formData.customer_name ||
      !formData.customer_phone ||
      !formData.vehicle_make
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      // For customers, use their authenticated user ID
      // For admins/owners booking on behalf, generate a new customer record
      const customerId = user?.role === "customer" ? user.id : undefined;

      const appointmentData = {
        customer_id: customerId,
        vehicle_id: undefined, // We'll need to create this or select existing
        scheduled_date: selectedDate,
        scheduled_time: selectedSlot,
        service_type: formData.service_type,
        description: `${formData.vehicle_make} - ${formData.service_type}`,
        status: "pending",
        notes: `Customer: ${formData.customer_name}, Phone: ${formData.customer_phone}`,
        mechanic_id: formData.mechanic_id || null,
      };

      // Save to database
      const { data, error } = await supabase
        .from("appointments")
        .insert([appointmentData])
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setAppointments([...appointments, data]);
      setShowBookingForm(false);
      setFormData({
        customer_name: "",
        customer_phone: "",
        vehicle_make: "",
        service_type: "Oil Change",
        mechanic_id: "",
      });
      setSelectedSlot(null);

      // Show success message
      alert("Appointment booked successfully!");
    } catch (err) {
      console.error("Error booking appointment:", err);
      alert("Failed to book appointment. Please try again.");
    }
  };

  const calendarDays = renderCalendarDays();
  const isOwner = user?.role === "owner";
  const isMechanic = user?.role === "mechanic";
  const isCustomer = user?.role === "customer";
  const canBookAppointments = isOwner || isCustomer;
  const canUpdateStatus = isOwner || isMechanic;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative w-full pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-800 to-transparent">
        <div className="max-w-6xl mx-auto">
          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-8 h-8 text-moto-accent" />
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white">
                Your <span className="text-moto-accent">Appointments</span>
              </h1>
            </div>
            <p className="text-lg text-slate-300 max-w-2xl">
              Schedule service appointments, track your booking status, and
              select your preferred mechanic. Professional service at your
              convenience.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Role Info Banner */}
          {isMechanic && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3"
            >
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-300 mb-1">
                  Mechanic View
                </h3>
                <p className="text-blue-200 text-sm">
                  You can only see appointments assigned to you. Update
                  appointment status to track service progress.
                </p>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar with Calendar and Booking */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1 space-y-6"
            >
              {/* Calendar Card */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-6 border border-slate-600">
                <h2 className="text-lg font-bold text-white mb-4">Calendar</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <div
                          key={day}
                          className="text-xs font-semibold text-slate-400 py-2"
                        >
                          {day.slice(0, 1)}
                        </div>
                      ),
                    )}
                    {calendarDays.map((day, index) => (
                      <motion.button
                        key={index}
                        whileHover={day !== null ? { scale: 1.1 } : {}}
                        onClick={() => {
                          if (day) {
                            const newDate = new Date();
                            newDate.setDate(day);
                            setSelectedDate(
                              newDate.toISOString().split("T")[0],
                            );
                          }
                        }}
                        className={`p-2 rounded text-sm transition font-medium ${
                          day === null
                            ? ""
                            : selectedDate.endsWith(
                                  `-${String(day).padStart(2, "0")}`,
                                )
                              ? "bg-gradient-to-br from-moto-accent to-moto-accent-dark text-white font-bold shadow-lg shadow-moto-accent/50"
                              : "hover:bg-slate-600 text-slate-300"
                        }`}
                      >
                        {day}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Book Button */}
              {canBookAppointments ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowBookingForm(true)}
                  className="w-full bg-gradient-to-r from-moto-accent to-moto-accent-dark hover:shadow-lg hover:shadow-moto-accent/50 text-white font-bold py-3 rounded-lg transition-all"
                >
                  {t("appointments.new")}
                </motion.button>
              ) : (
                <button
                  disabled
                  className="w-full bg-slate-600 text-slate-400 font-semibold py-3 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                  title="Only owners and customers can book appointments"
                >
                  <Lock className="w-4 h-4" />
                  {t("appointments.new")}
                </button>
              )}
            </motion.div>

            {/* Appointments List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3"
            >
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-6 border border-slate-600">
                <h2 className="text-xl font-bold text-white mb-6">
                  📅 {selectedDate}
                </h2>

                {filteredAppointments.filter(
                  (apt) => apt.scheduled_date === selectedDate,
                ).length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">
                      No appointments scheduled for this date
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {filteredAppointments
                        .filter((apt) => apt.scheduled_date === selectedDate)
                        .map((apt, index) => (
                          <motion.div
                            key={apt.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ x: 4 }}
                            className="bg-slate-700/50 hover:bg-slate-700 rounded-lg p-5 border border-slate-600 hover:border-moto-accent/30 transition-all cursor-pointer"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                  <span className="text-xl font-bold text-moto-accent">
                                    {apt.scheduled_time}
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full font-semibold ${statusConfig[apt.status].color}`}
                                  >
                                    {statusConfig[apt.status].label}
                                  </span>
                                </div>
                                <p className="text-white font-semibold mb-1">
                                  {apt.service_type}
                                </p>
                                {(apt as any).customer && (apt as any).customer.name && (
                                  <p className="text-indigo-300 text-sm font-semibold mt-1">
                                    Customer: {(apt as any).customer.name} {(apt as any).customer.phone ? `(${(apt as any).customer.phone})` : ''}
                                  </p>
                                )}
                                <p className="text-slate-300 text-sm mt-1">
                                  {apt.notes}
                                </p>
                              </div>
                              {canUpdateStatus && (
                                <select
                                  value={apt.status}
                                  onChange={(e) =>
                                    handleStatusChange(
                                      apt.id,
                                      e.target.value as AppointmentStatus,
                                    )
                                  }
                                  className="ml-4 bg-slate-600 text-white text-sm px-2 py-1 rounded border border-slate-500 hover:border-moto-accent/50 focus:border-moto-accent focus:outline-none transition-colors"
                                >
                                  {Object.entries(statusConfig).map(
                                    ([status, config]) => (
                                      <option key={status} value={status}>
                                        {config.label}
                                      </option>
                                    ),
                                  )}
                                </select>
                              )}
                            </div>
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Booking Form Modal */}
      <AnimatePresence>
        {showBookingForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700"
            >
              <h3 className="text-2xl font-bold text-white mb-6">
                Book New Appointment
              </h3>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={formData.customer_name}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_name: e.target.value })
                  }
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.customer_phone}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_phone: e.target.value })
                  }
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Vehicle (Make/Model)"
                  value={formData.vehicle_make}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicle_make: e.target.value })
                  }
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
                <select
                  value={formData.service_type}
                  onChange={(e) =>
                    setFormData({ ...formData, service_type: e.target.value })
                  }
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                >
                  <option>Oil Change</option>
                  <option>Brake Service</option>
                  <option>Tire Replacement</option>
                  <option>Engine Diagnostic</option>
                  <option>General Maintenance</option>
                  <option>Custom Work</option>
                </select>

                {/* Mechanic Selection */}
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <label className="flex items-center gap-2 text-white font-semibold mb-3">
                    <Wrench className="w-4 h-4" />
                    Assign Mechanic
                  </label>
                  {loadingMechanics ? (
                    <p className="text-slate-400 text-sm">
                      Loading mechanics...
                    </p>
                  ) : mechanics.length === 0 ? (
                    <p className="text-slate-400 text-sm">
                      No mechanics available
                    </p>
                  ) : (
                    <select
                      value={formData.mechanic_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mechanic_id: e.target.value,
                        })
                      }
                      className="w-full bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select a mechanic (optional)</option>
                      {mechanics.map((mechanic) => (
                        <option key={mechanic.id} value={mechanic.id}>
                          {mechanic.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {selectedSlot && (
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-blue-400 font-semibold">
                      Selected: {selectedDate} at {selectedSlot}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowBookingForm(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded transition"
                >
                  {t("form.cancel")}
                </button>
                <button
                  onClick={handleBookAppointment}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
                >
                  {t("form.submit")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppointmentCalendarPage;
