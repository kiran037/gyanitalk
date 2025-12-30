// src/components/landing/kundali/generate/YogaTab.tsx
import { motion } from 'framer-motion';
import { 
  Award, TrendingUp, TrendingDown, AlertCircle, 
  Star, Crown, Info, Sparkles 
} from 'lucide-react';

interface YogaTabProps {
  data: any;
}

export function YogaTab({ data }: YogaTabProps) {
  const { yogaList } = data;

  if (!yogaList || !yogaList.yogas || yogaList.yogas.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-gray-200/60 bg-white/60 p-8 text-center backdrop-blur-sm dark:border-gray-700/60 dark:bg-gray-900/50">
        <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
          <Award className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          No Major Yogas Detected
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Your chart doesn't show standard planetary combinations at this time.
        </p>
      </div>
    );
  }

  const { total, rajaYogaCount, dhanaYogaCount, daridraYogaCount, categorized } = yogaList;

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* 1. Summary Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-5 shadow-sm dark:border-purple-900/50 dark:from-purple-900/20 dark:to-pink-900/10 sm:p-6"
      >
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-500/30">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Yoga Analysis
            </h3>
            <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
              {total} Planetary Combinations Found
            </p>
          </div>
        </div>

        {/* Stats Grid - Stacks on mobile, row on desktop */}
        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryStat 
            label="Raja Yogas" 
            subLabel="Power & Authority"
            count={rajaYogaCount} 
            icon={Crown} 
            colors="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" 
            iconColor="text-amber-600"
          />
          <SummaryStat 
            label="Dhana Yogas" 
            subLabel="Wealth & Prosperity"
            count={dhanaYogaCount} 
            icon={TrendingUp} 
            colors="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" 
            iconColor="text-emerald-600"
          />
          <SummaryStat 
            label="Daridra Yogas" 
            subLabel="Challenges & Hurdles"
            count={daridraYogaCount} 
            icon={AlertCircle} 
            colors="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" 
            iconColor="text-red-600"
          />
        </div>
      </motion.div>

      {/* 2. Beneficial Yogas Grid */}
      {categorized?.beneficial && categorized.beneficial.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2 px-1">
            <Star className="h-5 w-5 text-emerald-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Beneficial Yogas
            </h3>
            <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              {categorized.beneficial.length}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {categorized.beneficial.map((yoga: any, idx: number) => (
              <YogaCard 
                key={idx} 
                yoga={yoga} 
                type="beneficial" 
                delay={idx * 0.05} 
              />
            ))}
          </div>
        </section>
      )}

      {/* 3. Challenging Yogas Grid */}
      {categorized?.challenging && categorized.challenging.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2 px-1">
            <TrendingDown className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Challenging Yogas
            </h3>
            <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
              {categorized.challenging.length}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {categorized.challenging.map((yoga: any, idx: number) => (
              <YogaCard 
                key={idx} 
                yoga={yoga} 
                type="challenging" 
                delay={idx * 0.05} 
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. Educational Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex gap-4 rounded-xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-900/30 dark:bg-blue-900/10"
      >
        <Info className="h-6 w-6 flex-shrink-0 text-blue-600 dark:text-blue-400" />
        <div>
          <h4 className="mb-1 text-sm font-bold text-blue-900 dark:text-blue-100">
            What are Yogas?
          </h4>
          <p className="text-sm leading-relaxed text-blue-800 dark:text-blue-200">
            In Vedic Astrology, a 'Yoga' is a specific union of planets that produces distinct results. 
            While Raja Yogas elevate status and Dhana Yogas improve finances, challenging yogas serve as karmic lessons to be mastered. 
            The strength percentage indicates how prominently a yoga may manifest in your life.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* --- Sub-Components --- */

function SummaryStat({ label, subLabel, count, icon: Icon, colors, iconColor }: any) {
  return (
    <div className={`flex flex-col justify-between rounded-xl p-4 transition-transform hover:scale-[1.02] ${colors}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider opacity-80">{label}</p>
          <p className="text-3xl font-bold">{count}</p>
        </div>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <p className="mt-2 text-xs font-medium opacity-70">{subLabel}</p>
    </div>
  );
}

function YogaCard({ yoga, type, delay }: any) {
  const isBeneficial = type === 'beneficial';
  
  const styles = isBeneficial ? {
    border: 'border-emerald-100 dark:border-emerald-900/30',
    bg: 'bg-white dark:bg-gray-900',
    headerBg: 'bg-emerald-50/50 dark:bg-emerald-900/10',
    title: 'text-gray-900 dark:text-white',
    icon: <Sparkles className="h-4 w-4 text-emerald-500" />,
    strengthColor: 'bg-emerald-500',
    pill: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
  } : {
    border: 'border-orange-100 dark:border-orange-900/30',
    bg: 'bg-white dark:bg-gray-900',
    headerBg: 'bg-orange-50/50 dark:bg-orange-900/10',
    title: 'text-gray-900 dark:text-white',
    icon: <AlertCircle className="h-4 w-4 text-orange-500" />,
    strengthColor: 'bg-orange-500',
    pill: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`flex flex-col justify-between overflow-hidden rounded-2xl border shadow-sm transition-all hover:shadow-md ${styles.border} ${styles.bg}`}
    >
      <div>
        {/* Card Header */}
        <div className={`flex items-start justify-between p-4 ${styles.headerBg}`}>
          <div className="flex-1 pr-2">
            <h4 className={`font-bold ${styles.title}`}>{yoga.yoga}</h4>
            <div className="mt-1 flex items-center gap-2">
               {/* Strength Bar */}
               <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                 <div 
                    className={`h-full rounded-full ${styles.strengthColor}`} 
                    style={{ width: `${yoga.strength_in_percentage}%` }} 
                 />
               </div>
               <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                 {yoga.strength_in_percentage}% Strength
               </span>
            </div>
          </div>
          <div className="flex-shrink-0 mt-1">
            {styles.icon}
          </div>
        </div>

        {/* Meaning */}
        <div className="p-4">
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {yoga.meaning}
          </p>
        </div>
      </div>

      {/* Footer: Planets */}
      {yoga.planets_involved && yoga.planets_involved.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-3 dark:border-gray-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-400">Formed by:</span>
            {yoga.planets_involved.map((planet: string, i: number) => (
              <span
                key={i}
                className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles.pill}`}
              >
                {planet}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}