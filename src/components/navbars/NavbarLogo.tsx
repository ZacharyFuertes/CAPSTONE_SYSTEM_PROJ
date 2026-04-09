import React from "react";

interface NavbarLogoProps {
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

/**
 * Shared chrome-badge logo component used across all navbars.
 * Matches the JBMS MOTOSHOP reference style: concentric metallic rings,
 * red accent ring, dark inner circle with logo, and chrome-gradient text.
 */
const NavbarLogo: React.FC<NavbarLogoProps> = ({
  subtitle,
  size = "md",
  onClick,
}) => {
  const sizeClasses = {
    sm: "w-10 h-10 sm:w-12 sm:h-12",
    md: "w-12 h-12 lg:w-[60px] lg:h-[60px]",
    lg: "w-14 h-14 lg:w-[68px] lg:h-[68px] xl:w-[78px] xl:h-[78px]",
  };

  const textClasses = {
    sm: "text-base lg:text-lg",
    md: "text-lg lg:text-xl",
    lg: "text-lg lg:text-xl xl:text-2xl",
  };

  return (
    <div
      className={`flex items-center gap-3 lg:gap-4 shrink-0 ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {/* Metallic Chrome Badge */}
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        {/* Outer glow */}
        <div className="absolute inset-[-4px] rounded-full bg-gradient-to-b from-[#d63a2f]/30 via-transparent to-[#d63a2f]/20 blur-[6px]" />
        {/* Chrome outer ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#e8e8e8] via-[#888] to-[#3a3a3a] p-[3px]">
          {/* Dark gap ring */}
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#1a1a1a] via-[#0d0d0d] to-[#1a1a1a] p-[2px]">
            {/* Inner chrome ring */}
            <div className="w-full h-full rounded-full bg-gradient-to-b from-[#c0c0c0] via-[#666] to-[#2a2a2a] p-[2px]">
              {/* Red accent ring */}
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#d63a2f] via-[#8b1a12] to-[#4a0e09] p-[2px]">
                {/* Inner dark circle with logo */}
                <div className="w-full h-full rounded-full bg-gradient-to-b from-[#1a1a1a] via-[#0a0a0a] to-[#111] flex items-center justify-center overflow-hidden shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)]">
                  <img
                    src="/logo.png"
                    alt="JBMS MotoShop Logo"
                    className="w-full h-full object-cover scale-[1.25] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Brand Text */}
      <div className="flex flex-col leading-none">
        <span
          className={`${textClasses[size]} font-display font-black tracking-wider uppercase`}
          style={{
            background:
              "linear-gradient(180deg, #ffffff 0%, #c0c0c0 40%, #888888 70%, #666666 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "none",
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))",
          }}
        >
          JBMS MOTOSHOP
        </span>
        {subtitle && (
          <p className="text-[9px] text-[#d63a2f] font-bold tracking-[0.2em] uppercase leading-none mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default NavbarLogo;
