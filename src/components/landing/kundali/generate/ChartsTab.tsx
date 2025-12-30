// src/components/landing/kundali/generate/ChartsTab.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X, Loader2, AlertCircle, Activity, Compass } from 'lucide-react';

interface ChartsTabProps {
  data: any;
  birthDetails: any;
}

const CHART_TYPES = [
  { id: 'D1', name: 'Rasi Chart (D1)', description: 'Main Birth Chart', icon: Activity },
  { id: 'D9', name: 'Navamsa (D9)', description: 'Marriage & Fortune', icon: Compass },
  { id: 'D10', name: 'Dasamsa (D10)', description: 'Career & Profession', icon: Activity },
  { id: 'D2', name: 'Hora (D2)', description: 'Wealth & Prosperity', icon: Compass },
  { id: 'D3', name: 'Drekkana (D3)', description: 'Siblings & Courage', icon: Activity },
  { id: 'D7', name: 'Saptamsa (D7)', description: 'Children & Progeny', icon: Compass },
  { id: 'D12', name: 'Dwadasamsa (D12)', description: 'Parents', icon: Activity },
];

export default function ChartsTab({ data, birthDetails }: ChartsTabProps) {
  const [selectedChart, setSelectedChart] = useState('D1');
  const [fullscreen, setFullscreen] = useState(false);
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');
  const [loadingChart, setLoadingChart] = useState(false);
  const [dynamicChart, setDynamicChart] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { charts, divisionalCharts, basicDetails } = data;

  const loadChartDynamically = async (chartDiv: string) => {
    setError(null);
    
    // First check if chart already exists in data
    const possibleKeys = [
      chartDiv.toLowerCase(),
      chartDiv.toUpperCase(),
      chartDiv,
      `chart_${chartDiv.toLowerCase()}`,
    ];

    let initialChart = null;
    for (const key of possibleKeys) {
      if (charts?.[key]) {
        initialChart = charts[key];
        break;
      }
    }

    if (initialChart) {
      console.log(`✓ Found ${chartDiv} in existing data`);
      setDynamicChart(initialChart);
      return;
    }

    // If not found, fetch from API
    setLoadingChart(true);
    console.log(`📡 Fetching ${chartDiv} chart from API...`);
    
    try {
      // CRITICAL: Ensure timezone is string
      const timezoneValue = typeof birthDetails.timezone === 'number' 
        ? birthDetails.timezone.toString() 
        : birthDetails.timezone;

      const requestBody = {
        birthDate: birthDetails.birthDate,
        birthTime: birthDetails.birthTime,
        latitude: birthDetails.latitude,
        longitude: birthDetails.longitude,
        timezone: timezoneValue, // Must be string like "5.5"
        div: chartDiv,
        style: chartStyle,
        language: birthDetails.language || 'en'
      };

      console.log('📤 Sending chart request:', requestBody);

      const response = await fetch('/api/landing/kundali/chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      console.log('📥 Chart API response:', result);
      
      if (result.success && result.data?.chart) {
        if (typeof result.data.chart === 'string' && result.data.chart.length > 0) {
          console.log(`✅ Chart loaded successfully! Length: ${result.data.chart.length}`);
          setDynamicChart(result.data.chart);
        } else {
          console.error('❌ Chart is empty or invalid type:', typeof result.data.chart);
          setError('Chart data is empty');
        }
      } else {
        console.error('❌ API returned unsuccessful response:', result);
        setError(result.message || result.error || 'Chart not available');
      }
    } catch (error: any) {
      console.error('❌ Chart fetch error:', error);
      setError(`Failed to load chart: ${error.message}`);
    } finally {
      setLoadingChart(false);
    }
  };

  useEffect(() => {
    setDynamicChart(null);
    setError(null);
    loadChartDynamically(selectedChart);
  }, [selectedChart, chartStyle]);

  const currentChart = dynamicChart;

  return (
    <div className="space-y-6">
      {/* Chart Selector */}
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <Activity className="h-5 w-5 text-[#FF6B35]" />
            Select Chart Type
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setChartStyle('north')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                chartStyle === 'north'
                  ? 'bg-[#FF6B35] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              <Compass className="h-4 w-4" />
              North Indian
            </button>
            <button
              onClick={() => setChartStyle('south')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                chartStyle === 'south'
                  ? 'bg-[#FF6B35] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              <Compass className="h-4 w-4" />
              South Indian
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CHART_TYPES.map((chart) => {
            const Icon = chart.icon;
            return (
              <motion.button
                key={chart.id}
                onClick={() => setSelectedChart(chart.id)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  selectedChart === chart.id
                    ? 'border-[#FF6B35] bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 shadow-lg'
                    : 'border-gray-200/60 bg-white/60 hover:border-[#FF6B35]/30 dark:border-gray-700/60 dark:bg-white/5'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="mb-2 h-8 w-8 text-[#FF6B35]" />
                <div className="font-bold text-gray-900 dark:text-white">{chart.name}</div>
                <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">{chart.description}</div>
              </motion.button>
            );
          })}
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
            {currentChart && (
              <button
                onClick={() => setFullscreen(true)}
                className="rounded-lg border border-gray-200/60 bg-white/60 p-2 transition-colors hover:bg-gray-50 dark:border-gray-700/60 dark:bg-white/5"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Chart Image */}
        <div className="relative min-h-[400px] w-full overflow-hidden bg-gradient-to-br from-orange-50 to-amber-50 p-6 dark:from-gray-800 dark:to-gray-900">
          {loadingChart ? (
            <div className="flex h-full min-h-[400px] items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto mb-3 h-12 w-12 animate-spin text-[#FF6B35]" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Generating {selectedChart} chart...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex h-full min-h-[400px] items-center justify-center">
              <div className="text-center">
                <AlertCircle className="mx-auto mb-3 h-12 w-12 text-orange-500" />
                <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Chart not available
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{error}</p>
                <button
                  onClick={() => loadChartDynamically(selectedChart)}
                  className="mt-4 rounded-lg bg-[#FF6B35] px-4 py-2 text-sm font-semibold text-white hover:bg-[#FF6B35]/90"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : currentChart ? (
            <div 
              className="flex min-h-[400px] items-center justify-center"
              dangerouslySetInnerHTML={{ __html: currentChart }}
            />
          ) : (
            <div className="flex h-full min-h-[400px] items-center justify-center">
              <div className="text-center">
                <Activity className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Chart not loaded
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="border-t border-gray-200/60 bg-blue-50/60 p-3 dark:border-gray-700/60 dark:bg-blue-900/10">
          <p className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <strong>Chart Style:</strong> {chartStyle === 'north' ? 'North Indian' : 'South Indian'} style. 
            Each house (1-12) shows planetary placements.
          </p>
        </div>
      </motion.div>

      {/* Fullscreen Modal */}
      {fullscreen && currentChart && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
            onClick={() => setFullscreen(false)}
          >
            <div className="relative max-h-[95vh] max-w-[95vw]" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setFullscreen(false)}
                className="absolute -right-4 -top-4 z-10 rounded-full bg-white p-3 shadow-2xl hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
              <div 
                className="rounded-xl bg-white p-8 shadow-2xl"
                dangerouslySetInnerHTML={{ __html: currentChart }}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}