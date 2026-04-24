/**
 * ViewPartsListModal.tsx
 * Displays the customer's personal parts list with quantities
 */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { usePartsList } from "../contexts/PartsListContext";

interface ViewPartsListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ViewPartsListModal: React.FC<ViewPartsListModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { cartItems, removeFromList, updateQuantity, getTotalItems } = usePartsList();

  if (!isOpen) return null;

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.part.unit_price * item.quantity,
    0
  );

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
          className="bg-[#0a0a0a] rounded-none border border-[#222] border-t-2 border-t-[#d63a2f] w-full sm:max-w-[1000px] h-[95vh] sm:h-auto sm:max-h-[94vh] overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 sm:px-10 py-6 border-b border-[#222] flex-shrink-0 bg-[#111111]">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-[#d63a2f] flex items-center justify-center shrink-0">
                <ShoppingBag size={28} className="text-white" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3 text-[#d63a2f] text-[10px] font-bold tracking-[0.2em] uppercase">
                  <div className="w-6 h-[1px] bg-[#d63a2f]" /> MY PARTS LIST
                </div>
                <h2 className="font-display text-3xl sm:text-4xl text-white uppercase leading-none tracking-wide">
                  YOUR PARTS
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
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border border-[#222] bg-[#111]">
                <ShoppingBag
                  className="w-16 h-16 text-[#333] mb-4"
                  strokeWidth={1}
                />
                <p className="text-[#6b6b6b] text-[10px] tracking-widest uppercase font-bold">
                  YOUR LIST IS EMPTY
                </p>
                <p className="text-[#555] text-xs mt-2 text-center max-w-xs">
                  Start adding parts from the browse section to build your personalized list.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <motion.div
                    key={item.part.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#111111] border border-[#222] hover:border-[#d63a2f]/40 transition-all p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between"
                  >
                    {/* Part Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg sm:text-xl text-white uppercase leading-tight mb-1 truncate">
                        {item.part.name}
                      </h3>
                      {item.part.description && (
                        <p className="text-[12px] text-[#555] line-clamp-2 mb-2">
                          {item.part.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold tracking-[0.2em] bg-[#111] text-[#6b6b6b] px-3 py-1.5 border border-[#222] uppercase">
                          {item.part.category}
                        </span>
                        <span className="text-[10px] font-bold tracking-[0.2em] bg-[#1a1a1a] text-[#888] px-2 py-1 uppercase">
                          SKU: {item.part.sku}
                        </span>
                      </div>
                    </div>

                    {/* Price & Quantity Controls */}
                    <div className="w-full sm:w-auto flex items-center gap-4 sm:gap-6">
                      {/* Price */}
                      <div className="text-right">
                        <p className="text-[10px] text-[#6b6b6b] uppercase tracking-widest font-bold mb-1">
                          Unit Price
                        </p>
                        <p className="font-display text-2xl font-black text-[#d63a2f]">
                          ₱{item.part.unit_price.toLocaleString()}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-[10px] text-[#6b6b6b] uppercase tracking-widest font-bold">
                          Qty
                        </p>
                        <div className="flex items-center gap-2 border border-[#333] bg-[#0a0a0a]">
                          <button
                            onClick={() =>
                              updateQuantity(item.part.id, item.quantity - 1)
                            }
                            className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-white hover:bg-[#111] transition"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.part.id, item.quantity + 1)
                            }
                            className="w-8 h-8 flex items-center justify-center text-[#888] hover:text-white hover:bg-[#111] transition"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Total for this item */}
                      <div className="text-right min-w-[120px]">
                        <p className="text-[10px] text-[#6b6b6b] uppercase tracking-widest font-bold mb-1">
                          Total
                        </p>
                        <p className="font-display text-2xl font-black text-[#4ade80]">
                          ₱{(item.part.unit_price * item.quantity).toLocaleString()}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromList(item.part.id)}
                        className="flex-shrink-0 p-2 border border-[#333] hover:bg-[#221515] hover:border-[#d63a2f] text-[#6b6b6b] hover:text-[#d63a2f] transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with Summary */}
          {cartItems.length > 0 && (
            <div className="px-6 sm:px-10 py-6 border-t border-[#222] bg-[#111] flex-shrink-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] text-[#6b6b6b] uppercase tracking-widest font-bold mb-2">
                    Summary
                  </p>
                  <div className="space-y-1">
                    <p className="text-white">
                      Total Items: <span className="font-bold text-[#d63a2f]">{getTotalItems()}</span>
                    </p>
                    <p className="text-white">
                      Total Price: <span className="font-display text-2xl font-black text-[#4ade80]">₱{totalPrice.toLocaleString()}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-8 py-3 bg-[#d63a2f] text-white border border-[#d63a2f] hover:bg-[#c0322a] font-bold uppercase tracking-widest text-sm transition"
                >
                  CONTINUE SHOPPING
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ViewPartsListModal;
