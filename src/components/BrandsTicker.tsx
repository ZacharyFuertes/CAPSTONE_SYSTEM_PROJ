import React, { useState } from "react";

const BrandsTicker: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  const brands = [
    "YAMAHA",
    "HONDA",
    "SUZUKI",
    "KAWASAKI",
    "TVS",
    "RUSI",
    "KYMCO",
    "MOTORSTAR",
  ];

  // Duplicate brands for seamless scrolling
  const scrollingBrands = [...brands, ...brands, ...brands];

  return (
    <section className="w-full bg-navy2 border-y border-white/10 py-8 md:py-12">
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-6">
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-navy2 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-navy2 to-transparent z-10 pointer-events-none" />

          {/* Scrolling content */}
          <div
            className="flex gap-12 md:gap-16"
            style={{
              animation: isHovered ? "none" : "scroll 30s linear infinite",
            }}
          >
            {scrollingBrands.map((brand, idx) => (
              <div
                key={`${brand}-${idx}`}
                className="flex items-center gap-4 whitespace-nowrap flex-shrink-0"
              >
                <span className="font-condensed font-bold text-xl text-cream/40 uppercase tracking-widest">
                  {brand}
                </span>
                {idx < scrollingBrands.length - 1 && (
                  <span className="text-cream/20">·</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandsTicker;
