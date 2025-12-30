// src/components/landing/kundali/generate/DoshaTab.tsx
import { motion } from 'framer-motion';
import { 
  Flame, AlertCircle, Zap, Users, Activity, 
  CheckCircle2, XCircle, ShieldCheck, Info 
} from 'lucide-react';

interface DoshaTabProps {
  data: any;
}

export function DoshaTab({ data }: DoshaTabProps) {
  const { doshas } = data;

  if (!doshas) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-gray-200/60 bg-white/60 p-8 text-center backdrop-blur-sm dark:border-gray-700/60 dark:bg-gray-900/50">
        <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
          <Zap className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Dosha Data Unavailable
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          We couldn't generate the dosha analysis for this chart.
        </p>
      </div>
    );
  }

  const doshaList = [
    { name: 'Mangal Dosh', data: doshas.mangal, icon: Flame },
    { name: 'Kaal Sarp Dosh', data: doshas.kaalsarp, icon: Activity },
    { name: 'Manglik Dosh', data: doshas.manglik, icon: Flame },
    { name: 'Pitra Dosh', data: doshas.pitra, icon: Users },
    { name: 'Papasamaya', data: doshas.papasamaya, icon: Zap }
  ];

  const presentDoshas = doshaList.filter(d => d.data?.present);
  const hasAnyDosha = presentDoshas.length > 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm sm:p-6 ${
          hasAnyDosha 
            ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 dark:border-orange-900/50 dark:from-orange-900/20 dark:to-red-900/20'
            : 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 dark:border-emerald-900/50 dark:from-emerald-900/20 dark:to-green-900/20'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`hidden rounded-xl p-3 text-white shadow-lg sm:block ${hasAnyDosha ? 'bg-orange-500' : 'bg-emerald-500'}`}>
            {hasAnyDosha ? <AlertCircle className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 sm:hidden">
              {hasAnyDosha ? (
                <AlertCircle className="h-5 w-5 text-orange-600" />
              ) : (
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              )}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Dosha Summary</h3>
            </div>
            <h3 className="hidden text-xl font-bold text-gray-900 dark:text-white sm:block">
              Dosha Analysis Summary
            </h3>
            
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              {hasAnyDosha 
                ? `${presentDoshas.length} dosha(s) detected in your chart. Review the details below for remedies.` 
                : 'Great news! No major negative doshas were detected in your birth chart.'}
            </p>

            {hasAnyDosha && (
              <div className="mt-4 flex flex-wrap gap-2">
                {presentDoshas.map(d => (
                  <span key={d.name} className="inline-flex items-center rounded-md bg-white/60 px-2 py-1 text-xs font-semibold text-orange-800 shadow-sm dark:bg-black/20 dark:text-orange-200">
                    {d.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Individual Doshas Grid */}
      <div className="grid gap-4 sm:gap-6">
        {doshaList.map((dosha, idx) => {
          const Icon = dosha.icon;
          const isPresent = dosha.data?.present;
          
          return (
            <motion.div
              key={dosha.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`overflow-hidden rounded-2xl border transition-all hover:shadow-md ${
                isPresent 
                  ? 'border-red-100 bg-white dark:border-red-900/30 dark:bg-gray-900' 
                  : 'border-gray-100 bg-gray-50/50 opacity-80 dark:border-gray-800 dark:bg-gray-900/50'
              }`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between border-b px-4 py-3 sm:px-6 ${
                isPresent 
                  ? 'border-red-100 bg-red-50/30 dark:border-red-900/30 dark:bg-red-900/10' 
                  : 'border-gray-100 bg-transparent dark:border-gray-800'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${
                    isPresent ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{dosha.name}</h3>
                    <p className={`text-xs font-medium ${isPresent ? 'text-red-600 dark:text-red-400' : 'text-gray-500'}`}>
                      {isPresent ? 'Detected' : 'Not Present'}
                    </p>
                  </div>
                </div>
                <div>
                  {isPresent ? (
                    <XCircle className="h-6 w-6 text-red-500" />
                  ) : (
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6">
                 {/* Score Bar (Only if present) */}
                 {isPresent && dosha.data?.score !== undefined && (
                  <div className="mb-4">
                    <div className="mb-1 flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400">
                      <span>Intensity Level</span>
                      <span>{dosha.data.score}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          dosha.data.score > 75 ? 'bg-red-600' : 
                          dosha.data.score > 50 ? 'bg-orange-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${dosha.data.score}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Description */}
                {dosha.data?.response && (
                  <div className={`rounded-xl p-3 text-sm leading-relaxed ${
                    isPresent 
                      ? 'bg-red-50/50 text-gray-800 dark:bg-red-900/10 dark:text-gray-200' 
                      : 'bg-transparent text-gray-500 italic dark:text-gray-400'
                  }`}>
                    {dosha.data.response}
                  </div>
                )}

                {/* Remedies Section */}
                {isPresent && dosha.data?.remedies && dosha.data.remedies.length > 0 && (
                  <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/30 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-blue-900 dark:text-blue-200">
                      <ShieldCheck className="h-4 w-4" />
                      Suggested Remedies
                    </h4>
                    <ul className="grid gap-2 sm:grid-cols-1">
                      {dosha.data.remedies.slice(0, 3).map((remedy: string, i: number) => (
                        <li key={i} className="flex gap-2 text-sm text-blue-800 dark:text-blue-300">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
                          <span className="leading-snug">{remedy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Educational Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex gap-4 rounded-xl border border-purple-100 bg-purple-50 p-4 dark:border-purple-900/30 dark:bg-purple-900/10"
      >
        <Info className="h-6 w-6 flex-shrink-0 text-purple-600 dark:text-purple-400" />
        <div>
          <h4 className="mb-1 text-sm font-bold text-purple-900 dark:text-purple-100">
            What does this mean?
          </h4>
          <p className="text-sm leading-relaxed text-purple-800/80 dark:text-purple-300">
            Doshas act as spiritual checkpoints in your chart. While they may indicate challenges, they are not sentences. Simple remedies and conscious effort can significantly mitigate their effects.
          </p>
        </div>
      </motion.div>
    </div>
  );
}