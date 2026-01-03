"use client";

import { motion } from "framer-motion";
import { Users, Star, Shield, Clock, CheckCircle2, Moon } from "lucide-react";

// --- Data ---
const benefits = [
  { 
    title: "Verified Experts", 
    desc: "100% ID & skill-verified astrologers." 
  },
  { 
    title: "Transparent Pricing", 
    desc: "Pay per minute. No hidden charges." 
  },
  { 
    title: "Instant Consultations", 
    desc: "Connect via Chat or Call in seconds." 
  },
  { 
    title: "Multilingual Support", 
    desc: "Consult in Hindi, English, Tamil & more." 
  },
];

const stats = [
  { value: "50K+", label: "Happy Users", icon: Users },
  { value: "100+", label: "Astrologers", icon: Star },
  { value: "99.9%", label: "Uptime", icon: Shield },
  { value: "24/7", label: "Support", icon: Clock },
];

export default function HomeBenefits() {
  return (
    <section
      aria-labelledby="benefits-heading"
      className="relative py-12 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black overflow-hidden"
    >
      {/* --- Background Decor --- */}
      {/* Moon Icon (Faded) */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 opacity-[0.03] dark:opacity-[0.1] pointer-events-none">
        <Moon size={300} strokeWidth={0.5} className="text-gray-900 dark:text-white" />
      </div>
      
      {/* Gradient Blob */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orange-100/50 dark:bg-orange-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          
          {/* --- LEFT COLUMN: Content --- */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 sm:space-y-8 text-center lg:text-left"
          >
            <div>
              <div className="inline-block px-3 py-1 mb-3 text-[10px] sm:text-xs font-bold tracking-widest uppercase text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300 rounded-full">
                Trusted by Thousands
              </div>
              <h2
                id="benefits-heading"
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight"
              >
                Why the World Loves <br className="hidden sm:block"/>
                <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                  GyaniTalk
                </span>
              </h2>
            </div>

            {/* Benefits List (Compact on Mobile) */}
            <div className="grid gap-3 sm:gap-4 text-left">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:border-orange-200 dark:hover:border-orange-900/50 transition-colors group"
                >
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-[#FF6B35] group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                      {benefit.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-snug">
                      {benefit.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* --- RIGHT COLUMN: Stats Grid --- */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-3 sm:gap-6"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="flex flex-col items-center justify-center p-4 sm:p-8 bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[2rem] shadow-lg shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-800 text-center group relative overflow-hidden"
              >
                {/* Hover Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent dark:from-orange-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <stat.icon className="relative w-6 h-6 sm:w-10 sm:h-10 text-[#FF6B35] mb-2 sm:mb-4 group-hover:scale-110 transition-transform" />
                
                <div className="relative text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                
                <div className="relative text-[10px] sm:text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}