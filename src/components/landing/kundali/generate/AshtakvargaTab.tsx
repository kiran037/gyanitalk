// src/components/landing/kundali/generate/AshtakvargaTab.tsx
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Zap, AlertCircle, BarChart3, ChevronRight, Info } from 'lucide-react';

interface AshtakvargaTabProps {
  data: any;
}

export default function AshtakvargaTab({ data }: AshtakvargaTabProps) {
  const { ashtakvarga } = data;

  if (!ashtakvarga) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-gray-200/60 bg-white/60 p-8 text-center backdrop-blur-sm dark:border-gray-700/60 dark:bg-gray-900/50">
        <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
          <Zap className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
          Ashtakvarga Data Unavailable
        </h3>
        <p className="max-w-xs text-sm text-gray-500 dark:text-gray-400">
          We couldn't generate the points for this chart. Please check the birth time accuracy.
        </p>
      </div>
    );
  }

  const { ashtakvarga_order, ashtakvarga_points, ashtakvarga_total } = ashtakvarga;
  const zodiacSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  // Helper for UI styling logic
  const getScoreStyles = (points: number) => {
    if (points >= 30) return {
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-900/50',
      bar: 'bg-emerald-500',
      icon: <TrendingUp className="h-3 w-3" />,
      label: 'Excellent'
    };
    if (points >= 25) return {
      text: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-900/50',
      bar: 'bg-blue-500',
      icon: <TrendingUp className="h-3 w-3" />,
      label: 'Good'
    };
    if (points >= 20) return {
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-900/50',
      bar: 'bg-amber-500',
      icon: <Minus className="h-3 w-3" />,
      label: 'Average'
    };
    return {
      text: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-900/20',
      border: 'border-rose-200 dark:border-rose-900/50',
      bar: 'bg-rose-500',
      icon: <TrendingDown className="h-3 w-3" />,
      label: 'Weak'
    };
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Intro Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:border-blue-900/30 dark:from-blue-900/20 dark:to-indigo-900/20 sm:p-6"
      >
        <div className="relative z-10 flex gap-4">
          <div className="hidden rounded-full bg-white p-2.5 shadow-sm dark:bg-blue-900/50 sm:block">
            <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="mb-1 text-base font-bold text-blue-900 dark:text-blue-100 sm:text-lg">
              Understanding Ashtakvarga
            </h3>
            <p className="text-sm leading-relaxed text-blue-800/80 dark:text-blue-200/80 sm:text-base">
              This system quantifies the strength of planets and signs. A score above <span className="font-bold">28</span> is generally considered favorable, indicating a sign can support positive outcomes.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Summary Section */}
      <section>
        <div className="mb-4 flex items-center justify-between px-1">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <BarChart3 className="h-5 w-5 text-[#FF6B35]" />
            Sign Strength Summary
          </h3>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
        >
          {ashtakvarga_total.map((total: number, idx: number) => {
            const style = getScoreStyles(total);
            return (
              <div
                key={idx}
                className={`relative overflow-hidden rounded-xl border p-3 transition-all hover:shadow-md sm:p-4 ${style.bg} ${style.border}`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    {zodiacSigns[idx].substring(0, 3)}
                  </span>
                  <div className={`rounded-full p-1 ${style.text} bg-white/50 dark:bg-black/20`}>
                    {style.icon}
                  </div>
                </div>
                
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-bold ${style.text}`}>{total}</span>
                  <span className="text-[10px] font-medium text-gray-500">/ 48</span>
                </div>
                
                <div className={`mt-1 text-xs font-medium ${style.text}`}>
                  {style.label}
                </div>

                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(total / 48) * 100}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className={`h-full ${style.bar}`}
                  />
                </div>
              </div>
            );
          })}
        </motion.div>
      </section>

      {/* Detailed Matrix Table */}
      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-gray-800">
          <div>
            <h3 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white sm:text-lg">
              <Zap className="h-5 w-5 text-[#FF6B35]" />
              Detailed Points Matrix
            </h3>
            <p className="text-xs text-gray-500">Planetary contribution per sign</p>
          </div>
          {/* Mobile Swipe Hint */}
          <div className="flex items-center gap-1 text-xs text-gray-400 lg:hidden">
            <span>Swipe</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>

        <div className="relative w-full overflow-hidden">
          {/* Scrollable Container */}
          <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            <table className="w-full min-w-max border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  {/* Sticky First Column Header */}
                  <th className="sticky left-0 z-20 min-w-[100px] border-b border-r border-gray-200 bg-gray-50 px-4 py-3 text-left font-semibold text-gray-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                    Planet
                  </th>
                  {zodiacSigns.map((sign) => (
                    <th key={sign} className="min-w-[60px] border-b border-gray-200 px-2 py-3 text-center font-semibold text-gray-600 dark:border-gray-700 dark:text-gray-300">
                      {sign.substring(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {ashtakvarga_order.map((planet: string, idx: number) => (
                  <tr key={planet} className="group hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    {/* Sticky First Column Body */}
                    <td className="sticky left-0 z-10 border-r border-gray-100 bg-white px-4 py-3 font-medium text-gray-900 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors group-hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:group-hover:bg-gray-800/30">
                      {planet}
                    </td>
                    {ashtakvarga_points[idx].map((point: number, signIdx: number) => (
                      <td key={signIdx} className="px-2 py-3 text-center">
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold shadow-sm transition-transform hover:scale-110 ${
                            point >= 5
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : point >= 4
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              : point >= 1
                              ? 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                              : 'bg-red-50 text-red-400 dark:bg-red-900/20 dark:text-red-400'
                          }`}
                        >
                          {point}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="bg-gradient-to-r from-orange-50/50 to-amber-50/50 font-bold dark:from-orange-900/10 dark:to-amber-900/10">
                  <td className="sticky left-0 z-10 border-r border-orange-100 bg-orange-50/90 px-4 py-4 text-[#FF6B35] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] backdrop-blur-sm dark:border-orange-900/30 dark:bg-gray-900/90">
                    Total
                  </td>
                  {ashtakvarga_total.map((total: number, idx: number) => {
                     const style = getScoreStyles(total);
                     return (
                      <td key={idx} className="px-2 py-4 text-center">
                        <span className={`text-base ${style.text}`}>
                          {total}
                        </span>
                      </td>
                     );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Legend / Guide */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          <h4 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">Interpretation Guide</h4>
          <div className="space-y-3">
            {[
              { label: 'Excellent (30+)', color: 'bg-emerald-500', desc: 'Very favorable results expected' },
              { label: 'Good (25-29)', color: 'bg-blue-500', desc: 'Positive and supportive period' },
              { label: 'Average (20-24)', color: 'bg-amber-500', desc: 'Mixed results with some effort' },
              { label: 'Weak (<20)', color: 'bg-rose-500', desc: 'Caution and remedies advised' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${item.color}`} />
                <div>
                  <div className="text-xs font-bold text-gray-700 dark:text-gray-300">{item.label}</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-800/50">
          <h4 className="mb-2 text-sm font-bold text-gray-900 dark:text-white">Quick Tip</h4>
          <p className="text-xs leading-5 text-gray-600 dark:text-gray-400">
            When a planet transits through a sign where it has high points (5+ in the matrix) or the sign has a high total (28+), that period is excellent for starting new ventures related to that planet's significations.
          </p>
        </div>
      </motion.div>
    </div>
  );
}