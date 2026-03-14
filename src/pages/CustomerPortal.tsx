import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Wrench,
  Phone,
  Mail,
  Download,
  ArrowLeft,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../services/supabaseClient";
import AccessDenied from "../components/AccessDenied";

interface ServiceRecord {
  id: string;
  date: string;
  vehicle: string;
  service: string;
  cost: number;
  status: string;
  parts_used: any;
  mechanic_name: string;
}

interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicles: Array<{
    id: string;
    make: string;
    model: string;
    plate_number: string;
    year: number;
  }>;
  total_visits: number;
  member_since: string;
  total_spent: number;
}

interface SelectedRecord {
  record: ServiceRecord | null;
  showDetails: boolean;
}

interface CustomerPortalProps {
  onNavigate?: (page: string) => void;
}

const CustomerPortal: React.FC<CustomerPortalProps> = ({ onNavigate }) => {
  const {} = useLanguage();
  const { user } = useAuth();
  const [selectedRecord, setSelectedRecord] = useState<SelectedRecord>({
    record: null,
    showDetails: false,
  });
  const [customerProfile, setCustomerProfile] =
    useState<CustomerProfile | null>(null);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch customer data from database
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        // Get user data (with fallback to context user)
        const userName = user.name || "Customer";
        const userEmail = user.email || "N/A";
        const userPhone = user.phone || "N/A";

        // Fetch vehicles for this customer (using user_id)
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from("vehicles")
          .select("*")
          .eq("customer_id", user.id);

        if (vehiclesError && vehiclesError.code !== "PGRST116") {
          console.error("Vehicles error:", vehiclesError);
        }

        // Fetch job orders (service history) for this customer
        const { data: jobOrdersData, error: jobOrdersError } = await supabase
          .from("job_orders")
          .select(
            `
            id,
            created_at,
            status,
            total_cost,
            vehicle_id,
            vehicles!inner(make, model),
            title,
            parts_used,
            mechanic_id,
            users!inner(name)
          `,
          )
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false });

        if (jobOrdersError && jobOrdersError.code !== "PGRST116") {
          console.error("Job orders error:", jobOrdersError);
        }

        // Build customer profile
        const profile: CustomerProfile = {
          id: user.id,
          name: userName,
          phone: userPhone,
          email: userEmail,
          vehicles: vehiclesData || [],
          total_visits: jobOrdersData?.length || 0,
          member_since: new Date().toISOString().split("T")[0],
          total_spent:
            jobOrdersData?.reduce(
              (sum: number, jo: any) => sum + (jo.total_cost || 0),
              0,
            ) || 0,
        };

        // Build service records from job orders
        const records: ServiceRecord[] = (jobOrdersData || []).map(
          (jo: any) => ({
            id: jo.id,
            date: new Date(jo.created_at).toISOString().split("T")[0],
            vehicle: `${jo.vehicles?.make || "Unknown"} ${jo.vehicles?.model || "Unknown"}`,
            service: jo.title || "Service",
            cost: jo.total_cost || 0,
            status: jo.status,
            parts_used: jo.parts_used || [],
            mechanic_name: Array.isArray(jo.users)
              ? jo.users[0]?.name
              : jo.users?.name || "Unassigned",
          }),
        );

        setCustomerProfile(profile);
        setServiceRecords(records);
      } catch (err) {
        console.error("Error fetching customer data:", err);
        setError("Failed to load customer data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [user?.id]);

  const handleGeneratePDF = (record: ServiceRecord) => {
    // Mock PDF generation - In production, use jsPDF or similar
    alert(`Generating PDF for Service Record #${record.id}`);
  };

  // Role-based access control: Only customers can access this portal
  if (user && user.role !== "customer") {
    return (
      <AccessDenied requestedPage="customer-portal" onNavigate={onNavigate} />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => onNavigate && onNavigate("dashboard")}
          className="mb-6 flex items-center gap-2 text-moto-accent hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </motion.button>
        <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-6 text-red-300">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!customerProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => onNavigate && onNavigate("dashboard")}
          className="mb-6 flex items-center gap-2 text-moto-accent hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </motion.button>
        <div className="text-white text-center">
          <p>No customer data available</p>
        </div>
      </div>
    );
  }

  const initials = customerProfile.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => onNavigate && onNavigate("dashboard")}
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
        <h1 className="text-4xl font-bold text-white mb-2">Customer Portal</h1>
        <p className="text-slate-400">
          View your service history and manage your vehicles
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Profile Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white shadow-lg">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl font-bold">{initials}</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{customerProfile.name}</h2>
            <p className="text-blue-100 mb-4">
              Member since {customerProfile.member_since}
            </p>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4" />
                <span>{customerProfile.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4" />
                <span className="break-all">{customerProfile.email}</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="space-y-3">
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-sm mb-2">Total Visits</p>
              <p className="text-3xl font-bold text-white">
                {customerProfile.total_visits}
              </p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <p className="text-slate-400 text-sm mb-2">Total Spent</p>
              <p className="text-3xl font-bold text-green-400">
                ₱
                {customerProfile.total_spent.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          {/* Vehicles */}
          {customerProfile.vehicles.length > 0 && (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">
                Registered Vehicles
              </h3>
              <div className="space-y-3">
                {customerProfile.vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="bg-slate-700 rounded-lg p-3">
                    <p className="text-white font-semibold">
                      {vehicle.make} {vehicle.model} ({vehicle.year})
                    </p>
                    <p className="text-slate-400 text-sm">
                      Plate: {vehicle.plate_number}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Service History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Service History</h2>
              <span className="text-slate-400">
                {serviceRecords.length} services
              </span>
            </div>

            {serviceRecords.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No service history yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {serviceRecords.map((record, index) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-slate-700 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition cursor-pointer"
                    onClick={() =>
                      setSelectedRecord({
                        record,
                        showDetails: !selectedRecord.showDetails,
                      })
                    }
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Wrench className="w-5 h-5 text-blue-400" />
                          <span className="font-semibold text-white">
                            {record.service}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded font-semibold ${
                              record.status === "completed"
                                ? "bg-green-500/20 text-green-400"
                                : record.status === "in_progress"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {record.status.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          {record.date} • {record.vehicle} • Mechanic:{" "}
                          {record.mechanic_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-400">
                          ₱
                          {record.cost.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Details Expanded */}
                    {selectedRecord.record?.id === record.id &&
                      selectedRecord.showDetails && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-slate-600 space-y-3"
                        >
                          {record.parts_used &&
                            Object.keys(record.parts_used).length > 0 && (
                              <div>
                                <p className="text-slate-400 text-sm mb-2">
                                  Parts Used:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(record.parts_used).map(
                                    ([part, qty]: [string, any], i) => (
                                      <span
                                        key={i}
                                        className="text-xs bg-slate-600 text-slate-200 px-2 py-1 rounded"
                                      >
                                        {part} {qty > 1 ? `(x${qty})` : ""}
                                      </span>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGeneratePDF(record);
                            }}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition text-sm"
                          >
                            <Download className="w-4 h-4" />
                            Download Invoice
                          </button>
                        </motion.div>
                      )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mt-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              Upcoming Appointments
            </h2>
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No upcoming appointments</p>
              <button
                onClick={() => onNavigate && onNavigate("appointments")}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition"
              >
                Book Service Now
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerPortal;
