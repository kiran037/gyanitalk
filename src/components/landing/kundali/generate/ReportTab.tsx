// src/components/landing/kundali/generate/ReportTab.tsx
import { motion } from 'framer-motion';
import { BookOpen, Star, TrendingUp, Home, Shield } from 'lucide-react';

interface ReportTabProps {
  data: any;
}

export function ReportTab({ data }: ReportTabProps) {
  const { personalCharacteristics, yogaList } = data;

  return (
    <div className="space-y-6">
      {/* Personal Characteristics */}
      {personalCharacteristics && personalCharacteristics.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Home className="h-6 w-6 text-[#FF6B35]" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              House-wise Analysis
            </h3>
          </div>
          {personalCharacteristics.map((house: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-xl border border-gray-200/60 bg-white/60 p-6 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h4 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
                    <Shield className="h-5 w-5 text-[#FF6B35]" />
                    House {house.current_house || idx + 1}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {house.current_zodiac} • Lord: {house.lord_of_zodiac}
                  </p>
                </div>
                <div className="rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFB347] px-3 py-1 text-xs font-bold text-white">
                  {house.current_zodiac}
                </div>
              </div>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {house.personalised_prediction}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {(!personalCharacteristics || personalCharacteristics.length === 0) && (
        <div className="rounded-xl border border-gray-200/60 bg-white/60 p-12 text-center backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5">
          <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
            Report Data Not Available
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Detailed house analysis coming soon
          </p>
        </div>
      )}
    </div>
  );
}