import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ShoppingCart, Zap, Package } from "lucide-react";

import { supabase } from "../services/supabaseClient";

interface Part {
  id: string;
  name: string;
  category: string;
  price?: number;
  unit_price?: number;
  image?: string;
  image_url?: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  quantity?: number;
  quantity_in_stock?: number;
  description?: string;
}

interface BrowsePartsPageProps {
  onNavigate?: (page: string) => void;
  embedded?: boolean;
}

const BrowsePartsPage: React.FC<BrowsePartsPageProps> = ({ embedded = false }) => {

  const [parts, setParts] = useState<Part[]>([]);
  const [filteredParts, setFilteredParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const fetchAbortRef = React.useRef<AbortController | null>(null);
  const fetchedRef = React.useRef(false);

  const categories = [
    { id: "all", label: "All Parts" },
    { id: "filters", label: "Filters" },
    { id: "tires", label: "Tires" },
    { id: "brakes", label: "Brakes" },
    { id: "oils", label: "Oils" },
    { id: "electrical", label: "Electrical" },
    { id: "suspension", label: "Suspension" },
    { id: "exhaust", label: "Exhaust" },
    { id: "other", label: "Other" },
  ];

  // Helper to get the display price from either field
  const getPrice = (part: Part): number => {
    return part.price ?? part.unit_price ?? 0;
  };

  // Helper to get the stock quantity
  const getStock = (part: Part): number => {
    return part.quantity ?? part.quantity_in_stock ?? 0;
  };

  // Helper to check if in stock
  const isInStock = (part: Part): boolean => {
    if (part.inStock !== undefined) return part.inStock;
    return getStock(part) > 0;
  };

  // Fetch parts from database (all parts, no shop_id filter for public store)
  useEffect(() => {
    const fetchParts = async () => {
      // Skip if we've already fetched
      if (fetchedRef.current) {
        return;
      }

      // Cancel any previous fetch
      if (fetchAbortRef.current) {
        fetchAbortRef.current.abort();
      }

      // Create new abort controller for this fetch
      fetchAbortRef.current = new AbortController();

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("parts")
          .select("*")
          .order("name", { ascending: true });

        if (fetchAbortRef.current?.signal.aborted) return;

        if (error) throw error;

        // Mark that we've fetched
        fetchedRef.current = true;

        setParts((data as Part[]) || []);
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        console.error("Error fetching parts:", err);
        if (!fetchAbortRef.current?.signal.aborted) {
          setParts([]);
        }
      } finally {
        if (!fetchAbortRef.current?.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchParts();

    // Cleanup: abort fetch if component unmounts
    return () => {
      if (fetchAbortRef.current) {
        fetchAbortRef.current.abort();
      }
    };
  }, []);

  // Filter parts based on category and search
  useEffect(() => {
    let result = parts;

    if (selectedCategory !== "all") {
      result = result.filter(
        (p) =>
          (p.category || "")
            .toLowerCase()
            .includes(selectedCategory.toLowerCase()) ||
          selectedCategory === "all",
      );
    }

    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredParts(result);
  }, [parts, selectedCategory, searchQuery]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div id={embedded ? "browse-parts-section" : undefined} className={embedded ? "" : "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"}>
      {/* Hero Section */}
      <section className={`relative w-full ${embedded ? 'pt-8 pb-8' : 'pt-24 pb-16'} px-4 sm:px-6 lg:px-8 ${embedded ? '' : 'bg-gradient-to-b from-slate-800 to-transparent'}`}>
        <div className="max-w-6xl mx-auto">
          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-8 h-8 text-moto-accent" />
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white">
                Quality <span className="text-moto-accent">Parts</span>
              </h1>
            </div>
            <p className="text-lg text-slate-300 max-w-2xl">
              Genuine motorcycle parts and accessories for your bike. Fast
              delivery, competitive prices, and expert support.
            </p>
          </motion.div>

          {/* Search & Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search parts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-700/50 text-white px-12 py-3 rounded-lg border border-slate-600 focus:border-moto-accent focus:outline-none transition-colors placeholder-slate-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? "bg-moto-accent text-white shadow-lg shadow-moto-accent/50"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {cat.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Parts Grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-slate-600 border-t-moto-accent rounded-full mx-auto"></div>
              <p className="text-slate-400 mt-4">Loading parts...</p>
            </div>
          ) : filteredParts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">
                No parts found in this category
              </p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredParts.map((part) => (
                <motion.div
                  key={part.id}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="group bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl border border-slate-600 overflow-hidden hover:border-moto-accent/50 transition-all"
                >
                  {/* Part Header with Image or Icon */}
                  <div className="h-48 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center relative overflow-hidden">
                    {part.image || part.image_url ? (
                      <img
                        src={part.image || part.image_url}
                        alt={part.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="absolute opacity-10"
                        >
                          <Package className="w-32 h-32 text-moto-accent" />
                        </motion.div>
                        <Zap className="w-16 h-16 text-moto-accent-neon relative z-10" />
                      </>
                    )}
                  </div>

                  {/* Part Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-lg mb-2 group-hover:text-moto-accent transition-colors">
                          {part.name}
                        </h3>
                        <p className="text-sm text-slate-400 capitalize">
                          {part.category}
                        </p>
                      </div>
                      <div className="ml-3">
                        {isInStock(part) ? (
                          <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-semibold">
                            In Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-semibold">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {part.description && (
                      <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                        {part.description}
                      </p>
                    )}

                    {/* Price and Action */}
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-moto-accent">
                        ₱{getPrice(part).toLocaleString()}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={!isInStock(part)}
                        className={`p-2.5 rounded-lg transition-all ${
                          isInStock(part)
                            ? "bg-moto-accent hover:bg-moto-accent-dark text-white"
                            : "bg-slate-600 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        <ShoppingCart size={20} />
                      </motion.button>
                    </div>

                    {/* Stock Count */}
                    <p className="text-xs text-slate-500 mt-3">
                      {getStock(part)} units
                      available
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default BrowsePartsPage;
