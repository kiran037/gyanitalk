// components/landing/horoscope/ZodiacSelector.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZodiacSign } from "@/app/horoscope/HoroscopeClient";
import { ensureAbs } from "@/lib/images";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";

interface ZodiacFromApi {
  id: number;
  name: ZodiacSign;
  label: string;
  image: string;
}

interface ZodiacSelectorProps {
  selectedZodiac: ZodiacSign | null;
}

export default function ZodiacSelector({ selectedZodiac }: ZodiacSelectorProps) {
  const [zodiacSigns, setZodiacSigns] = useState<ZodiacFromApi[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.9 },
    show: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <div className="rounded-3xl border border-gray-100 bg-white/80 p-5 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/50 sm:p-8">
      <div className="mb-6 flex flex-col items-center justify-center text-center">
        <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
          <Sparkles className="h-5 w-5 text-[#FF6B35]" />
          Choose Your Sign
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Select your zodiac to reveal your cosmic forecast
        </p>
      </div>

      {loading ? (
        // Loading Skeleton
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="flex h-32 flex-col items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50"
            >
              <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
            </div>
          ))}
        </div>
      ) : (
        // Zodiac Grid
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6"
        >
          {zodiacSigns.map((sign) => {
            const isSelected = selectedZodiac === sign.name;

            return (
              <motion.button
                key={sign.name}
                variants={itemVariants}
                onClick={() => {
                  router.push(`/horoscope/${sign.name}`, { scroll: false });
                }}
                className={`group relative flex flex-col items-center justify-center rounded-2xl border p-4 transition-all duration-300 ${
                  isSelected
                    ? "border-[#FF6B35] bg-[#FF6B35]/5 shadow-md ring-1 ring-[#FF6B35] dark:bg-[#FF6B35]/10"
                    : "border-gray-100 bg-white hover:-translate-y-1 hover:border-[#FF6B35]/30 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/50 dark:hover:border-[#FF6B35]/30"
                }`}
                whileTap={{ scale: 0.96 }}
              >
                {/* Image Container */}
                <div
                  className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full transition-colors duration-300 sm:h-16 sm:w-16 ${
                    isSelected
                      ? "bg-white shadow-sm dark:bg-gray-800"
                      : "bg-gray-50 group-hover:bg-[#FF6B35]/10 dark:bg-gray-800"
                  }`}
                >
                  <img
                    src={ensureAbs(sign.image, "/default-zodiac.svg")}
                    alt={sign.label}
                    className="h-9 w-9 object-contain transition-transform duration-300 group-hover:scale-110 sm:h-10 sm:w-10"
                    loading="lazy"
                  />
                </div>

                {/* Label */}
                <span
                  className={`text-sm font-bold transition-colors ${
                    isSelected
                      ? "text-[#FF6B35]"
                      : "text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white"
                  }`}
                >
                  {sign.label}
                </span>

                {/* Selected Indicator Dot (Optional but nice) */}
                {isSelected && (
                  <motion.div
                    layoutId="active-dot"
                    className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[#FF6B35]"
                  />
                )}
              </motion.button>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}