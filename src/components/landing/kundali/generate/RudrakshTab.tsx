// src/components/landing/kundali/generate/RudrakshTab.tsx
import { motion } from 'framer-motion';
import { Circle, Sparkles, AlertCircle } from 'lucide-react';

interface RudrakshTabProps {
  data: any;
}

export function RudrakshTab({ data }: RudrakshTabProps) {
  const { suggestions } = data;

  const rudrakshData = suggestions?.rudraksh;

  if (!rudrakshData) {
    return (
      <div className="rounded-xl border border-gray-200/60 bg-white/60 p-12 text-center backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5">
        <Circle className="mx-auto mb-4 h-16 w-16 text-gray-400" />
        <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
          Rudraksh Data Not Available
        </h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-amber-200/60 bg-gradient-to-r from-amber-50/80 to-orange-50/80 p-6 backdrop-blur-sm dark:border-amber-900/60 dark:from-amber-900/20 dark:to-orange-900/20"
      >
        <div className="flex items-center gap-3">
          <Circle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
          <div>
            <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100">
              Rudraksh Recommendations
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Sacred beads for spiritual growth and protection
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-gray-200/60 bg-white/60 p-6 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFB347] p-3">
            <Circle className="h-8 w-8 text-white" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">
              {rudrakshData.name}
            </h4>
            {rudrakshData.mukhiForDisease && rudrakshData.mukhiForDisease.length > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {rudrakshData.mukhiForDisease.join(', ')} Mukhi
              </p>
            )}
          </div>
        </div>

        {rudrakshData.description && (
          <p className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {rudrakshData.description}
          </p>
        )}

        {rudrakshData.response && (
          <div className="rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 p-4 dark:from-amber-900/20 dark:to-orange-900/20">
            <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-100">
              {rudrakshData.response}
            </p>
          </div>
        )}

        {/* Additional Recommendations */}
        {rudrakshData.mukhiForMoney && rudrakshData.mukhiForMoney.length > 0 && (
          <div className="mt-4 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <h5 className="mb-2 flex items-center gap-2 font-semibold text-green-900 dark:text-green-100">
              <Sparkles className="h-4 w-4" />
              For Wealth & Prosperity
            </h5>
            <div className="flex flex-wrap gap-2">
              {rudrakshData.mukhiForMoney.map((mukhi: number, idx: number) => (
                <span
                  key={idx}
                  className="flex items-center gap-1 rounded-full bg-green-200 px-3 py-1 text-sm font-medium text-green-900 dark:bg-green-800 dark:text-green-100"
                >
                  <Circle className="h-3 w-3" />
                  {mukhi} Mukhi
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Wearing Guidelines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-blue-200/60 bg-blue-50/60 p-6 backdrop-blur-sm dark:border-blue-900/60 dark:bg-blue-900/10"
      >
        <h3 className="mb-4 flex items-center gap-2 font-bold text-blue-900 dark:text-blue-100">
          <Circle className="h-5 w-5" />
          How to Wear Rudraksh
        </h3>
        <div className="space-y-3 text-sm text-blue-700 dark:text-blue-300">
          <div className="flex gap-3">
            <span className="font-bold">1.</span>
            <p>Purify the rudraksh by soaking in water mixed with cow's milk overnight</p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold">2.</span>
            <p>Energize on Monday morning by chanting "Om Namah Shivaya" 108 times</p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold">3.</span>
            <p>Wear touching the skin, preferably as a mala (necklace) or bracelet</p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold">4.</span>
            <p>Remove during sleep and intimate moments</p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold">5.</span>
            <p>Clean regularly with water and apply sandalwood paste occasionally</p>
          </div>
        </div>
      </motion.div>

      {/* Spiritual Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-purple-200/60 bg-purple-50/60 p-4 dark:border-purple-900/60 dark:bg-purple-900/10"
      >
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-purple-600 dark:text-purple-400" />
          <div>
            <h4 className="mb-1 font-semibold text-purple-900 dark:text-purple-100">
              Spiritual Significance
            </h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Rudraksh beads are sacred seeds from the Rudraksha tree, 
              believed to be tears of Lord Shiva. They provide protection, peace, and spiritual advancement when worn with faith.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}