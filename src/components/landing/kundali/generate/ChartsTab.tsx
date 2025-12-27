// src/components/landing/kundali/generate/ChartsTab.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, X } from 'lucide-react';

interface ChartsTabProps {
  data: any;
}

const CHART_TYPES = [
  { id: 'd1', name: 'Rasi Chart (D1)', description: 'Main Birth Chart', emoji: '📊' },
  { id: 'd9', name: 'Navamsa (D9)', description: 'Marriage & Fortune', emoji: '💑', premium: false },
  { id: 'd10', name: 'Dasamsa (D10)', description: 'Career & Profession', emoji: '💼', premium: true },
  { id: 'd12', name: 'Dwadasamsa (D12)', description: 'Parents & Ancestry', emoji: '👨‍👩‍👧', premium: true },
  { id: 'd20', name: 'Vimsamsa (D20)', description: 'Spiritual Progress', emoji: '🕉️', premium: true },
  { id: 'd24', name: 'Siddhamsa (D24)', description: 'Education & Learning', emoji: '📚', premium: true },
  { id: 'd30', name: 'Trimsamsa (D30)', description: 'Misfortune & Troubles', emoji: '⚠️', premium: true },
];

export default function ChartsTab({ data }: ChartsTabProps) {
  const [selectedChart, setSelectedChart] = useState('d1');
  const [fullscreen, setFullscreen] = useState(false);
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');

  const { charts, divisionalCharts, basicDetails } = data;

  const currentChart = charts?.[selectedChart];
  const isPremiumChart = CHART_TYPES.find(c => c.id === selectedChart)?.premium;

  return (
    <div className="space-y-6">
      {/* Chart Selector */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Select Chart Type
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setChartStyle('north')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                chartStyle === 'north'
                  ? 'bg-[#FF6B35] text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              North Indian
            </button>
            <button
              onClick={() => setChartStyle('south')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                chartStyle === 'south'
                  ? 'bg-[#FF6B35] text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              South Indian
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CHART_TYPES.map((chart) => (
            <motion.button
              key={chart.id}
              onClick={() => !chart.premium && setSelectedChart(chart.id)}
              disabled={chart.premium}
              className={`rounded-xl border p-4 text-left transition-all ${
                selectedChart === chart.id
                  ? 'border-[#FF6B35] bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10'
                  : chart.premium
                  ? 'border-gray-200/60 bg-gray-50/50 opacity-60 cursor-not-allowed dark:border-gray-700/60 dark:bg-gray-800/30'
                  : 'border-gray-200/60 bg-white/60 hover:border-[#FF6B35]/30 dark:border-gray-700/60 dark:bg-white/5'
              }`}
              whileHover={!chart.premium ? { scale: 1.02 } : {}}
              whileTap={!chart.premium ? { scale: 0.98 } : {}}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-2xl">{chart.emoji}</span>
                {chart.premium && (
                  <span className="rounded-full bg-[#FF6B35]/20 px-2 py-0.5 text-[10px] font-bold text-[#FF6B35]">
                    PREMIUM
                  </span>
                )}
              </div>
              <div className="font-bold text-gray-900 dark:text-white">{chart.name}</div>
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">{chart.description}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chart Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-gray-200/60 bg-white/60 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
      >
        {/* Header */}
        <div className="border-b border-gray-200/60 p-4 dark:border-gray-700/60">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {CHART_TYPES.find(c => c.id === selectedChart)?.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {basicDetails.name} • {new Date(basicDetails.birthDate).toLocaleDateString('en-GB')}
              </p>
            </div>
            <button
              onClick={() => setFullscreen(true)}
              className="rounded-lg border border-gray-200/60 bg-white/60 p-2 transition-colors hover:bg-gray-50 dark:border-gray-700/60 dark:bg-white/5"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Chart Image */}
        <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 p-6 dark:from-gray-800 dark:to-gray-900">
          {isPremiumChart ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mb-4 text-6xl">🔒</div>
                <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                  Premium Chart
                </h4>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  Upgrade to access detailed divisional charts
                </p>
                <button className="rounded-lg bg-gradient-to-r from-[#FF6B35] to-[#FFB347] px-6 py-2 font-semibold text-white">
                  Upgrade Now
                </button>
              </div>
            </div>
          ) : currentChart ? (
            <div 
              className="flex h-full items-center justify-center"
              dangerouslySetInnerHTML={{ __html: currentChart }}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mb-2 text-5xl">📊</div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Chart not available
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="border-t border-gray-200/60 bg-blue-50/60 p-3 dark:border-gray-700/60 dark:bg-blue-900/10">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            💡 <strong>Chart Style:</strong> Currently showing {chartStyle === 'north' ? 'North Indian' : 'South Indian'} style. 
            {!isPremiumChart && ' Each house (1-12) shows planetary placements and their influences on different life areas.'}
          </p>
        </div>
      </motion.div>

      {/* Planetary Positions in Current Chart */}
      {divisionalCharts && !isPremiumChart && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-gray-200/60 bg-white/60 p-6 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
        >
          <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
            Planetary Positions
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.values(divisionalCharts).map((planet: any, idx) => (
              planet.name && (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-lg border border-gray-200/60 bg-white/40 p-3 dark:border-gray-700/60 dark:bg-white/5"
                >
                  <div className="text-2xl">{getPlanetEmoji(planet.full_name)}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {planet.full_name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {planet.zodiac} • House {planet.house}
                      {planet.retro && <span className="ml-1 text-orange-600">(R)</span>}
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </motion.div>
      )}

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
              className="absolute -right-4 -top-4 z-10 rounded-full bg-white p-3 text-gray-900 shadow-2xl"
            >
              <X className="h-5 w-5" />
            </button>
            <div 
              className="rounded-xl bg-white p-4 shadow-2xl"
              dangerouslySetInnerHTML={{ __html: currentChart || '' }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}

function getPlanetEmoji(name: string) {
  const map: Record<string, string> = {
    'Sun': '☀️',
    'Moon': '🌙',
    'Mars': '♂️',
    'Mercury': '☿️',
    'Jupiter': '♃',
    'Venus': '♀️',
    'Saturn': '♄',
    'Rahu': '🐉',
    'Ketu': '🌟',
    'Ascendant': '⬆️'
  };
  return map[name] || '⭐';
}