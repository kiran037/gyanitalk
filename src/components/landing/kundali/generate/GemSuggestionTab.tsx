// src/components/landing/kundali/generate/GemSuggestionTab.tsx
import { motion } from 'framer-motion';
import { Gem, Sparkles, AlertTriangle, Calendar } from 'lucide-react';

interface GemSuggestionTabProps {
  data: any;
}

export function GemSuggestionTab({ data }: GemSuggestionTabProps) {
  const { suggestions, ascendantReport } = data;
  
  const gemData = suggestions?.gem;
  const luckyGem = ascendantReport?.lucky_gem;

  return (
    <div className="space-y-6">
      {/* Primary Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-purple-200/60 bg-gradient-to-br from-purple-50/80 to-pink-50/80 p-6 backdrop-blur-sm dark:border-purple-900/60 dark:from-purple-900/20 dark:to-pink-900/20"
      >
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-purple-900 dark:text-purple-100">
          <Gem className="h-5 w-5" />
          Primary Gemstone Recommendation
        </h3>
        <div className="rounded-lg bg-white/60 p-6 text-center dark:bg-white/5">
          <Gem className="mx-auto mb-4 h-16 w-16 text-purple-600 dark:text-purple-400" />
          <h4 className="mb-2 text-3xl font-bold text-purple-900 dark:text-purple-100">
            {gemData?.name || luckyGem || 'Not Available'}
          </h4>
          {gemData?.otherName && (
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Also known as {gemData.otherName}
            </p>
          )}
          {ascendantReport?.day_for_fasting && (
            <p className="mt-3 flex items-center justify-center gap-2 text-sm text-purple-700 dark:text-purple-300">
              <Calendar className="h-4 w-4" />
              Best worn on: <span className="font-semibold">{ascendantReport.day_for_fasting}</span>
            </p>
          )}
        </div>
      </motion.div>

      {/* Gem Details */}
      {gemData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-gray-200/60 bg-white/60 p-6 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
        >
          <h3 className="mb-4 font-bold text-gray-900 dark:text-white">
            About {gemData.name}
          </h3>
          
          {gemData.description && (
            <p className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {gemData.description}
            </p>
          )}

          {/* Benefits */}
          {gemData.goodResults && gemData.goodResults.length > 0 && (
            <div className="mb-4 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <h4 className="mb-2 flex items-center gap-2 font-semibold text-green-900 dark:text-green-100">
                <Sparkles className="h-4 w-4" />
                Benefits
              </h4>
              <div className="flex flex-wrap gap-2">
                {gemData.goodResults.map((benefit: string, idx: number) => (
                  <span
                    key={idx}
                    className="rounded-full bg-green-200 px-3 py-1 text-sm font-medium text-green-900 dark:bg-green-800 dark:text-green-100"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Specifications */}
          <div className="grid gap-3 sm:grid-cols-2">
            {gemData.finger && (
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                <p className="mb-1 text-xs font-medium text-gray-500">Finger</p>
                <p className="font-semibold text-gray-900 dark:text-white">{gemData.finger}</p>
              </div>
            )}
            {gemData.weight && (
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                <p className="mb-1 text-xs font-medium text-gray-500">Weight</p>
                <p className="font-semibold text-gray-900 dark:text-white">{gemData.weight}</p>
              </div>
            )}
            {gemData.metal && (
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                <p className="mb-1 text-xs font-medium text-gray-500">Metal</p>
                <p className="font-semibold text-gray-900 dark:text-white">{gemData.metal}</p>
              </div>
            )}
            {gemData.day && (
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                <p className="mb-1 text-xs font-medium text-gray-500">Day</p>
                <p className="font-semibold text-gray-900 dark:text-white">{gemData.day}</p>
              </div>
            )}
          </div>

          {/* Substitutes */}
          {gemData.substitute && gemData.substitute.length > 0 && (
            <div className="mt-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <h4 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
                Alternative Stones
              </h4>
              <div className="flex flex-wrap gap-2">
                {gemData.substitute.map((stone: string, idx: number) => (
                  <span
                    key={idx}
                    className="rounded-full bg-blue-200 px-3 py-1 text-sm font-medium text-blue-900 dark:bg-blue-800 dark:text-blue-100"
                  >
                    {stone}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Wearing Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-blue-200/60 bg-blue-50/60 p-6 backdrop-blur-sm dark:border-blue-900/60 dark:bg-blue-900/10"
      >
        <h3 className="mb-4 flex items-center gap-2 font-bold text-blue-900 dark:text-blue-100">
          <Sparkles className="h-5 w-5" />
          How to Wear Gemstones
        </h3>
        <div className="space-y-3 text-sm text-blue-700 dark:text-blue-300">
          <div className="flex gap-3">
            <span className="font-bold">1.</span>
            <p>Consult an experienced astrologer before wearing any gemstone</p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold">2.</span>
            <p>Ensure the gemstone is natural and of good quality</p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold">3.</span>
            <p>Wear on the recommended finger (usually ring or little finger)</p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold">4.</span>
            <p>Energize with proper mantras on an auspicious day</p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold">5.</span>
            <p>Touch the gemstone to your forehead before wearing for the first time</p>
          </div>
        </div>

        {gemData?.mantra && (
          <div className="mt-4 rounded-lg bg-white/60 p-4 dark:bg-white/5">
            <p className="mb-1 text-xs font-medium text-blue-600 dark:text-blue-400">Mantra</p>
            <p className="text-center font-medium text-blue-900 dark:text-blue-100">
              {gemData.mantra}
            </p>
          </div>
        )}
      </motion.div>

      {/* Precautions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-orange-200/60 bg-orange-50/60 p-4 dark:border-orange-900/60 dark:bg-orange-900/10"
      >
        <div className="flex gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
          <div>
            <h4 className="mb-1 font-semibold text-orange-900 dark:text-orange-100">
              Important Note
            </h4>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Wearing the wrong gemstone can have adverse effects. 
              Always consult a qualified astrologer and ensure proper energization rituals before wearing.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}