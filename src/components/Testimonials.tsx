import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  rating: number;
  quote: string;
  name: string;
  bikeModel: string;
  initials: string;
  color: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  rating,
  quote,
  name,
  bikeModel,
  initials,
  color,
}) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-navy3 border border-white/10 rounded-lg p-8 hover:border-orange/30 transition-colors duration-300"
    >
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
        ))}
      </div>

      {/* Quote */}
      <p className="text-cream/80 text-base font-sans leading-relaxed mb-6 italic">
        "{quote}"
      </p>

      {/* User Info */}
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-full ${color} flex items-center justify-center flex-shrink-0 text-white font-bold text-lg`}
        >
          {initials}
        </div>
        <div>
          <h4 className="font-condensed font-bold text-cream text-sm uppercase tracking-wide">
            {name}
          </h4>
          <p className="text-cream/50 text-xs font-sans">{bikeModel}</p>
        </div>
      </div>
    </motion.div>
  );
};

const Testimonials: React.FC = () => {
  const testimonials: TestimonialCardProps[] = [
    {
      rating: 5,
      quote:
        "Napakabilis ng service at ang quality ng parts ay sobrang mataas. Highly recommended sa lahat ng motorcycle riders!",
      name: "Juan Santos",
      bikeModel: "Yamaha YZF-R3",
      initials: "JS",
      color: "bg-blue-500",
    },
    {
      rating: 5,
      quote:
        "Best mechanics sa Metro Manila. Nakita ko na ang difference sa performance ng bike ko after their service.",
      name: "Maria Cruz",
      bikeModel: "Honda CB500F",
      initials: "MC",
      color: "bg-purple-500",
    },
    {
      rating: 5,
      quote:
        "Ang professionalism at attention to detail ay walang kapantay. Definitely coming back for my next maintenance!",
      name: "Antonio Reyes",
      bikeModel: "Kawasaki Ninja 400",
      initials: "AR",
      color: "bg-green-500",
    },
  ];

  return (
    <section className="w-full bg-navy py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="font-display text-5xl md:text-6xl font-bold text-cream mb-4">
            Trusted by Riders
          </h2>
          <p className="text-cream/60 text-lg max-w-2xl mx-auto">
            See what our customers have to say about their experience with JBMS
            MotoShop
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <TestimonialCard {...testimonial} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
