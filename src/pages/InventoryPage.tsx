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
  const [deniedMessage, setDeniedMessage] = useState(false);

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

  // Handle unauthorized action
  const handleUnauthorizedAction = () => {
    setDeniedMessage(true);
    setTimeout(() => setDeniedMessage(false), 3000);
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

      {/* Role Info Banner */}
      {!isOwner && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3"
        >
          <Lock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-300 mb-1">
              Read-Only Access
            </h3>
            <p className="text-blue-200 text-sm">
              You are viewing inventory in read-only mode. Only shop owners can
              add, edit, or delete parts.
            </p>
          </div>
        </motion.div>
      )}

      {/* Unauthorized Action Message */}
      <AnimatePresence>
        {deniedMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-red-600/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-red-300">Access Denied</h3>
              <p className="text-red-200 text-sm">
                Only shop owners can modify inventory.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {t("inventory.title")}
            </h1>
            <p className="text-slate-400">
              {isOwner ? "Manage" : "View"} {filteredParts.length} /{" "}
              {parts.length} parts in your inventory
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            {/* Add Part Button - Only for Owners */}
            {isOwner ? (
              <button
                onClick={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                title="Add new part"
              >
                <Plus className="w-5 h-5" />
                {t("inventory.add_part")}
              </button>
            ) : (
              <button
                disabled
                onClick={handleUnauthorizedAction}
                className="flex items-center gap-2 bg-slate-600 text-slate-400 px-4 py-2 rounded-lg cursor-not-allowed"
                title="Only owners can add parts"
              >
                <Lock className="w-4 h-4" />
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-800 p-4 rounded-lg border border-slate-700">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={t("inventory.search")}
              value={filters.searchTerm}
              onChange={(e) =>
                setFilters({ ...filters, searchTerm: e.target.value })
              }
              className="w-full bg-slate-700 text-white pl-10 pr-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          <select
            value={filters.category || ""}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value || undefined })
            }
            className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none transition"
          >
            <option value="">{t("inventory.category")} - All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition">
            <input
              type="checkbox"
              checked={filters.showLowStock}
              onChange={(e) =>
                setFilters({ ...filters, showLowStock: e.target.checked })
              }
              className="rounded"
            />
            <span className="text-sm">{t("inventory.low_stock")}</span>
          </label>
        </div>
      </motion.div>

      {/* Parts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredParts.map((part, index) => {
            const isLowStock = part.quantity_in_stock <= part.reorder_level;
            return (
              <motion.div
                key={part.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-slate-600 transition group"
              >
                {/* Image */}
                <div
                  className={`relative h-40 bg-gradient-to-br ${categoryColors[part.category]} overflow-hidden`}
                >
                  <img
                    src={part.image_url}
                    alt={part.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                  {isLowStock && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {part.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        SKU: {part.sku}
                      </p>
                    </div>
                    <span
                      className={`text-xs bg-gradient-to-r ${categoryColors[part.category]} text-white px-2 py-1 rounded`}
                    >
                      {part.category}
                    </span>
                  </div>

                  <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                    {part.description}
                  </p>

                  {/* Stock Info */}
                  <div className="bg-slate-700 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-sm">
                        {t("inventory.stock")}
                      </span>
                      <span
                        className={
                          isLowStock
                            ? "text-red-400 font-bold"
                            : "text-green-400 font-bold"
                        }
                      >
                        {part.quantity_in_stock}
                      </span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition ${
                          isLowStock ? "bg-red-500" : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min((part.quantity_in_stock / part.reorder_level) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-400">
                      ₱{part.unit_price.toLocaleString()}
                    </span>
                    {/* CRUD Buttons - Only visible to Owners */}
                    {isOwner && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditForm(part)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                          title="Edit part"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPart(part);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
                          title="Delete part"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {/* Disabled Buttons for Non-Owners */}
                    {!isOwner && (
                      <div className="flex gap-2">
                        <button
                          disabled
                          onClick={handleUnauthorizedAction}
                          className="p-2 bg-slate-600 text-slate-400 rounded cursor-not-allowed"
                          title="Only owners can edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          disabled
                          onClick={handleUnauthorizedAction}
                          className="p-2 bg-slate-600 text-slate-400 rounded cursor-not-allowed"
                          title="Only owners can delete"
                        >
                          <Trash2 className="w-4 h-4" />
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
          className="text-center py-16"
        >
          <AlertCircle className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">
            No parts found matching your filters
          </p>
        </motion.div>
      )}

      {/* ADD PART MODAL */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-lg border border-slate-700 max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Add New Part</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-white transition"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddPart} className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Part Image
                  </label>
                  <div className="relative">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-lg mb-2"
                      />
                    ) : (
                      <div className="w-full h-40 bg-slate-700 rounded-lg flex items-center justify-center mb-2">
                        <Upload className="w-8 h-8 text-slate-500" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <p className="text-xs text-slate-400">
                      Click or drag to upload image
                    </p>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Part Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as keyof typeof categoryColors,
                      })
                    }
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                  >
                    {Object.keys(categoryColors).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Unit Price
                  </label>
                  <input
                    type="number"
                    value={formData.unit_price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unit_price: parseFloat(e.target.value),
                      })
                    }
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Quantity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Quantity in Stock
                    </label>
                    <input
                      type="number"
                      value={formData.quantity_in_stock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantity_in_stock: parseInt(e.target.value),
                        })
                      }
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Reorder Level
                    </label>
                    <input
                      type="number"
                      value={formData.reorder_level}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          reorder_level: parseInt(e.target.value),
                        })
                      }
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition disabled:opacity-50"
                  >
                    <Save size={18} className="inline mr-2" />
                    Save Part
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT PART MODAL */}
      <AnimatePresence>
        {showEditForm && selectedPart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 rounded-lg border border-slate-700 max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Edit Part</h2>
                <button
                  onClick={() => setShowEditForm(false)}
                  className="text-slate-400 hover:text-white transition"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleEditPart} className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Part Image
                  </label>
                  <div className="relative">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-lg mb-2"
                      />
                    ) : (
                      <div className="w-full h-40 bg-slate-700 rounded-lg flex items-center justify-center mb-2">
                        <Upload className="w-8 h-8 text-slate-500" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <p className="text-xs text-slate-400">
                      Click or drag to upload image
                    </p>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Part Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as keyof typeof categoryColors,
                      })
                    }
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                  >
                    {Object.keys(categoryColors).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Unit Price
                  </label>
                  <input
                    type="number"
                    value={formData.unit_price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unit_price: parseFloat(e.target.value),
                      })
                    }
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Quantity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Quantity in Stock
                    </label>
                    <input
                      type="number"
                      value={formData.quantity_in_stock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantity_in_stock: parseInt(e.target.value),
                        })
                      }
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Reorder Level
                    </label>
                    <input
                      type="number"
                      value={formData.reorder_level}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          reorder_level: parseInt(e.target.value),
                        })
                      }
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition disabled:opacity-50"
                  >
                    <Save size={18} className="inline mr-2" />
                    Update Part
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {showDeleteConfirm && selectedPart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-slate-800 rounded-lg border border-slate-700 p-8 max-w-md"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                Delete Part?
              </h3>
              <p className="text-slate-300 mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{selectedPart.name}</span>? This
                action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeletePart}
                  disabled={saving}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded transition disabled:opacity-50"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded transition"
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
