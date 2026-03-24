import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Star,
  ShoppingCart,
  Package,
  Zap,
  Filter,
  Droplet,
  CircleDot,
  Disc3,
  Cable,
  SlidersHorizontal,
  Info,
} from "lucide-react";
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

interface BrowsePartsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const demoParts: Part[] = [
  { id: "1", name: "Oil Filter", category: "Filters", price: 450, image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSaLUpmocducA385wmGWxMjj3NPopkQ6ohCtaadIqbJhyWyWrUDlcSud2WkG-tsCPmVggaeav2-Osl6wYxlVyrnOj-OrUCoOejrYKpIaeFb_3R3n0tJhqgxqA", rating: 4.8, reviews: 234, inStock: true, quantity: 45 },
  { id: "2", name: "Air Filter", category: "Filters", price: 650, image: "https://m.media-amazon.com/images/I/81EQio4lHlL.jpg", rating: 4.9, reviews: 189, inStock: true, quantity: 32 },
  { id: "3", name: "Brake Pads Set", category: "Brakes", price: 1200, image: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQOWVt03NPiiV-eZ4ryoT4G4hNrQRVqxxU-SBYZH3bWbpGLHw3YoUY0Byi-w5ILYVRoXUfmJdQ_uzLgMOr68YonTVqiRUUM9GP20rKb2oNL6NiGxy4G7qqhItw", rating: 4.7, reviews: 156, inStock: true, quantity: 28 },
  { id: "4", name: "Spark Plugs (Set of 4)", category: "Electrical", price: 800, image: "https://www.partspro.ph/cdn/shop/files/IridiumIX-B_700x.jpg?v=1742352489", rating: 4.6, reviews: 142, inStock: true, quantity: 55 },
  { id: "5", name: "Wiper Blade Set", category: "Accessories", price: 550, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbj-BCKrR5JBP-OQHvaGHqHQj3coychNZaEg&s", rating: 4.5, reviews: 98, inStock: true, quantity: 40 },
  { id: "6", name: "Car Battery 40Ah", category: "Electrical", price: 2800, image: "https://img.lazcdn.com/g/p/11b752fe5ed0a26a8cbe7421207456b0.jpg_960x960q80.jpg_.webp", rating: 4.8, reviews: 267, inStock: true, quantity: 12 },
  { id: "7", name: "Engine Oil 5L (Synthetic)", category: "Fluids", price: 1800, image: "https://m.media-amazon.com/images/I/61ep7z3yB3L._AC_UF1000,1000_QL80_.jpg", rating: 4.7, reviews: 201, inStock: true, quantity: 38 },
  { id: "8", name: "Coolant Antifreeze 1L", category: "Fluids", price: 320, image: "https://down-ph.img.susercontent.com/file/ph-11134207-7ra0n-mb3ucjswkpyp17", rating: 4.6, reviews: 124, inStock: true, quantity: 50 },
  { id: "9", name: "Transmission Fluid 1L", category: "Fluids", price: 480, image: "https://www.partspro.ph/cdn/shop/files/MultiATFN.jpg?v=1691041651", rating: 4.5, reviews: 89, inStock: true, quantity: 25 },
  { id: "10", name: "Brake Fluid DOT 4", category: "Fluids", price: 380, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRE-UzVnvRXIJTichfwrz26Z2QxCtCO7qiSQ&s", rating: 4.7, reviews: 156, inStock: true, quantity: 42 },
  { id: "11", name: "Serpentine Belt", category: "Belts", price: 650, image: "https://img.lazcdn.com/g/p/c28725e1bcf0458b7a6ba7e4fe0ba0b5.jpg_720x720q80.jpg", rating: 4.4, reviews: 76, inStock: true, quantity: 18 },
  { id: "12", name: "Radiator Hose Kit", category: "Cooling", price: 1100, image: "https://img.lazcdn.com/g/ff/kf/S1d3152de25664de9a5288107f3506f55d.jpg_720x720q80.jpg", rating: 4.6, reviews: 112, inStock: true, quantity: 22 },
];

const CATEGORIES = [
  { id: "all", label: "All Parts", icon: Package },
  { id: "filters", label: "Filters", icon: Filter },
  { id: "brakes", label: "Brakes", icon: Disc3 },
  { id: "electrical", label: "Electrical", icon: Cable },
  { id: "fluids", label: "Fluids", icon: Droplet },
  { id: "accessories", label: "Accessories", icon: SlidersHorizontal },
  { id: "belts", label: "Belts", icon: CircleDot },
];

const BrowsePartsModal: React.FC<BrowsePartsModalProps> = ({ isOpen, onClose }) => {
  const [parts, setParts] = useState<Part[]>([]);
  const [filteredParts, setFilteredParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "instock" | "outofstock">("all");
  const fetchedRef = React.useRef(false);

  useEffect(() => {
    if (isOpen && !fetchedRef.current) {
      fetchParts();
    }
  }, [isOpen]);

  const fetchParts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("parts").select("*").order("name", { ascending: true });
      if (error) throw error;
      fetchedRef.current = true;
      setParts((data as Part[])?.length > 0 ? (data as Part[]) : demoParts);
    } catch {
      setParts(demoParts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = parts;
    if (selectedCategory !== "all") {
      result = result.filter((p) => (p.category || "").toLowerCase().includes(selectedCategory.toLowerCase()));
    }
    if (searchQuery) {
      result = result.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (stockFilter === "instock") {
      result = result.filter((p) => (p.inStock ?? (p.quantity ?? p.quantity_in_stock ?? 0) > 0));
    } else if (stockFilter === "outofstock") {
      result = result.filter((p) => !(p.inStock ?? (p.quantity ?? p.quantity_in_stock ?? 0) > 0));
    }
    setFilteredParts(result);
  }, [parts, selectedCategory, searchQuery, stockFilter]);

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
          className="bg-[#0f172a] rounded-t-3xl sm:rounded-3xl w-full sm:max-w-[95vw] h-[95vh] sm:h-auto sm:max-h-[94vh] overflow-hidden border border-slate-700/40 shadow-2xl shadow-black/50 flex flex-col"
        >
          {/* ── Top Bar ── */}
          <div className="flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 border-b border-slate-700/40 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Package size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-black text-white tracking-wide">Browse Parts</h2>
                <p className="text-slate-500 text-[10px] sm:text-xs hidden sm:block">Genuine motorcycle parts & accessories</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search parts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 bg-slate-800/60 text-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/50 focus:border-orange-500/50 focus:outline-none focus:ring-1 focus:ring-orange-500/20 transition text-sm placeholder-slate-500"
                />
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* ── Category Icons Row (inspired by template) ── */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 px-3 sm:px-8 py-2 sm:py-3 border-b border-slate-700/30 overflow-x-auto flex-shrink-0">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex flex-col items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl min-w-[56px] sm:min-w-[72px] transition-all ${
                    isActive
                      ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                      : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 border border-transparent"
                  }`}
                >
                  <Icon size={16} className="sm:w-5 sm:h-5" strokeWidth={isActive ? 2.5 : 1.5} />
                  <span className="text-[10px] font-semibold whitespace-nowrap">{cat.label}</span>
                </button>
              );
            })}

            {/* Availability filters */}
            <div className="hidden sm:flex ml-auto items-center gap-2 pl-4 border-l border-slate-700/30">
              {(["all", "instock", "outofstock"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setStockFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all ${
                    stockFilter === f
                      ? f === "instock" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : f === "outofstock" ? "bg-red-500/15 text-red-400 border border-red-500/30"
                        : "bg-slate-700/60 text-white border border-slate-600/50"
                      : "text-slate-500 hover:text-slate-300 border border-transparent"
                  }`}
                >
                  {f === "all" ? "All" : f === "instock" ? "In-Stock" : "Out-of-Stock"}
                </button>
              ))}
            </div>
          </div>

          {/* ── Mobile Search (shown for sm) ── */}
          <div className="sm:hidden px-4 py-2.5 border-b border-slate-700/30 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search parts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800/60 text-white pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/50 focus:border-orange-500/50 focus:outline-none transition text-sm placeholder-slate-500"
              />
            </div>
          </div>

          {/* ── Product Grid (template-style cards) ── */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-8 py-4 sm:py-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredParts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Package className="w-16 h-16 text-slate-700 mb-4" />
                <p className="text-slate-500 text-sm">No parts found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-5">
                {filteredParts.map((part, index) => {
                  const isInStock = part.inStock ?? (part.quantity ?? part.quantity_in_stock ?? 0) > 0;
                  return (
                    <motion.div
                      key={part.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="group bg-slate-800/40 rounded-2xl border border-slate-700/30 hover:border-orange-500/30 transition-all duration-300 overflow-hidden hover:shadow-lg hover:shadow-orange-500/5"
                    >
                      {/* Product Image */}
                      <div className="relative aspect-square bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
                        {part.image || part.image_url ? (
                          <img
                            src={part.image || part.image_url}
                            alt={part.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Zap className="w-12 h-12 text-slate-700" />
                          </div>
                        )}
                        {/* Stock Badge */}
                        <div className="absolute top-2.5 right-2.5">
                          {isInStock ? (
                            <span className="bg-emerald-500/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                              In Stock
                            </span>
                          ) : (
                            <span className="bg-red-500/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                              Sold Out
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Product Info (template-style: price → name → rating) */}
                      <div className="p-2.5 sm:p-4">
                        <p className="text-sm sm:text-lg font-black text-orange-400 mb-0.5 sm:mb-1">
                          ₱{part.price.toLocaleString()}
                        </p>
                        <h3 className="text-sm font-semibold text-white mb-1 leading-tight line-clamp-2 group-hover:text-orange-300 transition-colors">
                          {part.name}
                        </h3>

                        {/* Rating Row */}
                        <div className="flex items-center gap-1 mb-3">
                          {part.rating && (
                            <>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={10}
                                    className={i < Math.round(part.rating!) ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}
                                  />
                                ))}
                              </div>
                              <span className="text-[10px] text-slate-500 ml-1">{part.reviews}</span>
                            </>
                          )}
                        </div>

                        {/* Action Row */}
                        <div className="flex items-center justify-between">
                          <button className="text-[11px] text-slate-400 hover:text-orange-400 transition flex items-center gap-1 font-medium">
                            <Info size={12} /> More Info
                          </button>
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            disabled={!isInStock}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                              isInStock
                                ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/30"
                                : "bg-slate-700 text-slate-500 cursor-not-allowed"
                            }`}
                          >
                            <ShoppingCart size={14} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BrowsePartsModal;
