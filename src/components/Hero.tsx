import React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

/**
 * Hero Section Component
 *
 * Eye-catching introductory section with:
 * - Full-screen motorcycle background image
 * - Dark overlay for text readability
 * - Animated tagline and CTA button
 * - Scroll indicator at the bottom
 */
const Hero: React.FC = () => {
  const scrollToProducts = () => {
    const productsSection = document.getElementById("products");
    productsSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative w-full h-screen bg-cover bg-center flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(15, 15, 15, 0.7) 0%, rgba(26, 26, 26, 0.8) 100%), url('https://images.unsplash.com/photo-1507035896870-6d47a3e3a6ab?w=1600&h=900&fit=crop')`,
        backgroundAttachment: "fixed",
      }}
    >
      {/* Content Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* Main Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-display font-black text-white mb-4 leading-none tracking-wider">
            Gear Up.
            <span className="block text-moto-accent">Ride Out.</span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="text-base sm:text-lg md:text-xl text-gray-100 mb-8 max-w-2xl mx-auto font-medium tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          Premium motorcycles, protective gear, and accessories for riders who
          demand the best. Fast shipping. Real quality. Pure adrenaline.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <button
            onClick={scrollToProducts}
            className="px-8 py-3 bg-moto-accent hover:bg-moto-accent-dark text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            aria-label="Shop products - scroll to featured items"
          >
            Shop Now
          </button>
          <button
            className="px-8 py-3 border-2 border-white hover:bg-white hover:text-moto-dark text-white font-semibold rounded-lg transition-colors"
            aria-label="Learn more about MotoShop"
          >
            Learn More
          </button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <button
          onClick={scrollToProducts}
          className="flex flex-col items-center text-moto-accent hover:text-white transition-colors"
          aria-label="Scroll to featured products"
        >
          <span className="text-sm font-semibold mb-2">Explore</span>
          <ChevronDown size={24} />
        </button>
      </motion.div>
    </section>
  );
};

export default Hero;
