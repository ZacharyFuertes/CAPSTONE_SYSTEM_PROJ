import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Wrench,
  Award,
} from "lucide-react";
import { supabase } from "../services/supabaseClient";

interface MechanicsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

interface Mechanic {
  id: string;
  name: string;
  email: string;
  experience?: string;
  specialties?: string[];
  rating?: number;
  reviews?: Review[];
}

const MechanicsModal: React.FC<MechanicsModalProps> = ({ isOpen, onClose }) => {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    if (isOpen) {
      fetchMechanics();
    }
  }, [isOpen]);

  const generateMockReviews = (name: string): Review[] => {
    return [
      {
        id: "r1",
        author: "Mark S.",
        rating: 5,
        text: `${name} is an absolute lifesaver. Fixed my engine timing perfectly!`,
        date: "1 week ago",
      },
      {
        id: "r2",
        author: "Teresa L.",
        rating: 5,
        text: "Very professional and explained the repair process clearly. Highly recommend.",
        date: "3 weeks ago",
      },
    ];
  };

  const fetchMechanics = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "mechanic");

      if (error) throw error;

      const mechanicsWithReviews = (data || []).map((m: any) => ({
        ...m,
        reviews: generateMockReviews(m.name),
        rating: 4.8 + Math.random() * 0.2, // Fake rating between 4.8 and 5.0
      }));
      setMechanics(mechanicsWithReviews);
    } catch (error) {
      console.error("Error fetching mechanics:", error);
      // Mock data if failed to fetch
      setMechanics([
        {
          id: "1",
          name: "John Doeson",
          email: "john@JBMSmoto.com",
          experience: "10+ Years",
          specialties: ["Engine Performance", "Suspension"],
          rating: 4.9,
          reviews: generateMockReviews("John Doeson"),
        },
        {
          id: "2",
          name: "Mike O. Wrench",
          email: "mike@JBMSmoto.com",
          experience: "8 Years",
          specialties: ["Electrical Diagnostics", "Custom Builds"],
          rating: 4.8,
          reviews: generateMockReviews("Mike O. Wrench"),
        },
        {
          id: "3",
          name: "Sarah Bolt",
          email: "sarah@JBMSmoto.com",
          experience: "5 Years",
          specialties: ["Tire & Wheel", "Routine Maintenance"],
          rating: 4.7,
          reviews: generateMockReviews("Sarah Bolt"),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <div className="fixed inset-0 overflow-y-auto z-[60] py-10 px-4 md:px-0 scrollbar-hide pointer-events-none flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
              className="relative w-full max-w-5xl bg-[#0a0a0a] rounded-none border border-[#222] border-t-2 border-t-[#d63a2f] shadow-2xl pointer-events-auto flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex-none p-6 md:px-10 md:py-8 flex items-start justify-between border-b border-[#222] bg-[#111111]">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-[#d63a2f] flex items-center justify-center shrink-0">
                    <Wrench
                      size={28}
                      className="text-white"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3 text-[#d63a2f] text-[10px] font-bold tracking-[0.2em] uppercase">
                      <div className="w-6 h-[1px] bg-[#d63a2f]" /> TEAM
                    </div>
                    <h2 className="font-display text-4xl sm:text-5xl text-white uppercase leading-none tracking-wide">
                      OUR MECHANICS
                    </h2>
                    <p className="text-[#6b6b6b] text-xs font-light tracking-wide">
                      Meet the professionals who keep your ride running smooth.
                    </p>
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
              <div className="flex-grow overflow-y-auto px-6 md:px-10 py-8 bg-[#0a0a0a] scrollbar-hide">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-[#d63a2f] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[#6b6b6b] mt-6 tracking-[0.2em] uppercase text-[10px] font-bold">
                      LOADING TEAM...
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mechanics.map((mechanic, idx) => (
                      <motion.div
                        key={mechanic.id || idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-[#111111] border border-[#222] rounded-none p-6 hover:border-[#333] hover:bg-[#161616] transition-all group"
                      >
                        <div className="w-16 h-16 bg-[#0a0a0a] border border-[#333] mb-6 flex items-center justify-center">
                          <span className="font-display text-2xl text-white">
                            {mechanic.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <h3 className="font-display text-2xl leading-none text-white tracking-wide uppercase mb-2 group-hover:text-[#d63a2f] transition-colors">
                          {mechanic.name}
                        </h3>
                        {mechanic.experience ? (
                          <div className="flex items-center gap-2 mt-1 text-xs text-[#6b6b6b] font-light">
                            <Award size={14} className="text-[#d63a2f]" />
                            <span>{mechanic.experience} EXPERIENCE</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mt-1 text-xs text-[#6b6b6b] font-light">
                            <Award size={14} className="text-[#d63a2f]" />
                            <span>CERTIFIED JBMS EXPERT</span>
                          </div>
                        )}

                        <div className="mt-6 pt-6 border-t border-[#222]">
                          <p className="text-[10px] font-bold text-[#6b6b6b] uppercase tracking-[0.2em] mb-4">
                            SPECIALTIES
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {(
                              mechanic.specialties || [
                                "GENERAL MAINTENANCE",
                                "ENGINE REPAIR",
                              ]
                            ).map((spec, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-3 py-1.5 bg-[#0a0a0a] border border-[#333] rounded-none text-[10px] font-bold tracking-widest uppercase text-[#888]"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>


                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MechanicsModal;
