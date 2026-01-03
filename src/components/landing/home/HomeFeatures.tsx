"use client";

import { motion, useReducedMotion } from "framer-motion";
import { 
  Zap, 
  Wallet, 
  Star, 
  Shield, 
  Clock, 
  Users, 
  Sparkles 
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Pay",
    desc: "Lightning-fast transactions with a secure payment gateway.",
    color: "from-amber-400 to-orange-500",
    shadow: "shadow-orange-500/20"
  },
  {
    icon: Wallet,
    title: "Digital Wallet",
    desc: "Top up once and consult multiple astrologers without hassle.",
    color: "from-emerald-400 to-teal-500",
    shadow: "shadow-teal-500/20"
  },
  {
    icon: Star,
    title: "Verified Experts",
    desc: "100% verified Vedic experts and Tarot readers.",
    color: "from-purple-400 to-indigo-500",
    shadow: "shadow-purple-500/20"
  },
  {
    icon: Shield,
    title: "Secure Data",
    desc: "Military-grade encryption protects your personal chat history.",
    color: "from-blue-400 to-cyan-500",
    shadow: "shadow-blue-500/20"
  },
  {
    icon: Clock,
    title: "24/7 Support",
    desc: "Access our experts anytime, anywhere—even late at night.",
    color: "from-pink-400 to-rose-500",
    shadow: "shadow-pink-500/20"
  },
  {
    icon: Users,
    title: "Track Activity",
    desc: "Detailed logs of your consultations and spending patterns.",
    color: "from-yellow-400 to-amber-500",
    shadow: "shadow-yellow-500/20"
  },
];

export default function HomeFeatures() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="features-heading"
      className="relative py-12 sm:py-24 px-3 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black/40 overflow-hidden"
    >
      {/* --- Background Elements --- */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06]">
        <svg className="h-full w-full" width="100%" height="100%">
          <pattern id="zodiac-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" className="text-gray-900 dark:text-white" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#zodiac-pattern)" />
        </svg>
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/0 via-transparent to-gray-50/80 dark:from-black/0 dark:to-black/80 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto z-10">
        
             {/* --- Header --- */}
        <motion.div
          className="text-center mb-12 sm:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 text-xs font-bold tracking-widest uppercase mb-6">
            <Sparkles className="w-3 h-3" />
            Why Choose Us
          </div>
          
          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6"
          >
            <span className="text-gray-900 dark:text-white block sm:inline">
              Everything You Need for Your 
            </span>
            {" "}
            <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
              Spiritual Journey
            </span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            We combine ancient Vedic wisdom with modern technology to provide you with a seamless, secure, and enlightening experience.
          </p>
        </motion.div>

        {/* --- Compact Grid Layout --- */}
        {/* 2 Cols on Mobile, 3 on Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="group relative h-full bg-white dark:bg-gray-900/60 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-[2rem] p-4 sm:p-8 overflow-hidden hover:border-orange-200 dark:hover:border-gray-700 transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={prefersReducedMotion ? undefined : { y: -5 }}
            >
              {/* Desktop Hover Glow (Hidden on mobile to save performance) */}
              <div className={`hidden sm:block absolute -right-12 -top-12 w-40 h-40 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 blur-[60px] transition-opacity duration-500 pointer-events-none`} />

              {/* Icon - Smaller on Mobile */}
              <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 sm:mb-6 shadow-md ${feature.shadow}`}>
                <feature.icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              
              {/* Title - Compact on Mobile */}
              <h3 className="text-sm sm:text-xl font-bold mb-1.5 sm:mb-3 text-gray-900 dark:text-white group-hover:text-[#FF6B35] transition-colors leading-tight">
                {feature.title}
              </h3>
              
              {/* Description - Smaller text on mobile */}
              <p className="text-xs sm:text-base text-gray-600 dark:text-gray-400 leading-snug sm:leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}