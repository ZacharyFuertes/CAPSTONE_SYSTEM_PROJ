import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface CTABannerProps {
  onBookAppointment?: () => void;
}

const CTABanner: React.FC<CTABannerProps> = ({ onBookAppointment }) => {
  return (
    <section className="w-full bg-orange overflow-hidden relative py-16 md:py-20">
      {/* Decorative ghost text background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <span className="font-display text-9xl md:text-[20rem] font-black leading-none tracking-widest">
          JBMS
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-display text-5xl md:text-6xl font-bold text-navy mb-4 md:mb-6">
            Ready to Book Your Service?
          </h2>

          <p className="text-navy/70 text-lg md:text-xl mb-8 md:mb-10 max-w-2xl mx-auto">
            Schedule your appointment today and get your motorcycle running at
            peak performance
          </p>

          <motion.button
            onClick={onBookAppointment}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 px-8 md:px-10 py-4 md:py-5 bg-navy text-cream font-condensed font-bold text-lg uppercase tracking-widest rounded-lg hover:bg-navy3 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Book Appointment
            <ArrowRight size={20} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABanner;
