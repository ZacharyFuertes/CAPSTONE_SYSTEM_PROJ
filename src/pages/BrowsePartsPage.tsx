import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Clock, MapPin } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface Part {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  quantity: number;
}

interface BrowsePartsPageProps {
  onNavigate?: (page: string) => void;
}

const BrowsePartsPage: React.FC<BrowsePartsPageProps> = ({ onNavigate }) => {
  const {} = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [reservedParts, setReservedParts] = useState<Set<string>>(new Set());

  // Common car parts used in Philippines
  const parts: Part[] = [
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

  const categories = [
    "all",
    "Filters",
    "Brakes",
    "Electrical",
    "Accessories",
    "Fluids",
    "Belts",
    "Cooling",
  ];

  const filteredParts =
    selectedCategory === "all"
      ? parts
      : parts.filter((p) => p.category === selectedCategory);

  const handleReservePart = (partId: string) => {
    const newReserved = new Set(reservedParts);
    if (newReserved.has(partId)) {
      newReserved.delete(partId);
    } else {
      newReserved.add(partId);
    }
    setReservedParts(newReserved);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={
              i < Math.round(rating)
                ? "fill-orange-400 text-orange-400"
                : "text-slate-600"
            }
          />
        ))}
        <span className="text-xs text-slate-400 ml-1">({rating})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => onNavigate && onNavigate("appointments")}
        className="mb-6 flex items-center gap-2 text-moto-accent hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </motion.button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">
          Browse Available Parts
        </h1>
        <p className="text-slate-400">
          Reserve parts and visit our shop to complete your order
        </p>

        {/* Info Box */}
        <div className="mt-4 bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
          <MapPin size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-300 font-semibold">Reservation Process</p>
            <p className="text-blue-200 text-sm">
              Reserve parts online and visit our shop to confirm availability
              and complete your purchase.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedCategory === cat
                  ? "bg-moto-accent text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Parts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredParts.map((part, index) => (
          <motion.div
            key={part.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onMouseEnter={() => setHoveredPart(part.id)}
            onMouseLeave={() => setHoveredPart(null)}
            className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-slate-600 transition group"
          >
            {/* Image Container */}
            <div className="relative h-56 overflow-hidden bg-slate-900">
              <motion.img
                src={part.image}
                alt={part.name}
                className="w-full h-full object-cover"
                animate={{ scale: hoveredPart === part.id ? 1.08 : 1 }}
                transition={{ duration: 0.4 }}
              />

              {/* Category Badge */}
              <div className="absolute top-3 right-3">
                <span className="bg-moto-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                  {part.category}
                </span>
              </div>

              {/* Stock Indicator */}
              {part.quantity < 10 && (
                <div className="absolute bottom-3 left-3 bg-yellow-500 text-slate-900 text-xs font-bold px-2 py-1 rounded">
                  Only {part.quantity} left
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              {/* Product Name */}
              <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                {part.name}
              </h3>

              {/* Rating */}
              <div className="mb-3">
                {renderStars(part.rating)}
                <p className="text-xs text-slate-400 mt-1">
                  {part.reviews} reviews
                </p>
              </div>

              {/* Price */}
              <div className="mb-4">
                <p className="text-2xl font-bold text-moto-accent">
                  ₱{part.price.toLocaleString()}
                </p>
              </div>

              {/* Reserve Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleReservePart(part.id)}
                className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                  reservedParts.has(part.id)
                    ? "bg-green-600 text-white"
                    : "bg-moto-accent hover:bg-moto-accent-dark text-white"
                }`}
              >
                <Clock size={18} />
                {reservedParts.has(part.id) ? "Reserved ✓" : "Reserve Now"}
              </motion.button>

              <p className="text-xs text-slate-400 mt-3 text-center">
                {reservedParts.has(part.id)
                  ? "Please visit the shop to confirm"
                  : "Visit shop to complete"}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reserved Summary */}
      {reservedParts.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/20 border border-green-500/30 rounded-lg p-6 mt-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-green-300 font-bold text-lg mb-2">
                {reservedParts.size} part{reservedParts.size > 1 ? "s" : ""}{" "}
                reserved
              </h3>
              <p className="text-green-200 text-sm">
                Your reservations are pending. Please visit our shop with your
                customer ID to confirm availability and complete your purchase.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setReservedParts(new Set())}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium whitespace-nowrap"
            >
              Clear All
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {filteredParts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-slate-400 text-lg">
            No parts found in this category
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default BrowsePartsPage;
