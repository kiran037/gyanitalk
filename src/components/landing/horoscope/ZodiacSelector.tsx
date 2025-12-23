// components/landing/horoscope/ZodiacSelector.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ZodiacSign } from "@/app/landing/horoscope/HoroscopeClient";
import { ensureAbs } from "@/lib/images";
import { useRouter } from "next/navigation";

interface ZodiacFromApi {
  id: number;
  name: ZodiacSign; // "aries", "taurus" etc
  label: string; // "Aries"
  image: string; // image path from DB
}

interface ZodiacSelectorProps {
  selectedZodiac: ZodiacSign | null;
}

export default function ZodiacSelector({
  selectedZodiac,
}: ZodiacSelectorProps) {
  const [zodiacSigns, setZodiacSigns] = useState<ZodiacFromApi[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/landing/horoscopes/sign")
      .then((res) => res.json())
      .then((res) => {
        if (res?.success) {
          setZodiacSigns(res.data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <motion.div
      className="rounded-2xl border border-gray-200/70 bg-white/70 p-5 backdrop-blur-xl dark:border-gray-800 dark:bg-white/5 sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2 className="mb-5 text-center text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
        Select Your Zodiac Sign
      </h2>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
        {zodiacSigns.map((sign, index) => {
          const isSelected = selectedZodiac === sign.name;

          return (
            <motion.button
              key={sign.name}
              onClick={() => {
  router.push(`/landing/horoscope/${sign.name}`, { scroll: false });
}}
              className={`group relative overflow-hidden rounded-xl p-4 transition-all ${
                isSelected
                  ? "ring-2 ring-[#FF6B35] ring-offset-2 dark:ring-offset-gray-900"
                  : "hover:scale-105"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: isSelected ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-purple-500/10 transition-opacity group-hover:opacity-20" />

              {/* Selected Indicator */}
              {isSelected && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-purple-500/20"
                  layoutId="selectedZodiac"
                />
              )}

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center gap-1.5">
                <img
                  src={ensureAbs(sign.image, "/default-zodiac.svg")}
                  alt={sign.label}
                  className="h-10 w-10 object-contain sm:h-12 sm:w-12"
                />

                <div className="text-center">
                  <div className="text-xs font-bold text-gray-900 dark:text-white sm:text-sm">
                    {sign.label}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
