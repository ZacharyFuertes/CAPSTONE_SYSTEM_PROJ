import React from "react";
import { motion } from "framer-motion";
import {
  Wrench,
  Settings,
  Calendar,
  Cpu,
  LifeBuoy,
  ClipboardList,
} from "lucide-react";

interface ServiceCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  icon: Icon,
  title,
  description,
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
      className="relative flex flex-col p-8 lg:p-11 bg-[#111111] overflow-hidden group hover:bg-[#161616] transition-colors duration-300 cursor-pointer h-full"
    >
      <div className="absolute inset-0 bg-[#d63a2f]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="font-display text-[11px] tracking-[0.15em] text-[#6b6b6b] mb-10 group-hover:text-[#d63a2f] transition-colors duration-300">
        0{index + 1}
      </div>

      <div className="text-[#6b6b6b] mb-7 group-hover:text-[#d63a2f] group-hover:-translate-y-[3px] transition-all duration-300 relative z-10">
        <Icon size={46} strokeWidth={1.2} />
      </div>

      <h3 className="font-display text-[26px] tracking-wide text-[#f0ede8] mb-3.5 leading-none relative z-10 uppercase">
        {title}
      </h3>

      <p className="text-[14px] font-light text-[#6b6b6b] leading-[1.65] flex-1 mb-8 relative z-10">
        {description}
      </p>
    </motion.div>
  );
};

const ServicesGrid: React.FC = () => {
  const services = [
    {
      icon: Wrench,
      title: "General Repair",
      description:
        "Comprehensive maintenance and repair services for all motorcycle types  from oil changes to full engine rebuilds.",
    },
    {
      icon: Settings,
      title: "Parts & Accessories",
      description:
        "Wide selection of genuine and premium motorcycle components, sourced from trusted manufacturers worldwide.",
    },
    {
      icon: Calendar,
      title: "Online Booking",
      description:
        "Easy appointment scheduling with real-time availability. Book your slot in under a minute, reschedule anytime.",
    },
    {
      icon: Cpu,
      title: "AI Diagnostics",
      description:
        "Advanced diagnostics to identify issues quickly and accurately  reducing guesswork and turnaround time.",
    },
    {
      icon: LifeBuoy,
      title: "Tire & Wheel",
      description:
        "Professional tire fitting, balancing, and wheel maintenance. We carry all major brands in stock.",
    },
    {
      icon: ClipboardList,
      title: "Service History",
      description:
        "Complete tracking of all your vehicle maintenance records  accessible anytime, shareable with buyers.",
    },
  ];

  return (
    <section id="services" className="w-full bg-[#0a0a0a] py-20 lg:py-24">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        {/* Header Section */}
        <div className="mb-[72px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex items-center gap-[10px] text-[#d63a2f] text-[11px] font-medium tracking-[0.2em] uppercase mb-[20px]"
          >
            <div /> WHAT WE OFFER
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="font-display text-6xl sm:text-[9vw] lg:text-[120px] font-bold leading-[0.92] tracking-[0.01em] text-[#f0ede8] mb-6 uppercase"
          >
            OUR
            <br />
            <span className="text-[#d63a2f]">SERVICES</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-[16px] font-light text-[#6b6b6b] max-w-[420px] leading-[1.7]"
          >
            Everything you need to keep your motorcycle running at peak
            performance handled by people who ride.
          </motion.p>
        </div>

        {/* 1px Grid Layout Trick */}
        <div className="bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.07)] p-[1px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px]">
            {services.map((service, idx) => (
              <ServiceCard key={idx} {...service} index={idx} />
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-[60px] pt-[32px] border-t border-[rgba(255,255,255,0.07)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
        ></motion.div>
      </div>
    </section>
  );
};

export default ServicesGrid;
