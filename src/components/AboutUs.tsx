import React from "react";
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
  CalendarCheck,
  ChevronRight,
  Quote,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

interface Mechanic {
  name: string;
  role: string;
  years: number;
  specialties: string[];
  bio: string;
  avatar: string;
}

const mechanics: Mechanic[] = [
  {
    name: "Marco \"Kuya Marc\" Reyes",
    role: "Lead Mechanic & Shop Foreman",
    years: 14,
    specialties: ["Engine Overhaul", "Fuel Injection Systems", "Transmission"],
    bio: "Si Kuya Marc ang backbone ng MotoShop. With 14 years of hands-on experience across Honda, Yamaha, and Suzuki platforms, he can diagnose an engine issue just by listening. He leads the team with patience and precision — every bike that leaves his bay runs like new.",
    avatar: "MR",
  },
  {
    name: "Jessa Mae Villanueva",
    role: "Diagnostic Specialist",
    years: 8,
    specialties: ["AI-Assisted Diagnostics", "Electrical Systems", "ECU Tuning"],
    bio: "Jessa is our tech-forward specialist who bridges traditional know-how with modern diagnostic tools. She's the go-to for complex electrical gremlins and ECU calibration. Clients love her clear, jargon-free explanations — she makes sure you understand every repair.",
    avatar: "JV",
  },
  {
    name: "Rodel \"Odie\" Santos",
    role: "Senior Technician – Suspension & Chassis",
    years: 11,
    specialties: ["Suspension Tuning", "Frame Alignment", "Brake Systems"],
    bio: "Odie lives and breathes chassis work. From fork rebuilds to full brake overhauls, he treats every motorcycle like his own. Riders across Quezon City specifically request him for track-day setups and long-haul comfort tuning.",
    avatar: "RS",
  },
  {
    name: "Angelica \"Gel\" Delos Reyes",
    role: "Parts Specialist & Inventory Manager",
    years: 6,
    specialties: ["OEM Parts Sourcing", "Aftermarket Accessories", "Inventory Systems"],
    bio: "Gel keeps our shelves stocked and our system organized. She personally vets every supplier to ensure only quality parts make it to our inventory. Need a rare OEM gasket or a specific aftermarket exhaust? Gel will find it — fast.",
    avatar: "AD",
  },
  {
    name: "Bryan \"BJ\" Joaquin",
    role: "Junior Technician & Customer Liaison",
    years: 3,
    specialties: ["Preventive Maintenance", "Oil & Filter Service", "Tire Fitting"],
    bio: "BJ is the newest member of the MotoShop family, but his energy and dedication are unmatched. He handles routine maintenance with speed and care, and his friendly attitude makes every customer feel at home the moment they walk in.",
    avatar: "BJ",
  },
];

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
              riders guessing about what was actually done to their bikes.
              In 2019, he opened a small garage with one mission:{" "}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px]">
              {mechanics.map((mech, idx) => (
                <motion.div
                  key={idx}
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

              {/* Empty cell to complete the 3-col grid (5 mechanics + 1 filler) */}
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
            </div>
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
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-r from-[#d63a2f] to-[#f97316] rounded-2xl p-12 lg:p-16 overflow-hidden"
          >
            {/* Animated sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
              <div className="max-w-xl">
                <h3 className="font-display text-4xl lg:text-5xl font-bold text-white uppercase tracking-wide mb-4 leading-[1.05]">
                  Ready to Ride
                  <br />
                  with Confidence?
                </h3>
                <p className="text-white/85 text-[16px] leading-[1.7] mb-2">
                  Whether it's your daily commuter or your weekend warrior,
                  MotoShop is here to keep you on the road — safely, affordably,
                  and with a smile. Visit us in Quezon City or book your
                  appointment online today.
                </p>
                <p className="text-white/60 text-[14px] italic">
                  "Halika na, i-level up natin ang ride mo!"
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const top = document.getElementById("services");
                  top?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex items-center gap-3 bg-white text-[#d63a2f] px-8 py-4 rounded-xl font-bold text-[16px] uppercase tracking-wide hover:bg-white/90 transition-colors shadow-lg shadow-black/20 whitespace-nowrap"
              >
                <CalendarCheck size={22} />
                Book a Service
                <ChevronRight size={18} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
