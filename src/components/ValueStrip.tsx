import React from "react";

const ValueStrip: React.FC = () => {
  const values = [
    {
      icon: "🛠️",
      title: "Genuine Parts Only",
      description: "Authentic OEM & quality aftermarket components",
    },
    {
      icon: "⚡",
      title: "Same-Day Service",
      description: "Fast turnaround on repairs & installations",
    },
    {
      icon: "👨‍🔧",
      title: "Certified Mechanics",
      description: "Expert technicians with years of experience",
    },
    {
      icon: "💳",
      title: "GCash / PayMaya Ready",
      description: "Easy payment options for your convenience",
    },
  ];

  return (
    <section className="w-full bg-navy2 border-y border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-white/10">
          {values.map((item, idx) => (
            <div
              key={idx}
              className="px-6 md:px-8 py-8 md:py-10 hover:bg-orange/5 transition-colors duration-200 flex flex-col items-center md:items-start text-center md:text-left"
            >
              <div className="text-4xl md:text-3xl mb-3 opacity-80">
                {item.icon}
              </div>
              <h3 className="font-condensed font-bold text-lg text-cream mb-2 uppercase tracking-wide">
                {item.title}
              </h3>
              <p className="text-sm text-cream/55 font-sans leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueStrip;
