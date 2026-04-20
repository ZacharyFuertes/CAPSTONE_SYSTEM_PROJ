/**
 * ReceiptModal.tsx
 * Displays service booking receipt with mechanic info and appointment date
 */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Printer, CheckCircle, Wrench, Calendar, Clock, User } from "lucide-react";

interface ReceiptData {
  id: string;
  customer_id: string;
  service_type: string;
  scheduled_date: string;
  scheduled_time: string;
  mechanic_id?: string;
  mechanic_name?: string;
  status: string;
  parts?: any[];
  total_amount?: number;
  created_at: string;
  notes?: string;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: ReceiptData | null;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  receipt,
}) => {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const receiptContent = document.getElementById("receipt-content");
    if (receiptContent) {
      const printWindow = window.open("", "", "height=600,width=800");
      if (printWindow) {
        printWindow.document.write(receiptContent.innerHTML);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const appointmentDate = new Date(receipt.scheduled_date);
  const formattedDate = appointmentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const totalPartsPrice = (receipt.parts || []).reduce(
    (sum: number, part: any) => sum + (part.unit_price * part.quantity || 0),
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
          className="bg-[#0a0a0a] rounded-none border border-[#222] border-t-2 border-t-[#d63a2f] w-full sm:max-w-[900px] h-[95vh] sm:h-auto sm:max-h-[94vh] overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 sm:px-10 py-6 border-b border-[#222] flex-shrink-0 bg-[#111111]">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-[#4ade80] flex items-center justify-center shrink-0">
                <CheckCircle size={28} className="text-[#0a0a0a]" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3 text-[#d63a2f] text-[10px] font-bold tracking-[0.2em] uppercase">
                  <div className="w-6 h-[1px] bg-[#d63a2f]" /> SERVICE RECEIPT
                </div>
                <h2 className="font-display text-3xl sm:text-4xl text-white uppercase leading-none tracking-wide">
                  APPOINTMENT CONFIRMED
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

          {/* Receipt Content */}
          <div id="receipt-content" className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 bg-[#0a0a0a]">
            <div className="max-w-4xl mx-auto">
              {/* Receipt Number */}
              <div className="text-center mb-8 pb-8 border-b border-[#222]">
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#6b6b6b] uppercase mb-2">
                  Receipt Number
                </p>
                <p className="font-display text-2xl text-[#d63a2f] uppercase tracking-wide">
                  #{receipt.id.substring(0, 8).toUpperCase()}
                </p>
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#555] uppercase mt-2">
                  Created: {new Date(receipt.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Main Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 pb-8 border-b border-[#222]">
                {/* Service Details */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#d63a2f] uppercase mb-4">
                    SERVICE DETAILS
                  </h3>
                  <div className="flex items-start gap-3">
                    <Wrench size={20} className="text-[#d63a2f] mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-[#6b6b6b] uppercase tracking-widest font-bold mb-1">
                        Service Type
                      </p>
                      <p className="text-white font-bold text-lg">
                        {receipt.service_type.replace(/_/g, " ").toUpperCase()}
                      </p>
                    </div>
                  </div>
                  {receipt.notes && (
                    <div className="bg-[#111] border border-[#222] p-3 rounded-none">
                      <p className="text-[10px] text-[#6b6b6b] uppercase tracking-widest font-bold mb-1">
                        Notes
                      </p>
                      <p className="text-[#888] text-sm">{receipt.notes}</p>
                    </div>
                  )}
                </div>

                {/* Appointment Details */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#d63a2f] uppercase mb-4">
                    APPOINTMENT DETAILS
                  </h3>
                  <div className="flex items-start gap-3">
                    <Calendar size={20} className="text-[#4ade80] mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-[#6b6b6b] uppercase tracking-widest font-bold mb-1">
                        Appointment Date
                      </p>
                      <p className="text-white font-bold">{formattedDate}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={20} className="text-[#4ade80] mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-[#6b6b6b] uppercase tracking-widest font-bold mb-1">
                        Appointment Time
                      </p>
                      <p className="text-white font-bold">{receipt.scheduled_time}</p>
                    </div>
                  </div>
                  {receipt.mechanic_name && (
                    <div className="flex items-start gap-3">
                      <User size={20} className="text-[#4ade80] mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-[#6b6b6b] uppercase tracking-widest font-bold mb-1">
                          Assigned Mechanic
                        </p>
                        <p className="text-white font-bold">{receipt.mechanic_name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Parts List (if any) */}
              {receipt.parts && receipt.parts.length > 0 && (
                <div className="mb-8 pb-8 border-b border-[#222]">
                  <h3 className="text-[10px] font-bold tracking-[0.2em] text-[#d63a2f] uppercase mb-4">
                    PARTS INCLUDED
                  </h3>
                  <div className="space-y-2">
                    {receipt.parts.map((part, idx) => (
                      <div
                        key={idx}
                        className="bg-[#111] border border-[#222] p-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-white font-bold">{part.part_name}</p>
                          <p className="text-[10px] text-[#6b6b6b]">
                            SKU: {part.part_id}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">
                            {part.quantity}x @ ₱{part.unit_price.toLocaleString()}
                          </p>
                          <p className="text-[#4ade80] font-display font-black">
                            ₱{(part.quantity * part.unit_price).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Summary */}
              <div className="space-y-4 bg-[#111] border border-[#222] p-6">
                <div className="flex items-center justify-between border-b border-[#333] pb-4">
                  <p className="text-[#6b6b6b] font-bold uppercase tracking-widest text-sm">
                    Parts Total
                  </p>
                  <p className="text-white font-bold text-lg">
                    ₱{totalPartsPrice.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[#333]">
                  <p className="text-[#d63a2f] font-display font-black text-lg uppercase tracking-wide">
                    Total Amount
                  </p>
                  <p className="text-[#d63a2f] font-display font-black text-3xl">
                    ₱{(receipt.total_amount || totalPartsPrice).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="text-center mt-8 pt-8 border-t border-[#222]">
                <span className="inline-block bg-[#152215] border border-[#4ade80] text-[#4ade80] text-[10px] font-bold px-4 py-2 tracking-widest uppercase">
                  ✓ {receipt.status.toUpperCase()}
                </span>
                <p className="text-[#555] text-xs mt-4 tracking-wide">
                  Thank you for your business! Please bring this receipt to your appointment.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 sm:px-10 py-6 border-t border-[#222] bg-[#111] flex-shrink-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 py-3 px-4 border border-[#333] hover:border-[#d63a2f] hover:bg-[#221515] text-[#888] hover:text-[#d63a2f] font-bold uppercase tracking-widest transition flex items-center justify-center gap-2"
            >
              <Printer size={18} />
              PRINT RECEIPT
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 py-3 px-4 bg-[#d63a2f] hover:bg-[#c0322a] text-white border border-[#d63a2f] font-bold uppercase tracking-widest transition flex items-center justify-center gap-2"
            >
              <Download size={18} />
              DOWNLOAD
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-[#111] border border-[#333] hover:bg-[#1a1a1a] text-white font-bold uppercase tracking-widest transition"
            >
              CLOSE
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReceiptModal;
