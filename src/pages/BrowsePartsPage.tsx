import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Search, ShoppingCart, Zap, Package } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { supabase } from "../services/supabaseClient";

interface Part {
  id: string;
  name: string;
  category: string;
  price: number;
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
  const {} = useLanguage();
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
  ];

  // Demo parts data as fallback
  const demoParts: Part[] = [
    {
      id: "1",
      name: "Oil Filter",
      category: "Filters",
      price: 450,
      image:
        "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSaLUpmocducA385wmGWxMjj3NPopkQ6ohCtaadIqbJhyWyWrUDlcSud2WkG-tsCPmVggaeav2-Osl6wYxlVyrnOj-OrUCoOejrYKpIaeFb_3R3n0tJhqgxqA",
      rating: 4.8,
      reviews: 234,
      inStock: true,
      quantity: 45,
    },
    {
      id: "2",
      name: "Air Filter",
      category: "Filters",
      price: 650,
      image: "https://m.media-amazon.com/images/I/81EQio4lHlL.jpg",
      rating: 4.9,
      reviews: 189,
      inStock: true,
      quantity: 32,
    },
    {
      id: "3",
      name: "Brake Pads Set",
      category: "Brakes",
      price: 1200,
      image:
        "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQOWVt03NPiiV-eZ4ryoT4G4hNrQRVqxxU-SBYZH3bWbpGLHw3YoUY0Byi-w5ILYVRoXUfmJdQ_uzLgMOr68YonTVqiRUUM9GP20rKb2oNL6NiGxy4G7qqhItw",
      rating: 4.7,
      reviews: 156,
      inStock: true,
      quantity: 28,
    },
    {
      id: "4",
      name: "Spark Plugs (Set of 4)",
      category: "Electrical",
      price: 800,
      image:
        "https://www.partspro.ph/cdn/shop/files/IridiumIX-B_700x.jpg?v=1742352489",
      rating: 4.6,
      reviews: 142,
      inStock: true,
      quantity: 55,
    },
    {
      id: "5",
      name: "Wiper Blade Set",
      category: "Accessories",
      price: 550,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbj-BCKrR5JBP-OQHvaGHqHQj3coychNZaEg&s",
      rating: 4.5,
      reviews: 98,
      inStock: true,
      quantity: 40,
    },
    {
      id: "6",
      name: "Car Battery 40Ah",
      category: "Electrical",
      price: 2800,
      image:
        "https://img.lazcdn.com/g/p/11b752fe5ed0a26a8cbe7421207456b0.jpg_960x960q80.jpg_.webp",
      rating: 4.8,
      reviews: 267,
      inStock: true,
      quantity: 12,
    },
    {
      id: "7",
      name: "Engine Oil 5L (Synthetic)",
      category: "Fluids",
      price: 1800,
      image:
        "https://m.media-amazon.com/images/I/61ep7z3yB3L._AC_UF1000,1000_QL80_.jpg",
      rating: 4.7,
      reviews: 201,
      inStock: true,
      quantity: 38,
    },
    {
      id: "8",
      name: "Coolant Antifreeze 1L",
      category: "Fluids",
      price: 320,
      image:
        "https://down-ph.img.susercontent.com/file/ph-11134207-7ra0n-mb3ucjswkpyp17",
      rating: 4.6,
      reviews: 124,
      inStock: true,
      quantity: 50,
    },
    {
      id: "9",
      name: "Transmission Fluid 1L",
      category: "Fluids",
      price: 480,
      image:
        "https://www.partspro.ph/cdn/shop/files/MultiATFN.jpg?v=1691041651",
      rating: 4.5,
      reviews: 89,
      inStock: true,
      quantity: 25,
    },
    {
      id: "10",
      name: "Brake Fluid DOT 4",
      category: "Fluids",
      price: 380,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRE-UzVnvRXIJTichfwrz26Z2QxCtCO7qiSQ&s",
      rating: 4.7,
      reviews: 156,
      inStock: true,
      quantity: 42,
    },
    {
      id: "11",
      name: "Serpentine Belt",
      category: "Belts",
      price: 650,
      image:
        "https://img.lazcdn.com/g/p/c28725e1bcf0458b7a6ba7e4fe0ba0b5.jpg_720x720q80.jpg",
      rating: 4.4,
      reviews: 76,
      inStock: true,
      quantity: 18,
    },
    {
      id: "12",
      name: "Radiator Hose Kit",
      category: "Cooling",
      price: 1100,
      image:
        "https://img.lazcdn.com/g/ff/kf/S1d3152de25664de9a5288107f3506f55d.jpg_720x720q80.jpg",
      rating: 4.6,
      reviews: 112,
      inStock: true,
      quantity: 22,
    },
  ];

  // Fetch parts from database
  useEffect(() => {
    const fetchParts = async () => {
      // Skip if we've already fetched or are fetching
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

        // Use demo parts if database is empty
        const partsToUse =
          (data as Part[])?.length > 0 ? (data as Part[]) : demoParts;
        setParts(partsToUse);
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        console.error("Error fetching parts:", err);
        // Fallback to demo parts on error
        if (!fetchAbortRef.current?.signal.aborted) {
          setParts(demoParts);
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
                        {(part.inStock ??
                        (part.quantity ?? part.quantity_in_stock ?? 0) > 0) ? (
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

                    {/* Rating */}
                    {part.rating && (
                      <div className="mb-4">
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                i < Math.round(part.rating!)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-slate-600"
                              }
                            />
                          ))}
                          <span className="text-xs text-slate-400 ml-2">
                            {part.rating}
                          </span>
                        </div>
                        {part.reviews && (
                          <p className="text-xs text-slate-500">
                            ({part.reviews} reviews)
                          </p>
                        )}
                      </div>
                    )}

                    {/* Price and Action */}
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-moto-accent">
                        ₱{part.price.toLocaleString()}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={
                          !(
                            part.inStock ??
                            (part.quantity ?? part.quantity_in_stock ?? 0) > 0
                          )
                        }
                        className={`p-2.5 rounded-lg transition-all ${
                          (part.inStock ??
                          (part.quantity ?? part.quantity_in_stock ?? 0) > 0)
                            ? "bg-moto-accent hover:bg-moto-accent-dark text-white"
                            : "bg-slate-600 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        <ShoppingCart size={20} />
                      </motion.button>
                    </div>

                    {/* Stock Count */}
                    <p className="text-xs text-slate-500 mt-3">
                      {part.quantity ?? part.quantity_in_stock ?? 0} units
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
