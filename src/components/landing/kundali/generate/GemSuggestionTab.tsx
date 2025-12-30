// src/components/landing/kundali/generate/GemSuggestionTab.tsx
import { motion } from 'framer-motion';
import { 
  Gem, Sparkles, AlertTriangle, Calendar, 
  Hand, Scale, Hammer, Sun, Infinity
} from 'lucide-react';

interface GemSuggestionTabProps {
  data: any;
}

export function GemSuggestionTab({ data }: GemSuggestionTabProps) {
  const { suggestions, ascendantReport } = data;
  
  const gemData = suggestions?.gem;
  const luckyGem = ascendantReport?.lucky_gem;

  // Helper for icon mapping
  const getGemSpecIcon = (key: string) => {
    switch(key) {
      case 'finger': return <Hand className="h-4 w-4" />;
      case 'weight': return <Scale className="h-4 w-4" />;
      case 'metal': return <Hammer className="h-4 w-4" />;
      case 'day': return <Calendar className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Primary Recommendation - Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-100 via-white to-pink-50 p-6 text-center shadow-sm dark:border-purple-900/50 dark:from-purple-900/20 dark:via-gray-900 dark:to-pink-900/10 sm:p-10"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        
        <div className="relative z-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/60 px-4 py-1.5 text-sm font-semibold text-purple-700 shadow-sm backdrop-blur-sm dark:border-purple-800 dark:bg-black/20 dark:text-purple-300">
            <Sparkles className="h-4 w-4" />
            Primary Recommendation
          </div>

          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-full bg-purple-400 blur-xl opacity-20 dark:bg-purple-600" />
              <Gem className="relative h-20 w-20 text-purple-600 drop-shadow-lg dark:text-purple-400 sm:h-24 sm:w-24" />
            </div>
          </div>

          <h3 className="mb-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {gemData?.name || luckyGem || 'Gemstone Unavailable'}
          </h3>
          
          {gemData?.otherName && (
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              (Also known as {gemData.otherName})
            </p>
          )}

          {/* Mantra Display */}
          {gemData?.mantra && (
            <div className="mx-auto mt-6 max-w-lg rounded-xl border border-purple-100 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:border-purple-900/30 dark:bg-gray-800/50">
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-purple-500">Energizing Mantra</p>
              <p className="font-serif text-lg font-medium italic text-gray-800 dark:text-gray-200">
                "{gemData.mantra}"
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Detailed Specs Grid */}
      {gemData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8"
        >
          <div className="mb-6 border-b border-gray-100 pb-4 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Wearing Instructions</h3>
            <p className="text-sm text-gray-500">Detailed specifications for maximum benefit</p>
          </div>

          {/* Key Specs */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Wear Finger', value: gemData.finger, key: 'finger' },
              { label: 'Min Weight', value: gemData.weight, key: 'weight' },
              { label: 'Metal', value: gemData.metal, key: 'metal' },
              { label: 'Wear Day', value: gemData.day, key: 'day' }
            ].map((spec) => (
              <div key={spec.key} className="flex flex-col items-center justify-center rounded-xl bg-gray-50 p-4 text-center transition-colors hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800">
                <div className="mb-2 text-gray-400 dark:text-gray-500">
                  {getGemSpecIcon(spec.key)}
                </div>
                <p className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">{spec.label}</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white sm:text-base">
                  {spec.value || 'N/A'}
                </p>
              </div>
            ))}
          </div>

          {/* Benefits & Substitutes */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Benefits */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                <Sun className="h-4 w-4 text-amber-500" />
                Benefits & Effects
              </h4>
              {gemData.description && (
                <p className="mb-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {gemData.description}
                </p>
              )}
              {gemData.goodResults && (
                <div className="flex flex-wrap gap-2">
                  {gemData.goodResults.map((benefit: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/20 dark:text-green-300 dark:ring-green-900/50"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Substitutes */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                <Infinity className="h-4 w-4 text-blue-500" />
                Substitutes & Alternatives
              </h4>
              <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
                <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                  If {gemData.name} is unavailable or out of budget, consider these alternatives:
                </p>
                {gemData.substitute && (
                  <div className="flex flex-wrap gap-2">
                    {gemData.substitute.map((stone: string, idx: number) => (
                      <span
                        key={idx}
                        className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100 dark:bg-blue-900/40 dark:text-blue-200 dark:ring-blue-800"
                      >
                        {stone}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Rituals & Precautions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4 sm:grid-cols-3"
      >
        <div className="col-span-1 rounded-2xl bg-blue-600 p-6 text-white shadow-lg sm:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 font-bold">
            <Sparkles className="h-5 w-5" />
            Ritual Process
          </h3>
          <div className="space-y-4">
            {[
              "Ensure the gemstone is natural and untreated.",
              "Wash with raw milk and holy water (Gangajal).",
              "Recite the mantra 108 times before wearing.",
              `Wear on ${gemData?.day || 'the suggested day'} morning during Shukla Paksha.`
            ].map((step, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold">
                  {i + 1}
                </span>
                <span className="text-blue-50">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-1 rounded-2xl border border-orange-200 bg-orange-50 p-6 dark:border-orange-900/50 dark:bg-orange-900/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 flex-shrink-0 text-orange-600 dark:text-orange-500" />
            <div>
              <h4 className="mb-2 font-bold text-orange-900 dark:text-orange-200">
                Precaution
              </h4>
              <p className="text-sm leading-relaxed text-orange-800 dark:text-orange-300">
                Gemstones affect energy fields powerfully. Never wear a damaged stone. Always consult an expert to confirm if this gem suits your current Dasha period.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}