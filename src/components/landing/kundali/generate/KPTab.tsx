// // src/components/landing/kundali/generate/KPTab.tsx
// import { motion } from 'framer-motion';
// import { Hash, Star, Sun, Moon, Zap, Circle, AlertCircle } from 'lucide-react';

// interface KPTabProps {
//   data: any;
// }

// export default function KPTab({ data }: KPTabProps) {
//   const { kpSystem } = data;

//   if (!kpSystem) {
//     return (
//       <div className="rounded-xl border border-gray-200/60 bg-white/60 p-12 text-center backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5">
//         <Hash className="mx-auto mb-4 h-16 w-16 text-gray-400" />
//         <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
//           KP System Data Not Available
//         </h3>
//       </div>
//     );
//   }

//   const { houses, planets } = kpSystem;

//   const getPlanetIcon = (name: string) => {
//     const icons: Record<string, any> = {
//       'Sun': Sun, 'Moon': Moon, 'Mars': Zap, 'Mercury': Star,
//       'Jupiter': Star, 'Venus': Star, 'Saturn': Circle, 'Rahu': Circle,
//       'Ketu': Circle, 'Ascendant': Star
//     };
//     return icons[name] || Star;
//   };

//   return (
//     <div className="space-y-6">
//       {/* Explanation */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="rounded-xl border border-blue-200/60 bg-blue-50/60 p-4 backdrop-blur-sm dark:border-blue-900/60 dark:bg-blue-900/10"
//       >
//         <div className="flex gap-3">
//           <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
//           <div>
//             <h3 className="mb-2 font-bold text-blue-900 dark:text-blue-100">
//               What is KP System?
//             </h3>
//             <p className="text-sm text-blue-700 dark:text-blue-300">
//               Krishnamurti Paddhati (KP) is an advanced predictive astrology system that uses sub-lords 
//               for accurate timing of events. It divides each nakshatra into 9 unequal parts for precise predictions.
//             </p>
//           </div>
//         </div>
//       </motion.div>

//       {/* KP Houses */}
//       {houses && houses.length > 0 && (
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//         >
//           <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
//             <Hash className="h-5 w-5 text-[#FF6B35]" />
//             KP House Cusps
//           </h3>
//           <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
//             {houses.map((house: any, idx: number) => (
//               <div
//                 key={idx}
//                 className="rounded-xl border border-gray-200/60 bg-white/60 p-4 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
//               >
//                 <div className="mb-2 flex items-center justify-between">
//                   <span className="font-bold text-[#FF6B35]">House {house.house || idx + 1}</span>
//                   <span className="text-xs font-medium text-gray-500">Cusp</span>
//                 </div>
//                 <div className="space-y-1 text-sm">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600 dark:text-gray-400">Sign:</span>
//                     <span className="font-semibold text-gray-900 dark:text-white">{house.start_rasi}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600 dark:text-gray-400">Star:</span>
//                     <span className="font-semibold text-gray-900 dark:text-white">{house.start_nakshatra}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600 dark:text-gray-400">Sub Lord:</span>
//                     <span className="font-semibold text-gray-900 dark:text-white">{house.cusp_sub_lord}</span>
//                   </div>
//                   {house.planets && house.planets.length > 0 && (
//                     <div className="mt-2 flex flex-wrap gap-1">
//                       {house.planets.map((planet: any, i: number) => (
//                         <span
//                           key={i}
//                           className="rounded bg-[#FF6B35]/10 px-2 py-0.5 text-xs font-medium text-[#FF6B35]"
//                         >
//                           {planet.name}
//                         </span>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </motion.div>
//       )}

