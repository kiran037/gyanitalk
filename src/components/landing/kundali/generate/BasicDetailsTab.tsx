// src/components/landing/kundali/generate/BasicDetailsTab.tsx
import { motion } from 'framer-motion';
import { User, Calendar, MapPin, Clock, Star, Sun, Moon, TrendingUp, Sparkles, Award } from 'lucide-react';

interface BasicDetailsTabProps {
  data: any;
}

export default function BasicDetailsTab({ data }: BasicDetailsTabProps) {
  const { basicDetails, planetDetails, ascendantReport } = data;

  return (
    <div className="space-y-6">
      {/* Personal Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-gray-200/60 bg-white/60 p-6 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
      >
        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
          Personal Information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#FF6B35]/10 p-2">
              <User className="h-5 w-5 text-[#FF6B35]" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Name</p>
              <p className="font-semibold text-gray-900 dark:text-white">{basicDetails.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#FF6B35]/10 p-2">
              <Calendar className="h-5 w-5 text-[#FF6B35]" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {new Date(basicDetails.birthDate).toLocaleDateString('en-GB')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#FF6B35]/10 p-2">
              <Clock className="h-5 w-5 text-[#FF6B35]" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Time</p>
              <p className="font-semibold text-gray-900 dark:text-white">{basicDetails.birthTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#FF6B35]/10 p-2">
              <MapPin className="h-5 w-5 text-[#FF6B35]" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Place</p>
              <p className="truncate font-semibold text-gray-900 dark:text-white">{basicDetails.birthPlace}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Core Signs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-3"
      >
        <div className="rounded-xl border border-gray-200/60 bg-white/60 p-6 text-center backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5">
          <TrendingUp className="mx-auto mb-3 h-10 w-10 text-purple-600 dark:text-purple-400" />
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Ascendant (Lagna)</p>
          <p className="text-2xl font-bold text-[#FF6B35]">{basicDetails.ascendant || ascendantReport?.ascendant || 'N/A'}</p>
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Your outer personality
          </p>
        </div>
        <div className="rounded-xl border border-gray-200/60 bg-white/60 p-6 text-center backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5">
          <Moon className="mx-auto mb-3 h-10 w-10 text-blue-600 dark:text-blue-400" />
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Moon Sign (Rashi)</p>
          <p className="text-2xl font-bold text-[#FF6B35]">{basicDetails.moonSign || planetDetails.moon?.zodiac || 'N/A'}</p>
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Your inner emotions
          </p>
        </div>
        <div className="rounded-xl border border-gray-200/60 bg-white/60 p-6 text-center backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5">
          <Sun className="mx-auto mb-3 h-10 w-10 text-amber-600 dark:text-amber-400" />
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Sun Sign</p>
          <p className="text-2xl font-bold text-[#FF6B35]">{basicDetails.sunSign || planetDetails.sun?.zodiac || 'N/A'}</p>
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Your core identity
          </p>
        </div>
      </motion.div>

      {/* Ascendant Report */}
      {ascendantReport && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-gray-200/60 bg-white/60 p-6 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFB347] p-3">
              <Star className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Ascendant Analysis
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {ascendantReport.ascendant} Rising
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">General Characteristics</h4>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {ascendantReport.general_prediction}
              </p>
            </div>

            <div>
              <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">Personalized Insight</h4>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {ascendantReport.personalised_prediction}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-green-900 dark:text-green-100">
                  <Award className="h-4 w-4" />
                  Positive Qualities
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {ascendantReport.good_qualities}
                </p>
              </div>
              <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-900/20">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-orange-900 dark:text-orange-100">
                  <TrendingUp className="h-4 w-4" />
                  Areas to Work On
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  {ascendantReport.bad_qualities}
                </p>
              </div>
            </div>

            {/* Lucky Items */}
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
                <p className="mb-1 flex items-center gap-1 text-xs font-medium text-purple-600 dark:text-purple-400">
                  <Sparkles className="h-3 w-3" />
                  Lucky Gem
                </p>
                <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                  {ascendantReport.lucky_gem}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                <p className="mb-1 flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                  <Calendar className="h-3 w-3" />
                  Fasting Day
                </p>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  {ascendantReport.day_for_fasting}
                </p>
              </div>
              <div className="rounded-lg bg-pink-50 p-3 dark:bg-pink-900/20">
                <p className="mb-1 flex items-center gap-1 text-xs font-medium text-pink-600 dark:text-pink-400">
                  <Star className="h-3 w-3" />
                  Symbol
                </p>
                <p className="text-sm font-semibold text-pink-900 dark:text-pink-100">
                  {ascendantReport.symbol}
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                <p className="mb-1 flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                  <TrendingUp className="h-3 w-3" />
                  Element
                </p>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                  {ascendantReport.zodiac_characteristics?.split(',')[1]?.trim() || 'N/A'}
                </p>
              </div>
            </div>

            {/* Spirituality */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
              <h4 className="mb-2 flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-100">
                <Sparkles className="h-4 w-4" />
                Spiritual Guidance
              </h4>
              <p className="text-sm leading-relaxed text-blue-700 dark:text-blue-300">
                {ascendantReport.spirituality_advice}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Panchang Details */}
      {planetDetails.panchang && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-gray-200/60 bg-white/60 p-6 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
        >
          <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
            Panchang at Birth
          </h3>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div>
              <p className="mb-1 text-xs text-gray-500">Day</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {planetDetails.panchang.day_of_birth}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-500">Tithi</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {planetDetails.panchang.tithi}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-500">Nakshatra</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {planetDetails.nakshatra}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-500">Karana</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {planetDetails.panchang.karana}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-500">Yoga</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {planetDetails.panchang.yoga}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs text-gray-500">Day Lord</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {planetDetails.panchang.day_lord}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}