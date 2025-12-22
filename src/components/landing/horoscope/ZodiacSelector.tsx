// // components/landing/horoscope/ZodiacSelector.tsx
// "use client";

// import { motion } from "framer-motion";
// import { ZodiacSign } from "@/app/landing/horoscope/HoroscopeClient";

// const ZODIAC_SIGNS = [
//   { name: "aries", symbol: "♈", label: "Aries", dates: "Mar 21 - Apr 19", color: "from-red-500 to-orange-500" },
//   { name: "taurus", symbol: "♉", label: "Taurus", dates: "Apr 20 - May 20", color: "from-green-500 to-emerald-500" },
//   { name: "gemini", symbol: "♊", label: "Gemini", dates: "May 21 - Jun 20", color: "from-yellow-500 to-amber-500" },
//   { name: "cancer", symbol: "♋", label: "Cancer", dates: "Jun 21 - Jul 22", color: "from-blue-500 to-cyan-500" },
//   { name: "leo", symbol: "♌", label: "Leo", dates: "Jul 23 - Aug 22", color: "from-orange-500 to-red-500" },
//   { name: "virgo", symbol: "♍", label: "Virgo", dates: "Aug 23 - Sep 22", color: "from-green-600 to-teal-500" },
//   { name: "libra", symbol: "♎", label: "Libra", dates: "Sep 23 - Oct 22", color: "from-pink-500 to-rose-500" },
//   { name: "scorpio", symbol: "♏", label: "Scorpio", dates: "Oct 23 - Nov 21", color: "from-red-600 to-purple-600" },
//   { name: "sagittarius", symbol: "♐", label: "Sagittarius", dates: "Nov 22 - Dec 21", color: "from-purple-500 to-indigo-500" },
//   { name: "capricorn", symbol: "♑", label: "Capricorn", dates: "Dec 22 - Jan 19", color: "from-gray-600 to-slate-600" },
//   { name: "aquarius", symbol: "♒", label: "Aquarius", dates: "Jan 20 - Feb 18", color: "from-cyan-500 to-blue-500" },
//   { name: "pisces", symbol: "♓", label: "Pisces", dates: "Feb 19 - Mar 20", color: "from-blue-400 to-purple-500" },
// ];

// interface ZodiacSelectorProps {
//   selectedZodiac: ZodiacSign | null;
//   onSelectZodiac: (zodiac: ZodiacSign) => void;
// }

// export default function ZodiacSelector({
//   selectedZodiac,
//   onSelectZodiac,
// }: ZodiacSelectorProps) {
//   return (
//     <motion.div
//       className="rounded-2xl border border-gray-200/70 bg-white/70 p-5 backdrop-blur-xl dark:border-gray-800 dark:bg-white/5 sm:p-6"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//     >
//       <h2 className="mb-5 text-center text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
//         Select Your Zodiac Sign
//       </h2>
      
//       <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
//         {ZODIAC_SIGNS.map((sign, index) => {
//           const isSelected = selectedZodiac === sign.name;
          
//           return (
//             <motion.button
//               key={sign.name}
//               onClick={() => onSelectZodiac(sign.name as ZodiacSign)}
//               className={`group relative overflow-hidden rounded-xl p-4 transition-all ${
//                 isSelected
//                   ? "ring-2 ring-[#FF6B35] ring-offset-2 dark:ring-offset-gray-900"
//                   : "hover:scale-105"
//               }`}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.03 }}
//               whileHover={{ scale: isSelected ? 1 : 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               {/* Background Gradient */}
//               <div
//                 className={`absolute inset-0 bg-gradient-to-br ${sign.color} opacity-10 transition-opacity group-hover:opacity-20`}
//               />
              
//               {/* Selected Indicator */}
//               {isSelected && (
//                 <motion.div
//                   className={`absolute inset-0 bg-gradient-to-br ${sign.color} opacity-20`}
//                   layoutId="selectedZodiac"
//                 />
//               )}

//               {/* Content */}
//               <div className="relative z-10 flex flex-col items-center gap-1.5">
//                 <div className="text-3xl sm:text-4xl">{sign.symbol}</div>
//                 <div className="text-center">
//                   <div className="text-xs font-bold text-gray-900 dark:text-white sm:text-sm">
//                     {sign.label}
//                   </div>
//                   <div className="mt-0.5 text-[10px] text-gray-600 dark:text-gray-400">
//                     {sign.dates}
//                   </div>
//                 </div>
//               </div>
//             </motion.button>
//           );
//         })}
//       </div>
//     </motion.div>
//   );
// }

// components/landing/horoscope/ZodiacSelector.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ZodiacSign } from "@/app/landing/horoscope/HoroscopeClient";
import { ensureAbs } from "@/lib/images";

interface ZodiacFromApi {
  id: number;
  name: ZodiacSign; // "aries", "taurus" etc
  label: string;    // "Aries"
  image: string;    // image path from DB
}

interface ZodiacSelectorProps {
  selectedZodiac: ZodiacSign | null;
  onSelectZodiac: (zodiac: ZodiacSign) => void;
}

export default function ZodiacSelector({
  selectedZodiac,
  onSelectZodiac,
}: ZodiacSelectorProps) {
  const [zodiacSigns, setZodiacSigns] = useState<ZodiacFromApi[]>([]);

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
              onClick={() => onSelectZodiac(sign.name)}
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