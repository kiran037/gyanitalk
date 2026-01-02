"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sun, ArrowRight } from "lucide-react";
import { ensureAbs } from "@/lib/images";

// --- Static Data for Enrichment ---
const ZODIAC_META: Record<string, { dates: string }> = {
  aries: { dates: "Mar 21 - Apr 19" },
  taurus: { dates: "Apr 20 - May 20" },
  gemini: { dates: "May 21 - Jun 20" },
  cancer: { dates: "Jun 21 - Jul 22" },
  leo: { dates: "Jul 23 - Aug 22" },
  virgo: { dates: "Aug 23 - Sep 22" },
  libra: { dates: "Sep 23 - Oct 22" },
  scorpio: { dates: "Oct 23 - Nov 21" },
  sagittarius: { dates: "Nov 22 - Dec 21" },
  capricorn: { dates: "Dec 22 - Jan 19" },
  aquarius: { dates: "Jan 20 - Feb 18" },
  pisces: { dates: "Feb 19 - Mar 20" },
};

interface ZodiacFromApi {
  id: number;
  name: string;
  label: string;
  image: string;
}

export default function ZodiacSignComponent() {
  const [zodiacSigns, setZodiacSigns] = useState<ZodiacFromApi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/landing/horoscopes/sign")
      .then((res) => res.json())
      .then((res) => {
        if (res?.success) {
          setZodiacSigns(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black overflow-hidden">
      
      {/* --- Background Decor --- */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-100/30 dark:bg-orange-900/10 rounded-full blur-[100px]" />
         <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.08]" 
             style={{ backgroundImage: "radial-gradient(#FF6B35 1px, transparent 1px)", backgroundSize: "24px 24px" }} 
         />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* --- Header --- */}
        <div className="text-center mb-10 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 text-[10px] font-bold tracking-widest uppercase mb-3"
          >
            <Sun className="w-3 h-3" />
            Daily Horoscope
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-3 text-gray-900 dark:text-white"
          >
            Choose Your <span className="text-[#FF6B35]">Sign</span>
          </motion.h2>
        </div>

        {/* --- Compact Grid Layout --- */}
        {/* Mobile: 3 cols (4 rows) | Tablet: 4 cols (3 rows) | Desktop: 6 cols (2 rows) */}
        {loading ? (
          <ZodiacSkeleton />
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6 lg:gap-5">
            {zodiacSigns.map((sign, index) => {
              const meta = ZODIAC_META[sign.name.toLowerCase()] || { dates: "" };
              
              return (
                <motion.div
                  key={sign.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                >
                  <Link href={`/horoscope/${sign.name}`} className="group block h-full">
                    <article className="relative h-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-3 sm:p-4 overflow-hidden shadow-sm hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-900/50 transition-all duration-300 flex flex-col items-center text-center">
                      
                      {/* Hover Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent dark:from-orange-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Image Container (Compact) */}
                      <div className="relative mb-2 sm:mb-3">
                        <div className="absolute inset-0 bg-orange-400 blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full" />
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                          <img
                            src={ensureAbs(sign.image, "/images/default-zodiac.png")}
                            alt={`${sign.label} Zodiac`}
                            className="w-full h-full object-contain drop-shadow-sm"
                            loading="lazy"
                          />
                        </div>
                      </div>

                      {/* Text Content (Compact) */}
                      <div className="relative z-10 w-full space-y-0.5">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white group-hover:text-[#FF6B35] transition-colors">
                          {sign.label}
                        </h3>
                        
                        <p className="text-[9px] sm:text-[10px] font-semibold text-gray-400 uppercase tracking-wide truncate">
                          {meta.dates}
                        </p>
                      </div>
                      
                      {/* Hover Indicator (Subtle Dot) */}
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#FF6B35] opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300" />
                    </article>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}

// --- Compact Skeleton ---
function ZodiacSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6 lg:gap-5">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="h-32 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 flex flex-col items-center justify-center animate-pulse">
           <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 mb-3" />
           <div className="w-14 h-3 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      ))}
    </div>
  );
}