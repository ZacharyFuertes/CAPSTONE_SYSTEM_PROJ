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
  ArrowLeft,
  Box,
  CheckCircle,
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
  sku?: string;
}

interface BrowsePartsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const demoParts: Part[] = [
  { id: "1", name: "Oil Filter", category: "Filters", price: 450, image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSaLUpmocducA385wmGWxMjj3NPopkQ6ohCtaadIqbJhyWyWrUDlcSud2WkG-tsCPmVggaeav2-Osl6wYxlVyrnOj-OrUCoOejrYKpIaeFb_3R3n0tJhqgxqA", rating: 4.8, reviews: 234, inStock: true, quantity: 45, description: "High-quality oil filter compatible with most motorcycle engines. Provides superior filtration to protect your engine from harmful contaminants." },
  { id: "2", name: "Air Filter", category: "Filters", price: 650, image: "https://m.media-amazon.com/images/I/81EQio4lHlL.jpg", rating: 4.9, reviews: 189, inStock: true, quantity: 32, description: "Premium air filter for optimal airflow and engine protection. Designed for easy installation and long service life." },
  { id: "3", name: "Brake Pads Set", category: "Brakes", price: 1200, image: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQOWVt03NPiiV-eZ4ryoT4G4hNrQRVqxxU-SBYZH3bWbpGLHw3YoUY0Byi-w5ILYVRoXUfmJdQ_uzLgMOr68YonTVqiRUUM9GP20rKb2oNL6NiGxy4G7qqhItw", rating: 4.7, reviews: 156, inStock: true, quantity: 28, description: "High-performance brake pads set. Semi-metallic compound for excellent stopping power and durability, with low noise and dust." },
  { id: "4", name: "Spark Plugs (Set of 4)", category: "Electrical", price: 800, image: "https://www.partspro.ph/cdn/shop/files/IridiumIX-B_700x.jpg?v=1742352489", rating: 4.6, reviews: 142, inStock: true, quantity: 55, description: "Iridium spark plugs for improved ignition performance and fuel efficiency. Long-lasting and reliable in all conditions." },
  { id: "5", name: "Wiper Blade Set", category: "Accessories", price: 550, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbj-BCKrR5JBP-OQHvaGHqHQj3coychNZaEg&s", rating: 4.5, reviews: 98, inStock: true, quantity: 40, description: "Premium wiper blades with natural rubber for streak-free wiping. Easy installation and fits most vehicle models." },
  { id: "6", name: "Car Battery 40Ah", category: "Electrical", price: 2800, image: "https://img.lazcdn.com/g/p/11b752fe5ed0a26a8cbe7421207456b0.jpg_960x960q80.jpg_.webp", rating: 4.8, reviews: 267, inStock: true, quantity: 12, description: "Maintenance-free 40Ah battery with superior starting power. Calcium-calcium technology for longer life and better performance." },
  { id: "7", name: "Engine Oil 5L (Synthetic)", category: "Fluids", price: 1800, image: "https://m.media-amazon.com/images/I/61ep7z3yB3L._AC_UF1000,1000_QL80_.jpg", rating: 4.7, reviews: 201, inStock: true, quantity: 38, description: "Full synthetic engine oil 5W-30. Provides exceptional engine protection, fuel economy, and performance in all driving conditions." },
  { id: "8", name: "Coolant Antifreeze 1L", category: "Fluids", price: 320, image: "https://down-ph.img.susercontent.com/file/ph-11134207-7ra0n-mb3ucjswkpyp17", rating: 4.6, reviews: 124, inStock: true, quantity: 50, description: "All-season coolant antifreeze. Protects engines from overheating in summer and freezing in winter with anti-corrosion additives." },
  { id: "9", name: "Transmission Fluid 1L", category: "Fluids", price: 480, image: "https://www.partspro.ph/cdn/shop/files/MultiATFN.jpg?v=1691041651", rating: 4.5, reviews: 89, inStock: true, quantity: 25, description: "Multi-vehicle automatic transmission fluid. Ensures smooth shifting and protects transmission components from wear." },
  { id: "10", name: "Brake Fluid DOT 4", category: "Fluids", price: 380, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRE-UzVnvRXIJTichfwrz26Z2QxCtCO7qiSQ&s", rating: 4.7, reviews: 156, inStock: true, quantity: 42, description: "DOT 4 brake fluid with high boiling point. Compatible with all DOT 3 and DOT 4 brake systems for reliable braking performance." },
  { id: "11", name: "Serpentine Belt", category: "Belts", price: 650, image: "https://img.lazcdn.com/g/p/c28725e1bcf0458b7a6ba7e4fe0ba0b5.jpg_720x720q80.jpg", rating: 4.4, reviews: 76, inStock: true, quantity: 18, description: "Premium serpentine belt with reinforced fiber construction. Quiet operation and extended service life for your vehicle." },
  { id: "12", name: "Radiator Hose Kit", category: "Cooling", price: 1100, image: "https://img.lazcdn.com/g/ff/kf/S1d3152de25664de9a5288107f3506f55d.jpg_720x720q80.jpg", rating: 4.6, reviews: 112, inStock: true, quantity: 22, description: "Complete radiator hose kit with upper and lower hoses. Heat-resistant construction with reinforced clamps included." },
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
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [inquirySent, setInquirySent] = useState<string | null>(null);
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

  const handleInquiry = (partId: string) => {
    setInquirySent(partId);
    setTimeout(() => setInquirySent(null), 3000);
  };

  if (!isOpen) return null;

  // Part detail view
  if (selectedPart) {
    const isInStock = selectedPart.inStock ?? (selectedPart.quantity ?? selectedPart.quantity_in_stock ?? 0) > 0;
    const stockQty = selectedPart.quantity ?? selectedPart.quantity_in_stock ?? 0;

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
            className="bg-[#0a0a0a] rounded-none border border-[#222] border-t-2 border-t-[#d63a2f] w-full sm:max-w-[800px] h-[95vh] sm:h-auto sm:max-h-[94vh] overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 sm:px-10 py-6 border-b border-[#222] flex-shrink-0 bg-[#111111]">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setSelectedPart(null)}
                  className="w-14 h-14 bg-[#161616] hover:bg-[#221515] border border-[#333] hover:border-[#d63a2f] flex items-center justify-center shrink-0 transition text-[#6b6b6b] hover:text-[#d63a2f]"
                >
                  <ArrowLeft size={24} strokeWidth={1.5} />
                </button>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-3 text-[#d63a2f] text-[10px] font-bold tracking-[0.2em] uppercase">
                    <div className="w-6 h-[1px] bg-[#d63a2f]" /> PART DETAILS
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl text-white uppercase leading-none tracking-wide truncate max-w-[300px] sm:max-w-[450px]">
                    {selectedPart.name}
                  </h2>
                </div>
              </div>
              <button onClick={onClose} className="p-2 border border-[#333] hover:bg-[#222] transition text-[#6b6b6b] hover:text-white shrink-0">
                <X size={20} strokeWidth={1} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 bg-[#0a0a0a]">
              <div className="flex flex-col sm:flex-row gap-8">
                {/* Image */}
                <div className="w-full sm:w-[320px] flex-shrink-0">
                  <div className="aspect-square bg-[#111] border border-[#222] overflow-hidden">
                    {selectedPart.image || selectedPart.image_url ? (
                      <img
                        src={selectedPart.image || selectedPart.image_url}
                        alt={selectedPart.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Zap className="w-16 h-16 text-[#333]" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-bold tracking-[0.2em] bg-[#111] text-[#6b6b6b] px-3 py-1.5 border border-[#222] uppercase">
                      {selectedPart.category}
                    </span>
                    {isInStock ? (
                      <span className="text-[10px] font-bold tracking-[0.2em] bg-[#221515] text-[#d63a2f] px-3 py-1.5 border border-[#d63a2f] uppercase flex items-center gap-1">
                        <CheckCircle size={10} /> IN STOCK ({stockQty})
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold tracking-[0.2em] bg-[#111] text-[#6b6b6b] px-3 py-1.5 border border-[#333] uppercase">
                        OUT OF STOCK
                      </span>
                    )}
                  </div>

                  <h2 className="font-display text-3xl text-white uppercase leading-tight mb-2 tracking-wide">{selectedPart.name}</h2>

                  {/* Rating */}
                  {selectedPart.rating && (
                    <div className="flex items-center gap-2 mb-6 border-b border-[#222] pb-6">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < Math.round(selectedPart.rating!) ? "fill-[#d63a2f] text-[#d63a2f]" : "text-[#333]"}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold tracking-widest uppercase text-[#555] ml-2">({selectedPart.reviews} REVIEWS)</span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-end gap-3 mb-8">
                    <span className="font-display text-5xl font-black text-[#d63a2f] leading-none tracking-tight">₱{selectedPart.price.toLocaleString()}</span>
                  </div>

                  {/* Description */}
                  {selectedPart.description && (
                    <div className="mb-8 flex-1">
                      <h4 className="text-[10px] font-bold text-[#6b6b6b] uppercase tracking-[0.2em] mb-3">DESCRIPTION</h4>
                      <p className="text-[#888] text-xs font-light leading-relaxed">{selectedPart.description}</p>
                    </div>
                  )}

                  {/* SKU */}
                  {selectedPart.sku && (
                    <div className="flex items-center gap-2 mb-8">
                      <Box size={14} className="text-[#555]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#555]">SKU: {selectedPart.sku}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-auto">
                    <button
                      onClick={() => handleInquiry(selectedPart.id)}
                      disabled={!isInStock || inquirySent === selectedPart.id}
                      className={`w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 font-bold text-[10px] tracking-[0.2em] uppercase transition-all border ${
                        inquirySent === selectedPart.id
                          ? "bg-[#d63a2f] border-[#d63a2f] text-white"
                          : isInStock
                            ? "bg-transparent border-[#d63a2f] text-[#d63a2f] hover:bg-[#d63a2f] hover:text-white"
                            : "bg-[#111] border-[#222] text-[#555] cursor-not-allowed"
                      }`}
                    >
                      {inquirySent === selectedPart.id ? (
                        <><CheckCircle size={16} /> INQUIRY SENT</>
                      ) : (
                        <><ShoppingCart size={16} /> INQUIRE NOW</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

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
          className="bg-[#0a0a0a] rounded-none border border-[#222] border-t-2 border-t-[#d63a2f] w-full sm:max-w-[1200px] h-[95vh] sm:h-auto sm:max-h-[94vh] overflow-hidden shadow-2xl flex flex-col"
        >
          {/* ── Top Bar ── */}
          <div className="flex items-start justify-between px-6 sm:px-10 py-6 border-b border-[#222] flex-shrink-0 bg-[#111111]">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-[#d63a2f] flex items-center justify-center shrink-0">
                <Package size={28} className="text-white" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3 text-[#d63a2f] text-[10px] font-bold tracking-[0.2em] uppercase">
                  <div className="w-6 h-[1px] bg-[#d63a2f]" /> INVENTORY
                </div>
                <h2 className="font-display text-3xl sm:text-4xl text-white uppercase leading-none tracking-wide">
                  BROWSE PARTS
                </h2>
                <p className="text-[#6b6b6b] text-xs font-light tracking-wide hidden sm:block">
                  Genuine motorcycle parts and accessories
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555] w-4 h-4" />
                <input
                  type="text"
                  placeholder="SEARCH PARTS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-72 bg-[#0a0a0a] text-white pl-12 pr-4 py-3 border border-[#333] focus:border-[#d63a2f] focus:outline-none transition text-xs font-bold tracking-widest uppercase rounded-none"
                />
              </div>
              <button onClick={onClose} className="p-2 border border-[#333] hover:bg-[#222] transition text-[#6b6b6b] hover:text-white shrink-0 mt-1 sm:mt-0">
                <X size={20} strokeWidth={1} />
              </button>
            </div>
          </div>

          {/* ── Category Icons Row ── */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 px-6 sm:px-10 py-4 border-b border-[#222] overflow-x-auto flex-shrink-0 bg-[#0a0a0a]">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex flex-col items-center gap-2 px-4 py-3 min-w-[72px] transition-all border ${
                    isActive
                      ? "bg-[#221515] text-[#d63a2f] border-[#d63a2f]"
                      : "text-[#6b6b6b] bg-transparent border-[#222] hover:bg-[#111111] hover:border-[#333]"
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                  <span className="text-[9px] font-bold tracking-widest uppercase whitespace-nowrap">{cat.label}</span>
                </button>
              );
            })}

            {/* Availability filters */}
            <div className="hidden sm:flex ml-auto items-center gap-3 pl-6 border-l border-[#222]">
              {(["all", "instock", "outofstock"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setStockFilter(f)}
                  className={`px-4 py-3 text-[9px] font-bold uppercase tracking-widest transition-all border ${
                    stockFilter === f
                      ? f === "instock" ? "bg-[#221515] text-[#d63a2f] border-[#d63a2f]"
                        : f === "outofstock" ? "bg-[#221n1] text-[#d63a2f] border-[#d63a2f]"
                        : "bg-[#111] text-white border-[#333]"
                      : "text-[#6b6b6b] border-[#222] hover:bg-[#111] hover:text-[#888]"
                  }`}
                >
                  {f === "all" ? "ALL" : f === "instock" ? "IN-STOCK" : "OUT-OF-STOCK"}
                </button>
              ))}
            </div>
          </div>

          {/* ── Mobile Search ── */}
          <div className="sm:hidden px-6 py-4 border-b border-[#222] flex-shrink-0 bg-[#0a0a0a]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555] w-4 h-4" />
              <input
                type="text"
                placeholder="SEARCH PARTS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111111] text-white pl-12 pr-4 py-4 border border-[#333] focus:border-[#d63a2f] focus:outline-none transition rounded-none uppercase text-xs tracking-widest font-bold"
              />
            </div>
          </div>

          {/* ── Product Grid ── */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 bg-[#0a0a0a]">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-3 border-[#d63a2f] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredParts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border border-[#222] bg-[#111]">
                <Package className="w-16 h-16 text-[#333] mb-4" strokeWidth={1} />
                <p className="text-[#6b6b6b] text-[10px] tracking-widest uppercase font-bold">NO PARTS FOUND</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 w-full">
                {filteredParts.map((part) => {
                  const isInStock = part.inStock ?? (part.quantity ?? part.quantity_in_stock ?? 0) > 0;
                  return (
                    <div
                      key={part.id}
                      className="group bg-[#111111] border border-[#222] hover:border-[#333] transition flex flex-col items-stretch max-w-full"
                    >
                      {/* Product Image */}
                      <div className="relative aspect-square bg-[#0a0a0a] border-b border-[#222] overflow-hidden cursor-pointer w-full" onClick={() => setSelectedPart(part)}>
                        {part.image || part.image_url ? (
                          <img
                            src={part.image || part.image_url}
                            alt={part.name}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Zap className="w-12 h-12 text-[#333]" />
                          </div>
                        )}
                        {/* Stock Badge */}
                        <div className="absolute top-3 right-3">
                          {isInStock ? (
                            <span className="bg-[#221515] border border-[#d63a2f] text-[#d63a2f] text-[8px] font-bold px-2 py-1 tracking-widest uppercase">
                              IN STOCK
                            </span>
                          ) : (
                            <span className="bg-[#111] border border-[#333] text-[#6b6b6b] text-[8px] font-bold px-2 py-1 tracking-widest uppercase">
                              SOLD OUT
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-4 sm:p-5 flex flex-col flex-1 w-full justify-between items-stretch">
                        <div className="w-full">
                          <p className="font-display text-2xl font-black text-[#d63a2f] mb-2 leading-none">
                            ₱{part.price.toLocaleString()}
                          </p>
                          <h3 className="font-display text-lg text-white mb-3 leading-tight uppercase group-hover:text-[#d63a2f] transition-colors break-words">
                            {part.name}
                          </h3>

                          {/* Rating Row */}
                          <div className="flex items-center gap-1 mb-5">
                            {part.rating && (
                              <>
                                <div className="flex gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={10}
                                      className={i < Math.round(part.rating!) ? "fill-[#d63a2f] text-[#d63a2f]" : "text-[#333]"}
                                    />
                                  ))}
                                </div>
                                <span className="text-[9px] font-bold tracking-widest text-[#555] ml-1">({part.reviews})</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Action Row */}
                        <div className="flex items-center justify-between mt-auto">
                          <button
                            onClick={() => setSelectedPart(part)}
                            className="text-[9px] text-[#6b6b6b] hover:text-[#d63a2f] transition flex items-center gap-1 font-bold tracking-widest uppercase"
                          >
                            <Info size={12} /> DETAILS
                          </button>
                          <button
                            disabled={!isInStock}
                            onClick={() => handleInquiry(part.id)}
                            className={`w-10 h-10 flex items-center justify-center transition border shrink-0 ${
                              inquirySent === part.id
                                ? "bg-[#d63a2f] border-[#d63a2f] text-white"
                                : isInStock
                                  ? "bg-transparent border-[#d63a2f] text-[#d63a2f] hover:bg-[#d63a2f] hover:text-white"
                                  : "bg-[#111] border-[#222] text-[#555] cursor-not-allowed"
                            }`}
                          >
                            {inquirySent === part.id ? <CheckCircle size={16} /> : <ShoppingCart size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
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
