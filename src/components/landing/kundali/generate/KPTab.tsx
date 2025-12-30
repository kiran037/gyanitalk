// src/components/landing/kundali/generate/KPTab.tsx
import { motion } from 'framer-motion';
import { Hash, Star, Sun, Moon, Zap, Circle, AlertCircle } from 'lucide-react';

interface KPTabProps {
  data: any;
}

export default function KPTab({ data }: KPTabProps) {
  const { kpSystem } = data;

  if (!kpSystem) {
    return (
      <div className="rounded-xl border border-gray-200/60 bg-white/60 p-12 text-center backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5">
        <Hash className="mx-auto mb-4 h-16 w-16 text-gray-400" />
        <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
          KP System Data Not Available
        </h3>
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
    <div className="space-y-6">
      {/* Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-blue-200/60 bg-blue-50/60 p-4 backdrop-blur-sm dark:border-blue-900/60 dark:bg-blue-900/10"
      >
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="mb-2 font-bold text-blue-900 dark:text-blue-100">
              What is KP System?
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Krishnamurti Paddhati (KP) is an advanced predictive astrology system that uses sub-lords 
              for accurate timing of events. It divides each nakshatra into 9 unequal parts for precise predictions.
            </p>
          </div>
        </div>
      </motion.div>

      {/* KP Houses */}
      {houses && houses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <Hash className="h-5 w-5 text-[#FF6B35]" />
            KP House Cusps
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {houses.map((house: any, idx: number) => (
              <div
                key={idx}
                className="rounded-xl border border-gray-200/60 bg-white/60 p-4 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-bold text-[#FF6B35]">House {house.house || idx + 1}</span>
                  <span className="text-xs font-medium text-gray-500">Cusp</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Sign:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{house.start_rasi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Star:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{house.start_nakshatra}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Sub Lord:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{house.cusp_sub_lord}</span>
                  </div>
                  {house.planets && house.planets.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {house.planets.map((planet: any, i: number) => (
                        <span
                          key={i}
                          className="rounded bg-[#FF6B35]/10 px-2 py-0.5 text-xs font-medium text-[#FF6B35]"
                        >
                          {planet.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* KP Planets */}
      {planets && Object.keys(planets).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <Star className="h-5 w-5 text-[#FF6B35]" />
            KP Planetary Positions
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.values(planets).filter((p: any) => p.name && p.name !== 'midheaven' && p.name !== 'ascendant').map((planet: any, idx: number) => {
              const Icon = getPlanetIcon(planet.full_name);
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-gray-200/60 bg-white/60 p-4 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <Icon className="h-6 w-6 text-[#FF6B35]" />
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{planet.full_name}</h4>
                      {planet.retro && (
                        <span className="text-xs font-medium text-orange-600">Retrograde</span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Sign</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{planet.zodiac}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">House</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{planet.house}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Nakshatra</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{planet.pseudo_nakshatra}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Sub Lord</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{planet.sub_lord}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* KP Significance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-purple-200/60 bg-purple-50/60 p-6 backdrop-blur-sm dark:border-purple-900/60 dark:bg-purple-900/10"
      >
        <h3 className="mb-4 flex items-center gap-2 font-bold text-purple-900 dark:text-purple-100">
          <Hash className="h-5 w-5" />
          KP System Key Concepts
        </h3>
        <div className="space-y-3 text-sm text-purple-700 dark:text-purple-300">
          <p><strong>Sign Lord:</strong> The planet ruling the zodiac sign where the cusp/planet is placed</p>
          <p><strong>Star Lord:</strong> The planet ruling the nakshatra (27 divisions) containing the cusp/planet</p>
          <p><strong>Sub Lord:</strong> The planet ruling the sub-division (further division of nakshatra into 9 parts)</p>
          <p><strong>Significance:</strong> The Sub Lord is most important in KP system for event prediction and timing</p>
        </div>
      </motion.div>
    </div>
  );
}