import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, BookOpen } from 'lucide-react'

interface Slide {
  id: number
  image: string
  title: string
  subtitle: string
}

interface HeroSlideshowProps {
  onBookNow?: () => void
  onShopNow?: () => void
}

const HeroSlideshow: React.FC<HeroSlideshowProps> = ({ onBookNow, onShopNow }) => {
  const [current, setCurrent] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  const slides: Slide[] = [
    {
      id: 1,
      image: 'https://scontent.fmnl9-4.fna.fbcdn.net/v/t1.15752-9/643787299_1281727390507393_2125770188258383661_n.png?_nc_cat=106&ccb=1-7&_nc_sid=9f807c&_nc_eui2=AeEso-l7zXL9bfqANziQXJiUlZNTfdhhWr6Vk1N92GFavnZZmi7l_W7r_p84WV15YajYpa6QWxo_1d-KNj7MwInr&_nc_ohc=tqpcOkULju4Q7kNvwEqc3b7&_nc_oc=AdnzehCSyeYSbtuZefz8KGGvQR4L3l9eA3yt2I0_ZTyVzS2cp9_q8Sq0SwjHyaBzmac&_nc_zt=23&_nc_ht=scontent.fmnl9-4.fna&_nc_ss=8&oh=03_Q7cD4wFgmvFMZWK82ffeiiT-oLp_Gy7C-OVbx82g3coqje5Dsw&oe=69CE5ECD',
      title: 'Gear Up. Ride Hard.',
      subtitle: 'Premium Parts • Expert Service • Para sa Mga Rider ng Pilipinas',
    },
    {
      id: 2,
      image: 'https://images.pexels.com/photos/235226/pexels-photo-235226.jpeg',
      title: 'Service Fast.',
      subtitle: 'Premium Motorcycle Parts & Expert Maintenance sa PH',
    },
    {
      id: 3,
      image: 'https://images.pexels.com/photos/1409999/pexels-photo-1409999.jpeg',
      title: 'Powered By Performance',
      subtitle: 'Top-Tier Components Para sa Yamaha, Honda, Suzuki',
    },
    {
      id: 4,
      image: 'https://images.pexels.com/photos/10182878/pexels-photo-10182878.jpeg',
      title: 'Built To Last',
      subtitle: 'Quality Parts From Local & International Brands',
    },
  ]

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length)
    setIsAutoPlay(false)
  }

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlay(false)
  }

  useEffect(() => {
    if (!isAutoPlay) return

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlay])

  return (
    <div className="relative w-full h-screen mt-20 overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${slides[current].image})`,
              backgroundPosition: 'center',
            }}
          />

          {/* Gradient Overlay*/}
          <div className="absolute inset-0 bg-gradient-overlay" />

          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="max-w-4xl"
            >
              <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter mb-6 text-white drop-shadow-2xl">
                {slides[current].title}
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-200 font-light tracking-wide drop-shadow-lg mb-8">
                {slides[current].subtitle}
              </p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <motion.button
                  onClick={onShopNow}
                  className="px-8 py-3 bg-gradient-accent rounded-lg font-bold text-white uppercase tracking-wide flex items-center gap-2 hover:shadow-2xl hover:shadow-moto-accent/50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play size={20} fill="currentColor" />
                  Shop Now
                </motion.button>
                <motion.button
                  onClick={onBookNow}
                  className="px-8 py-3 border-2 border-moto-accent-neon rounded-lg font-bold text-moto-accent-neon uppercase tracking-wide flex items-center gap-2 hover:bg-moto-accent-neon/10 backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BookOpen size={20} />
                  Book Service
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        onMouseEnter={() => setIsAutoPlay(false)}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-moto-dark/60 hover:bg-moto-accent-orange text-white transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
      >
        <ChevronLeft size={28} />
      </button>

      <button
        onClick={nextSlide}
        onMouseEnter={() => setIsAutoPlay(false)}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-moto-dark/60 hover:bg-moto-accent-orange text-white transition-all duration-300 opacity-0 group-hover:opacity-100 backdrop-blur-sm"
      >
        <ChevronRight size={28} />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex gap-3">
        {slides.map((_, idx) => (
          <motion.button
            key={idx}
            onClick={() => {
              setCurrent(idx)
              setIsAutoPlay(false)
            }}
            className={`h-3 rounded-full transition-all duration-300 ${
              idx === current
                ? 'w-12 bg-moto-accent-orange'
                : 'w-3 bg-white/40 hover:bg-white/60'
            }`}
            whileHover={{ scale: 1.2 }}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      <div className="absolute top-8 right-8 z-40 text-sm text-gray-400 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isAutoPlay ? 'bg-moto-accent-neon animate-pulse' : 'bg-gray-600'}`} />
        {isAutoPlay ? 'Auto-play' : 'Manual'}
      </div>
    </div>
  )
}

export default HeroSlideshow
