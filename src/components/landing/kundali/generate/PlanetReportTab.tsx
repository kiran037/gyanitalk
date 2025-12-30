// src/components/landing/kundali/generate/PlanetReportTab.tsx
import { motion } from "framer-motion";
import { useState } from "react";
import { Star, Sun, Moon, Zap, Circle, Activity } from "lucide-react";

interface PlanetReportTabProps {
  data: any;
}

export function PlanetReportTab({ data }: PlanetReportTabProps) {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const { planetDetails, personalCharacteristics } = data;

  const planets = [
    { name: "Sun", key: "1", icon: Sun },
    { name: "Moon", key: "2", icon: Moon },
    { name: "Mars", key: "3", icon: Zap },
    { name: "Mercury", key: "4", icon: Star },
    { name: "Jupiter", key: "5", icon: Star },
    { name: "Venus", key: "6", icon: Star },
    { name: "Saturn", key: "7", icon: Circle },
    { name: "Rahu", key: "8", icon: Circle },
    { name: "Ketu", key: "9", icon: Circle },
  ];

  const selectedPlanetData = selectedPlanet
    ? planetDetails.planets?.[selectedPlanet]
    : null;

  const selectedPlanetIndex =
    selectedPlanet !== null ? parseInt(selectedPlanet, 10) - 1 : null;

  return (
    <div className="space-y-6">
      {/* Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-blue-200/60 bg-blue-50/60 p-4 backdrop-blur-sm dark:border-blue-900/60 dark:bg-blue-900/10"
      >
        <p className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
          <Activity className="h-4 w-4" />
          Select a planet below to view its detailed analysis, house placement,
          and effects
        </p>
      </motion.div>

      {/* Planet Selector */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {planets.map((planet) => {
          const Icon = planet.icon;
          return (
            <button
              key={planet.key}
              onClick={() => setSelectedPlanet(planet.key)}
              className={`rounded-xl border p-4 text-center transition-all ${
                selectedPlanet === planet.key
                  ? "border-[#FF6B35] bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 shadow-lg"
                  : "border-gray-200/60 bg-white/60 hover:border-[#FF6B35]/30 hover:shadow-md dark:border-gray-700/60 dark:bg-white/5"
              }`}
            >
              <Icon className="mx-auto mb-2 h-8 w-8 text-[#FF6B35]" />
              <div className="font-semibold text-gray-900 dark:text-white">
                {planet.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Planet Details */}
      {selectedPlanetData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Planet Position Card */}
          <div className="rounded-xl border border-gray-200/60 bg-white/60 p-6 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5">
            <div className="mb-4 flex items-center gap-3">
              {/* {planets.find(p => p.key === selectedPlanet)?.icon && 
                React.createElement(planets.find(p => p.key === selectedPlanet)!.icon, {
                  className: "h-10 w-10 text-[#FF6B35]"
                })
              } */}
              {(() => {
                const PlanetIcon = planets.find(
                  (p) => p.key === selectedPlanet,
                )?.icon;
                return PlanetIcon ? (
                  <PlanetIcon className="h-10 w-10 text-[#FF6B35]" />
                ) : null;
              })()}
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedPlanetData.full_name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedPlanetData.zodiac} • House {selectedPlanetData.house}
                  {selectedPlanetData.retro && (
                    <span className="ml-2 font-medium text-orange-600">
                      (Retrograde)
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                <p className="mb-1 text-xs text-gray-500">Nakshatra</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {selectedPlanetData.nakshatra}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                <p className="mb-1 text-xs text-gray-500">Degree</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {Math.round(selectedPlanetData.local_degree)}°
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                <p className="mb-1 text-xs text-gray-500">Lord</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {selectedPlanetData.zodiac_lord}
                </p>
              </div>
            </div>
          </div>

          {/* House Placement Analysis */}
          {selectedPlanetIndex !== null &&
            personalCharacteristics &&
            personalCharacteristics[selectedPlanetIndex] && (
              <div className="rounded-xl border border-gray-200/60 bg-white/60 p-6 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5">
                <h4 className="mb-3 font-bold text-gray-900 dark:text-white">
                  House Placement Analysis
                </h4>
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {
                    personalCharacteristics[selectedPlanetIndex]
                      ?.personalised_prediction
                  }
                </p>
              </div>
            )}
        </motion.div>
      )}

      {!selectedPlanet && (
        <div className="rounded-xl border border-gray-200/60 bg-white/60 p-12 text-center backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5">
          <Star className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
            Select a Planet
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click on any planet above to view detailed analysis
          </p>
        </div>
      )}
    </div>
  );
}
