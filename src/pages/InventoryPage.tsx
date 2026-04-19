import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  Download,
  ArrowLeft,
  Lock,
  X,
  Upload,
  Save,
  Package,
  Zap,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { inventoryService } from "../services/inventoryService";
import { imageService } from "../services/imageService";
import { Part } from "../types";

const categoryColors: Record<string, string> = {
  brakes: "from-red-500 to-red-600",
  tires: "from-gray-500 to-gray-600",
  oils: "from-yellow-500 to-yellow-600",
  electrical: "from-blue-500 to-blue-600",
  suspension: "from-purple-500 to-purple-600",
  exhaust: "from-orange-500 to-orange-600",
  filters: "from-green-500 to-green-600",
  other: "from-slate-500 to-slate-600",
};

interface InventoryFilters {
  category?: string;
  searchTerm: string;
  showLowStock: boolean;
}

interface InventoryPageProps {
  onNavigate?: (page: string) => void;
}

interface PartFormData {
  name: string;
  description: string;
  category: keyof typeof categoryColors;
  sku: string;
  unit_price: number;
  quantity_in_stock: number;
  reorder_level: number;
  image_url: string;
}

const InventoryPage: React.FC<InventoryPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { user, canManageInventory } = useAuth();
  const [parts, setParts] = useState<Part[]>([]);
  const [filters, setFilters] = useState<InventoryFilters>({
    searchTerm: "",
    showLowStock: false,
  });

  // Modal states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState<PartFormData>({
    name: "",
    description: "",
    category: "other",
    sku: "",
    unit_price: 0,
    quantity_in_stock: 0,
    reorder_level: 5,
    image_url: "",
  });

  // Fetch parts from database
  useEffect(() => {
    if (user?.shop_id) {
      fetchParts();
    }
  }, [user?.shop_id]);

  const fetchParts = async () => {
    try {
      const dbParts = await inventoryService.getParts(user?.shop_id || "");
      setParts(dbParts);
    } catch (err) {
      console.error("Error fetching parts:", err);
      setParts([]);
    }
  };



  // Add part handler
  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) {
      alert("Name and SKU are required");
      return;
    }

    try {
      setSaving(true);
      const newPart = await inventoryService.createPart({
        shop_id: user?.shop_id || "",
        name: formData.name,
        description: formData.description,
        category: formData.category as Part["category"],
        sku: formData.sku,
        unit_price: formData.unit_price,
        quantity_in_stock: formData.quantity_in_stock,
        reorder_level: formData.reorder_level,
        image_url: formData.image_url,
      });
      if (newPart) {
        setParts([...parts, newPart]);
        setShowAddForm(false);
        resetForm();
        alert("Part added successfully!");
      }
    } catch (err) {
      console.error("Error adding part:", err);
      alert("Failed to add part");
    } finally {
      setSaving(false);
    }
  };

  // Edit part handler
  const handleEditPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPart || !formData.name || !formData.sku) {
      alert("Name and SKU are required");
      return;
    }

    try {
      setSaving(true);

      // If image URL changed and old image exists, delete it from Supabase Storage
      if (
        formData.image_url !== selectedPart.image_url &&
        selectedPart.image_url
      ) {
        await imageService.deletePartImage(selectedPart.image_url);
      }

      const updated = await inventoryService.updatePart(selectedPart.id, {
        name: formData.name,
        description: formData.description,
        category: formData.category as Part["category"],
        sku: formData.sku,
        unit_price: formData.unit_price,
        quantity_in_stock: formData.quantity_in_stock,
        reorder_level: formData.reorder_level,
        image_url: formData.image_url,
      });
      if (updated) {
        setParts(parts.map((p) => (p.id === selectedPart.id ? updated : p)));
        setShowEditForm(false);
        setSelectedPart(null);
        resetForm();
        alert("Part updated successfully!");
      }
    } catch (err) {
      console.error("Error updating part:", err);
      alert("Failed to update part");
    } finally {
      setSaving(false);
    }
  };

  // Delete part handler
  const handleDeletePart = async () => {
    if (!selectedPart) return;

    try {
      setSaving(true);

      // Delete image from Supabase Storage if it exists
      if (selectedPart.image_url) {
        await imageService.deletePartImage(selectedPart.image_url);
      }

      const success = await inventoryService.deletePart(selectedPart.id);
      if (success) {
        setParts(parts.filter((p) => p.id !== selectedPart.id));
        setShowDeleteConfirm(false);
        setSelectedPart(null);
        alert("Part deleted successfully!");
      }
    } catch (err) {
      console.error("Error deleting part:", err);
      alert("Failed to delete part");
    } finally {
      setSaving(false);
    }
  };

  // Open edit form
  const openEditForm = (part: Part) => {
    setSelectedPart(part);
    setFormData({
      name: part.name,
      description: part.description || "",
      category: part.category,
      sku: part.sku,
      unit_price: part.unit_price,
      quantity_in_stock: part.quantity_in_stock,
      reorder_level: part.reorder_level,
      image_url: part.image_url || "",
    });
    setImagePreview(part.image_url || "");
    setShowEditForm(true);
  };

  // Handle image upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Show preview immediately
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);

        // Upload to Supabase Storage
        const uploadedUrl = await imageService.uploadPartImage(
          file,
          formData.name || "part",
        );

        if (uploadedUrl) {
          setFormData({ ...formData, image_url: uploadedUrl });
          setImagePreview(uploadedUrl);
        } else {
          alert("Failed to upload image");
        }
      } catch (err) {
        console.error("Error uploading image:", err);
        alert("Error uploading image");
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "other",
      sku: "",
      unit_price: 0,
      quantity_in_stock: 0,
      reorder_level: 5,
      image_url: "",
    });
    setImagePreview("");
  };

  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      const matchesSearch =
        part.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        part.sku.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesCategory =
        !filters.category || part.category === filters.category;

      const matchesLowStock =
        !filters.showLowStock || part.quantity_in_stock <= part.reorder_level;

      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [parts, filters]);

  const categories = Array.from(new Set(parts.map((p) => p.category)));

  const handleExportCSV = () => {
    const csv = [
      [
        "Part Name",
        "SKU",
        "Category",
        "Unit Price",
        "In Stock",
        "Reorder Level",
        "Status",
      ].join(","),
      ...filteredParts.map((part) =>
        [
          part.name,
          part.sku,
          part.category,
          part.unit_price,
          part.quantity_in_stock,
          part.reorder_level,
          part.quantity_in_stock <= part.reorder_level ? "LOW STOCK" : "OK",
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const isOwner = canManageInventory();

  // ── Shared input class for the brutalist theme ──
  const inputClass =
    "w-full bg-[#0a0a0a] text-white px-4 py-3 border border-[#333] focus:border-[#d63a2f] focus:outline-none transition text-xs font-bold tracking-widest uppercase rounded-none";
  const labelClass =
    "block text-[10px] font-bold text-[#6b6b6b] mb-2 uppercase tracking-[0.2em]";

  // ── Reusable form fields component ──
  const renderFormFields = () => (
    <>
      {/* Image Upload */}
      <div>
        <label className={labelClass}>Part Image</label>
        <div className="relative">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-44 object-cover border border-[#333] mb-2"
            />
          ) : (
            <div className="w-full h-44 bg-[#0a0a0a] border border-[#222] flex flex-col items-center justify-center mb-2 gap-2">
              <Upload className="w-8 h-8 text-[#333]" />
              <span className="text-[9px] text-[#555] font-bold tracking-widest uppercase">
                UPLOAD IMAGE
              </span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <p className="text-[9px] text-[#555] tracking-widest uppercase font-bold">
            Click or drag to upload
          </p>
        </div>
      </div>

      {/* Name & SKU */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Part Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>SKU *</label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) =>
              setFormData({ ...formData, sku: e.target.value })
            }
            className={inputClass}
            required
          />
        </div>
      </div>

      {/* Category & Price */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Category</label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({
                ...formData,
                category: e.target.value as keyof typeof categoryColors,
              })
            }
            className={inputClass}
          >
            {Object.keys(categoryColors).map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Unit Price (₱)</label>
          <input
            type="number"
            value={formData.unit_price}
            onChange={(e) =>
              setFormData({
                ...formData,
                unit_price: parseFloat(e.target.value),
              })
            }
            className={inputClass}
          />
        </div>
      </div>

      {/* Quantity & Reorder */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Quantity in Stock</label>
          <input
            type="number"
            value={formData.quantity_in_stock}
            onChange={(e) =>
              setFormData({
                ...formData,
                quantity_in_stock: parseInt(e.target.value),
              })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Reorder Level</label>
          <input
            type="number"
            value={formData.reorder_level}
            onChange={(e) =>
              setFormData({
                ...formData,
                reorder_level: parseInt(e.target.value),
              })
            }
            className={inputClass}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          className={`${inputClass} normal-case`}
          style={{ textTransform: "none" }}
        />
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 sm:p-8">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => onNavigate && onNavigate("dashboard")}
        className="mb-8 flex items-center gap-3 text-[#d63a2f] hover:text-white transition-colors group"
      >
        <div className="w-10 h-10 bg-[#111] border border-[#333] group-hover:border-[#d63a2f] flex items-center justify-center transition">
          <ArrowLeft size={18} strokeWidth={1.5} />
        </div>
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Back to Dashboard</span>
      </motion.button>

      {/* Role Info Banner */}
      {!isOwner && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-[#221515] border border-[#d63a2f]/30 p-5 flex items-start gap-4"
        >
          <Lock className="w-5 h-5 text-[#d63a2f] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-[10px] font-bold text-[#d63a2f] mb-1 tracking-[0.2em] uppercase">
              Read-Only Access
            </h3>
            <p className="text-[#888] text-xs font-light">
              You are viewing inventory in read-only mode. Only shop owners can
              add, edit, or delete parts.
            </p>
          </div>
        </motion.div>
      )}




      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-[#d63a2f] flex items-center justify-center shrink-0">
              <Package size={28} className="text-white" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-3 text-[#d63a2f] text-[10px] font-bold tracking-[0.2em] uppercase mb-1.5">
                <div className="w-6 h-[1px] bg-[#d63a2f]" /> MANAGEMENT
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-wide leading-none">
                {t("inventory.title")}
              </h1>
              <p className="text-[#6b6b6b] text-xs font-light tracking-wide mt-1">
                {isOwner ? "Manage" : "View"} {filteredParts.length} /{" "}
                {parts.length} parts in inventory
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-transparent border border-[#333] hover:border-[#555] text-[#6b6b6b] hover:text-white px-5 py-3 transition text-[10px] font-bold tracking-[0.15em] uppercase"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            {/* Add Part Button - Only for Owners (TODO: implemented — hidden for mechanics) */}
            {isOwner && (
              <button
                onClick={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
                className="flex items-center gap-2 bg-[#d63a2f] hover:bg-[#b82e25] text-white px-5 py-3 transition text-[10px] font-bold tracking-[0.15em] uppercase border border-[#d63a2f]"
                title="Add new part"
              >
                <Plus className="w-5 h-5" />
                {t("inventory.add_part")}
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-[#111] p-4 border border-[#222]">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
            <input
              type="text"
              placeholder={t("inventory.search")}
              value={filters.searchTerm}
              onChange={(e) =>
                setFilters({ ...filters, searchTerm: e.target.value })
              }
              className="w-full bg-[#0a0a0a] text-white pl-12 pr-4 py-3 border border-[#333] focus:border-[#d63a2f] focus:outline-none transition text-xs font-bold tracking-widest uppercase rounded-none"
            />
          </div>

          <select
            value={filters.category || ""}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value || undefined })
            }
            className="bg-[#0a0a0a] text-white px-4 py-3 border border-[#333] focus:border-[#d63a2f] focus:outline-none transition text-xs font-bold tracking-widest uppercase rounded-none"
          >
            <option value="">{t("inventory.category")} - All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          <button
            onClick={() =>
              setFilters({ ...filters, showLowStock: !filters.showLowStock })
            }
            className={`px-5 py-3 text-[9px] font-bold uppercase tracking-widest transition-all border ${
              filters.showLowStock
                ? "bg-[#221515] text-[#d63a2f] border-[#d63a2f]"
                : "text-[#6b6b6b] border-[#222] hover:bg-[#111] hover:text-[#888]"
            }`}
          >
            {t("inventory.low_stock")}
          </button>
        </div>
      </motion.div>

      {/* Parts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <AnimatePresence>
          {filteredParts.map((part, index) => {
            const isLowStock = part.quantity_in_stock <= part.reorder_level;
            return (
              <motion.div
                key={part.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.04 }}
                className="group bg-[#111] border border-[#222] hover:border-[#333] transition flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-[#0a0a0a] border-b border-[#222] overflow-hidden">
                  {part.image_url ? (
                    <img
                      src={part.image_url}
                      alt={part.name}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Zap className="w-12 h-12 text-[#333]" />
                    </div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                    {isLowStock && (
                      <span className="bg-[#221515] border border-[#d63a2f] text-[#d63a2f] text-[8px] font-bold px-2.5 py-1 tracking-widest uppercase flex items-center gap-1">
                        <AlertCircle size={10} /> LOW STOCK
                      </span>
                    )}
                    <span className="bg-[#111] border border-[#333] text-[#6b6b6b] text-[8px] font-bold px-2.5 py-1 tracking-widest uppercase">
                      {part.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-black text-white uppercase leading-tight tracking-wide group-hover:text-[#d63a2f] transition-colors truncate">
                        {part.name}
                      </h3>
                      <p className="text-[9px] text-[#555] mt-1 font-bold tracking-widest uppercase">
                        SKU: {part.sku}
                      </p>
                    </div>
                  </div>

                  {part.description && (
                    <p className="text-[#666] text-xs font-light leading-relaxed mb-4 line-clamp-2">
                      {part.description}
                    </p>
                  )}

                  {/* Stock Bar */}
                  <div className="bg-[#0a0a0a] border border-[#222] p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] text-[#555] font-bold tracking-widest uppercase">
                        {t("inventory.stock")}
                      </span>
                      <span
                        className={`text-xs font-black ${
                          isLowStock ? "text-[#d63a2f]" : "text-[#4ade80]"
                        }`}
                      >
                        {part.quantity_in_stock}
                      </span>
                    </div>
                    <div className="w-full bg-[#222] h-1">
                      <div
                        className={`h-1 transition-all ${
                          isLowStock ? "bg-[#d63a2f]" : "bg-[#4ade80]"
                        }`}
                        style={{
                          width: `${Math.min((part.quantity_in_stock / Math.max(part.reorder_level * 3, 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-black text-[#d63a2f]">
                      ₱{part.unit_price.toLocaleString()}
                    </span>
                    {/* CRUD Buttons - Only visible to Owners (TODO: implemented — mechanics see nothing, pure read-only) */}
                    {isOwner && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => openEditForm(part)}
                          className="w-9 h-9 flex items-center justify-center border border-[#333] text-[#6b6b6b] hover:border-[#d63a2f] hover:text-[#d63a2f] hover:bg-[#221515] transition"
                          title="Edit part"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPart(part);
                            setShowDeleteConfirm(true);
                          }}
                          className="w-9 h-9 flex items-center justify-center border border-[#333] text-[#6b6b6b] hover:border-[#d63a2f] hover:text-[#d63a2f] hover:bg-[#221515] transition"
                          title="Delete part"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredParts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 border border-[#222] bg-[#111] mt-6"
        >
          <Package className="w-16 h-16 text-[#333] mb-4" strokeWidth={1} />
          <p className="text-[#6b6b6b] text-[10px] tracking-widest uppercase font-bold">
            No parts found matching your filters
          </p>
        </motion.div>
      )}

      {/* ══════════ ADD PART MODAL ══════════ */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0a0a] border border-[#222] border-t-2 border-t-[#d63a2f] max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-[#222] bg-[#111] flex-shrink-0">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-[#d63a2f] flex items-center justify-center shrink-0">
                    <Plus size={24} className="text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 text-[#d63a2f] text-[10px] font-bold tracking-[0.2em] uppercase">
                      <div className="w-6 h-[1px] bg-[#d63a2f]" /> NEW ENTRY
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-wide leading-none">
                      Add Part
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 border border-[#333] hover:bg-[#222] transition text-[#6b6b6b] hover:text-white"
                >
                  <X size={20} strokeWidth={1} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleAddPart} className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
                {renderFormFields()}

                <div className="flex gap-3 pt-4 border-t border-[#222]">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#d63a2f] hover:bg-[#b82e25] text-white font-bold px-6 py-4 transition text-[10px] tracking-[0.2em] uppercase border border-[#d63a2f] disabled:opacity-50"
                  >
                    <Save size={16} />
                    {saving ? "SAVING..." : "SAVE PART"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-transparent border border-[#333] text-[#6b6b6b] hover:text-white hover:border-[#555] font-bold px-6 py-4 transition text-[10px] tracking-[0.2em] uppercase"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ EDIT PART MODAL ══════════ */}
      <AnimatePresence>
        {showEditForm && selectedPart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0a0a] border border-[#222] border-t-2 border-t-[#d63a2f] max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-[#222] bg-[#111] flex-shrink-0">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-[#d63a2f] flex items-center justify-center shrink-0">
                    <Edit2 size={22} className="text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 text-[#d63a2f] text-[10px] font-bold tracking-[0.2em] uppercase">
                      <div className="w-6 h-[1px] bg-[#d63a2f]" /> EDIT ENTRY
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-wide leading-none truncate max-w-[300px]">
                      {selectedPart.name}
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditForm(false)}
                  className="p-2 border border-[#333] hover:bg-[#222] transition text-[#6b6b6b] hover:text-white"
                >
                  <X size={20} strokeWidth={1} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleEditPart} className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
                {renderFormFields()}

                <div className="flex gap-3 pt-4 border-t border-[#222]">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#d63a2f] hover:bg-[#b82e25] text-white font-bold px-6 py-4 transition text-[10px] tracking-[0.2em] uppercase border border-[#d63a2f] disabled:opacity-50"
                  >
                    <Save size={16} />
                    {saving ? "UPDATING..." : "UPDATE PART"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="flex-1 bg-transparent border border-[#333] text-[#6b6b6b] hover:text-white hover:border-[#555] font-bold px-6 py-4 transition text-[10px] tracking-[0.2em] uppercase"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ DELETE CONFIRMATION MODAL ══════════ */}
      <AnimatePresence>
        {showDeleteConfirm && selectedPart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0a0a] border border-[#222] border-t-2 border-t-[#d63a2f] max-w-md w-full shadow-2xl"
            >
              {/* Header */}
              <div className="px-8 py-6 border-b border-[#222] bg-[#111]">
                <div className="flex items-center gap-3 text-[#d63a2f] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">
                  <div className="w-6 h-[1px] bg-[#d63a2f]" /> CONFIRM DELETE
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-wide">
                  Delete Part?
                </h3>
              </div>

              {/* Body */}
              <div className="px-8 py-6">
                <p className="text-[#888] text-sm font-light mb-2">
                  Are you sure you want to delete:
                </p>
                <p className="text-white font-black text-lg uppercase tracking-wide mb-6">
                  {selectedPart.name}
                </p>
                <p className="text-[#555] text-xs font-light">
                  This action cannot be undone. The part and its image will be permanently removed.
                </p>
              </div>

              {/* Footer */}
              <div className="flex gap-3 px-8 py-6 border-t border-[#222]">
                <button
                  onClick={handleDeletePart}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#d63a2f] hover:bg-[#b82e25] text-white font-bold px-6 py-4 transition text-[10px] tracking-[0.2em] uppercase border border-[#d63a2f] disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  {saving ? "DELETING..." : "DELETE"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-transparent border border-[#333] text-[#6b6b6b] hover:text-white hover:border-[#555] font-bold px-6 py-4 transition text-[10px] tracking-[0.2em] uppercase"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InventoryPage;
