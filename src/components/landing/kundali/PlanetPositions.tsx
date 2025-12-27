
// components/landing/kundali/PlanetPositions.tsx
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

interface Planet {
  name: string;
  sign: string;
  degree: string;
  house: number;
  retrograde?: boolean;
}

interface PlanetPositionsProps {
  planets: Planet[];
}

export default function PlanetPositions({ planets }: PlanetPositionsProps) {
  const getPlanetEmoji = (name: string) => {
    const emojiMap: Record<string, string> = {
      'Sun': '☀️',
      'Moon': '🌙',
      'Mars': '♂️',
      'Mercury': '☿️',
      'Jupiter': '♃',
      'Venus': '♀️',
      'Saturn': '♄',
      'Rahu': '🐉',
      'Ketu': '🌟',
    };
    return emojiMap[name] || '⭐';
  };

  const getSignColor = (sign: string) => {
    // Fire signs
    if (['Aries', 'Leo', 'Sagittarius'].includes(sign)) {
      return 'from-red-500 to-orange-500';
    }
    // Earth signs
    if (['Taurus', 'Virgo', 'Capricorn'].includes(sign)) {
      return 'from-green-500 to-emerald-500';
    }
    // Air signs
    if (['Gemini', 'Libra', 'Aquarius'].includes(sign)) {
      return 'from-blue-500 to-cyan-500';
    }
    // Water signs
    if (['Cancer', 'Scorpio', 'Pisces'].includes(sign)) {
      return 'from-purple-500 to-pink-500';
    }
    return 'from-gray-500 to-gray-600';
  };

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-xl border border-gray-200/60 bg-white/60 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5 md:block">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Planet
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Sign
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Degree
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                House
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/60 dark:divide-gray-700/60">
            {planets.map((planet, index) => (
              <motion.tr
                key={planet.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getPlanetEmoji(planet.name)}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {planet.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full bg-gradient-to-r ${getSignColor(planet.sign)} px-3 py-1 text-xs font-semibold text-white`}>
                    {planet.sign}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                    {planet.degree}°
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-lg bg-[#FF6B35]/10 px-3 py-1 text-sm font-semibold text-[#FF6B35]">
                    {planet.house}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {planet.retrograde ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                      <TrendingUp className="h-3 w-3 rotate-180" />
                      Retrograde
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400">Direct</span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {planets.map((planet, index) => (
          <motion.div
            key={planet.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-xl border border-gray-200/60 bg-white/60 p-4 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getPlanetEmoji(planet.name)}</span>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {planet.name}
                  </div>
                  {planet.retrograde && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                      <TrendingUp className="h-2.5 w-2.5 rotate-180" />
                      Retrograde
                    </span>
                  )}
                </div>
              </div>
              <span className="inline-flex items-center rounded-lg bg-[#FF6B35]/10 px-2 py-1 text-sm font-bold text-[#FF6B35]">
                House {planet.house}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 text-xs font-medium text-gray-500">Sign</div>
                <div className={`inline-flex rounded-full bg-gradient-to-r ${getSignColor(planet.sign)} px-2.5 py-1 text-xs font-semibold text-white`}>
                  {planet.sign}
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs font-medium text-gray-500">Degree</div>
                <div className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                  {planet.degree}°
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info Box */}
      <div className="rounded-xl border border-blue-200/60 bg-blue-50/60 p-4 dark:border-blue-900/60 dark:bg-blue-900/10">
        <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
          💡 <strong>Understanding Planets:</strong> Each planet represents different aspects of life. 
          Their position in signs and houses shows how these energies manifest. Retrograde planets 
          appear to move backward and bring introspection in their areas of influence.
        </p>
      </div>
    </div>
  );
}