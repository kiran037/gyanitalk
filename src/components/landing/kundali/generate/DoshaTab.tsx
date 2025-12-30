// src/components/landing/kundali/generate/DoshaTab.tsx
import { motion } from 'framer-motion';
import { Flame, AlertCircle, Zap, Users, Activity, CheckCircle, XCircle } from 'lucide-react';

interface DoshaTabProps {
  data: any;
}

export function DoshaTab({ data }: DoshaTabProps) {
  const { doshas } = data;

  if (!doshas) {
    return (
      <div className="rounded-xl border border-gray-200/60 bg-white/60 p-12 text-center backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5">
        <Zap className="mx-auto mb-4 h-16 w-16 text-gray-400" />
        <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
          Dosha Data Not Available
        </h3>
      </div>
    );
  }

  const doshaList = [
    { name: 'Mangal Dosh', data: doshas.mangal, icon: Flame, color: 'red' },
    { name: 'Kaal Sarp Dosh', data: doshas.kaalsarp, icon: Activity, color: 'purple' },
    { name: 'Manglik Dosh', data: doshas.manglik, icon: Flame, color: 'orange' },
    { name: 'Pitra Dosh', data: doshas.pitra, icon: Users, color: 'blue' },
    { name: 'Papasamaya', data: doshas.papasamaya, icon: Zap, color: 'yellow' }
  ];

  const hasAnyDosha = doshaList.some(d => d.data?.present);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl border p-6 ${
          hasAnyDosha 
            ? 'border-orange-200/60 bg-gradient-to-r from-orange-50/80 to-amber-50/80 dark:border-orange-900/60 dark:from-orange-900/20 dark:to-amber-900/20'
            : 'border-green-200/60 bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:border-green-900/60 dark:from-green-900/20 dark:to-emerald-900/20'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`rounded-full p-3 ${hasAnyDosha ? 'bg-orange-500' : 'bg-green-500'} text-white`}>
            {hasAnyDosha ? <AlertCircle className="h-6 w-6" /> : <CheckCircle className="h-6 w-6" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Dosha Analysis Summary
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {hasAnyDosha ? 'Some doshas detected - check details below' : 'No major doshas detected'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Individual Doshas */}
      {doshaList.map((dosha, idx) => {
        const Icon = dosha.icon;
        return (
          <motion.div
            key={dosha.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="rounded-xl border border-gray-200/60 bg-white/60 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
          >
            <div className={`border-b border-gray-200/60 p-4 dark:border-gray-700/60 ${
              dosha.data?.present 
                ? 'bg-red-50/60 dark:bg-red-900/10' 
                : 'bg-green-50/60 dark:bg-green-900/10'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className={`h-6 w-6 ${dosha.data?.present ? 'text-red-600' : 'text-green-600'}`} />
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{dosha.name}</h3>
                    <div className="flex items-center gap-2">
                      {dosha.data?.present ? (
                        <XCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      <p className={`text-sm font-medium ${
                        dosha.data?.present 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        {dosha.data?.present ? 'Present' : 'Not Present'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {/* Score/Percentage */}
              {dosha.data?.score !== undefined && (
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Intensity</span>
                    <span className="font-bold text-gray-900 dark:text-white">{dosha.data.score}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className={`h-full rounded-full ${
                        dosha.data.score > 50 ? 'bg-red-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${dosha.data.score}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Response */}
              {dosha.data?.response && (
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {dosha.data.response}
                  </p>
                </div>
              )}

              {/* Remedies */}
              {dosha.data?.remedies && dosha.data.remedies.length > 0 && (
                <div className="rounded-lg border border-blue-200/60 bg-blue-50/60 p-4 dark:border-blue-900/60 dark:bg-blue-900/10">
                  <h4 className="mb-2 flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-100">
                    <Activity className="h-4 w-4" />
                    Remedies
                  </h4>
                  <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
                    {dosha.data.remedies.slice(0, 3).map((remedy: string, i: number) => (
                      <li key={i} className="flex gap-2">
                        <span>•</span>
                        <span>{remedy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Info Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl border border-purple-200/60 bg-purple-50/60 p-4 dark:border-purple-900/60 dark:bg-purple-900/10"
      >
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-purple-600 dark:text-purple-400" />
          <div>
            <h4 className="mb-1 font-semibold text-purple-900 dark:text-purple-100">
              About Doshas
            </h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Doshas are karmic patterns that can be managed through awareness and remedies. 
              Consult an experienced astrologer for personalized guidance on remedial measures.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}