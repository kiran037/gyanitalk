// src/components/landing/kundali/generate/YogaTab.tsx
import { motion } from 'framer-motion';
import { Award, TrendingUp, TrendingDown, AlertCircle, Star, Crown } from 'lucide-react';

interface YogaTabProps {
  data: any;
}

export function YogaTab({ data }: YogaTabProps) {
  const { yogaList } = data;

  if (!yogaList || !yogaList.yogas || yogaList.yogas.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200/60 bg-white/60 p-12 text-center backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5">
        <Award className="mx-auto mb-4 h-16 w-16 text-gray-400" />
        <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
          No Yogas Detected
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your chart doesn't show any prominent yogas at this time
        </p>
      </div>
    );
  }

  const { yogas, categorized, total, rajaYogaCount, dhanaYogaCount, daridraYogaCount } = yogaList;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-purple-200/60 bg-gradient-to-r from-purple-50/80 to-pink-50/80 p-6 backdrop-blur-sm dark:border-purple-900/60 dark:from-purple-900/20 dark:to-pink-900/20"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-full bg-purple-500 p-3 text-white">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100">
              Yoga Analysis Summary
            </h3>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              {total} total yogas detected in your chart
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-amber-100 p-4 dark:bg-amber-900/30">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-amber-900 dark:text-amber-100">Raja Yogas</span>
              <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{rajaYogaCount}</p>
            <p className="text-xs text-amber-700 dark:text-amber-300">Power & Status</p>
          </div>

          <div className="rounded-lg bg-green-100 p-4 dark:bg-green-900/30">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-green-900 dark:text-green-100">Dhana Yogas</span>
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">{dhanaYogaCount}</p>
            <p className="text-xs text-green-700 dark:text-green-300">Wealth & Prosperity</p>
          </div>

          <div className="rounded-lg bg-red-100 p-4 dark:bg-red-900/30">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-red-900 dark:text-red-100">Daridra Yogas</span>
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-900 dark:text-red-100">{daridraYogaCount}</p>
            <p className="text-xs text-red-700 dark:text-red-300">Challenges</p>
          </div>
        </div>
      </motion.div>

      {/* Beneficial Yogas */}
      {categorized?.beneficial && categorized.beneficial.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Beneficial Yogas
            </h3>
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
              {categorized.beneficial.length}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {categorized.beneficial.map((yoga: any, idx: number) => (
              <div
                key={idx}
                className="rounded-xl border border-green-200/60 bg-gradient-to-r from-green-50/80 to-emerald-50/80 p-4 backdrop-blur-sm dark:border-green-900/60 dark:from-green-900/20 dark:to-emerald-900/20"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-green-900 dark:text-green-100">
                      {yoga.yoga}
                    </h4>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded-full bg-green-200 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-800 dark:text-green-200">
                        {yoga.strength_in_percentage}% strength
                      </span>
                    </div>
                  </div>
                  <TrendingUp className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                </div>

                <p className="mb-3 text-sm leading-relaxed text-green-700 dark:text-green-300">
                  {yoga.meaning}
                </p>

                {yoga.planets_involved && yoga.planets_involved.length > 0 && (
                  <div className="rounded-lg bg-white/60 p-2 dark:bg-white/5">
                    <p className="mb-1 text-xs font-medium text-green-600 dark:text-green-400">
                      Planets Involved
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {yoga.planets_involved.map((planet: string, i: number) => (
                        <span
                          key={i}
                          className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        >
                          {planet}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Challenging Yogas */}
      {categorized?.challenging && categorized.challenging.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Challenging Yogas
            </h3>
            <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
              {categorized.challenging.length}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {categorized.challenging.map((yoga: any, idx: number) => (
              <div
                key={idx}
                className="rounded-xl border border-orange-200/60 bg-gradient-to-r from-orange-50/80 to-amber-50/80 p-4 backdrop-blur-sm dark:border-orange-900/60 dark:from-orange-900/20 dark:to-amber-900/20"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-orange-900 dark:text-orange-100">
                      {yoga.yoga}
                    </h4>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded-full bg-orange-200 px-2 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-800 dark:text-orange-200">
                        {yoga.strength_in_percentage}% strength
                      </span>
                    </div>
                  </div>
                  <TrendingDown className="h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                </div>

                <p className="mb-3 text-sm leading-relaxed text-orange-700 dark:text-orange-300">
                  {yoga.meaning}
                </p>

                {yoga.planets_involved && yoga.planets_involved.length > 0 && (
                  <div className="rounded-lg bg-white/60 p-2 dark:bg-white/5">
                    <p className="mb-1 text-xs font-medium text-orange-600 dark:text-orange-400">
                      Planets Involved
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {yoga.planets_involved.map((planet: string, i: number) => (
                        <span
                          key={i}
                          className="rounded bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                        >
                          {planet}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-blue-200/60 bg-blue-50/60 p-4 backdrop-blur-sm dark:border-blue-900/60 dark:bg-blue-900/10"
      >
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <div>
            <h4 className="mb-1 font-semibold text-blue-900 dark:text-blue-100">
              Understanding Yogas
            </h4>
            <p className="text-sm leading-relaxed text-blue-700 dark:text-blue-300">
              Yogas are planetary combinations that create specific effects in your life. 
              Raja Yogas bring power and status, Dhana Yogas bring wealth, while challenging 
              yogas indicate areas requiring attention and remedies. The strength percentage 
              shows how powerfully each yoga manifests in your chart.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}