// src/components/landing/kundali/generate/NumerologyTab.tsx
import { motion } from 'framer-motion';
import { Hash, User, Target, Sparkles, Heart, Calendar } from 'lucide-react';

interface NumerologyTabProps {
  data: any;
}

export function NumerologyTab({ data }: NumerologyTabProps) {
  const { numerology } = data;

  if (!numerology) {
    return (
      <div className="rounded-xl border border-gray-200/60 bg-white/60 p-12 text-center backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5">
        <Hash className="mx-auto mb-4 h-16 w-16 text-gray-400" />
        <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
          Numerology Data Not Available
        </h3>
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

  const safeFriendlyNums = Array.isArray(friendly_num)
  ? friendly_num
  : typeof friendly_num === "string"
    ? friendly_num.split(",").map(n => Number(n.trim())).filter(Boolean)
    : typeof friendly_num === "number"
      ? [friendly_num]
      : [];

const safeNeutralNums = Array.isArray(neutral_num)
  ? neutral_num
  : typeof neutral_num === "string"
    ? neutral_num.split(",").map(n => Number(n.trim())).filter(Boolean)
    : typeof neutral_num === "number"
      ? [neutral_num]
      : [];

const safeEvilNums = Array.isArray(evil_num)
  ? evil_num
  : typeof evil_num === "string"
    ? evil_num.split(",").map(n => Number(n.trim())).filter(Boolean)
    : typeof evil_num === "number"
      ? [evil_num]
      : [];

  return (
    <div className="space-y-6">
      {/* Main Numbers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 sm:grid-cols-3"
      >
        <div className="rounded-xl border border-purple-200/60 bg-gradient-to-br from-purple-50/80 to-pink-50/80 p-6 text-center backdrop-blur-sm dark:border-purple-900/60 dark:from-purple-900/20 dark:to-pink-900/20">
          <User className="mx-auto mb-3 h-8 w-8 text-purple-600 dark:text-purple-400" />
          <p className="mb-2 text-sm font-medium text-purple-600 dark:text-purple-400">
            Radical Number
          </p>
          <p className="text-4xl font-bold text-purple-900 dark:text-purple-100">
            {radical_number}
          </p>
          <p className="mt-2 text-xs text-purple-700 dark:text-purple-300">
            Ruled by {radical_ruler}
          </p>
        </div>

        <div className="rounded-xl border border-blue-200/60 bg-gradient-to-br from-blue-50/80 to-cyan-50/80 p-6 text-center backdrop-blur-sm dark:border-blue-900/60 dark:from-blue-900/20 dark:to-cyan-900/20">
          <Target className="mx-auto mb-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
          <p className="mb-2 text-sm font-medium text-blue-600 dark:text-blue-400">
            Destiny Number
          </p>
          <p className="text-4xl font-bold text-blue-900 dark:text-blue-100">
            {destiny}
          </p>
          <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
            Life Path
          </p>
        </div>

        <div className="rounded-xl border border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-orange-50/80 p-6 text-center backdrop-blur-sm dark:border-amber-900/60 dark:from-amber-900/20 dark:to-orange-900/20">
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-amber-600 dark:text-amber-400" />
          <p className="mb-2 text-sm font-medium text-amber-600 dark:text-amber-400">
            Name Number
          </p>
          <p className="text-4xl font-bold text-amber-900 dark:text-amber-100">
            {name_number}
          </p>
          <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
            Expression
          </p>
        </div>
      </motion.div>

      {/* Characteristics */}
      {characteristics && characteristics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-gray-200/60 bg-white/60 p-6 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
        >
          <div className="mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-[#FF6B35]" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Your Characteristics
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {characteristics.map((char: string, idx: number) => (
              <span
                key={idx}
                className="rounded-full border border-[#FF6B35]/30 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                {char}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Lucky Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-gray-200/60 bg-white/60 p-6 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
      >
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Lucky Elements
          </h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {fav_color && (
            <div className="rounded-lg border border-gray-200/60 bg-gradient-to-r from-gray-50/80 to-white/80 p-3 dark:border-gray-700/60 dark:from-gray-800/50 dark:to-gray-900/50">
              <p className="mb-1 text-xs font-medium text-gray-500">Lucky Color</p>
              <p className="font-semibold text-gray-900 dark:text-white">{fav_color}</p>
            </div>
          )}

          {fav_day && (
            <div className="rounded-lg border border-gray-200/60 bg-gradient-to-r from-gray-50/80 to-white/80 p-3 dark:border-gray-700/60 dark:from-gray-800/50 dark:to-gray-900/50">
              <p className="mb-1 text-xs font-medium text-gray-500">Lucky Day</p>
              <p className="font-semibold text-gray-900 dark:text-white">{fav_day}</p>
            </div>
          )}

          {fav_stone && (
            <div className="rounded-lg border border-gray-200/60 bg-gradient-to-r from-gray-50/80 to-white/80 p-3 dark:border-gray-700/60 dark:from-gray-800/50 dark:to-gray-900/50">
              <p className="mb-1 text-xs font-medium text-gray-500">Lucky Stone</p>
              <p className="font-semibold text-gray-900 dark:text-white">{fav_stone}</p>
            </div>
          )}

          {fav_metal && (
            <div className="rounded-lg border border-gray-200/60 bg-gradient-to-r from-gray-50/80 to-white/80 p-3 dark:border-gray-700/60 dark:from-gray-800/50 dark:to-gray-900/50">
              <p className="mb-1 text-xs font-medium text-gray-500">Lucky Metal</p>
              <p className="font-semibold text-gray-900 dark:text-white">{fav_metal}</p>
            </div>
          )}

          {fav_god && (
            <div className="rounded-lg border border-gray-200/60 bg-gradient-to-r from-gray-50/80 to-white/80 p-3 dark:border-gray-700/60 dark:from-gray-800/50 dark:to-gray-900/50">
              <p className="mb-1 text-xs font-medium text-gray-500">Deity</p>
              <p className="font-semibold text-gray-900 dark:text-white">{fav_god}</p>
            </div>
          )}

          {fav_substone && (
            <div className="rounded-lg border border-gray-200/60 bg-gradient-to-r from-gray-50/80 to-white/80 p-3 dark:border-gray-700/60 dark:from-gray-800/50 dark:to-gray-900/50">
              <p className="mb-1 text-xs font-medium text-gray-500">Sub Stone</p>
              <p className="font-semibold text-gray-900 dark:text-white">{fav_substone}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Number Compatibility */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-gray-200/60 bg-white/60 p-6 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
      >
        <div className="mb-4 flex items-center gap-2">
          <Hash className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Number Compatibility
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
{safeFriendlyNums.length > 0 && (
            <div className="rounded-lg border border-green-200/60 bg-green-50/60 p-4 dark:border-green-900/60 dark:bg-green-900/10">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-green-900 dark:text-green-100">
                <span className="text-lg">✓</span>
                Friendly Numbers
              </p>
              <div className="flex flex-wrap gap-2">
                {safeFriendlyNums.map((num: number, idx: number) => (
                  <span
                    key={idx}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-200 font-bold text-green-900 dark:bg-green-800 dark:text-green-100"
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>
          )}

{safeNeutralNums.length > 0 && (
            <div className="rounded-lg border border-gray-200/60 bg-gray-50/60 p-4 dark:border-gray-700/60 dark:bg-gray-800/10">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                <span className="text-lg">−</span>
                Neutral Numbers
              </p>
              <div className="flex flex-wrap gap-2">
{safeNeutralNums.map((num: number, idx: number) => (
                  <span
                    key={idx}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 font-bold text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>
          )}

{safeEvilNums.length > 0 && (
            <div className="rounded-lg border border-red-200/60 bg-red-50/60 p-4 dark:border-red-900/60 dark:bg-red-900/10">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-900 dark:text-red-100">
                <span className="text-lg">✕</span>
                Unfavorable Numbers
              </p>
              <div className="flex flex-wrap gap-2">
{safeEvilNums.map((num: number, idx: number) => (
                  <span
                    key={idx}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-200 font-bold text-red-900 dark:bg-red-800 dark:text-red-100"
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Mantra */}
      {fav_mantra && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-purple-200/60 bg-purple-50/60 p-6 backdrop-blur-sm dark:border-purple-900/60 dark:bg-purple-900/10"
        >
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100">
              Lucky Mantra
            </h3>
          </div>
          <p className="text-center text-lg font-medium leading-relaxed text-purple-700 dark:text-purple-300">
            {fav_mantra}
          </p>
        </motion.div>
      )}

      {/* Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl border border-blue-200/60 bg-blue-50/60 p-4 dark:border-blue-900/60 dark:bg-blue-900/10"
      >
        <div className="flex gap-3">
          <Calendar className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <div>
            <h4 className="mb-1 font-semibold text-blue-900 dark:text-blue-100">
              About Your Numbers
            </h4>
            <p className="text-sm leading-relaxed text-blue-700 dark:text-blue-300">
              <strong>Radical Number:</strong> Based on your birth date, represents your core personality. 
              <strong className="ml-2">Destiny Number:</strong> Sum of all birth date digits, shows life purpose. 
              <strong className="ml-2">Name Number:</strong> Based on your name, influences how others perceive you.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}