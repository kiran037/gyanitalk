"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ScrollText, 
  HeartHandshake, 
  ArrowRight, 
  Binary 
} from "lucide-react";

export default function KundaliCard() {
  return (
    <section className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black overflow-hidden">
      
      {/* --- Background Decor --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]" 
             style={{ backgroundImage: "radial-gradient(#FF6B35 1px, transparent 1px)", backgroundSize: "32px 32px" }} 
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-100/40 dark:bg-orange-900/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* --- Header --- */}
        <div className="flex flex-col sm:flex-row items-end justify-between gap-6 mb-10">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 text-xs font-bold tracking-widest uppercase mb-3"
            >
              <Binary className="w-3 h-3" />
              Vedic Tools
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white"
            >
              Free <span className="text-[#FF6B35]">Kundali</span>
            </motion.h2>
          </div>
          
          <motion.p 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 max-w-xs text-right"
          >
            Instant, accurate, and free Vedic astrology reports generated in seconds.
          </motion.p>
        </div>

        {/* --- Compact Container (Snap Scroll on Mobile, Grid on Desktop) --- */}
        <div className="relative -mx-4 sm:mx-0">
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 px-4 sm:px-0 pb-8 scrollbar-hide md:grid md:grid-cols-2 md:overflow-visible md:pb-0">
            
            {/* Card 1: Janam Kundali */}
            <CompactToolCard 
              title="Janam Kundali"
              subtitle="Birth Chart"
              description="Generate your detailed Vedic birth chart with planetary positions."
              icon={ScrollText}
              href="/free-kundali"
              colorClass="from-orange-400 to-red-500"
              delay={0.1}
            />

            {/* Card 2: Kundali Matching */}
            <CompactToolCard 
              title="Kundali Matching"
              subtitle="Compatibility"
              description="Check marriage compatibility (Gun Milan) for you and your partner."
              icon={HeartHandshake}
              href="/kundali-matching"
              colorClass="from-pink-500 to-rose-500"
              delay={0.2}
            />

          </div>
        </div>

      </div>
      
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}

// --- Compact Card Component ---
function CompactToolCard({ 
  title, 
  subtitle, 
  description, 
  icon: Icon, 
  href, 
  colorClass,
  delay 
}: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="snap-center shrink-0 w-[85vw] md:w-auto flex flex-col group relative"
    >
      {/* Glow Border */}
      <div className="absolute -inset-0.5 bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-[2rem] blur-[1px] group-hover:blur-md transition-all duration-300 opacity-100" />
      
      <Link href={href} className="relative h-full flex flex-col bg-white dark:bg-gray-950 rounded-[1.9rem] p-6 sm:p-8 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        
        {/* Hover Bloom */}
        <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-10 blur-[60px] transition-opacity duration-500`} />

        <div className="relative z-10 flex flex-col h-full">
          
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <span className="px-3 py-1 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Free
            </span>
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-[#FF6B35] transition-colors">
            {title}
          </h3>
          <p className="text-xs font-bold text-[#FF6B35] uppercase tracking-wide mb-3">
            {subtitle}
          </p>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6 flex-1">
            {description}
          </p>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#FF6B35] transition-colors">
            Try Now 
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}