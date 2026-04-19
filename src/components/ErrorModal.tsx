import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ErrorModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  onTryAgain?: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  title = "Authentication Error",
  message,
  onClose,
  onTryAgain,
}) => {
  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-[#0a0a0a] border border-[#222] border-t-2 border-t-[#d63a2f] w-full max-w-sm overflow-hidden flex flex-col shadow-2xl relative"
      >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-[#111] border-b border-[#222]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#d63a2f]" />
                <h3 className="font-display font-bold text-white uppercase text-xs tracking-widest">
                  {title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-[#666] hover:text-white transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6">
              <p className="text-[#888] text-sm leading-relaxed mb-6 font-medium text-center">
                {message}
              </p>
              
              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onTryAgain || onClose}
                  className="flex-1 bg-[#d63a2f] hover:bg-[#b82e25] text-white font-bold py-3 uppercase tracking-widest text-[10px] transition border border-[#d63a2f]"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-transparent hover:bg-[#222] text-[#6b6b6b] hover:text-white font-bold py-3 uppercase tracking-widest text-[10px] border border-[#333] transition"
                >
                  Close
                </button>
              </div>
              
              {/* Footer Links */}
              <div className="mt-5 text-center border-t border-[#1a1a1a] pt-4">
                <button 
                  onClick={() => alert("Password reset functionality would open here.")} 
                  className="text-[#555] hover:text-[#d63a2f] text-[10px] uppercase tracking-widest font-bold transition"
                >
                  Forgot Password?
                </button>
              </div>
            </div>
      </motion.div>
    </div>
  ) : null;

  return modalContent;
};

export default ErrorModal;
