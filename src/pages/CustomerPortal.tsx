import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Wrench,
  Phone,
  Mail,
  Download,
  ArrowLeft,
  Star,
  Users,
  TrendingUp,
  Bike,
  Shield,
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

  // Fetch customer data when user is authenticated
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const loadCustomerData = async () => {
      try {
        setLoading(true);

        // Build profile from auth context data
        const profile: CustomerProfile = {
          id: user.id,
          name: user.name || "Customer",
          phone: user.phone || "N/A",
          email: user.email || "N/A",
          vehicles: [],
          total_visits: 0,
          member_since: user.created_at
            ? new Date(user.created_at).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          total_spent: 0,
        };

        // Fetch customer vehicles
        const { data: vehiclesData } = await supabase
          .from("vehicles")
          .select("id, make, model, plate_number, year")
          .eq("customer_id", user.id);

        profile.vehicles = vehiclesData || [];

        // Fetch job orders
        const { data: jobOrdersData } = await supabase
          .from("job_orders")
          .select(
            "id, created_at, status, total_cost, vehicle_id, title, parts_used, mechanic_id",
          )
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false });

        profile.total_visits = jobOrdersData?.length || 0;
        profile.total_spent =
          jobOrdersData?.reduce(
            (sum: number, jo: any) => sum + (jo.total_cost || 0),
            0,
          ) || 0;

        // Batch fetch all referenced vehicles
        const vehicleIds = [
          ...new Set(
            (jobOrdersData || [])
              .map((jo: any) => jo.vehicle_id)
              .filter(Boolean),
          ),
        ];
        const vehicleMap: {
          [key: string]: { make: string; model: string };
        } = {};
        if (vehicleIds.length > 0) {
          const { data: vehicles } = await supabase
            .from("vehicles")
            .select("id, make, model")
            .in("id", vehicleIds);
          vehicles?.forEach((v: any) => {
            vehicleMap[v.id] = { make: v.make, model: v.model };
          });
        }

        // Batch fetch all referenced mechanics
        const mechanicIds = [
          ...new Set(
            (jobOrdersData || [])
              .map((jo: any) => jo.mechanic_id)
              .filter(Boolean),
          ),
        ];
        const mechanicMap: { [key: string]: string } = {};
        if (mechanicIds.length > 0) {
          const { data: mechanics } = await supabase
            .from("users")
            .select("id, name")
            .in("id", mechanicIds);
          mechanics?.forEach((m: any) => {
            mechanicMap[m.id] = m.name;
          });
        }

        // Build service records
        const records: ServiceRecord[] = (jobOrdersData || []).map(
          (jo: any) => {
            const vehicleInfo = vehicleMap[jo.vehicle_id];
            const vehicleName = vehicleInfo
              ? `${vehicleInfo.make} ${vehicleInfo.model}`
              : "Unknown";
            const mechanicName = mechanicMap[jo.mechanic_id] || "Unassigned";

            return {
              id: jo.id,
              date: new Date(jo.created_at).toISOString().split("T")[0],
              vehicle: vehicleName,
              service: jo.title || "Service",
              cost: jo.total_cost || 0,
              status: jo.status,
              parts_used: jo.parts_used || [],
              mechanic_name: mechanicName,
            };
          },
        );

        setCustomerProfile(profile);
        setServiceRecords(records);
        setError(null);
      } catch (err) {
        console.error("Error loading customer data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadCustomerData();
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
              <Users className="w-8 h-8 text-moto-accent" />
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white">
                My <span className="text-moto-accent">Portal</span>
              </h1>
            </div>
            <p className="text-lg text-slate-300 max-w-2xl">
              Welcome back, {customerProfile.name}. View your account details,
              vehicles, and service history.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-moto-dark to-moto-darker relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
          >
            {[
              {
                icon: Users,
                label: "Total Visits",
                value: customerProfile.total_visits.toString(),
              },
              {
                icon: TrendingUp,
                label: "Total Spent",
                value: `₱${customerProfile.total_spent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              },
              {
                icon: Bike,
                label: "Vehicles",
                value: customerProfile.vehicles.length.toString(),
              },
              {
                icon: Star,
                label: "Member Since",
                value: new Date(customerProfile.member_since)
                  .getFullYear()
                  .toString(),
              },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-moto-gray">
                      <Icon className="text-moto-accent-orange" size={32} />
                    </div>
                  </div>
                  <p className="text-3xl font-display font-bold text-white mb-2">
                    {stat.value}
                  </p>
                  <p className="text-gray-400 font-medium">{stat.label}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700"
          >
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Your Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg">
                <div className="p-3 rounded-full bg-blue-600/20">
                  <Mail className="text-blue-400" size={24} />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Email</p>
                  <p className="text-white font-medium break-all">
                    {customerProfile.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg">
                <div className="p-3 rounded-full bg-green-600/20">
                  <Phone className="text-green-400" size={24} />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Phone</p>
                  <p className="text-white font-medium">
                    {customerProfile.phone}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg">
                <div className="p-3 rounded-full bg-purple-600/20">
                  <Shield className="text-purple-400" size={24} />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Member Since</p>
                  <p className="text-white font-medium">
                    {customerProfile.member_since}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vehicles Section */}
      {customerProfile.vehicles.length > 0 && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-moto-dark">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-white">
                Your{" "}
                <span className="bg-gradient-accent bg-clip-text text-transparent">
                  Vehicles
                </span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Keep track of all your registered motorcycles
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customerProfile.vehicles.map((vehicle, idx) => (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-full bg-moto-accent/20">
                      <Bike className="text-moto-accent" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-slate-400">Year: {vehicle.year}</p>
                    </div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-3">
                    <p className="text-slate-400 text-sm">Plate Number</p>
                    <p className="text-white font-mono font-medium">
                      {vehicle.plate_number}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Service History Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-moto-darker to-moto-dark">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-white">
              Service{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                History
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Track all your motorcycle maintenance and repairs
            </p>
          </motion.div>

          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-white">Recent Services</h3>
              <span className="text-slate-400 bg-slate-700 px-3 py-1 rounded-full">
                {serviceRecords.length} services
              </span>
            </div>

            {serviceRecords.length === 0 ? (
              <div className="text-center py-16">
                <Wrench className="w-20 h-20 text-slate-600 mx-auto mb-6" />
                <h4 className="text-xl font-semibold text-white mb-2">
                  No service history yet
                </h4>
                <p className="text-slate-400 mb-6">
                  Your first service with us is just a booking away!
                </p>
                <motion.button
                  onClick={() => onNavigate && onNavigate("appointments")}
                  className="px-6 py-3 bg-moto-accent rounded-lg font-bold text-white hover:bg-moto-accent-orange transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Book Your First Service
                </motion.button>
              </div>
            ) : (
              <div className="space-y-4">
                {serviceRecords.map((record, index) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05, duration: 0.6 }}
                    className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl p-6 border border-slate-600 hover:border-slate-500 transition-all cursor-pointer"
                    onClick={() =>
                      setSelectedRecord({
                        record,
                        showDetails: !selectedRecord.showDetails,
                      })
                    }
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-full bg-blue-600/20">
                            <Wrench className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <span className="font-semibold text-white text-lg">
                              {record.service}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`text-xs px-3 py-1 rounded-full font-semibold ${
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
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{record.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Bike className="w-4 h-4" />
                            <span>{record.vehicle}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{record.mechanic_name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-green-400 mb-2">
                          ₱
                          {record.cost.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGeneratePDF(record);
                          }}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm"
                        >
                          <Download className="w-4 h-4" />
                          Invoice
                        </button>
                      </div>
                    </div>

                    {/* Details Expanded */}
                    {selectedRecord.record?.id === record.id &&
                      selectedRecord.showDetails && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-6 pt-6 border-t border-slate-600"
                        >
                          {record.parts_used &&
                            Object.keys(record.parts_used).length > 0 && (
                              <div>
                                <p className="text-slate-300 text-sm mb-3 font-medium">
                                  Parts Used:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(record.parts_used).map(
                                    ([part, qty]: [string, any], i) => (
                                      <span
                                        key={i}
                                        className="text-xs bg-slate-600 text-slate-200 px-3 py-2 rounded-lg"
                                      >
                                        {part} {qty > 1 ? `(x${qty})` : ""}
                                      </span>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                        </motion.div>
                      )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-12 text-center"
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              Need Service?
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center"></div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default CustomerPortal;
