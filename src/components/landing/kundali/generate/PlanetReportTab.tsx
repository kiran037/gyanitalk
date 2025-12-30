// // src/components/landing/kundali/generate/PlanetReportTab.tsx
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { 
  Star, Sun, Moon, Zap, Circle, Activity, 
  Orbit, Compass, Crown, Info 
} from "lucide-react";

interface PlanetReportTabProps {
  data: any;
}

export function PlanetReportTab({ data }: PlanetReportTabProps) {
  // Default to null, or set '1' to auto-select Sun on load
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  
  const { planetDetails, personalCharacteristics } = data;

  const planets = [
    { name: "Sun", key: "0", icon: Sun, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { name: "Moon", key: "1", icon: Moon, color: "text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { name: "Mars", key: "2", icon: Zap, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
    { name: "Mercury", key: "3", icon: Star, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { name: "Jupiter", key: "4", icon: Star, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
    { name: "Venus", key: "5", icon: Star, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-900/20" },
    { name: "Saturn", key: "6", icon: Circle, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
    { name: "Rahu", key: "7", icon: Circle, color: "text-gray-500", bg: "bg-gray-100 dark:bg-gray-800" },
    { name: "Ketu", key: "8", icon: Circle, color: "text-gray-500", bg: "bg-gray-100 dark:bg-gray-800" },
  ];

  const selectedPlanetData = selectedPlanet
    ? planetDetails.planets?.[selectedPlanet]
    : null;

  // Ensure safe integer parsing for array indexing
  const selectedPlanetIndex = selectedPlanet !== null ? parseInt(selectedPlanet, 10) : null;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Educational Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10"
      >
        <div className="flex gap-3">
          <Info className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <p className="text-sm leading-relaxed text-blue-800 dark:text-blue-200">
            <strong>Planetary Positions:</strong> Select a planet to understand its influence on your life based on its zodiac sign, house placement, and nakshatra.
          </p>
        </div>
      </motion.div>

      {/* Planet Selector Grid - Responsive */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
        {planets.map((planet) => {
          const Icon = planet.icon;
          const isSelected = selectedPlanet === planet.key;
          
          return (
            <button
              key={planet.key}
              onClick={() => setSelectedPlanet(planet.key)}
              className={`group flex flex-col items-center justify-center rounded-xl border p-3 transition-all ${
                isSelected
                  ? "border-[#FF6B35] bg-gradient-to-b from-[#FF6B35]/10 to-[#FFB347]/10 shadow-md"
                  : "border-gray-200 bg-white hover:border-[#FF6B35]/30 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
              }`}
            >
              <div className={`mb-2 rounded-full p-2 transition-transform group-hover:scale-110 ${isSelected ? "bg-white shadow-sm dark:bg-gray-800" : planet.bg}`}>
                <Icon className={`h-5 w-5 ${isSelected ? "text-[#FF6B35]" : planet.color}`} />
              </div>
              <span className={`text-xs font-semibold ${isSelected ? "text-[#FF6B35]" : "text-gray-600 dark:text-gray-400"}`}>
                {planet.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Detailed Analysis Section */}
      <AnimatePresence mode="wait">
        {selectedPlanetData ? (
          <motion.div
            key={selectedPlanet}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {(() => {
                  const pObj = planets.find(p => p.key === selectedPlanet);
                  const PIcon = pObj?.icon || Star;
                  return (
                    <div className={`rounded-2xl p-3 shadow-sm ${pObj?.bg}`}>
                      <PIcon className={`h-8 w-8 ${pObj?.color}`} />
                    </div>
                  );
                })()}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedPlanetData.full_name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">{selectedPlanetData.zodiac}</span>
                    <span>•</span>
                    <span>House {selectedPlanetData.house}</span>
                  </div>
                </div>
              </div>

              {selectedPlanetData.retro && (
                <div className="self-start rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-red-600 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400 sm:self-center">
                  Retrograde
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100 dark:divide-gray-800 dark:border-gray-800 lg:grid-cols-4">
              <StatItem 
                label="Nakshatra" 
                value={selectedPlanetData.nakshatra} 
                icon={Star}
              />
              <StatItem 
                label="Degree" 
                value={`${selectedPlanetData.local_degree?.toFixed(2)}°`} 
                icon={Compass}
              />
              <StatItem 
                label="Global Degree" 
                value={`${selectedPlanetData.global_degree?.toFixed(2)}°`} 
                icon={Orbit}
              />
              <StatItem 
                label="Zodiac Lord" 
                value={selectedPlanetData.zodiac_lord} 
                icon={Crown}
                isLast
              />
            </div>

            {/* Prediction Text */}
            <div className="p-5 sm:p-8">
              <div className="mb-3 flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#FF6B35]" />
                <h4 className="font-bold text-gray-900 dark:text-white">
                  House Placement Analysis
                </h4>
              </div>
              
              {selectedPlanetIndex !== null && personalCharacteristics && personalCharacteristics[selectedPlanetIndex] ? (
                <div className="rounded-xl bg-gray-50 p-4 leading-relaxed text-gray-700 dark:bg-gray-800/50 dark:text-gray-300">
                  {personalCharacteristics[selectedPlanetIndex]?.personalised_prediction || "Detailed interpretation is currently unavailable for this placement."}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Analysis data unavailable.</p>
              )}
            </div>
          </motion.div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 py-12 text-center dark:border-gray-700 dark:bg-gray-800/20"
          >
            <div className="mb-4 rounded-full bg-white p-4 shadow-sm dark:bg-gray-800">
              <Orbit className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              No Planet Selected
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tap on an icon above to reveal its celestial secrets.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* --- Helper Component --- */

function StatItem({ label, value, icon: Icon, isLast }: any) {
  return (
    <div className={`p-4 ${!isLast ? 'border-b border-gray-100 dark:border-gray-800 lg:border-b-0' : ''} sm:p-6`}>
      <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="truncate text-lg font-bold text-gray-900 dark:text-white">
        {value}
      </div>
    </div>
  );
}