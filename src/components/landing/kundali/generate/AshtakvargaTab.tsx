// src/components/landing/kundali/generate/AshtakvargaTab.tsx
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AshtakvargaTabProps {
  data: any;
}

export default function AshtakvargaTab({ data }: AshtakvargaTabProps) {
  const { ashtakvarga } = data;

  if (!ashtakvarga) {
    return (
      <div className="rounded-xl border border-gray-200/60 bg-white/60 p-12 text-center backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5">
        <div className="mb-4 text-6xl">⚡</div>
        <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
          Ashtakvarga Data Not Available
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Ashtakvarga analysis requires additional data processing
        </p>
      </div>
    );
  }

  const { ashtakvarga_order, ashtakvarga_points, ashtakvarga_total } = ashtakvarga;
  const zodiacSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  const getStrengthColor = (points: number) => {
    if (points >= 32) return 'text-green-600 dark:text-green-400';
    if (points >= 25) return 'text-blue-600 dark:text-blue-400';
    if (points >= 20) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStrengthBg = (points: number) => {
    if (points >= 32) return 'bg-green-50 dark:bg-green-900/20';
    if (points >= 25) return 'bg-blue-50 dark:bg-blue-900/20';
    if (points >= 20) return 'bg-yellow-50 dark:bg-yellow-900/20';
    return 'bg-red-50 dark:bg-red-900/20';
  };

  const getStrengthLabel = (points: number) => {
    if (points >= 32) return { label: 'Excellent', icon: <TrendingUp className="h-4 w-4" /> };
    if (points >= 25) return { label: 'Good', icon: <TrendingUp className="h-4 w-4" /> };
    if (points >= 20) return { label: 'Average', icon: <Minus className="h-4 w-4" /> };
    return { label: 'Weak', icon: <TrendingDown className="h-4 w-4" /> };
  };

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-blue-200/60 bg-blue-50/60 p-4 backdrop-blur-sm dark:border-blue-900/60 dark:bg-blue-900/10"
      >
        <h3 className="mb-2 font-bold text-blue-900 dark:text-blue-100">
          ⚡ What is Ashtakvarga?
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Ashtakvarga is a predictive system that measures the strength of planets and signs. 
          Higher points (28+) indicate favorable results, while lower points suggest challenges. 
          It helps identify the best timing for activities based on planetary transits.
        </p>
      </motion.div>

      {/* Total Strength Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-gray-200/60 bg-white/60 p-6 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
      >
        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
          Sign Strength Summary
        </h3>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {ashtakvarga_total.map((total: number, idx: number) => {
            const strength = getStrengthLabel(total);
            return (
              <div
                key={idx}
                className={`rounded-lg border border-gray-200/60 p-4 ${getStrengthBg(total)}`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {zodiacSigns[idx]}
                  </span>
                  <span className={`flex items-center gap-1 ${getStrengthColor(total)}`}>
                    {strength.icon}
                  </span>
                </div>
                <div className="mb-1 text-2xl font-bold ${getStrengthColor(total)}">
                  {total}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {strength.label}
                </div>
                {/* Progress Bar */}
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-full ${getStrengthColor(total).replace('text-', 'bg-')}`}
                    style={{ width: `${(total / 48) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Detailed Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-gray-200/60 bg-white/60 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
      >
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Detailed Ashtakvarga Points
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Shows how each planet contributes to sign strength
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Planet</th>
                {zodiacSigns.map((sign) => (
                  <th key={sign} className="px-2 py-3 text-center text-xs font-semibold">
                    {sign.substring(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/60 dark:divide-gray-700/60">
              {ashtakvarga_order.map((planet: string, idx: number) => (
                <tr key={planet} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                    {planet}
                  </td>
                  {ashtakvarga_points[idx].map((point: number, signIdx: number) => (
                    <td key={signIdx} className="px-2 py-3 text-center">
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold ${
                          point >= 5
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : point >= 3
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {point}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 font-bold">
                <td className="px-4 py-3">Total</td>
                {ashtakvarga_total.map((total: number, idx: number) => (
                  <td key={idx} className="px-2 py-3 text-center">
                    <span className={`text-base ${getStrengthColor(total)}`}>
                      {total}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="space-y-4 p-4 lg:hidden">
          {ashtakvarga_order.map((planet: string, idx: number) => (
            <div
              key={planet}
              className="rounded-lg border border-gray-200/60 bg-white/40 p-4 dark:border-gray-700/60 dark:bg-white/5"
            >
              <h4 className="mb-3 font-bold text-gray-900 dark:text-white">{planet}</h4>
              <div className="grid grid-cols-4 gap-2">
                {ashtakvarga_points[idx].map((point: number, signIdx: number) => (
                  <div key={signIdx} className="text-center">
                    <div className="mb-1 text-xs text-gray-500">{zodiacSigns[signIdx].substring(0, 3)}</div>
                    <div
                      className={`mx-auto flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold ${
                        point >= 5
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : point >= 3
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {point}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Interpretation Guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-purple-200/60 bg-purple-50/60 p-6 backdrop-blur-sm dark:border-purple-900/60 dark:bg-purple-900/10"
      >
        <h3 className="mb-4 font-bold text-purple-900 dark:text-purple-100">
          📚 How to Interpret
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="mb-2 font-semibold text-purple-800 dark:text-purple-200">
              Sign Strength (Total Points)
            </h4>
            <ul className="space-y-1 text-sm text-purple-700 dark:text-purple-300">
              <li>• <strong>32-48:</strong> Excellent - Very favorable period</li>
              <li>• <strong>25-31:</strong> Good - Generally positive results</li>
              <li>• <strong>20-24:</strong> Average - Mixed results</li>
              <li>• <strong>Below 20:</strong> Weak - Challenges likely</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-semibold text-purple-800 dark:text-purple-200">
              Planetary Contributions
            </h4>
            <ul className="space-y-1 text-sm text-purple-700 dark:text-purple-300">
              <li>• <strong>5-8:</strong> Strong positive influence</li>
              <li>• <strong>3-4:</strong> Moderate support</li>
              <li>• <strong>0-2:</strong> Minimal or adverse effect</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}