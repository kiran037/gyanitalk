// src/components/landing/kundali/generate/NumerologyTab.tsx
import { motion } from 'framer-motion';
import { 
  Hash, User, Target, Sparkles, Heart, 
  Calendar, Crown, Gem, Feather, Volume2, Info 
} from 'lucide-react';

interface NumerologyTabProps {
  data: any;
}

export function NumerologyTab({ data }: NumerologyTabProps) {
  const { numerology } = data;

  if (!numerology) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-gray-200/60 bg-white/60 p-8 text-center backdrop-blur-sm dark:border-gray-700/60 dark:bg-gray-900/50">
        <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
          <Hash className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Numerology Data Unavailable
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          We couldn't calculate the numerology report for this chart.
        </p>
      </div>
    );
  }

  const {
    radical_number,
    radical_ruler,
    destiny,
    name_number,
    characteristics,
    fav_color,
    fav_day,
    fav_god,
    fav_mantra,
    fav_metal,
    fav_stone,
    fav_substone,
    friendly_num,
    evil_num,
    neutral_num
  } = numerology;

  // Safe parsing helper
  const parseNumArray = (val: any) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return val.split(',').map(n => Number(n.trim())).filter(Boolean);
    if (typeof val === 'number') return [val];
    return [];
  };

  const safeFriendlyNums = parseNumArray(friendly_num);
  const safeNeutralNums = parseNumArray(neutral_num);
  const safeEvilNums = parseNumArray(evil_num);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. The Core Numbers - Big Impact Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 grid-cols-1 sm:grid-cols-3"
      >
        <NumberCard 
          title="Radical Number" 
          value={radical_number} 
          subtitle={`Ruled by ${radical_ruler}`}
          icon={User}
          gradient="from-purple-500 to-indigo-500"
          shadow="shadow-purple-500/20"
          delay={0}
        />
        <NumberCard 
          title="Destiny Number" 
          value={destiny} 
          subtitle="Life Path"
          icon={Target}
          gradient="from-blue-500 to-cyan-500"
          shadow="shadow-blue-500/20"
          delay={0.1}
        />
        <NumberCard 
          title="Name Number" 
          value={name_number} 
          subtitle="Expression"
          icon={Feather}
          gradient="from-amber-500 to-orange-500"
          shadow="shadow-amber-500/20"
          delay={0.2}
        />
      </motion.div>

      {/* 2. Characteristics */}
      {characteristics && characteristics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-[#FF6B35]" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Key Characteristics
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {characteristics.map((char: string, idx: number) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-lg border border-orange-100 bg-orange-50/50 px-3 py-1.5 text-sm font-medium text-gray-800 transition-colors hover:bg-orange-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                {char}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* 3. Lucky Elements Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6"
      >
        <div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-4 dark:border-gray-800">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Favorable Elements
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          <LuckyItem label="Lucky Color" value={fav_color} icon={<div className="h-3 w-3 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500" />} />
          <LuckyItem label="Lucky Day" value={fav_day} icon={<Calendar className="h-3 w-3 text-blue-500" />} />
          <LuckyItem label="Lucky Stone" value={fav_stone} icon={<Gem className="h-3 w-3 text-emerald-500" />} />
          <LuckyItem label="Lucky Metal" value={fav_metal} icon={<div className="h-3 w-3 rounded-full border border-gray-400 bg-gray-200" />} />
          <LuckyItem label="Deity" value={fav_god} icon={<Crown className="h-3 w-3 text-amber-500" />} />
          <LuckyItem label="Sub Stone" value={fav_substone} icon={<Gem className="h-3 w-3 text-teal-500" />} />
        </div>
      </motion.div>

      {/* 4. Compatibility Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid gap-4 sm:grid-cols-3"
      >
        {/* Friendly */}
        {safeFriendlyNums.length > 0 && (
          <CompatibilityCard 
            title="Friendly Numbers"
            numbers={safeFriendlyNums}
            type="friendly"
          />
        )}

        {/* Neutral */}
        {safeNeutralNums.length > 0 && (
          <CompatibilityCard 
            title="Neutral Numbers"
            numbers={safeNeutralNums}
            type="neutral"
          />
        )}

        {/* Enemy */}
        {safeEvilNums.length > 0 && (
          <CompatibilityCard 
            title="Enemy Numbers"
            numbers={safeEvilNums}
            type="evil"
          />
        )}
      </motion.div>

      {/* 5. Mantra & Info */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Mantra Card (Spans 2 cols on Desktop) */}
        {fav_mantra && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-purple-100 bg-purple-50 p-6 dark:border-purple-900/30 dark:bg-purple-900/10 md:col-span-2"
          >
            <div className="mb-3 flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-bold text-purple-900 dark:text-purple-100">
                Lucky Mantra
              </h3>
            </div>
            <p className="font-serif text-lg font-medium italic leading-relaxed text-purple-800 dark:text-purple-200">
              "{fav_mantra}"
            </p>
          </motion.div>
        )}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-blue-100 bg-blue-50 p-6 dark:border-blue-900/30 dark:bg-blue-900/10 md:col-span-1"
        >
          <div className="flex gap-3">
            <Info className="h-6 w-6 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            <div className="space-y-2">
              <h4 className="font-bold text-blue-900 dark:text-blue-100">Did you know?</h4>
              <p className="text-xs leading-relaxed text-blue-800 dark:text-blue-200">
                <span className="font-semibold">Destiny Number</span> is derived from your full date of birth and represents your life's ultimate purpose.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* --- Helper Components for clean code & UI --- */

function NumberCard({ title, value, subtitle, icon: Icon, gradient, shadow, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 text-white shadow-lg ${shadow}`}
    >
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="mb-3 rounded-full bg-white/20 p-2.5 backdrop-blur-sm">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <p className="text-sm font-medium text-white/80">{title}</p>
        <h3 className="my-1 text-5xl font-bold tracking-tighter">{value}</h3>
        <p className="text-xs font-semibold uppercase tracking-wider text-white/90">{subtitle}</p>
      </div>
      {/* Decorative Circles */}
      <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-xl" />
      <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-black/10 blur-xl" />
    </motion.div>
  );
}

function LuckyItem({ label, value, icon }: any) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-800/30 dark:hover:bg-gray-800">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-700">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="truncate font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function CompatibilityCard({ title, numbers, type }: any) {
  const styles = {
    friendly: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/10',
      border: 'border-emerald-100 dark:border-emerald-900/30',
      text: 'text-emerald-900 dark:text-emerald-100',
      circle: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
      icon: '✓'
    },
    neutral: {
      bg: 'bg-gray-50 dark:bg-gray-800/30',
      border: 'border-gray-200 dark:border-gray-700',
      text: 'text-gray-900 dark:text-gray-100',
      circle: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      icon: '−'
    },
    evil: {
      bg: 'bg-rose-50 dark:bg-rose-900/10',
      border: 'border-rose-100 dark:border-rose-900/30',
      text: 'text-rose-900 dark:text-rose-100',
      circle: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
      icon: '✕'
    }
  }[type as 'friendly' | 'neutral' | 'evil'];

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${styles.bg} ${styles.border}`}>
      <h4 className={`mb-3 flex items-center gap-2 text-sm font-bold ${styles.text}`}>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/50 text-xs shadow-sm">
          {styles.icon}
        </span>
        {title}
      </h4>
      <div className="flex flex-wrap gap-2">
        {numbers.map((num: number, idx: number) => (
          <span
            key={idx}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold shadow-sm ${styles.circle}`}
          >
            {num}
          </span>
        ))}
      </div>
    </div>
  );
}