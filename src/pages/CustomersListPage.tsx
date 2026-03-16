import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../services/supabaseClient";

interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  total_spent?: number;
  created_at?: string;
}

interface CustomersListPageProps {
  onNavigate?: (page: string) => void;
}

const CustomersListPage: React.FC<CustomersListPageProps> = ({
  onNavigate,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch ONLY users with role = 'customer' (case-sensitive)
        const { data, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("role", "customer")
          .order("created_at", { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        // Double-check: Filter out any non-customers (in case of data inconsistency)
        const customersOnly = (data || []).filter(
          (user) => user.role === "customer",
        );

        setCustomers(customersOnly);
        setFilteredCustomers(customersOnly);
        console.log(
          `✅ Loaded ${customersOnly.length} customers (mechanics excluded)`,
        );
      } catch (err) {
        console.error("Error fetching customers:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load customers",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Filter customers based on search term
  useEffect(() => {
    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phone && customer.phone.includes(searchTerm)),
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const totalSpent = customers.reduce(
    (sum, c) => sum + (c.total_spent || 0),
    0,
  );
  const totalCustomers = customers.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block p-4 bg-moto-accent/20 rounded-full mb-4">
            <div className="animate-spin">
              <div className="w-8 h-8 border-4 border-moto-accent border-t-transparent rounded-full" />
            </div>
          </div>
          <p className="text-gray-300">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Customer List</h1>
        <p className="text-gray-400">
          Manage and view all your customers and their information
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-700/50 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Customers</p>
              <p className="text-3xl font-bold text-white">{totalCustomers}</p>
            </div>
            <div className="p-3 bg-blue-900/50 rounded-lg">
              <AlertCircle className="text-blue-400" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-700/50 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-green-400">
                ₱
                {totalSpent.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="p-3 bg-green-900/50 rounded-lg">
              <TrendingUp className="text-green-400" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-900/40 to-orange-800/20 border border-orange-700/50 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Avg per Customer</p>
              <p className="text-3xl font-bold text-orange-400">
                ₱
                {totalCustomers > 0
                  ? (totalSpent / totalCustomers).toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })
                  : "0"}
              </p>
            </div>
            <div className="p-3 bg-orange-900/50 rounded-lg">
              <Calendar className="text-orange-400" size={24} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative"
      >
        <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-moto-gray border border-moto-gray-light/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-moto-accent transition-colors"
        />
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300"
        >
          {error}
        </motion.div>
      )}

      {/* Customers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-moto-darker border border-moto-gray-light/20 rounded-lg overflow-hidden"
      >
        {filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-moto-gray-light/20 bg-moto-gray/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Total Spent
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-moto-gray-light/20">
                {filteredCustomers.map((customer, idx) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * idx }}
                    className="hover:bg-moto-gray/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{customer.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Mail size={16} />
                        {customer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        {customer.phone ? (
                          <>
                            <Phone size={16} />
                            {customer.phone}
                          </>
                        ) : (
                          <span className="text-gray-600">Not provided</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        {customer.city || customer.address ? (
                          <>
                            <MapPin size={16} />
                            {customer.city || customer.address}
                          </>
                        ) : (
                          <span className="text-gray-600">Not provided</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-green-400">
                        ₱
                        {(customer.total_spent || 0).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {customer.created_at
                        ? new Date(customer.created_at).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-gray-500 mb-3" size={32} />
            <p className="text-gray-400">
              {searchTerm
                ? "No customers found matching your search"
                : "No customers yet"}
            </p>
          </div>
        )}
      </motion.div>

      {/* Results Count */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center text-gray-400"
      >
        Showing {filteredCustomers.length} of {totalCustomers} customers
      </motion.div>
    </div>
  );
};

export default CustomersListPage;
