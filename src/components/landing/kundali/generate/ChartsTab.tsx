// src/components/landing/kundali/generate/ChartsTab.tsx
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X, Loader2, AlertCircle, Activity, Compass, Info } from 'lucide-react';

interface ChartsTabProps {
  data: any;
  birthDetails: any;
}

const CHART_TYPES = [
  { id: 'D1', name: 'Rasi (D1)', description: 'Birth Chart', icon: Activity },
  { id: 'D9', name: 'Navamsa (D9)', description: 'Marriage', icon: Compass },
  { id: 'D10', name: 'Dasamsa (D10)', description: 'Career', icon: Activity },
  { id: 'D2', name: 'Hora (D2)', description: 'Wealth', icon: Compass },
  { id: 'D3', name: 'Drekkana (D3)', description: 'Siblings', icon: Activity },
  { id: 'D7', name: 'Saptamsa (D7)', description: 'Children', icon: Compass },
  { id: 'D12', name: 'Dwadasamsa', description: 'Parents', icon: Activity },
];

export default function ChartsTab({ data, birthDetails }: ChartsTabProps) {
  const [selectedChart, setSelectedChart] = useState('D1');
  const [fullscreen, setFullscreen] = useState(false);
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');
  const [loadingChart, setLoadingChart] = useState(false);
  const [dynamicChart, setDynamicChart] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { charts } = data;

  // --- CRITICAL FIX FOR CUTTING CHARTS ---
  const processChartSvg = (svgString: string | null) => {
    if (!svgString) return null;

    let processed = svgString;

    // 1. EXTRACT DIMENSIONS: We need the original width/height to create a viewBox
    // If we don't do this, removing width/height will cause the browser to crop the image
    const widthMatch = processed.match(/width=["']?(\d+)(\.\d+)?(px)?["']?/i);
    const heightMatch = processed.match(/height=["']?(\d+)(\.\d+)?(px)?["']?/i);
    
    let viewBoxAttr = "";

    // If API didn't provide a viewBox, we create one based on the width/height
    if (!processed.includes('viewBox') && widthMatch && heightMatch) {
      const w = widthMatch[1]; // e.g. "750"
      const h = heightMatch[1]; // e.g. "750"
      viewBoxAttr = `viewBox="0 0 ${w} ${h}"`;
    }

    // 2. CLEANUP: Remove fixed width and height attributes
    // This allows the SVG to shrink/grow with CSS
    processed = processed.replace(/width=["']?[^"']*["']?/gi, '');
    processed = processed.replace(/height=["']?[^"']*["']?/gi, '');

    // 3. INJECT: Add responsive class, style, and the calculated viewBox
    const responsiveAttributes = `
      ${viewBoxAttr}
      width="100%" 
      height="100%" 
      preserveAspectRatio="xMidYMid meet"
      style="width: 100%; height: auto; display: block; max-width: 100%;"
    `;

    // Replace the opening <svg> tag with our enhanced version
    // We search for <svg followed by any character until >
    processed = processed.replace(/<svg([^>]*)>/i, (match, existingAttrs) => {
      // Clean up any double spaces we might create
      return `<svg ${responsiveAttributes} ${existingAttrs}>`;
    });

    return processed;
  };

  const loadChartDynamically = async (chartDiv: string) => {
    setError(null);
    
    // 1. Check existing data
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
      setDynamicChart(initialChart);
      return;
    }

    // 2. Fetch from API
    setLoadingChart(true);
    
    try {
      const timezoneValue = typeof birthDetails.timezone === 'number' 
        ? birthDetails.timezone.toString() 
        : birthDetails.timezone;

      const response = await fetch('/api/landing/kundali/chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate: birthDetails.birthDate,
          birthTime: birthDetails.birthTime,
          latitude: birthDetails.latitude,
          longitude: birthDetails.longitude,
          timezone: timezoneValue,
          div: chartDiv,
          style: chartStyle,
          language: birthDetails.language || 'en'
        })
      });

      const result = await response.json();
      
      if (result.success && result.data?.chart) {
        setDynamicChart(result.data.chart);
      } else {
        setError(result.message || 'Chart unavailable');
      }
    } catch (error: any) {
      setError('Connection failed');
    } finally {
      setLoadingChart(false);
    }
  };

  useEffect(() => {
    setDynamicChart(null);
    setError(null);
    loadChartDynamically(selectedChart);
  }, [selectedChart, chartStyle]);

  // Memoize the processed SVG
  const responsiveChartHtml = useMemo(() => {
    return processChartSvg(dynamicChart);
  }, [dynamicChart]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header & Controls */}
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-orange-50 p-2.5 text-[#FF6B35] dark:bg-orange-900/20">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">
              Divisional Charts
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Varga Chakras for detailed analysis
            </p>
          </div>
        </div>

        {/* Style Toggle */}
        <div className="flex w-full rounded-xl bg-gray-100 p-1 dark:bg-gray-800 md:w-auto">
          {(['north', 'south'] as const).map((style) => (
            <button
              key={style}
              onClick={() => setChartStyle(style)}
              className={`flex-1 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all sm:text-sm ${
                chartStyle === style
                  ? 'bg-white text-[#FF6B35] shadow-sm dark:bg-gray-700 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              {style} Style
            </button>
          ))}
        </div>
      </div>

      {/* 2. Chart Selection Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {CHART_TYPES.map((chart) => {
          const Icon = chart.icon;
          const isSelected = selectedChart === chart.id;
          return (
            <button
              key={chart.id}
              onClick={() => setSelectedChart(chart.id)}
              className={`group relative flex flex-col items-start rounded-xl border p-3 text-left transition-all hover:shadow-md sm:p-4 ${
                isSelected
                  ? 'border-[#FF6B35] bg-gradient-to-br from-[#FF6B35]/5 to-[#FFB347]/10 ring-1 ring-[#FF6B35]/30'
                  : 'border-gray-200 bg-white hover:border-[#FF6B35]/30 dark:border-gray-700 dark:bg-gray-900'
              }`}
            >
              <div className="mb-2 flex w-full items-center justify-between">
                <span className={`text-sm font-bold ${isSelected ? 'text-[#FF6B35]' : 'text-gray-900 dark:text-white'}`}>
                  {chart.id}
                </span>
                <Icon className={`h-4 w-4 ${isSelected ? 'text-[#FF6B35]' : 'text-gray-400'}`} />
              </div>
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {chart.name.split('(')[0].trim()}
              </div>
              <div className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                {chart.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Main Chart Display */}
      {/* Removed overflow-hidden here to prevent clipping if child expands */}
      <motion.div
        layout
        className="relative rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-800/30">
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white sm:text-base">
              {CHART_TYPES.find(c => c.id === selectedChart)?.name}
            </h4>
            <p className="text-xs text-gray-500">
              {birthDetails.name} • {birthDetails.birthPlace}
            </p>
          </div>
          {responsiveChartHtml && (
            <button
              onClick={() => setFullscreen(true)}
              className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm ring-1 ring-gray-200 transition-colors hover:text-[#FF6B35] dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Expand</span>
            </button>
          )}
        </div>

        {/* 
          Chart Rendering Container 
          - Remove fixed heights (min-h-[300px]) to allow SVG aspect ratio to control height
          - p-2 sm:p-6: Padding to keep chart away from edges
        */}
        <div className="relative flex w-full flex-col items-center justify-center bg-white p-2 dark:bg-black/20 sm:p-6">
          {loadingChart ? (
            <div className="flex h-64 w-full flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35]" />
              <p className="text-sm font-medium text-gray-500">Calculating positions...</p>
            </div>
          ) : error ? (
            <div className="flex h-64 w-full flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="rounded-full bg-red-50 p-3 dark:bg-red-900/20">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
              <button
                onClick={() => loadChartDynamically(selectedChart)}
                className="rounded-lg bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
              >
                Retry Load
              </button>
            </div>
          ) : responsiveChartHtml ? (
            /* 
              SVG WRAPPER
              - w-full: Always take full width
              - max-w-[600px]: Don't get too huge on desktop
              - block: Removes line-height issues
            */
            <div 
              className="w-full max-w-[600px]"
              dangerouslySetInnerHTML={{ __html: responsiveChartHtml }}
            />
          ) : (
            <div className="flex h-64 w-full flex-col items-center justify-center opacity-40">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No chart data</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center border-t border-gray-100 bg-blue-50/50 p-2 text-[10px] text-blue-800 dark:border-gray-800 dark:bg-blue-900/10 dark:text-blue-300 sm:text-xs">
          <Info className="mr-1.5 h-3 w-3" />
          <span>Viewing {chartStyle === 'north' ? 'North' : 'South'} Indian Style</span>
        </div>
      </motion.div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {fullscreen && responsiveChartHtml && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 p-2 backdrop-blur-md dark:bg-black/95 sm:p-4"
            onClick={() => setFullscreen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative flex h-full max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {CHART_TYPES.find(c => c.id === selectedChart)?.name}
                </h3>
                <button
                  onClick={() => setFullscreen(false)}
                  className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-red-50 hover:text-red-500 dark:bg-gray-800 dark:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-1 items-center justify-center overflow-auto p-4 sm:p-8">
                 <div 
                  className="w-full max-w-[650px]"
                  dangerouslySetInnerHTML={{ __html: responsiveChartHtml }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}