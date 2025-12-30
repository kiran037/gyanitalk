// src/components/landing/kundali/generate/DashaTab.tsx
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, AlertCircle, Clock, Sparkles } from 'lucide-react';

interface DashaTabProps {
  data: any;
}

export function DashaTab({ data }: DashaTabProps) {
  const { aiPrediction, sadeSati } = data;
  
  if (!aiPrediction && !sadeSati) {
    return (
      <div className="rounded-xl border border-gray-200/60 bg-white/60 p-12 text-center backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5">
        <Clock className="mx-auto mb-4 h-16 w-16 text-gray-400" />
        <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
          Dasha Data Not Available
        </h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Sade Sati Status */}
      {sadeSati?.current && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-orange-200/60 bg-gradient-to-r from-orange-50/80 to-amber-50/80 p-6 backdrop-blur-sm dark:border-orange-900/60 dark:from-orange-900/20 dark:to-amber-900/20"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-full bg-orange-500 p-3 text-white">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100">
                Current Sade Sati Status
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                {sadeSati.current.periodType} phase • Age {sadeSati.current.age}
              </p>
            </div>
          </div>
          
          <p className="mb-4 text-sm leading-relaxed text-orange-700 dark:text-orange-300">
            {sadeSati.current.botResponse}
          </p>

          {sadeSati.current.remedies && sadeSati.current.remedies.length > 0 && (
            <div className="rounded-lg border border-orange-200 bg-white/60 p-4 dark:border-orange-800 dark:bg-white/5">
              <h4 className="mb-2 flex items-center gap-2 font-semibold text-orange-900 dark:text-orange-100">
                <Sparkles className="h-4 w-4" />
                Remedies
              </h4>
              <ul className="space-y-2 text-sm text-orange-700 dark:text-orange-300">
                {sadeSati.current.remedies.slice(0, 3).map((remedy: string, idx: number) => (
                  <li key={idx} className="flex gap-2">
                    <span>•</span>
                    <span>{remedy}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {/* AI Predictions */}
      {aiPrediction && aiPrediction.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <Calendar className="h-5 w-5 text-[#FF6B35]" />
            12-Month Predictions
          </h3>
          {aiPrediction.slice(0, 6).map((prediction: any, idx: number) => (
            <div key={idx} className="rounded-xl border border-gray-200/60 bg-white/60 p-6 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    {prediction.month}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {prediction.dasha}
                  </p>
                </div>
                <Calendar className="h-5 w-5 text-[#FF6B35]" />
              </div>
              <div className="space-y-3">
                {prediction.predictions && Object.entries(prediction.predictions).map(([key, value]: [string, any]) => (
                  <div key={key} className="rounded-lg border border-gray-200/60 bg-gradient-to-r from-gray-50/80 to-white/80 p-4 dark:border-gray-700/60 dark:from-gray-800/50 dark:to-gray-900/50">
                    <h5 className="mb-2 flex items-center gap-2 font-semibold capitalize text-gray-900 dark:text-white">
                      <TrendingUp className="h-4 w-4 text-[#FF6B35]" />
                      {key.replace(/_/g, ' ')}
                    </h5>
                    <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      {value.response || value.bot_response}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Sade Sati Periods */}
      {sadeSati?.periods && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-purple-200/60 bg-purple-50/60 p-6 backdrop-blur-sm dark:border-purple-900/60 dark:bg-purple-900/10"
        >
          <h3 className="mb-4 flex items-center gap-2 font-bold text-purple-900 dark:text-purple-100">
            <Clock className="h-5 w-5" />
            Sade Sati Timeline
          </h3>
          
          {sadeSati.periods.current && sadeSati.periods.current.length > 0 && (
            <div className="mb-4">
              <h4 className="mb-2 text-sm font-semibold text-purple-700 dark:text-purple-300">Current Period</h4>
              {sadeSati.periods.current.map((period: any, idx: number) => (
                <div key={idx} className="rounded-lg bg-white/60 p-3 dark:bg-white/5">
                  <p className="text-sm text-purple-900 dark:text-purple-100">
                    {period.start_date} - {period.end_date} • {period.zodiac}
                  </p>
                </div>
              ))}
            </div>
          )}

          {sadeSati.periods.future && sadeSati.periods.future.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-purple-700 dark:text-purple-300">Upcoming Periods</h4>
              <div className="space-y-2">
                {sadeSati.periods.future.slice(0, 5).map((period: any, idx: number) => (
                  <div key={idx} className="rounded-lg bg-white/60 p-3 dark:bg-white/5">
                    <p className="text-sm text-purple-900 dark:text-purple-100">
                      {period.start_date} - {period.end_date} • {period.zodiac}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}