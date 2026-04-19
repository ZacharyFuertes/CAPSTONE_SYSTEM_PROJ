/**
 * BrowsePartsModal.tsx
 * TODO: implemented — Replaced "Add to Cart" / "Inquire" with "Reserve" button
 * Only logged-in customers can reserve. Non-logged-in users are prompted to log in.
 */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
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
  LogIn,
  Bookmark,
} from "lucide-react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { Part } from "../types";
import { createReservation } from "../services/reservationService";

interface BrowsePartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginRedirect?: () => void; // callback to redirect to login page
}

const CATEGORIES = [
  { id: "all", label: "All Parts", icon: Package },
  { id: "filters", label: "Filters", icon: Filter },
  { id: "brakes", label: "Brakes", icon: Disc3 },
  { id: "electrical", label: "Electrical", icon: Cable },
  { id: "fluids", label: "Fluids", icon: Droplet },
  { id: "oils", label: "Oils", icon: Droplet },
  { id: "suspension", label: "Suspension", icon: CircleDot },
  { id: "exhaust", label: "Exhaust", icon: SlidersHorizontal },
];

const BrowsePartsModal: React.FC<BrowsePartsModalProps> = ({
  isOpen,
  onClose,
  onLoginRedirect,
}) => {
  const { user, isAuthenticated } = useAuth();
  const shopId = user?.shop_id || "";
  const [parts, setParts] = useState<Part[]>([]);
  const [filteredParts, setFilteredParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<
    "all" | "instock" | "outofstock"
  >("all");
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  // TODO: implemented — Reservation state replaces old inquirySent
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [reservedIds, setReservedIds] = useState<Set<string>>(new Set());
  const [reserveError, setReserveError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchParts();
    }
  }, [isOpen, shopId]);

  const fetchParts = async () => {
    try {
      setLoading(true);
      let query = supabase.from("parts").select("*").order("name", { ascending: true });
      if (shopId) {
        query = query.eq("shop_id", shopId);
      }
      const { data, error } = await query;
      if (error) throw error;
      setParts((data as Part[]) || []);
    } catch (err) {
      console.error("Error fetching parts:", err);
      setParts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = parts;
    if (selectedCategory !== "all") {
      result = result.filter(
        (p) =>
          (p.category || "").toLowerCase() === selectedCategory.toLowerCase(),
      );
    }
    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    if (stockFilter === "instock") {
      result = result.filter((p) => (p.quantity_in_stock ?? 0) > 0);
    } else if (stockFilter === "outofstock") {
      result = result.filter((p) => (p.quantity_in_stock ?? 0) === 0);
    }
    setFilteredParts(result);
  }, [parts, selectedCategory, searchQuery, stockFilter]);

  // TODO: implemented — Reserve handler with login check
  const handleReserve = async (partId: string) => {
    // If not logged in, redirect to login
    if (!isAuthenticated || !user) {
      onClose();
      if (onLoginRedirect) {
        onLoginRedirect();
      }
      return;
    }

    // Only customers can reserve
    if (user.role !== "customer") {
      setReserveError("Only customers can reserve items.");
      setTimeout(() => setReserveError(null), 3000);
      return;
    }

    try {
      setReservingId(partId);
      setReserveError(null);
      await createReservation(user.id, partId, 1);
      setReservedIds((prev) => new Set([...prev, partId]));
    } catch (err: any) {
      console.error("Reserve error:", err);
      setReserveError(err.message || "Failed to reserve. Please try again.");
      setTimeout(() => setReserveError(null), 3000);
    } finally {
      setReservingId(null);
    }
  };

  if (!isOpen) return null;

  // Helper to render the reserve button
  const renderReserveButton = (part: Part, isCompact: boolean = false) => {
    const isInStock = (part.quantity_in_stock ?? 0) > 0;
    const isReserved = reservedIds.has(part.id);
    const isReserving = reservingId === part.id;

    if (isReserved) {
      // Already reserved state
      return isCompact ? (
        <button
          disabled
          className="w-10 h-10 flex items-center justify-center transition border shrink-0 bg-[#d63a2f] border-[#d63a2f] text-white"
        >
          <CheckCircle size={16} />
        </button>
      ) : (
        <button
          disabled
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 font-bold text-[10px] tracking-[0.2em] uppercase transition-all border bg-[#d63a2f] border-[#d63a2f] text-white"
        >
          <CheckCircle size={16} /> RESERVED
        </button>
      );
    }

    if (!isAuthenticated) {
      // Not logged in — show "Login to Reserve"
      return isCompact ? (
        <button
          onClick={() => handleReserve(part.id)}
          className="w-10 h-10 flex items-center justify-center transition border shrink-0 bg-transparent border-[#d63a2f] text-[#d63a2f] hover:bg-[#d63a2f] hover:text-white"
          title="Login to Reserve"
        >
          <LogIn size={16} />
        </button>
      ) : (
        <button
          onClick={() => handleReserve(part.id)}
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 font-bold text-[10px] tracking-[0.2em] uppercase transition-all border bg-transparent border-[#d63a2f] text-[#d63a2f] hover:bg-[#d63a2f] hover:text-white"
        >
          <LogIn size={16} /> LOGIN TO RESERVE
        </button>
      );
    }

    if (!isInStock) {
      return isCompact ? (
        <button
          disabled
          className="w-10 h-10 flex items-center justify-center transition border shrink-0 bg-[#111] border-[#222] text-[#555] cursor-not-allowed"
        >
          <Bookmark size={16} />
        </button>
      ) : (
        <button
          disabled
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 font-bold text-[10px] tracking-[0.2em] uppercase transition-all border bg-[#111] border-[#222] text-[#555] cursor-not-allowed"
        >
          <Bookmark size={16} /> OUT OF STOCK
        </button>
      );
    }

    // Available to reserve
    return isCompact ? (
      <button
        onClick={() => handleReserve(part.id)}
        disabled={isReserving}
        className="w-10 h-10 flex items-center justify-center transition border shrink-0 bg-transparent border-[#d63a2f] text-[#d63a2f] hover:bg-[#d63a2f] hover:text-white disabled:opacity-50"
      >
        {isReserving ? (
          <div className="w-4 h-4 border-2 border-[#d63a2f] border-t-transparent rounded-full animate-spin" />
        ) : (
          <Bookmark size={16} />
        )}
      </button>
    ) : (
      <button
        onClick={() => handleReserve(part.id)}
        disabled={isReserving}
        className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 font-bold text-[10px] tracking-[0.2em] uppercase transition-all border bg-transparent border-[#d63a2f] text-[#d63a2f] hover:bg-[#d63a2f] hover:text-white disabled:opacity-50"
      >
        {isReserving ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            RESERVING...
          </>
        ) : (
          <>
            <Bookmark size={16} /> RESERVE
          </>
        )}
      </button>
    );
  };

  // Part detail view
  if (selectedPart) {
    const isInStock = (selectedPart.quantity_in_stock ?? 0) > 0;
    const stockQty = selectedPart.quantity_in_stock ?? 0;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-3 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
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
              <button
                onClick={onClose}
                className="p-2 border border-[#333] hover:bg-[#222] transition text-[#6b6b6b] hover:text-white shrink-0"
              >
                <X size={20} strokeWidth={1} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 bg-[#0a0a0a]">
              {/* Reserve error */}
              {reserveError && (
                <div className="mb-4 bg-[#221515] border border-[#d63a2f]/30 px-4 py-3 text-[#d63a2f] text-xs font-bold tracking-widest uppercase">
                  {reserveError}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-8">
                {/* Image */}
                <div className="w-full sm:w-[320px] flex-shrink-0">
                  <div className="aspect-square bg-[#111] border border-[#222] overflow-hidden">
                    {selectedPart.image_url ? (
                      <img
                        src={selectedPart.image_url}
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

                  <h2 className="font-display text-3xl text-white uppercase leading-tight mb-2 tracking-wide">
                    {selectedPart.name}
                  </h2>

                  {/* Price */}
                  <div className="flex items-end gap-3 mb-8 border-b border-[#222] pb-6">
                    <span className="font-display text-5xl font-black text-[#d63a2f] leading-none tracking-tight">
                      ₱{selectedPart.unit_price.toLocaleString()}
                    </span>
                  </div>

                  {/* Description */}
                  {selectedPart.description && (
                    <div className="mb-8 flex-1">
                      <h4 className="text-[10px] font-bold text-[#6b6b6b] uppercase tracking-[0.2em] mb-3">
                        DESCRIPTION
                      </h4>
                      <p className="text-[#888] text-xs font-light leading-relaxed">
                        {selectedPart.description}
                      </p>
                    </div>
                  )}

                  {/* SKU */}
                  {selectedPart.sku && (
                    <div className="flex items-center gap-2 mb-8">
                      <Box size={14} className="text-[#555]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#555]">
                        SKU: {selectedPart.sku}
                      </span>
                    </div>
                  )}

                  {/* Reserve Button */}
                  <div className="mt-auto">
                    {renderReserveButton(selectedPart, false)}
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
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
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
              {/* Login status hint */}
              {!isAuthenticated && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-[#111] border border-[#333] text-[#6b6b6b] text-[9px] font-bold tracking-widest uppercase">
                  <LogIn size={12} /> LOGIN TO RESERVE
                </div>
              )}
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
              <button
                onClick={onClose}
                className="p-2 border border-[#333] hover:bg-[#222] transition text-[#6b6b6b] hover:text-white shrink-0 mt-1 sm:mt-0"
              >
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
                  <span className="text-[9px] font-bold tracking-widest uppercase whitespace-nowrap">
                    {cat.label}
                  </span>
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
                      ? f === "instock"
                        ? "bg-[#221515] text-[#d63a2f] border-[#d63a2f]"
                        : f === "outofstock"
                          ? "bg-[#221515] text-[#d63a2f] border-[#d63a2f]"
                          : "bg-[#111] text-white border-[#333]"
                      : "text-[#6b6b6b] border-[#222] hover:bg-[#111] hover:text-[#888]"
                  }`}
                >
                  {f === "all"
                    ? "ALL"
                    : f === "instock"
                      ? "IN-STOCK"
                      : "OUT-OF-STOCK"}
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

          {/* ── Reserve Error Banner ── */}
          <AnimatePresence>
            {reserveError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 sm:px-10 py-3 bg-[#221515] border-b border-[#d63a2f]/30 text-[#d63a2f] text-xs font-bold tracking-widest uppercase flex-shrink-0"
              >
                {reserveError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Product Grid ── */}
          <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 bg-[#0a0a0a]">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-3 border-[#d63a2f] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredParts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border border-[#222] bg-[#111]">
                <Package
                  className="w-16 h-16 text-[#333] mb-4"
                  strokeWidth={1}
                />
                <p className="text-[#6b6b6b] text-[10px] tracking-widest uppercase font-bold">
                  NO PARTS FOUND
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 w-full">
                {filteredParts.map((part) => {
                  const isInStock = (part.quantity_in_stock ?? 0) > 0;
                  return (
                    <div
                      key={part.id}
                      className="group bg-[#111111] border border-[#222] hover:border-[#333] transition flex flex-col items-stretch max-w-full"
                    >
                      {/* Product Image */}
                      <div
                        className="relative aspect-square bg-[#0a0a0a] border-b border-[#222] overflow-hidden cursor-pointer w-full"
                        onClick={() => setSelectedPart(part)}
                      >
                        {part.image_url ? (
                          <img
                            src={part.image_url}
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
                            ₱{part.unit_price.toLocaleString()}
                          </p>
                          <h3 className="font-display text-lg text-white mb-3 leading-tight uppercase group-hover:text-[#d63a2f] transition-colors break-words">
                            {part.name}
                          </h3>
                        </div>

                        {/* Action Row — TODO: implemented — Reserve replaces old Cart */}
                        <div className="flex items-center justify-between mt-auto">
                          <button
                            onClick={() => setSelectedPart(part)}
                            className="text-[9px] text-[#6b6b6b] hover:text-[#d63a2f] transition flex items-center gap-1 font-bold tracking-widest uppercase"
                          >
                            <Info size={12} /> DETAILS
                          </button>
                          {renderReserveButton(part, true)}
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
