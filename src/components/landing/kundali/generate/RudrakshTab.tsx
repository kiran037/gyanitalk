// src/components/landing/kundali/generate/RudrakshTab.tsx
import { motion } from 'framer-motion';
import { 
  Circle, Sparkles, AlertCircle, Droplets, 
  Sun, Moon, Shield, Info, HeartPulse 
} from 'lucide-react';

interface RudrakshTabProps {
  data: any;
}

export function RudrakshTab({ data }: RudrakshTabProps) {
  const { suggestions } = data;
  const rudrakshData = suggestions?.rudraksh;

  if (!rudrakshData) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-gray-200/60 bg-white/60 p-8 text-center backdrop-blur-sm dark:border-gray-700/60 dark:bg-gray-900/50">
        <div className="mb-4 rounded-full bg-amber-50 p-4 dark:bg-amber-900/20">
          <Circle className="h-8 w-8 text-amber-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Rudraksh Data Unavailable
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          We couldn't generate specific recommendations at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 text-center shadow-sm dark:border-amber-900/50 dark:from-amber-900/20 dark:to-orange-900/20 sm:p-8"
      >
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="rounded-full bg-white/80 p-3 shadow-sm backdrop-blur-sm dark:bg-amber-900/30">
            <Circle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 sm:text-2xl">
              Sacred Rudraksh
            </h3>
            <p className="mx-auto max-w-md text-sm text-amber-800 dark:text-amber-200">
              Powerful beads believed to be Lord Shiva's tears, offering protection and spiritual growth tailored to your energy.
            </p>
          </div>
        </div>
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.15]" />
      </motion.div>

      {/* Main Recommendation Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/30 sm:px-6">
          <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Your Primary Bead
          </h4>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
            {/* Visual Representation */}
            <div className="flex-shrink-0 self-center sm:self-start">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700 shadow-inner dark:from-amber-900/40 dark:to-orange-900/40 dark:text-amber-300">
                <span className="text-3xl font-bold">
                  {rudrakshData.mukhiForDisease?.[0] || '?'}
                </span>
                <span className="ml-1 text-xs font-medium uppercase">Mukhi</span>
              </div>
            </div>

            <div className="flex-1 space-y-4 text-center sm:text-left">
              <div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                  {rudrakshData.name}
                </h4>
                {rudrakshData.mukhiForDisease && (
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    Recommended: {rudrakshData.mukhiForDisease.join(', ')} Mukhi
                  </p>
                )}
              </div>

              {rudrakshData.description && (
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {rudrakshData.description}
                </p>
              )}

              {/* AI Insight Box */}
              {rudrakshData.response && (
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-left text-sm text-amber-900 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-100">
                  <span className="mb-1 block text-xs font-bold uppercase text-amber-500">Astrological Insight</span>
                  {rudrakshData.response}
                </div>
              )}
            </div>
          </div>

          {/* Secondary Recommendations Grid */}
          {(rudrakshData.mukhiForMoney?.length > 0 || rudrakshData.mukhiForDisease?.length > 0) && (
            <div className="mt-6 grid gap-4 border-t border-gray-100 pt-6 dark:border-gray-800 sm:grid-cols-2">
              {rudrakshData.mukhiForMoney && rudrakshData.mukhiForMoney.length > 0 && (
                <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-900/10">
                  <h5 className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-900 dark:text-emerald-100">
                    <Sun className="h-4 w-4" />
                    For Wealth & Success
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {rudrakshData.mukhiForMoney.map((mukhi: number, idx: number) => (
                      <span
                        key={`money-${idx}`}
                        className="inline-flex items-center rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 shadow-sm dark:bg-emerald-800 dark:text-emerald-100"
                      >
                        {mukhi} Mukhi
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
               {/* Note: Often disease mukhi is same as main, but if different, we can show it here too. 
                   Using Health Icon for generic secondary display if needed */}
               {/* 
               <div className="rounded-xl bg-rose-50 p-4 dark:bg-rose-900/10">
                  <h5 className="mb-3 flex items-center gap-2 text-sm font-bold text-rose-900 dark:text-rose-100">
                    <HeartPulse className="h-4 w-4" />
                    For Health & Vitality
                  </h5>
                  ...
               </div> 
               */}
            </div>
          )}
        </div>
      </motion.div>

      {/* Rituals & Guidelines */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-6 md:grid-cols-2"
      >
        {/* Wearing Process */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <Shield className="h-5 w-5 text-blue-500" />
            Wearing Rituals
          </h3>
          <div className="space-y-4">
            {[
              { title: "Purification", desc: "Soak in Ganga water or raw milk overnight.", icon: Droplets },
              { title: "Energization", desc: "Chant 'Om Namah Shivaya' 108 times on Monday.", icon: Sun },
              { title: "Placement", desc: "Wear as a pendant/mala touching the skin.", icon: Circle },
              { title: "Care", desc: "Clean with water; oil occasionally to prevent drying.", icon: Sparkles }
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-900 dark:text-white">{step.title}</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Guidelines & Significance */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5 dark:border-purple-900/30 dark:bg-purple-900/10">
            <h4 className="mb-2 flex items-center gap-2 font-bold text-purple-900 dark:text-purple-100">
              <Info className="h-4 w-4" />
              Significance
            </h4>
            <p className="text-sm leading-relaxed text-purple-800 dark:text-purple-300">
              Rudraksh beads act as a protective shield for the body's energy. They help in maintaining physical and mental balance, especially for those constantly on the move.
            </p>
          </div>

          <div className="flex-1 rounded-2xl border border-orange-100 bg-orange-50 p-5 dark:border-orange-900/30 dark:bg-orange-900/10">
            <h4 className="mb-2 flex items-center gap-2 font-bold text-orange-900 dark:text-orange-100">
              <AlertCircle className="h-4 w-4" />
              Important Rules
            </h4>
            <ul className="space-y-2 text-sm text-orange-800 dark:text-orange-300">
              <li className="flex gap-2">
                <span className="text-orange-500">•</span>
                Remove while sleeping.
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500">•</span>
                Do not wear during intimate moments.
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500">•</span>
                Avoid wearing at funerals or cremation grounds.
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}