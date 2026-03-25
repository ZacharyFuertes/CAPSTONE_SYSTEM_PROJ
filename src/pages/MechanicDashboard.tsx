import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  CheckCircle,
  Clock,
  Users,
  Wrench,
  LayoutDashboard,
  Calendar,
  Package,
  LogOut,
  Globe,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../services/supabaseClient";

interface PerformanceMetric {
  label: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color: string;
}

interface JobOrder {
  id: string;
  title: string;
  status: string;
  created_at: string;
  customer_id: string;
  vehicle_id: string;
  customer_name?: string;
  customer_contact?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_plate?: string;
  completed_at?: string;
}

interface Appointment {
  id: string;
  customer_id: string;
  customer_name: string;
  date: string;
  time: string;
  status: string;
  notes?: string;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  max_stock: number;
}

const MechanicDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Performance data
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [performanceData, setPerformanceData] = useState<
    { date: string; completed: number; rated: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Tabs data
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  // Fetch all mechanic data
  useEffect(() => {
    const fetchAllData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Fetch job orders with customer and vehicle info
        const { data: jobs } = await supabase
          .from("job_orders")
          .select(
            `
            id,
            title,
            status,
            created_at,
            completed_at,
            customer_id,
            vehicle_id,
            customer:users!customer_id (name, phone),
            vehicle:vehicles!vehicle_id (make, model, plate_number)
          `,
          )
          .eq("mechanic_id", user.id)
          .order("created_at", { ascending: false });

        // Fetch appointments for this mechanic
        const { data: appts } = await supabase
          .from("appointments")
          .select(
            `
            id,
            scheduled_date,
            scheduled_time,
            status,
            customer:users!customer_id (name)
          `,
          )
          .eq("mechanic_id", user.id)
          .gte("scheduled_date", new Date().toISOString().split("T")[0])
          .order("scheduled_date", { ascending: true });

        // Fetch inventory (read-only)
        const { data: inv } = await supabase
          .from("inventory")
          .select(
            `
            id,
            part_name,
            quantity_on_hand,
            unit_of_measure,
            reorder_level
          `,
          )
          .gt("quantity_on_hand", 0)
          .order("part_name", { ascending: true });

        // Format job orders
        const formattedJobs: JobOrder[] =
          jobs?.map((job: any) => ({
            id: job.id,
            title: job.title,
            status: job.status,
            created_at: job.created_at,
            customer_id: job.customer_id,
            vehicle_id: job.vehicle_id,
            completed_at: job.completed_at,
            customer_name: job.customer?.name,
            customer_contact: job.customer?.phone,
            vehicle_make: job.vehicle?.make,
            vehicle_model: job.vehicle?.model,
            vehicle_plate: job.vehicle?.plate_number,
          })) || [];

        // Format appointments
        const formattedAppts: Appointment[] =
          appts?.map((appt: any) => ({
            id: appt.id,
            customer_id: appt.customer_id,
            customer_name: appt.customer?.name || "Unknown Customer",
            date: appt.scheduled_date,
            time: appt.scheduled_time,
            status: appt.status,
          })) || [];

        // Format inventory
        const formattedInv: InventoryItem[] =
          inv?.map((item: any) => ({
            id: item.id,
            name: item.part_name,
            quantity: item.quantity_on_hand,
            unit: item.unit_of_measure || "units",
            max_stock: item.reorder_level * 2 || 50,
          })) || [];

        setJobOrders(formattedJobs);
        setAppointments(formattedAppts);
        setInventory(formattedInv);

        // Calculate metrics from jobs + appointments combined
        const completedJobs = formattedJobs.filter(
          (j) => j.status === "completed",
        );
        const pendingJobs = formattedJobs.filter((j) => j.status === "pending");
        const inProgressJobs = formattedJobs.filter(
          (j) => j.status === "in_progress",
        );

        // Also count appointments as pending/total work
        const pendingAppts = formattedAppts.filter((a) => a.status === "pending" || a.status === "confirmed");
        const completedAppts = formattedAppts.filter((a) => a.status === "completed");

        const totalCustomers = new Set([
          ...formattedJobs.map((j) => j.customer_id),
          ...formattedAppts.map((a) => a.customer_id),
        ]).size;

        // Build performance metrics (combining jobs + appointments)
        const newMetrics: PerformanceMetric[] = [
          {
            label: "Total Jobs",
            value: formattedJobs.length + formattedAppts.length,
            icon: <Wrench className="w-6 h-6" />,
            color: "bg-blue-500",
          },
          {
            label: "Pending",
            value: pendingJobs.length + pendingAppts.length,
            icon: <AlertCircle className="w-6 h-6" />,
            color: "bg-yellow-500",
          },
          {
            label: "In Progress",
            value: inProgressJobs.length,
            icon: <Clock className="w-6 h-6" />,
            color: "bg-blue-500",
          },
          {
            label: "Completed",
            value: completedJobs.length + completedAppts.length,
            icon: <CheckCircle className="w-6 h-6" />,
            color: "bg-green-500",
          },
          {
            label: "Customers Served",
            value: totalCustomers,
            icon: <Users className="w-6 h-6" />,
            color: "bg-pink-500",
          },
          {
            label: "Upcoming Appts",
            value: formattedAppts.length,
            icon: <Calendar className="w-6 h-6" />,
            color: "bg-blue-400",
          },
        ];

        setMetrics(newMetrics);

        // Build performance trend data from last 7 days
        const last7Days: { date: string; completed: number; rated: number }[] =
          [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          const jobsCompletedOnDate = formattedJobs.filter((job) => {
            if (!job.completed_at) return false;
            const jobDate = new Date(job.completed_at);
            return (
              jobDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }) === dateStr && job.status === "completed"
            );
          }).length;

          last7Days.push({
            date: dateStr,
            completed: jobsCompletedOnDate,
            rated: jobsCompletedOnDate,
          });
        }
        setPerformanceData(last7Days);
      } catch (error) {
        console.error("Error fetching mechanic data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [user?.id]);

  // Update job status
  const updateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      setStatusUpdating(jobId);
      const updateData: any = { status: newStatus };

      if (newStatus === "completed") {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("job_orders")
        .update(updateData)
        .eq("id", jobId);

      if (error) throw error;

      // Refresh data
      setJobOrders(
        jobOrders.map((job) =>
          job.id === jobId
            ? {
                ...job,
                status: newStatus,
                completed_at:
                  newStatus === "completed"
                    ? new Date().toISOString()
                    : job.completed_at,
              }
            : job,
        ),
      );
    } catch (error) {
      console.error("Error updating job status:", error);
      alert("Failed to update job status");
    } finally {
      setStatusUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-50"></div>
      </div>
    );
  }

  const navItems = [
    { id: "dashboard", label: "DASHBOARD", icon: LayoutDashboard },
    { id: "jobs", label: "JOBS", icon: Wrench },
    { id: "appointments", label: "APPOINTMENTS", icon: Calendar },
    { id: "inventory", label: "INVENTORY", icon: Package },
  ];

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Left Sidebar */}
      <div className="w-56 bg-gradient-to-b from-slate-800 to-slate-900 text-white fixed h-screen left-0 top-0 flex flex-col overflow-y-auto border-r border-slate-700">
        {/* Logo Section */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h2 className="text-sm font-black text-white">MOTOSHOP</h2>
              <p className="text-xs text-slate-400">Mechanic Dashboard</p>
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mb-2">
              <span className="text-white font-bold text-xl">
                {user?.name?.[0] || "M"}
              </span>
            </div>
            <h3 className="font-bold text-sm text-white">
              {user?.name || "Mechanic"}
            </h3>
            <p className="text-slate-400 text-xs mt-1 break-all">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm font-semibold ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                    : "text-slate-300 hover:text-white hover:bg-slate-700"
                }`}
                whileHover={{ x: 4 }}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* Language Toggle */}
        <div className="p-3 border-t border-slate-700">
          <motion.button
            onClick={() => setLanguage(language === "en" ? "tl" : "en")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            whileHover={{ scale: 1.05 }}
            title={
              language === "en" ? "Switch to Tagalog" : "Switch to English"
            }
          >
            <Globe className="w-4 h-4" />
            <span className="text-xs font-semibold">
              {language.toUpperCase()}
            </span>
          </motion.button>
        </div>

        {/* Logout Button */}
        <div className="p-3 border-t border-slate-700">
          <motion.button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 transition font-semibold rounded-lg border border-red-600/30"
            whileHover={{ scale: 1.05 }}
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs">LOGOUT</span>
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-56 w-full">
        <div className="min-h-screen bg-slate-900 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Dashboard Tab Content */}
            {activeTab === "dashboard" && (
              <>
                {/* Header */}
                <motion.div
                  className="mb-12"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h1 className="text-5xl font-black text-white mb-2">
                    MY <span className="text-blue-500">PERFORMANCE</span>
                  </h1>
                  <p className="text-slate-400 text-lg">
                    Track your work, ratings, and customer satisfaction
                  </p>
                </motion.div>

                {/* Key Metrics Grid */}
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {metrics.map((metric, idx) => (
                    <motion.div
                      key={idx}
                      className="relative rounded-lg p-5 overflow-hidden cursor-pointer transition-all shadow-md"
                      style={{
                        background:
                          idx === 0
                            ? "linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)"
                            : idx === 1
                              ? "linear-gradient(135deg, #10B981 0%, #065F46 100%)"
                              : idx === 2
                                ? "linear-gradient(135deg, #FBBF24 0%, #B45309 100%)"
                                : idx === 3
                                  ? "linear-gradient(135deg, #A855F7 0%, #6B21A8 100%)"
                                  : idx === 4
                                    ? "linear-gradient(135deg, #EC4899 0%, #831843 100%)"
                                    : "linear-gradient(135deg, #60A5FA 0%, #1E3A8A 100%)",
                      }}
                      whileHover={{ y: -8 }}
                    >
                      <div className="flex items-start justify-between h-full">
                        <div>
                          <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-4">
                            {metric.label}
                          </p>
                          <p className="text-white text-4xl font-black">
                            {metric.value}
                          </p>
                        </div>
                        <div className="text-white/40 mt-2">{metric.icon}</div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Performance Trend */}
                  <motion.div
                    className="bg-slate-800/50 border border-slate-700 rounded-lg p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="text-white font-black text-lg mb-6 uppercase tracking-wide">
                      Last 7 Days Performance
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#404856" />
                        <XAxis dataKey="date" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1E293B",
                            border: "1px solid #404856",
                          }}
                          labelStyle={{ color: "#F3F4F6" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="completed"
                          stroke="#FF6B35"
                          strokeWidth={3}
                          dot={{ fill: "#FF6B35" }}
                          name="Jobs Completed"
                        />
                        <Line
                          type="monotone"
                          dataKey="rated"
                          stroke="#4ECDC4"
                          strokeWidth={3}
                          dot={{ fill: "#4ECDC4" }}
                          name="Rated"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </motion.div>

                  {/* Customer Ratings */}
                  <motion.div
                    className="bg-slate-800/50 border border-slate-700 rounded-lg p-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h2 className="text-white font-black text-lg mb-6 uppercase tracking-wide">
                      Customer Ratings
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#404856" />
                        <XAxis dataKey="date" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1E293B",
                            border: "1px solid #404856",
                          }}
                          labelStyle={{ color: "#F3F4F6" }}
                        />
                        <Bar dataKey="rated" fill="#60A5FA" name="Ratings" />
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>
                </div>
              </>
            )}

            {/* Jobs Tab Content */}
            {activeTab === "jobs" && (
              <motion.div
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h2 className="text-white font-black text-3xl mb-6">MY JOBS</h2>
                {jobOrders.length === 0 ? (
                  <div className="text-slate-400 text-center py-12">
                    No jobs assigned yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {jobOrders.map((job) => (
                      <div
                        key={job.id}
                        className="bg-slate-700/50 rounded-lg p-6 border border-slate-600"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          {/* Job Title and Details */}
                          <div className="md:col-span-2">
                            <h3 className="text-white font-bold text-lg">
                              {job.title}
                            </h3>
                            <p className="text-slate-400 text-sm mb-3">
                              Job ID: #{job.id.substring(0, 8).toUpperCase()}
                            </p>

                            {/* Customer Info */}
                            <div className="mb-2">
                              <p className="text-slate-300 text-xs font-semibold">
                                Customer
                              </p>
                              <p className="text-white text-sm">
                                {job.customer_name || "Unknown"}
                              </p>
                              {job.customer_contact && (
                                <p className="text-slate-400 text-xs">
                                  {job.customer_contact}
                                </p>
                              )}
                            </div>

                            {/* Vehicle Info */}
                            <div>
                              <p className="text-slate-300 text-xs font-semibold">
                                Vehicle
                              </p>
                              <p className="text-white text-sm">
                                {job.vehicle_make && job.vehicle_model
                                  ? `${job.vehicle_make} ${job.vehicle_model}`
                                  : "Unknown Vehicle"}
                              </p>
                              {job.vehicle_plate && (
                                <p className="text-slate-400 text-xs">
                                  Plate: {job.vehicle_plate}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Status and Actions */}
                          <div className="md:col-span-2 flex flex-col justify-between">
                            <div>
                              <p className="text-slate-300 text-xs font-semibold mb-2">
                                Status
                              </p>
                              <span
                                className={`px-4 py-2 rounded-full text-sm font-semibold inline-block ${
                                  job.status === "completed"
                                    ? "bg-green-600/30 text-green-300"
                                    : job.status === "in_progress"
                                      ? "bg-blue-600/30 text-blue-300"
                                      : "bg-yellow-600/30 text-yellow-300"
                                }`}
                              >
                                {job.status.replace(/_/g, " ").toUpperCase()}
                              </span>
                            </div>

                            {/* Status Update Buttons */}
                            {job.status !== "completed" && (
                              <div className="flex gap-2 mt-4">
                                {job.status === "pending" && (
                                  <button
                                    onClick={() =>
                                      updateJobStatus(job.id, "in_progress")
                                    }
                                    disabled={statusUpdating === job.id}
                                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
                                  >
                                    {statusUpdating === job.id
                                      ? "Updating..."
                                      : "Start Job"}
                                  </button>
                                )}
                                {job.status === "in_progress" && (
                                  <button
                                    onClick={() =>
                                      updateJobStatus(job.id, "completed")
                                    }
                                    disabled={statusUpdating === job.id}
                                    className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
                                  >
                                    {statusUpdating === job.id
                                      ? "Updating..."
                                      : "Mark Completed"}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Appointments Tab Content */}
            {activeTab === "appointments" && (
              <motion.div
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h2 className="text-white font-black text-3xl mb-6">
                  MY APPOINTMENTS
                </h2>
                {appointments.length === 0 ? (
                  <div className="text-slate-400 text-center py-12">
                    No upcoming appointments.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {appointments.map((appt) => (
                      <div
                        key={appt.id}
                        className="bg-slate-700/50 rounded-lg p-6 border border-slate-600"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-bold text-lg">
                              {appt.customer_name}
                            </h3>
                            <p className="text-slate-400 text-sm">
                              {new Date(appt.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}{" "}
                              - {appt.time}
                            </p>
                          </div>
                          <span
                            className={`px-4 py-2 rounded-full text-sm font-semibold ${
                              appt.status === "completed"
                                ? "bg-green-600/30 text-green-300"
                                : appt.status === "cancelled"
                                  ? "bg-red-600/30 text-red-300"
                                  : "bg-yellow-600/30 text-yellow-300"
                            }`}
                          >
                            {appt.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Inventory Tab Content */}
            {activeTab === "inventory" && (
              <motion.div
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="mb-6">
                  <h2 className="text-white font-black text-3xl mb-2">
                    INVENTORY
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Read-only access to parts availability
                  </p>
                </div>
                {inventory.length === 0 ? (
                  <div className="text-slate-400 text-center py-12">
                    No inventory items available.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inventory.map((item) => {
                      const stockPercentage = Math.min(
                        (item.quantity / item.max_stock) * 100,
                        100,
                      );
                      const isLowStock = item.quantity < item.max_stock * 0.3;

                      return (
                        <div
                          key={item.id}
                          className={`bg-slate-700/50 rounded-lg p-6 border ${
                            isLowStock
                              ? "border-red-600/50"
                              : "border-slate-600"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-bold text-lg flex-1">
                              {item.name}
                            </h3>
                            <span
                              className={`text-2xl font-black ml-2 ${
                                isLowStock ? "text-red-400" : "text-blue-400"
                              }`}
                            >
                              {item.quantity}
                            </span>
                          </div>

                          <p className="text-slate-400 text-xs mb-3">
                            {item.unit} • Max: {item.max_stock}
                            {isLowStock && (
                              <span className="ml-2 text-red-400 font-semibold">
                                ⚠ LOW STOCK
                              </span>
                            )}
                          </p>

                          <div className="w-full bg-slate-600 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                isLowStock
                                  ? "bg-red-500"
                                  : stockPercentage > 70
                                    ? "bg-green-500"
                                    : "bg-yellow-500"
                              }`}
                              style={{ width: `${stockPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MechanicDashboard;
