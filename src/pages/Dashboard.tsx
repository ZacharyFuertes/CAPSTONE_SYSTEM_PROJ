import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  AlertTriangle,
  Users,
  Clock,
  CheckCircle,
  DollarSign,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../services/supabaseClient";
import AccessDenied from "../components/AccessDenied";

interface StatCard {
  label: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color: string;
}

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "year"
  >("week");

  // Real data state
  const [revenueData, setRevenueData] = useState<
    { date: string; revenue: number }[]
  >([]);
  const [statusData, setStatusData] = useState<
    { name: string; value: number; color: string }[]
  >([]);
  const [partUsageData, setPartUsageData] = useState<
    { name: string; usage: number }[]
  >([]);
  const [lowStockParts, setLowStockParts] = useState<
    { name: string; current: number; reorder: number }[]
  >([]);
  const [stats, setStats] = useState<StatCard[]>([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch job orders to get status distribution
        const { data: jobOrders } = await supabase
          .from("job_orders")
          .select("status")
          .eq("shop_id", user?.shop_id);

        // Fetch invoices for revenue
        const { data: invoices } = await supabase
          .from("invoices")
          .select("total_amount, created_at")
          .eq("shop_id", user?.shop_id)
          .order("created_at", { ascending: false })
          .limit(30);

        // Fetch parts with low stock
        const { data: parts } = await supabase
          .from("parts")
          .select("name, quantity_in_stock, reorder_level")
          .eq("shop_id", user?.shop_id)
          .lte("quantity_in_stock", 10)
          .order("quantity_in_stock", { ascending: true })
          .limit(5);

        // Calculate revenue data
        const revenueByDay =
          invoices?.reduce((acc: any, inv: any) => {
            const date = new Date(inv.created_at);
            const dayName = date.toLocaleDateString("en-US", {
              weekday: "short",
            });
            const existing = acc.find((d: any) => d.date === dayName);
            if (existing) {
              existing.revenue += inv.total_amount || 0;
            } else {
              acc.push({ date: dayName, revenue: inv.total_amount || 0 });
            }
            return acc;
          }, []) || [];

        // Set default week data if empty
        if (revenueByDay.length === 0) {
          setRevenueData([
            { date: "Mon", revenue: 0 },
            { date: "Tue", revenue: 0 },
            { date: "Wed", revenue: 0 },
            { date: "Thu", revenue: 0 },
            { date: "Fri", revenue: 0 },
            { date: "Sat", revenue: 0 },
            { date: "Sun", revenue: 0 },
          ]);
        } else {
          setRevenueData(revenueByDay);
        }

        // Calculate status distribution
        const statusCounts =
          jobOrders?.reduce((acc: any, jo: any) => {
            const existing = acc.find((s: any) => s.name === jo.status);
            if (existing) {
              existing.value += 1;
            } else {
              const statusColors: Record<string, string> = {
                completed: "#10b981",
                in_progress: "#f59e0b",
                pending: "#ef4444",
              };
              acc.push({
                name: jo.status,
                value: 1,
                color: statusColors[jo.status] || "#6b7280",
              });
            }
            return acc;
          }, []) || [];

        setStatusData(
          statusCounts.length > 0
            ? statusCounts
            : [
                { name: "Completed", value: 0, color: "#10b981" },
                { name: "In Progress", value: 0, color: "#f59e0b" },
                { name: "Pending", value: 0, color: "#ef4444" },
              ],
        );

        // Set low stock parts
        const formattedLowStock =
          parts?.map((p: any) => ({
            name: p.name,
            current: p.quantity_in_stock,
            reorder: p.reorder_level,
          })) || [];

        setLowStockParts(
          formattedLowStock.length > 0
            ? formattedLowStock
            : [{ name: "No low stock items", current: 0, reorder: 0 }],
        );

        // Calculate stats
        const totalRevenue =
          invoices?.reduce(
            (sum: number, inv: any) => sum + (inv.total_amount || 0),
            0,
          ) || 0;
        const completedJobs =
          jobOrders?.filter((j: any) => j.status === "completed").length || 0;
        const pendingJobs =
          jobOrders?.filter((j: any) => j.status === "pending").length || 0;

        // Also fetch pending appointments to include in stats
        const { data: pendingAppointments } = await supabase
          .from("appointments")
          .select("id, status")
          .in("status", ["pending", "confirmed"]);

        const pendingApptCount = pendingAppointments?.length || 0;
        const totalPending = pendingJobs + pendingApptCount;

        const totalCustomers = await supabase
          .from("users")
          .select("id")
          .eq("role", "customer");

        setStats([
          {
            label: t("dashboard.revenue"),
            value: `₱${totalRevenue.toLocaleString()}`,
            change: "+12.5% from last period",
            icon: <DollarSign className="w-8 h-8" />,
            color: "from-green-500 to-emerald-600",
          },
          {
            label: t("dashboard.today_jobs"),
            value: completedJobs,
            change: `${completedJobs} completed`,
            icon: <CheckCircle className="w-8 h-8" />,
            color: "from-blue-500 to-cyan-600",
          },
          {
            label: t("dashboard.pending"),
            value: totalPending,
            change: `${totalPending} need attention`,
            icon: <Clock className="w-8 h-8" />,
            color: "from-orange-500 to-red-600",
          },
          {
            label: "Active Customers",
            value: totalCustomers.data?.length || 0,
            change: `+${totalCustomers.data?.length || 0} this month`,
            icon: <Users className="w-8 h-8" />,
            color: "from-purple-500 to-pink-600",
          },
        ]);

        // Fetch part usage data (top used parts from job_order_items)
        const { data: partUsage } = await supabase
          .from("job_order_items")
          .select("part_id, quantity, parts(name)")
          .eq("job_orders.shop_id", user?.shop_id)
          .limit(5);

        if (partUsage && partUsage.length > 0) {
          const usageByPart = partUsage.reduce((acc: any, use: any) => {
            const existing = acc.find((p: any) => p.name === use.parts?.name);
            if (existing) {
              existing.usage += use.quantity || 0;
            } else {
              acc.push({
                name: use.parts?.name || "Unknown",
                usage: use.quantity || 0,
              });
            }
            return acc;
          }, []);
          setPartUsageData(usageByPart);
        } else {
          setPartUsageData([
            { name: "Brake Pads", usage: 0 },
            { name: "Oil Filter", usage: 0 },
            { name: "Air Filter", usage: 0 },
            { name: "Spark Plugs", usage: 0 },
            { name: "Coolant", usage: 0 },
          ]);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        // Use empty/default data on error
      }
    };

    if (user?.shop_id) {
      fetchDashboardData();
    }
  }, [user?.shop_id, t]);

  // Role-based access control: Only admin and owner can access the dashboard
  if (user && user.role !== "admin" && user.role !== "owner") {
    return <AccessDenied requestedPage="dashboard" onNavigate={onNavigate} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => onNavigate && onNavigate("landing")}
        className="mb-6 flex items-center gap-2 text-moto-accent hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </motion.button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">
          {t("dashboard.title")}
        </h1>
        <p className="text-slate-400">
          {user?.role === "owner"
            ? `Welcome back, ${user?.name}! Here's your shop performance overview.`
            : user?.role === "mechanic"
              ? `Welcome back, ${user?.name}! Here are your assigned tasks and metrics.`
              : `Welcome back, ${user?.name}! Here's your service history and appointments.`}
        </p>
      </motion.div>

      {/* Role-Based Content Notice */}
      {user?.role === "mechanic" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3"
        >
          <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-300 mb-1">
              Mechanic Dashboard
            </h3>
            <p className="text-blue-200 text-sm">
              You see metrics for your assigned jobs and tasks. Full analytics
              are available to shop owners only.
            </p>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${stat.color} rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">{stat.icon}</div>
              <span className="text-xs bg-white/20 px-2 py-1 rounded text-xs">
                {stat.change}
              </span>
            </div>
            <p className="text-slate-200 text-sm mb-2">{stat.label}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Owner-Only Analytics Section */}
      {user?.role === "owner" && (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Revenue Trend</h2>
                <div className="flex gap-2">
                  {(["week", "month", "year"] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-3 py-1 rounded text-sm transition ${
                        selectedPeriod === period
                          ? "bg-blue-600 text-white"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                    }}
                    labelStyle={{ color: "#e2e8f0" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Job Status Pie */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-700"
            >
              <h2 className="text-xl font-bold text-white mb-6">
                Job Status Distribution
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                    }}
                    labelStyle={{ color: "#e2e8f0" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {statusData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-300">{item.name}</span>
                    </div>
                    <span className="text-white font-semibold">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Part Usage & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Parts Used */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-700"
            >
              <h2 className="text-xl font-bold text-white mb-6">
                Top Parts Used
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={partUsageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                    }}
                    labelStyle={{ color: "#e2e8f0" }}
                  />
                  <Bar dataKey="usage" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Low Stock Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-700"
            >
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h2 className="text-xl font-bold text-white">
                  {t("dashboard.low_stock")}
                </h2>
              </div>
              <div className="space-y-4">
                {lowStockParts.map((item) => (
                  <div key={item.name} className="bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">
                        {item.name}
                      </span>
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                        Low Stock
                      </span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${(item.current / item.reorder) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      {item.current} units (need {item.reorder})
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Non-Owner Restricted Content Notice */}
      {user?.role !== "owner" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 rounded-lg p-8 border border-slate-700 text-center"
        >
          <Lock className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Advanced Analytics
          </h2>
          <p className="text-slate-400 mb-4">
            Detailed revenue reports, part usage analytics, and full inventory
            management are available to shop owners only.
          </p>
          <p className="text-slate-500 text-sm">
            {user?.role === "mechanic"
              ? "Contact your shop owner to access full reporting features."
              : "Log in as a shop owner to view analytics."}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