//       {/* KP Planets */}
//       {planets && Object.keys(planets).length > 0 && (
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//         >
//           <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
//             <Star className="h-5 w-5 text-[#FF6B35]" />
//             KP Planetary Positions
//           </h3>
//           <div className="grid gap-3 sm:grid-cols-2">
//             {Object.values(planets).filter((p: any) => p.name && p.name !== 'midheaven' && p.name !== 'ascendant').map((planet: any, idx: number) => {
//               const Icon = getPlanetIcon(planet.full_name);
//               return (
//                 <div
//                   key={idx}
//                   className="rounded-xl border border-gray-200/60 bg-white/60 p-4 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
//                 >
//                   <div className="mb-3 flex items-center gap-3">
//                     <Icon className="h-6 w-6 text-[#FF6B35]" />
//                     <div>
//                       <h4 className="font-bold text-gray-900 dark:text-white">{planet.full_name}</h4>
//                       {planet.retro && (
//                         <span className="text-xs font-medium text-orange-600">Retrograde</span>
//                       )}
//                     </div>
//                   </div>
//                   <div className="grid grid-cols-2 gap-2 text-sm">
//                     <div>
//                       <p className="text-xs text-gray-500">Sign</p>
//                       <p className="font-semibold text-gray-900 dark:text-white">{planet.zodiac}</p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-gray-500">House</p>
//                       <p className="font-semibold text-gray-900 dark:text-white">{planet.house}</p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-gray-500">Nakshatra</p>
//                       <p className="font-semibold text-gray-900 dark:text-white">{planet.pseudo_nakshatra}</p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-gray-500">Sub Lord</p>
//                       <p className="font-semibold text-gray-900 dark:text-white">{planet.sub_lord}</p>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </motion.div>
//       )}

//       {/* KP Significance */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.3 }}
//         className="rounded-xl border border-purple-200/60 bg-purple-50/60 p-6 backdrop-blur-sm dark:border-purple-900/60 dark:bg-purple-900/10"
//       >
//         <h3 className="mb-4 flex items-center gap-2 font-bold text-purple-900 dark:text-purple-100">
//           <Hash className="h-5 w-5" />
//           KP System Key Concepts
//         </h3>
//         <div className="space-y-3 text-sm text-purple-700 dark:text-purple-300">
//           <p><strong>Sign Lord:</strong> The planet ruling the zodiac sign where the cusp/planet is placed</p>
//           <p><strong>Star Lord:</strong> The planet ruling the nakshatra (27 divisions) containing the cusp/planet</p>
//           <p><strong>Sub Lord:</strong> The planet ruling the sub-division (further division of nakshatra into 9 parts)</p>
//           <p><strong>Significance:</strong> The Sub Lord is most important in KP system for event prediction and timing</p>
//         </div>
//       </motion.div>
//     </div>
//   );
// }

// src/components/landing/kundali/generate/KPTab.tsx
import { motion } from 'framer-motion';
import { 
  Hash, Star, Sun, Moon, Zap, Circle, AlertCircle, 
  Info, ChevronRight, LayoutGrid 
} from 'lucide-react';

interface KPTabProps {
  data: any;
}

