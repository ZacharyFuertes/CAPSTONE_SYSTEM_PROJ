import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Wrench,
  Cpu,
  ShieldCheck,
  Clock,
  Sparkles,
  Languages,
  DollarSign,
  Package,
  Quote,
} from "lucide-react";
import { supabase } from "../services/supabaseClient";

// Inline replacement for deleted staffService.getMechanics
const getMechanics = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", "mechanic")
    .order("name");
  if (error) throw error;
  return data || [];
};

// About Us shop photos (arranged by filename)
import frontViewShop from "../pictures/about-us-pics/front-view-shop.jpg";
import insideViewShop from "../pictures/about-us-pics/inside-view-shop.jpg";
import insideViewProducts1 from "../pictures/about-us-pics/inside-view-shop-products-1.png";
import insideViewProducts2 from "../pictures/about-us-pics/inside-view-shop-products-2.png";
import insideViewTools1 from "../pictures/about-us-pics/inside-view-shop-tools-1.png";
import sideViewShop from "../pictures/about-us-pics/side-view-shop.jpg";

const shopPhotos = [
  { src: frontViewShop, alt: "Front View of MotoShop", label: "Front View" },
  { src: insideViewShop, alt: "Inside View of MotoShop", label: "Inside the Shop" },
  { src: insideViewProducts1, alt: "Shop Products Display 1", label: "Parts & Products" },
  { src: insideViewProducts2, alt: "Shop Products Display 2", label: "Product Shelves" },
  { src: insideViewTools1, alt: "Shop Tools & Equipment", label: "Tools & Equipment" },
  { src: sideViewShop, alt: "Side View of MotoShop", label: "Side View" },
];

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

interface DBMechanic {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  address?: string;
  specialties?: string;
  bio?: string;
  years_of_experience?: number;
  created_at: string;
}

interface Mechanic {
  id: string;
  name: string;
  role: string;
  years: number;
  specialties: string[];
  bio: string;
  avatar: string;
  email?: string;
}

// Mapping for different mechanic roles to more descriptive titles
const roleMapping: { [key: string]: string } = {
  mechanic: "Technician",
  lead_mechanic: "Lead Mechanic",
  senior_mechanic: "Senior Technician",
  diagnostic_specialist: "Diagnostic Specialist",
  parts_specialist: "Parts Specialist",
};

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Cpu,
    title: "Modern Diagnostic Tools",
    description:
      "State-of-the-art scanners and testing equipment that pinpoint issues in minutes — not hours.",
  },
  {
    icon: Package,
    title: "Quality Parts Inventory",
    description:
      "Genuine OEM and premium aftermarket parts for Honda, Yamaha, Suzuki, Kawasaki, and more.",
  },
  {
    icon: Sparkles,
    title: "AI-Assisted Diagnostics",
    description:
      "Our proprietary AI system cross-references symptoms with thousands of repair cases for faster, more accurate fixes.",
  },
  {
    icon: ShieldCheck,
    title: "Warranty on Repairs",
    description:
      "Every repair comes with a service warranty — because we stand behind the quality of our work.",
  },
  {
    icon: Clock,
    title: "Fast Turnaround Time",
    description:
      "Most routine services are completed same-day. We respect your time and keep you riding.",
  },
  {
    icon: DollarSign,
    title: "Honest & Transparent Pricing",
    description:
      "No hidden fees, no surprise charges. You approve every cost before we turn a single wrench.",
  },
  {
    icon: Languages,
    title: "Bilingual Staff",
    description:
      "Our team speaks fluent English and Tagalog — para comfortable ka kung paano mo gustong mag-communicate.",
  },
  {
    icon: Wrench,
    title: "Clean & Comfortable Shop",
    description:
      "A well-organized, professional workspace with a comfortable waiting area — because your experience matters.",
  },
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

