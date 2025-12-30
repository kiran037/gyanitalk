
// src/components/landing/kundali/generate/DashaTab.tsx
import { motion } from 'framer-motion';
import { 
  Calendar, TrendingUp, AlertCircle, Clock, Sparkles, 
  Briefcase, Heart, Coins, GraduationCap, Activity, 
  CheckCircle2, ArrowRight
} from 'lucide-react';

interface DashaTabProps {
  data: any;
}

export function DashaTab({ data }: DashaTabProps) {
  const { aiPrediction, sadeSati } = data;
  
  // Helper to map prediction keys to icons
  const getCategoryIcon = (key: string) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('health')) return <Heart className="h-4 w-4 text-rose-500" />;
    if (lowerKey.includes('career') || lowerKey.includes('profession')) return <Briefcase className="h-4 w-4 text-blue-500" />;
    if (lowerKey.includes('finance') || lowerKey.includes('wealth')) return <Coins className="h-4 w-4 text-amber-500" />;
    if (lowerKey.includes('education')) return <GraduationCap className="h-4 w-4 text-purple-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  if (!aiPrediction && !sadeSati) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-gray-200/60 bg-white/60 p-8 text-center backdrop-blur-sm dark:border-gray-700/60 dark:bg-gray-900/50">
        <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
          <Clock className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Dasha Data Unavailable
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Unable to generate timeline predictions at this moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Current Sade Sati Status - Hero Card */}
      {sadeSati?.current && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 shadow-sm dark:border-orange-900/50 dark:from-orange-900/20 dark:to-amber-900/10"
        >
          <div className="border-b border-orange-200/50 p-4 dark:border-orange-900/30 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="hidden rounded-xl bg-gradient-to-br from-orange-500 to-red-500 p-3 text-white shadow-lg shadow-orange-500/20 sm:block">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 sm:hidden">
                   <AlertCircle className="h-5 w-5 text-orange-600" />
                   <h3 className="text-lg font-bold text-orange-900 dark:text-orange-100">Sade Sati Status</h3>
                </div>
                <h3 className="hidden text-xl font-bold text-orange-900 dark:text-orange-100 sm:block">
                  Current Sade Sati Status
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-orange-800 dark:text-orange-200">
                  <span className="rounded-full bg-orange-200/50 px-2.5 py-0.5 font-semibold dark:bg-orange-900/50">
                    {sadeSati.current.periodType} Phase
                  </span>
                  <span className="hidden h-1 w-1 rounded-full bg-orange-400 sm:block" />
                  <span>Age: {sadeSati.current.age}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            <p className="mb-6 text-sm leading-relaxed text-orange-800/90 dark:text-orange-200/90 sm:text-base">
              {sadeSati.current.botResponse}
            </p>

            {sadeSati.current.remedies && sadeSati.current.remedies.length > 0 && (
              <div className="rounded-xl bg-white/60 p-4 backdrop-blur-sm dark:bg-black/20">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-orange-900 dark:text-orange-100">
                  <Sparkles className="h-4 w-4 text-orange-500" />
                  Recommended Remedies
                </h4>
                <ul className="grid gap-2 sm:grid-cols-1">
                  {sadeSati.current.remedies.slice(0, 3).map((remedy: string, idx: number) => (
                    <li key={idx} className="flex gap-3 text-sm text-orange-800 dark:text-orange-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />
                      <span>{remedy}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* AI Predictions - Grid Layout */}
      {aiPrediction && aiPrediction.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2 px-1">
            <Calendar className="h-5 w-5 text-[#FF6B35]" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              12-Month Predictions
            </h3>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            {aiPrediction.slice(0, 6).map((prediction: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-900"
              >
                {/* Month Header */}
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/50 sm:px-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-base font-bold text-gray-900 dark:text-white sm:text-lg">
                      {prediction.month}
                    </h4>
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-600 shadow-sm dark:bg-gray-800 dark:text-gray-400">
                      Dasha: {prediction.dasha}
                    </span>
                  </div>
                </div>

                {/* Prediction Cards Grid */}
                <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6">
                  {prediction.predictions && Object.entries(prediction.predictions).map(([key, value]: [string, any]) => (
                    <div 
                      key={key} 
                      className="group rounded-xl border border-gray-100 bg-white p-3 transition-colors hover:border-[#FF6B35]/20 hover:bg-orange-50/10 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <div className="rounded-lg bg-gray-50 p-1.5 dark:bg-gray-800">
                          {getCategoryIcon(key)}
                        </div>
                        <h5 className="text-sm font-semibold capitalize text-gray-900 dark:text-gray-200">
                          {key.replace(/_/g, ' ')}
                        </h5>
                      </div>
                      <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400 sm:text-sm">
                        {value.response || value.bot_response}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Sade Sati Timeline - Visual Update */}
      {sadeSati?.periods && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-purple-100 bg-purple-50/40 p-5 dark:border-purple-900/40 dark:bg-purple-900/10 sm:p-8"
        >
          <div className="mb-6 flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100">
              Sade Sati Timeline
            </h3>
          </div>

          <div className="relative border-l-2 border-purple-200 dark:border-purple-800 ml-2 sm:ml-4">
            {/* Current Period */}
            {sadeSati.periods.current?.map((period: any, idx: number) => (
              <div key={`curr-${idx}`} className="mb-8 ml-6 relative">
                <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 ring-4 ring-purple-100 dark:ring-purple-900/30">
                  <Clock className="h-3 w-3 text-white" />
                </span>
                <div className="rounded-xl border border-purple-200 bg-white p-4 shadow-sm dark:border-purple-800 dark:bg-gray-900">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded bg-purple-100 px-2 py-0.5 text-[10px] font-bold uppercase text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                      Current
                    </span>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {period.zodiac}
                    </span>
                  </div>
                  <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                    {period.start_date} <ArrowRight className="mx-1 inline h-3 w-3 text-gray-400" /> {period.end_date}
                  </p>
                </div>
              </div>
            ))}

            {/* Future Periods */}
            {sadeSati.periods.future?.slice(0, 5).map((period: any, idx: number) => (
              <div key={`fut-${idx}`} className="mb-6 ml-6 relative">
                 <span className="absolute -left-[29px] mt-1.5 h-3 w-3 rounded-full border-2 border-purple-300 bg-white dark:border-purple-700 dark:bg-gray-900" />
                 <div className="rounded-lg border border-transparent bg-white/60 p-3 transition-colors hover:bg-white hover:shadow-sm dark:bg-white/5 dark:hover:bg-white/10">
                   <p className="mb-1 text-xs text-purple-800 dark:text-purple-300">
                     {period.zodiac} Phase
                   </p>
                   <p className="text-xs text-gray-600 dark:text-gray-400">
                     {period.start_date} — {period.end_date}
                   </p>
                 </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}