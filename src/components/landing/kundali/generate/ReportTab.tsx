// src/components/landing/kundali/generate/ReportTab.tsx
import { motion } from 'framer-motion';
import { 
  BookOpen, Star, TrendingUp, Home, Shield, 
  Info, Crown, LayoutGrid 
} from 'lucide-react';

interface ReportTabProps {
  data: any;
}

export function ReportTab({ data }: ReportTabProps) {
  const { personalCharacteristics } = data;

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Educational Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10 sm:p-5"
      >
        <div className="flex gap-3">
          <Info className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100">
              Understanding House Analysis
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-blue-800/80 dark:text-blue-200/80">
              Your Kundali is divided into 12 Houses (Bhavas), each representing a specific area of life such as personality, wealth, family, and career. This report analyzes the influence of planets on each sector.
            </p>
          </div>
        </div>
      </motion.div>

      {/* House Grid */}
      {personalCharacteristics && personalCharacteristics.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <LayoutGrid className="h-5 w-5 text-[#FF6B35]" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              12 Houses Analysis
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:gap-6">
            {personalCharacteristics.map((house: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                {/* Card Header */}
                <div className="border-b border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-[#FF6B35] dark:bg-orange-900/20">
                        <span className="text-lg font-bold">{house.current_house || idx + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">
                          House {house.current_house || idx + 1}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                          <Crown className="h-3 w-3 text-amber-500" />
                          <span>Lord: {house.lord_of_zodiac}</span>
                        </div>
                      </div>
                    </div>
                    
                    <span className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {house.current_zodiac}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {house.personalised_prediction}
                  </p>
                  
                  {/* Decorative Footer Element */}
                  <div className="mt-4 flex items-center gap-2 pt-4 opacity-50">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />
                    <Shield className="h-3 w-3 text-gray-400" />
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/30">
          <div className="mb-4 rounded-full bg-white p-4 shadow-sm dark:bg-gray-800">
            <BookOpen className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
            Report Data Unavailable
          </h3>
          <p className="max-w-xs text-sm text-gray-500 dark:text-gray-400">
            Detailed house-by-house analysis could not be generated for this chart.
          </p>
        </div>
      )}
    </div>
  );
}