const AboutUs: React.FC = () => {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dbMechanics = (await getMechanics()) as DBMechanic[];

        // Transform database mechanics into Mechanic interface format
        const transformedMechanics: Mechanic[] = dbMechanics.map(
          (mech, idx) => {
            // Generate initials for avatar
            const initials = mech.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            // Parse specialties from string or provide default
            const specialties = mech.specialties
              ? mech.specialties.split(",").map((s) => s.trim())
              : ["Motorcycle Repair", "Maintenance"];

            // Get descriptive role title or use from database
            const roleTitle =
              roleMapping[mech.role] || mech.role || "Technician";

            return {
              id: mech.id,
              name: mech.name,
              role: roleTitle,
              years: mech.years_of_experience || (idx + 1) * 3, // Default years if not provided
              specialties,
              bio:
                mech.bio ||
                `Dedicated technician bringing years of expertise to MotoShop. With a passion for motorcycles and commitment to quality repairs, ${mech.name} ensures every bike leaves our shop running smoothly.`,
              avatar: initials,
              email: mech.email,
            };
          },
        );

        setMechanics(transformedMechanics);
        setError(null);
      } catch (err) {
        console.error("Error fetching mechanics:", err);
        setError("Unable to load mechanics data");
        setMechanics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <section id="about-us" className="w-full bg-[#0a0a0a] overflow-hidden">
      {/* ============================================================ */}
      {/*  HERO / INTRODUCTION                                         */}
      {/* ============================================================ */}
      <div className="relative py-28 lg:py-36 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#d63a2f]/5 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#f97316]/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-[rgba(255,255,255,0.03)]" />
        </div>

        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex items-center gap-[10px] text-[#d63a2f] text-[11px] font-medium tracking-[0.2em] uppercase mb-5"
          >
            <div className="w-8 h-[1px] bg-[#d63a2f]" />
            ABOUT US
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="font-display text-6xl sm:text-[9vw] lg:text-[120px] font-bold leading-[0.92] tracking-[0.01em] text-[#f0ede8] mb-6 uppercase"
          >
            WHO
            <br />
            <span className="text-[#d63a2f]">WE ARE</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            viewport={{ once: true }}
            className="text-[16px] font-light text-[#6b6b6b] max-w-[520px] leading-[1.7] mb-3"
          >
            Your trusted motorcycle repair and parts partner in Quezon City.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-[15px] italic text-[#6b6b6b]/70 max-w-[520px] leading-[1.7]"
          >
            "Ang partner mo sa daan — mula pagkumpuni hanggang paglalakbay."
          </motion.p>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  OUR STORY                                                    */}
      {/* ============================================================ */}
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 pb-24 lg:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left — label + heading */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-[10px] text-[#d63a2f] text-[11px] font-medium tracking-[0.2em] uppercase mb-5">
              <div className="w-8 h-[1px] bg-[#d63a2f]" />
              OUR STORY
            </div>
            <h3 className="font-display text-5xl lg:text-7xl font-bold text-[#f0ede8] uppercase leading-[0.95] mb-8">
              Built by <span className="text-[#d63a2f]">Riders,</span>
              <br />
              for Riders
            </h3>

            {/* Decorative quote */}
            <div className="flex items-start gap-4 bg-[#111111] border-l-4 border-[#d63a2f] p-6 rounded-r-lg">
              <Quote size={28} className="text-[#d63a2f] flex-shrink-0 mt-1" />
              <p className="text-[#888] text-[15px] italic leading-relaxed">
                "Hindi lang kami nagkukumpuni ng motorsiklo — nagtatayo kami ng
                tiwala, isang rider sa bawat pagkakataon."
              </p>
            </div>
          </motion.div>

          {/* Right — story paragraphs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="text-[#999] text-[15px] leading-[1.8]">
              MotoShop was born out of frustration — and a love for riding. Our
              founder, a lifelong motorcycle enthusiast from Quezon City, grew
              tired of repair shops that over-charged, under-delivered, and left
              riders guessing about what was actually done to their bikes. In
              2019, he opened a small garage with one mission:{" "}
              <span className="text-[#f0ede8] font-medium">
                provide honest, high-quality motorcycle service that every
                Filipino rider deserves.
              </span>
            </p>
            <p className="text-[#999] text-[15px] leading-[1.8]">
              What started as a two-bay operation has grown into a fully
              equipped, technology-driven repair shop. Today, MotoShop combines
              traditional mechanical expertise with modern innovations like
              AI-powered diagnostics, digital appointment scheduling, and a
              real-time inventory system. We service everything from daily
              commuter scooters to weekend sport bikes — and we treat every
              machine with the same level of care and attention.
            </p>
            <p className="text-[#999] text-[15px] leading-[1.8]">
              Our values haven't changed since day one:{" "}
              <span className="text-[#d63a2f] font-medium">honesty</span>,{" "}
              <span className="text-[#d63a2f] font-medium">quality</span>, and{" "}
              <span className="text-[#d63a2f] font-medium">speed</span>. We
              believe that trust is earned — one perfectly tuned engine at a
              time. Whether you're here for a quick oil change or a full engine
              rebuild, you'll be treated like family. Because at MotoShop,
              riders take care of riders.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  OUR SHOP — PHOTO GALLERY                                     */}
      {/* ============================================================ */}
      <div className="py-24 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="flex items-center gap-[10px] text-[#d63a2f] text-[11px] font-medium tracking-[0.2em] uppercase mb-5">
              <div className="w-8 h-[1px] bg-[#d63a2f]" />
              OUR SHOP
            </div>
            <h3 className="font-display text-5xl sm:text-[8vw] lg:text-[100px] font-bold leading-[0.92] tracking-[0.01em] text-[#f0ede8] uppercase mb-6">
              INSIDE
              <br />
              <span className="text-[#d63a2f]">MOTOSHOP</span>
            </h3>
            <p className="text-[16px] font-light text-[#6b6b6b] max-w-[480px] leading-[1.7]">
              Take a look at our fully equipped workshop, organized parts inventory, and professional workspace — where every repair begins.
            </p>
          </motion.div>

          {/* Photo gallery grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shopPhotos.map((photo, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                viewport={{ once: true, margin: "-50px" }}
                className={`relative overflow-hidden group cursor-pointer bg-[#111111] border border-[rgba(255,255,255,0.07)] ${
                  idx === 0 ? "md:col-span-2 md:row-span-2" : ""
                }`}
              >
                <div className={`relative overflow-hidden ${
                  idx === 0 ? "h-[300px] md:h-[500px] lg:h-[600px]" : "h-[250px] lg:h-[290px]"
                }`}>
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Red accent line */}
                  <div className="absolute bottom-0 left-0 w-0 h-[3px] bg-[#d63a2f] group-hover:w-full transition-all duration-500" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  MEET OUR MECHANICS                                           */}
      {/* ============================================================ */}
      <div className="bg-[#080808] py-24 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="flex items-center gap-[10px] text-[#d63a2f] text-[11px] font-medium tracking-[0.2em] uppercase mb-5">
              <div className="w-8 h-[1px] bg-[#d63a2f]" />
              THE TEAM
            </div>
            <h3 className="font-display text-5xl sm:text-[8vw] lg:text-[100px] font-bold leading-[0.92] tracking-[0.01em] text-[#f0ede8] uppercase mb-6">
              MEET OUR
              <br />
              <span className="text-[#d63a2f]">MECHANICS</span>
            </h3>
            <p className="text-[16px] font-light text-[#6b6b6b] max-w-[480px] leading-[1.7]">
              The skilled hands and sharp minds behind every repair. Our team
              combines decades of experience with genuine passion for
              motorcycles.
            </p>
          </motion.div>

          {/* Mechanic cards — brutalist grid */}
          <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] p-[1px]">
            {loading ? (
              <div className="flex items-center justify-center py-20 px-6">
                <p className="text-[#888]">Loading mechanics...</p>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-20 px-6">
                <p className="text-[#d63a2f]">{error}</p>
              </div>
            ) : mechanics.length === 0 ? (
              <div className="flex items-center justify-center py-20 px-6">
                <p className="text-[#888]">No mechanics found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px]">
                {mechanics.map((mech, idx) => (
                  <motion.div
                    key={mech.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.08 }}
                    viewport={{ once: true, margin: "-50px" }}
                    className="relative flex flex-col p-8 lg:p-10 bg-[#111111] overflow-hidden group hover:bg-[#161616] transition-colors duration-300"
                  >
                    {/* Hover glow */}
                    <div className="absolute inset-0 bg-[#d63a2f]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {/* Index */}
                    <div className="font-display text-[11px] tracking-[0.15em] text-[#6b6b6b] mb-6 group-hover:text-[#d63a2f] transition-colors duration-300 relative z-10">
                      0{idx + 1}
                    </div>

                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#d63a2f] to-[#f97316] flex items-center justify-center text-white font-display text-xl font-bold mb-6 group-hover:scale-105 transition-transform duration-300 relative z-10">
                      {mech.avatar}
                    </div>

                    {/* Name & Role */}
                    <h4 className="font-display text-[22px] tracking-wide text-[#f0ede8] leading-tight uppercase mb-1 relative z-10">
                      {mech.name}
                    </h4>
                    <p className="text-[#d63a2f] text-[13px] font-medium tracking-wide mb-1 relative z-10">
                      {mech.role}
                    </p>
                    <p className="text-[#6b6b6b] text-[12px] mb-5 relative z-10">
                      {mech.years} years of experience
                    </p>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-2 mb-5 relative z-10">
                      {mech.specialties.map((spec, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-3 py-1 text-[11px] tracking-wider uppercase bg-[#1a1a1a] border border-[rgba(255,255,255,0.07)] text-[#888] rounded-sm group-hover:border-[#d63a2f]/30 group-hover:text-[#bbb] transition-all duration-300"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>

                    {/* Bio */}
                    <p className="text-[13px] font-light text-[#6b6b6b] leading-[1.7] flex-1 relative z-10">
                      {mech.bio}
                    </p>
                  </motion.div>
                ))}

                {/* Empty cell to complete the 3-col grid (if mechanics count is not divisible by 3) */}
                {mechanics.length % 3 !== 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="relative flex flex-col items-center justify-center p-8 lg:p-10 bg-[#111111] overflow-hidden group hover:bg-[#161616] transition-colors duration-300 min-h-[300px]"
                  >
                    <div className="absolute inset-0 bg-[#d63a2f]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    <div className="text-center relative z-10">
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#333] flex items-center justify-center mx-auto mb-5 group-hover:border-[#d63a2f]/50 transition-colors duration-300">
                        <span className="text-[#444] text-2xl group-hover:text-[#d63a2f] transition-colors duration-300">
                          +
                        </span>
                      </div>
                      <p className="font-display text-[18px] text-[#444] uppercase tracking-wide mb-2 group-hover:text-[#666] transition-colors duration-300">
                        Join the Team
                      </p>
                      <p className="text-[13px] text-[#444] leading-[1.6]">
                        We're always looking for passionate mechanics.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  WHY CHOOSE MOTOSHOP / FEATURES                               */}
      {/* ============================================================ */}
      <div className="py-24 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <div className="flex items-center gap-[10px] text-[#d63a2f] text-[11px] font-medium tracking-[0.2em] uppercase mb-5">
              <div className="w-8 h-[1px] bg-[#d63a2f]" />
              WHY US
            </div>
            <h3 className="font-display text-5xl sm:text-[8vw] lg:text-[100px] font-bold leading-[0.92] tracking-[0.01em] text-[#f0ede8] uppercase mb-6">
              WHY CHOOSE
              <br />
              <span className="text-[#d63a2f]">MOTOSHOP</span>
            </h3>
            <p className="text-[16px] font-light text-[#6b6b6b] max-w-[480px] leading-[1.7]">
              We don't just fix motorcycles — we build long-term relationships
              with every rider who trusts us with their machine.
            </p>
          </motion.div>

          {/* Features grid */}
          <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] p-[1px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1px]">
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.06 }}
                    viewport={{ once: true, margin: "-50px" }}
                    className="relative flex flex-col p-8 lg:p-10 bg-[#111111] overflow-hidden group hover:bg-[#161616] transition-colors duration-300"
                  >
                    <div className="absolute inset-0 bg-[#d63a2f]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    <div className="font-display text-[11px] tracking-[0.15em] text-[#6b6b6b] mb-8 group-hover:text-[#d63a2f] transition-colors duration-300 relative z-10">
                      0{idx + 1}
                    </div>

                    <div className="text-[#6b6b6b] mb-6 group-hover:text-[#d63a2f] group-hover:-translate-y-[3px] transition-all duration-300 relative z-10">
                      <Icon size={40} strokeWidth={1.2} />
                    </div>

                    <h4 className="font-display text-[20px] tracking-wide text-[#f0ede8] mb-3 leading-tight uppercase relative z-10">
                      {feat.title}
                    </h4>

                    <p className="text-[13px] font-light text-[#6b6b6b] leading-[1.65] flex-1 relative z-10">
                      {feat.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  CTA / CLOSING                                                */}
      {/* ============================================================ */}
      <div className="pb-24 lg:pb-32">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
