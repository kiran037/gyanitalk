// components/landing/kundali/HousesDisplay.tsx
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

interface House {
  house: number;
  sign: string;
  sign_lord: string;
  planets?: string[];
}

interface HousesDisplayProps {
  houses: House[];
}

export default function HousesDisplay({ houses }: HousesDisplayProps) {
  const getHouseMeaning = (houseNum: number) => {
    const meanings: Record<number, string> = {
      1: 'Self, Personality, Physical Appearance',
      2: 'Wealth, Family, Speech',
      3: 'Courage, Siblings, Communication',
      4: 'Mother, Home, Happiness',
      5: 'Children, Creativity, Intelligence',
      6: 'Health, Enemies, Service',
      7: 'Marriage, Partnership, Spouse',
      8: 'Longevity, Transformation, Secrets',
      9: 'Fortune, Father, Higher Learning',
      10: 'Career, Status, Public Image',
      11: 'Gains, Friends, Aspirations',
      12: 'Losses, Spirituality, Foreign Travel'
    };
    return meanings[houseNum] || '';
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
      <div className="hidden overflow-hidden rounded-xl border border-gray-200/60 bg-white/60 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5 lg:block">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                House
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Sign
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Lord
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Planets
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Significance
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/60 dark:divide-gray-700/60">
            {houses.map((house, index) => (
              <motion.tr
                key={house.house}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6B35]/10 font-bold text-[#FF6B35]">
                      {house.house}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full bg-gradient-to-r ${getSignColor(house.sign)} px-3 py-1 text-xs font-semibold text-white`}>
                    {house.sign}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {house.sign_lord}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {house.planets && house.planets.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {house.planets.map((planet, idx) => (
                        <span
                          key={idx}
                          className="rounded-md bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                        >
                          {planet}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Empty</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {getHouseMeaning(house.house)}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Cards */}
      <div className="space-y-3 lg:hidden">
        {houses.map((house, index) => (
          <motion.div
            key={house.house}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-xl border border-gray-200/60 bg-white/60 p-4 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF6B35]/10 text-lg font-bold text-[#FF6B35]">
                  {house.house}
                </div>
                <div>
                  <div className={`inline-flex items-center rounded-full bg-gradient-to-r ${getSignColor(house.sign)} px-3 py-1 text-xs font-semibold text-white`}>
                    {house.sign}
                  </div>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    Lord: <span className="font-medium text-gray-900 dark:text-white">{house.sign_lord}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-2">
              <p className="mb-1 text-xs font-medium text-gray-500">Planets:</p>
              {house.planets && house.planets.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {house.planets.map((planet, idx) => (
                    <span
                      key={idx}
                      className="rounded-md bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    >
                      {planet}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-gray-400">Empty House</span>
              )}
            </div>

            <div className="rounded-lg bg-gray-50 p-2 dark:bg-gray-800/50">
              <p className="text-xs text-gray-700 dark:text-gray-300">
                <strong>Signifies:</strong> {getHouseMeaning(house.house)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info Box */}
      <div className="rounded-xl border border-blue-200/60 bg-blue-50/60 p-4 dark:border-blue-900/60 dark:bg-blue-900/10">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          💡 <strong>Understanding Houses:</strong> Each house represents different life areas. 
          The sign in each house and its ruling planet influence how that area manifests in your life. 
          Planets placed in houses bring their energy to those life areas.
        </p>
      </div>
    </div>
  );
}