export default function KPTab({ data }: KPTabProps) {
  const { kpSystem } = data;

  if (!kpSystem) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-gray-200/60 bg-white/60 p-8 text-center backdrop-blur-sm dark:border-gray-700/60 dark:bg-gray-900/50">
        <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
          <Hash className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          KP System Data Unavailable
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Advanced KP calculations could not be generated for this chart.
        </p>
      </div>
    );
  }

  const { houses, planets } = kpSystem;

  const getPlanetIcon = (name: string) => {
    const icons: Record<string, any> = {
      'Sun': Sun, 'Moon': Moon, 'Mars': Zap, 'Mercury': Star,
      'Jupiter': Star, 'Venus': Star, 'Saturn': Circle, 'Rahu': Circle,
      'Ketu': Circle, 'Ascendant': Star
    };
    return icons[name] || Star;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Educational Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10 sm:p-5"
      >
        <div className="flex gap-4">
          <div className="hidden rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 sm:block">
            <Info className="h-6 w-6" />
          </div>
          <div>
            <h3 className="mb-1 text-base font-bold text-blue-900 dark:text-blue-100">
              Krishnamurti Paddhati (KP) System
            </h3>
            <p className="text-sm leading-relaxed text-blue-800/80 dark:text-blue-200/80">
              KP Astrology uses <strong>Sub-Lords</strong> for precise event timing. Unlike traditional Vedic astrology, it divides each Nakshatra into 9 unequal parts to offer deeper granular insights.
            </p>
          </div>
        </div>
      </motion.div>

      {/* KP Planets Grid */}
      {planets && Object.keys(planets).length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2 px-1">
            <Star className="h-5 w-5 text-[#FF6B35]" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              KP Planetary Positions
            </h3>
          </div>
          
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.values(planets)
              .filter((p: any) => p.name && !['midheaven', 'ascendant'].includes(p.name.toLowerCase()))
              .map((planet: any, idx: number) => {
                const Icon = getPlanetIcon(planet.full_name);
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-[#FF6B35]/30 hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-orange-50 p-2 text-[#FF6B35] dark:bg-orange-900/20">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">
                            {planet.full_name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {planet.zodiac}
                          </p>
                        </div>
                      </div>
                      {planet.retro && (
                        <span className="rounded-md border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
                          Retro
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between border-b border-gray-50 pb-1 dark:border-gray-800">
                        <span className="text-xs text-gray-500">Nakshatra</span>
                        <span className="font-medium text-gray-900 dark:text-white">{planet.pseudo_nakshatra}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-gray-500">Sub Lord</span>
                        <span className="font-bold text-[#FF6B35]">{planet.sub_lord}</span>
                      </div>
                    </div>
                  </motion.div>
                );
            })}
          </div>
        </section>
      )}

      {/* KP Houses - Table View for Better Data Density */}
      {houses && houses.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-100 p-4 dark:border-gray-800 sm:p-5">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
              <LayoutGrid className="h-5 w-5 text-[#FF6B35]" />
              House Cusps & Sub Lords
            </h3>
            <p className="text-xs text-gray-500">Scroll horizontally to view full details</p>
          </div>

          <div className="relative w-full overflow-hidden">
             {/* Mobile Swipe Indicator */}
             <div className="absolute right-0 top-0 z-10 flex h-full w-8 items-center justify-center bg-gradient-to-l from-white to-transparent dark:from-gray-900 lg:hidden">
              <ChevronRight className="h-4 w-4 text-gray-400 opacity-50" />
             </div>

            <div className="overflow-x-auto pb-2">
              <table className="w-full min-w-[600px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
                    <th className="px-4 py-3 font-semibold">House</th>
                    <th className="px-4 py-3 font-semibold">Sign (Rasi)</th>
                    <th className="px-4 py-3 font-semibold">Degree</th>
                    <th className="px-4 py-3 font-semibold">Nakshatra Lord</th>
                    <th className="px-4 py-3 font-semibold text-[#FF6B35]">Sub Lord</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {houses.map((house: any, idx: number) => (
                    <tr key={idx} className="group hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold dark:bg-gray-800">
                          {house.house || idx + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {house.start_rasi}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                        {house.degree?.toFixed(2)}°
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {house.sign_lord || house.start_nakshatra?.split(' ')[0] || '-'}
                      </td>
                      <td className="px-4 py-3 font-bold text-[#FF6B35]">
                        {house.cusp_sub_lord}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Glossary / Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid gap-4 sm:grid-cols-3"
      >
        {[
          { title: "Sign Lord", desc: "Ruler of the Zodiac Sign" },
          { title: "Star Lord", desc: "Ruler of the Nakshatra" },
          { title: "Sub Lord", desc: "Most critical for prediction in KP" },
        ].map((item, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
            <h4 className="mb-1 text-sm font-bold text-gray-900 dark:text-white">{item.title}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}