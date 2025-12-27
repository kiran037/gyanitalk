

// components/landing/kundali/ChartDisplay.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, Loader2, X } from 'lucide-react';

interface ChartDisplayProps {
  chartUrl?: string;
  chartType?: string;
  birthDetails?: {
    name: string;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
  };
}

export default function ChartDisplay({ 
  chartUrl, 
  chartType = 'D1 (Rasi Chart)',
  birthDetails 
}: ChartDisplayProps) {
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [selectedChart, setSelectedChart] = useState<'D1' | 'D9' | 'D10'>('D1');

  const chartTypes = [
    { key: 'D1', name: 'Rasi Chart', description: 'Birth Chart', emoji: '📊' },
    { key: 'D9', name: 'Navamsa', description: 'Marriage & Luck', emoji: '💑' },
    { key: 'D10', name: 'Dasamsa', description: 'Career', emoji: '💼' },
  ];

  return (
    <div className="space-y-4">
      {/* Chart Type Selector */}
      <div className="flex flex-wrap gap-2">
        {chartTypes.map((type) => (
          <motion.button
            key={type.key}
            onClick={() => setSelectedChart(type.key as any)}
            disabled={type.key !== 'D1'} // Only D1 available in free tier
            className={`rounded-xl px-4 py-3 text-left font-medium transition-all ${
              selectedChart === type.key
                ? 'border-2 border-[#FF6B35] bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 text-gray-900 dark:text-white'
                : type.key === 'D1'
                ? 'border border-gray-200/60 bg-white/60 text-gray-700 hover:border-[#FF6B35]/30 dark:border-gray-700/60 dark:bg-white/5 dark:text-gray-300'
                : 'border border-gray-200/60 bg-gray-100/60 text-gray-400 cursor-not-allowed dark:border-gray-700/60 dark:bg-gray-800/20'
            }`}
            whileHover={type.key === 'D1' ? { scale: 1.02 } : {}}
            whileTap={type.key === 'D1' ? { scale: 0.98 } : {}}
          >
            <div className="flex items-start gap-2">
              <span className="text-xl">{type.emoji}</span>
              <div>
                <div className="text-sm font-bold">{type.name}</div>
                <div className="text-xs opacity-70">{type.description}</div>
                {type.key !== 'D1' && (
                  <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#FF6B35]/20 px-2 py-0.5 text-[10px] font-semibold text-[#FF6B35]">
                    🔒 Premium
                  </div>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Chart Display */}
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white/60 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Header */}
        <div className="border-b border-gray-200/60 p-4 dark:border-gray-700/60">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {chartTypes.find(t => t.key === selectedChart)?.name}
              </h3>
              {birthDetails && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {birthDetails.name} • {new Date(birthDetails.birthDate).toLocaleDateString('en-GB')}
                </p>
              )}
            </div>
            <motion.button
              onClick={() => setFullscreen(true)}
              className="rounded-lg border border-gray-200/60 bg-white/60 p-2 transition-colors hover:bg-gray-50 dark:border-gray-700/60 dark:bg-white/5 dark:hover:bg-gray-800/50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="View Fullscreen"
            >
              <Maximize2 className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            </motion.button>
          </div>
        </div>

        {/* Chart Image */}
        <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 p-6 dark:from-gray-800 dark:to-gray-900">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#FF6B35]" />
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading chart...</p>
              </div>
            </div>
          )}
          {chartUrl ? (
            <div className="flex h-full items-center justify-center">
              <img
                src={chartUrl}
                alt={`${chartType} Chart`}
                className="max-h-full max-w-full object-contain"
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mb-2 text-5xl">📊</div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Chart not available
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Unable to generate chart visualization
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="border-t border-gray-200/60 bg-blue-50/60 p-3 dark:border-gray-700/60 dark:bg-blue-900/10">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            💡 <strong>Reading the Chart:</strong> Each house (1-12) represents different life areas. 
            Planets and signs in each house show how those areas manifest in your life.
          </p>
        </div>
      </motion.div>

      {/* Fullscreen Modal */}
      {fullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setFullscreen(false)}
        >
          <div className="relative max-h-[95vh] max-w-[95vw]">
            <button
              onClick={() => setFullscreen(false)}
              className="absolute -right-4 -top-4 z-10 rounded-full bg-white p-3 text-gray-900 shadow-2xl transition-transform hover:scale-110 dark:bg-gray-800 dark:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="rounded-xl bg-white p-4 shadow-2xl dark:bg-gray-900">
              {birthDetails && (
                <div className="mb-3 text-center">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {birthDetails.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(birthDetails.birthDate).toLocaleDateString('en-GB')} • {birthDetails.birthTime}
                  </p>
                </div>
              )}
              <img
                src={chartUrl}
                alt="Kundli Chart"
                className="max-h-[80vh] max-w-full rounded-lg"
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}