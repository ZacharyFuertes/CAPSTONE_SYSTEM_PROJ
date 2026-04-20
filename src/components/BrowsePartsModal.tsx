/**
 * BrowsePartsModal.tsx
 * Read-only gallery for customers — browse items, view prices & descriptions.
 * No purchase / reserve / cart actions.
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
  ArrowLeft,
  Box,
  CheckCircle,
  Eye,
  ShoppingCart,
  Plus,
} from "lucide-react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { usePartsList } from "../contexts/PartsListContext";
import { Part } from "../types";

interface BrowsePartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginRedirect?: () => void;
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
}) => {
  const { user } = useAuth();
  const { addToList } = usePartsList();
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
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  const [addedToList, setAddedToList] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchParts();
      if (user?.id) {
        fetchOrders();
      }
    }
  }, [isOpen, user?.id]);

  const fetchOrders = async () => {
    if (!user?.id) return;
    try {
      setLoadingOrders(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", user.id)
        .in("status", ["pending", "completed"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleAddToCart = async (part: Part) => {
    if (!user?.id) return;
    
    if (loadingOrders) {
      alert("Loading your appointments. Please wait a moment and try again.");
      return;
    }
    
    if (orders.length === 0) {
      alert("Please book an appointment first to add parts to your receipt.");
      return;
    }

    try {
      // Use selected order or the latest one
      const targetOrder = selectedOrder 
        ? orders.find(o => o.id === selectedOrder)
        : orders[0];

      if (!targetOrder) {
        alert("No order found. Please book an appointment first.");
        return;
      }

      const newPart = {
        part_id: part.id,
        part_name: part.name,
        quantity: 1,
        unit_price: part.unit_price,
      };

      const existingParts = targetOrder.parts || [];
      const existingPartIndex = existingParts.findIndex(
        (p: any) => p.part_id === part.id
      );

      let updatedParts;
      if (existingPartIndex >= 0) {
        existingParts[existingPartIndex].quantity += 1;
        updatedParts = existingParts;
      } else {
        updatedParts = [...existingParts, newPart];
      }

      const totalAmount = updatedParts.reduce(
        (sum: number, p: any) => sum + p.unit_price * p.quantity,
        0
      );

      const { error } = await supabase
        .from("orders")
        .update({
          parts: updatedParts,
          total_amount: totalAmount,
        })
        .eq("id", targetOrder.id);

      if (error) throw error;

      setAddedToCart(part.id);
      setTimeout(() => setAddedToCart(null), 2000);

      // Refresh orders
      fetchOrders();
    } catch (error) {
      console.error("Error adding part to order:", error);
      alert("Failed to add part. Please try again.");
    }
  };

  const handleAddToList = (part: Part) => {
    addToList(part);
    setAddedToList(part.id);
    setTimeout(() => setAddedToList(null), 2000);
  };

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

  if (!isOpen) return null;

  // ── Part detail view (read-only) ──
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
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className="text-[10px] font-bold tracking-[0.2em] bg-[#111] text-[#6b6b6b] px-3 py-1.5 border border-[#222] uppercase">
                      {selectedPart.category}
                    </span>
                    {isInStock ? (
                      <span className="text-[10px] font-bold tracking-[0.2em] bg-[#152215] text-[#4ade80] px-3 py-1.5 border border-[#4ade80]/40 uppercase flex items-center gap-1">
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
                      <p className="text-[#888] text-sm font-light leading-relaxed">
                        {selectedPart.description}
                      </p>
                    </div>
                  )}

                  {/* SKU */}
                  {selectedPart.sku && (
                    <div className="flex items-center gap-2 mb-4">
                      <Box size={14} className="text-[#555]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#555]">
                        SKU: {selectedPart.sku}
                      </span>
                    </div>
                  )}

                  {/* Gallery-only note */}
                  <div className="mt-auto pt-4 border-t border-[#222] space-y-3">
                    {orders.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-[10px] tracking-[0.2em] font-medium uppercase text-[#6b6b6b]">
                          Add to Receipt
                        </label>
                        <select
                          value={selectedOrder || ""}
                          onChange={(e) => setSelectedOrder(e.target.value || null)}
                          className="w-full bg-[#0a0a0a] border border-[#333] text-white px-3 py-2 text-xs focus:border-[#d63a2f] focus:outline-none rounded-none uppercase font-bold tracking-wider"
                        >
                          <option value="">Select Receipt (Latest)</option>
                          {orders.map((order) => (
                            <option key={order.id} value={order.id}>
                              {order.service_type || "Unnamed"} -{" "}
                              {order.scheduled_date}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {/* Add to List Button */}
                    <button
                      onClick={() => handleAddToList(selectedPart)}
                      className={`w-full py-3 px-4 font-bold uppercase tracking-widest text-sm transition flex items-center justify-center gap-2 border ${
                        addedToList === selectedPart.id
                          ? "bg-[#4ade80] text-white border-[#4ade80]"
                          : "bg-[#111] text-white border-[#333] hover:border-[#555] hover:bg-[#1a1a1a]"
                      }`}
                    >
                      <Plus size={18} />
                      {addedToList === selectedPart.id
                        ? "ADDED TO MY LIST"
                        : "ADD TO MY LIST"}
                    </button>
                    {/* Add to Receipt Button */}
                    <button
                      onClick={() => handleAddToCart(selectedPart)}
                      disabled={!isInStock || orders.length === 0}
                      className={`w-full py-3 px-4 font-bold uppercase tracking-widest text-sm transition flex items-center justify-center gap-2 ${
                        !isInStock || orders.length === 0
                          ? "bg-[#111] border border-[#333] text-[#555] cursor-not-allowed"
                          : addedToCart === selectedPart.id
                            ? "bg-[#4ade80] text-white border border-[#4ade80]"
                            : "bg-[#d63a2f] text-white border border-[#d63a2f] hover:bg-[#c0322a]"
                      }`}
                    >
                      <ShoppingCart size={18} />
                      {orders.length === 0
                        ? "BOOK APPOINTMENT FIRST"
                        : addedToCart === selectedPart.id
                          ? "ADDED TO RECEIPT"
                          : "ADD TO RECEIPT"}
                    </button>
                    {orders.length === 0 && (
                      <p className="text-[10px] text-[#d63a2f] font-bold uppercase tracking-widest text-center">
                        Book an appointment to start adding parts
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ── Main gallery grid ──
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
                  <div className="w-6 h-[1px] bg-[#d63a2f]" /> SHOP GALLERY
                </div>
                <h2 className="font-display text-3xl sm:text-4xl text-white uppercase leading-none tracking-wide">
                  OUR ITEMS
                </h2>
                <p className="text-[#6b6b6b] text-xs font-light tracking-wide hidden sm:block">
                  Browse our genuine motorcycle parts and accessories
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555] w-4 h-4" />
                <input
                  type="text"
                  placeholder="SEARCH ITEMS..."
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
                placeholder="SEARCH ITEMS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111111] text-white pl-12 pr-4 py-4 border border-[#333] focus:border-[#d63a2f] focus:outline-none transition rounded-none uppercase text-xs tracking-widest font-bold"
              />
            </div>
          </div>

          {/* ── Product Grid (Gallery — view only) ── */}
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
                  NO ITEMS FOUND
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 w-full">
                {filteredParts.map((part) => {
                  const isInStock = (part.quantity_in_stock ?? 0) > 0;
                  return (
                    <motion.div
                      key={part.id}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="group bg-[#111111] border border-[#222] hover:border-[#d63a2f]/40 transition-all flex flex-col items-stretch max-w-full"
                    >
                      {/* Product Image */}
                      <div
                        className="relative aspect-square bg-[#0a0a0a] border-b border-[#222] overflow-hidden w-full cursor-pointer"
                        onClick={() => setSelectedPart(part)}
                      >
                        {part.image_url ? (
                          <img
                            src={part.image_url}
                            alt={part.name}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Zap className="w-12 h-12 text-[#333]" />
                          </div>
                        )}
                        {/* Stock Badge */}
                        <div className="absolute top-3 right-3">
                          {isInStock ? (
                            <span className="bg-[#152215] border border-[#4ade80]/40 text-[#4ade80] text-[8px] font-bold px-2 py-1 tracking-widest uppercase">
                              IN STOCK
                            </span>
                          ) : (
                            <span className="bg-[#111] border border-[#333] text-[#6b6b6b] text-[8px] font-bold px-2 py-1 tracking-widest uppercase">
                              SOLD OUT
                            </span>
                          )}
                        </div>
                        {/* View overlay on hover */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="flex items-center gap-2 text-white text-[10px] font-bold tracking-widest uppercase">
                            <Eye size={16} /> VIEW
                          </div>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-4 sm:p-5 flex flex-col flex-1 w-full justify-between items-stretch">
                        <div
                          className="w-full cursor-pointer"
                          onClick={() => setSelectedPart(part)}
                        >
                          <p className="font-display text-2xl font-black text-[#d63a2f] mb-2 leading-none">
                            ₱{part.unit_price.toLocaleString()}
                          </p>
                          <h3 className="font-display text-sm sm:text-base text-white mb-1 leading-tight uppercase group-hover:text-[#d63a2f] transition-colors break-words">
                            {part.name}
                          </h3>
                          {part.description && (
                            <p className="text-[11px] text-[#555] line-clamp-2 mt-1 leading-relaxed">
                              {part.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleAddToList(part)}
                            className={`flex-1 py-2 px-2 font-bold uppercase tracking-widest text-[10px] transition flex items-center justify-center gap-1 border ${
                              addedToList === part.id
                                ? "bg-[#4ade80] text-white border-[#4ade80]"
                                : "bg-[#111] border-[#333] text-[#888] hover:border-[#555] hover:text-white"
                            }`}
                            title="Add to your personal parts list"
                          >
                            <Plus size={12} />
                            <span className="hidden sm:inline">LIST</span>
                          </button>
                          <button
                            onClick={() => handleAddToCart(part)}
                            disabled={!isInStock}
                            className={`flex-1 py-2 px-2 font-bold uppercase tracking-widest text-[10px] transition flex items-center justify-center gap-1 border ${
                              !isInStock
                                ? "bg-[#111] border-[#333] text-[#555] cursor-not-allowed"
                                : addedToCart === part.id
                                  ? "bg-[#4ade80] text-white border-[#4ade80]"
                                  : "bg-[#d63a2f] text-white border-[#d63a2f] hover:bg-[#c0322a]"
                            }`}
                            title="Add to appointment receipt"
                          >
                            <ShoppingCart size={12} />
                            <span className="hidden sm:inline">RECEIPT</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Footer note ── */}
          <div className="px-6 sm:px-10 py-4 border-t border-[#222] bg-[#111] flex-shrink-0">
            <p className="text-[10px] text-[#555] font-bold uppercase tracking-widest text-center">
              Visit our shop for purchases &amp; inquiries
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BrowsePartsModal;
