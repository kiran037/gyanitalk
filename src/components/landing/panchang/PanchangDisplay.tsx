
"use client";

import { motion } from "framer-motion";
import {
  Moon,
  Star,
  Sun,
  CloudMoon,
  Sunrise,
  Sunset,
  Clock,
  AlertCircle,
  Loader2,
  Calendar as CalendarIcon,
} from "lucide-react";

interface PanchangDisplayProps {
  data: any;
  loading: boolean;
  error: string | null;
  selectedDate: Date;
}

export default function PanchangDisplay({
  data,
  loading,
  error,
  selectedDate,
}: PanchangDisplayProps) {
  if (loading) {
    return (
      <motion.div
        className="flex items-center justify-center rounded-2xl border border-gray-200/70 bg-white/70 p-12 backdrop-blur-xl dark:border-gray-800 dark:bg-white/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35]" />
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="rounded-2xl border border-red-200/70 bg-red-50/70 p-8 text-center backdrop-blur-xl dark:border-red-800/70 dark:bg-red-900/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <AlertCircle className="mx-auto mb-3 h-12 w-12 text-red-500" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </motion.div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Main Panchang Elements */}
      <motion.div
        className="rounded-2xl border border-gray-200/70 bg-white/70 p-6 backdrop-blur-xl dark:border-gray-800 dark:bg-white/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="mb-5 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
          <Star className="h-5 w-5 text-[#FF6B35]" />
          Panchang Elements
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Tithi */}
          {data.tithi?.details && (
            <div className="rounded-xl bg-gray-50/80 p-4 dark:bg-gray-800/60">
              <div className="mb-2 flex items-center gap-2">
                <Moon className="h-4 w-4 text-[#FF6B35]" />
                <span className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  Tithi
                </span>
              </div>
              <div className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
                {data.tithi.details.tithi_name}
              </div>
              {data.tithi.end_time && (
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Till {String(data.tithi.end_time.hour).padStart(2, '0')}:
                  {String(data.tithi.end_time.minute).padStart(2, '0')}
                </div>
              )}
              {data.tithi.details.special && (
                <div className="mt-2 text-xs text-[#FF6B35]">
                  {data.tithi.details.special}
                </div>
              )}
            </div>
          )}

          {/* Nakshatra */}
          {data.nakshatra?.details && (
            <div className="rounded-xl bg-gray-50/80 p-4 dark:bg-gray-800/60">
              <div className="mb-2 flex items-center gap-2">
                <Star className="h-4 w-4 text-[#FF6B35]" />
                <span className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  Nakshatra
                </span>
              </div>
              <div className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
                {data.nakshatra.details.nak_name}
              </div>
              {data.nakshatra.end_time && (
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Till {String(data.nakshatra.end_time.hour).padStart(2, '0')}:
                  {String(data.nakshatra.end_time.minute).padStart(2, '0')}
                </div>
              )}
              {data.nakshatra.details.ruler && (
                <div className="mt-2 text-xs text-[#FF6B35]">
                  Ruler: {data.nakshatra.details.ruler}
                </div>
              )}
            </div>
          )}

          {/* Yoga */}
          {data.yog?.details && (
            <div className="rounded-xl bg-gray-50/80 p-4 dark:bg-gray-800/60">
              <div className="mb-2 flex items-center gap-2">
                <CloudMoon className="h-4 w-4 text-[#FF6B35]" />
                <span className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  Yoga
                </span>
              </div>
              <div className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
                {data.yog.details.yog_name}
              </div>
              {data.yog.end_time && (
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Till {String(data.yog.end_time.hour).padStart(2, '0')}:
                  {String(data.yog.end_time.minute).padStart(2, '0')}
                </div>
              )}
            </div>
          )}

          {/* Karana */}
          {data.karan?.details && (
            <div className="rounded-xl bg-gray-50/80 p-4 dark:bg-gray-800/60">
              <div className="mb-2 flex items-center gap-2">
                <Sun className="h-4 w-4 text-[#FF6B35]" />
                <span className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                  Karana
                </span>
              </div>
              <div className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
                {data.karan.details.karan_name}
              </div>
              {data.karan.end_time && (
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Till {String(data.karan.end_time.hour).padStart(2, '0')}:
                  {String(data.karan.end_time.minute).padStart(2, '0')}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Additional Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Day & Paksha */}
        {(data.day || data.paksha) && (
          <motion.div
            className="rounded-xl border border-gray-200/70 bg-white/70 p-4 backdrop-blur-xl dark:border-gray-800 dark:bg-white/5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-2 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-[#FF6B35]" />
              <span className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                Day & Paksha
              </span>
            </div>
            {data.day && (
              <div className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
                {data.day}
              </div>
            )}
            {data.paksha && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {data.paksha}
              </div>
            )}
          </motion.div>
        )}

        {/* Hindu Month */}
        {data.hindu_maah && (
          <motion.div
            className="rounded-xl border border-gray-200/70 bg-white/70 p-4 backdrop-blur-xl dark:border-gray-800 dark:bg-white/5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="mb-2 flex items-center gap-2">
              <Moon className="h-4 w-4 text-[#FF6B35]" />
              <span className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                Hindu Month
              </span>
            </div>
            <div className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
              {data.hindu_maah.purnimanta}
            </div>
            {data.hindu_maah.amanta && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Amanta: {data.hindu_maah.amanta}
              </div>
            )}
          </motion.div>
        )}

        {/* Zodiac Signs */}
        {(data.sun_sign || data.moon_sign) && (
          <motion.div
            className="rounded-xl border border-gray-200/70 bg-white/70 p-4 backdrop-blur-xl dark:border-gray-800 dark:bg-white/5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-2 flex items-center gap-2">
              <Star className="h-4 w-4 text-[#FF6B35]" />
              <span className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                Zodiac Signs
              </span>
            </div>
            {data.sun_sign && (
              <div className="mb-1 text-sm text-gray-900 dark:text-white">
                <span className="font-semibold">Sun:</span> {data.sun_sign}
              </div>
            )}
            {data.moon_sign && (
              <div className="text-sm text-gray-900 dark:text-white">
                <span className="font-semibold">Moon:</span> {data.moon_sign}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Sun & Moon Timings */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sun Timings */}
        {(data.sunrise || data.sunset) && (
          <motion.div
            className="rounded-2xl border border-gray-200/70 bg-white/70 p-6 backdrop-blur-xl dark:border-gray-800 dark:bg-white/5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
              <Sun className="h-5 w-5 text-[#FF6B35]" />
              Sun Timings
            </h3>

            <div className="space-y-3">
              {data.sunrise && (
                <div className="flex items-center justify-between rounded-lg bg-gray-50/80 p-3 dark:bg-gray-800/60">
                  <div className="flex items-center gap-2">
                    <Sunrise className="h-4 w-4 text-orange-500" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      Sunrise
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {data.sunrise}
                  </span>
                </div>
              )}

              {data.sunset && (
                <div className="flex items-center justify-between rounded-lg bg-gray-50/80 p-3 dark:bg-gray-800/60">
                  <div className="flex items-center gap-2">
                    <Sunset className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      Sunset
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {data.sunset}
                  </span>
                </div>
              )}

              {data.vedic_sunrise && (
                <div className="flex items-center justify-between rounded-lg bg-gray-50/80 p-3 dark:bg-gray-800/60">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      Vedic Sunrise
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {data.vedic_sunrise}
                  </span>
                </div>
              )}

              {data.vedic_sunset && (
                <div className="flex items-center justify-between rounded-lg bg-gray-50/80 p-3 dark:bg-gray-800/60">
                  <div className="flex items-center gap-2">
                    <Sunset className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      Vedic Sunset
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {data.vedic_sunset}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Moon Timings */}
        {(data.moonrise || data.moonset) && (
          <motion.div
            className="rounded-2xl border border-gray-200/70 bg-white/70 p-6 backdrop-blur-xl dark:border-gray-800 dark:bg-white/5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
              <Moon className="h-5 w-5 text-[#FF6B35]" />
              Moon Timings
            </h3>

            <div className="space-y-3">
              {data.moonrise && (
                <div className="flex items-center justify-between rounded-lg bg-gray-50/80 p-3 dark:bg-gray-800/60">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      Moonrise
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {data.moonrise}
                  </span>
                </div>
              )}

              {data.moonset && (
                <div className="flex items-center justify-between rounded-lg bg-gray-50/80 p-3 dark:bg-gray-800/60">
                  <div className="flex items-center gap-2">
                    <CloudMoon className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      Moonset
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {data.moonset}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Auspicious Timings */}
      {data.abhijit_muhurta && (
        <motion.div
          className="rounded-2xl border border-green-200/70 bg-green-50/70 p-6 backdrop-blur-xl dark:border-green-800/70 dark:bg-green-900/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
            Auspicious Timing
          </h3>

          <div className="rounded-lg bg-white/60 p-4 dark:bg-gray-800/60">
            <div className="mb-2 text-sm font-semibold uppercase text-green-600 dark:text-green-400">
              Abhijit Muhurta
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {data.abhijit_muhurta.start} - {data.abhijit_muhurta.end}
            </div>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              Most auspicious time for important activities
            </p>
          </div>
        </motion.div>
      )}

      {/* Inauspicious Timings */}
      {(data.rahukaal || data.guliKaal || data.yamghant_kaal) && (
        <motion.div
          className="rounded-2xl border border-orange-200/70 bg-orange-50/70 p-6 backdrop-blur-xl dark:border-orange-800/70 dark:bg-orange-900/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            Inauspicious Timings
          </h3>

          <div className="grid gap-3 sm:grid-cols-3">
            {data.rahukaal && (
              <div className="rounded-lg bg-white/60 p-3 dark:bg-gray-800/60">
                <div className="mb-1 text-xs font-semibold uppercase text-orange-600 dark:text-orange-400">
                  Rahu Kaal
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {data.rahukaal.start} - {data.rahukaal.end}
                </div>
              </div>
            )}

            {data.guliKaal && (
              <div className="rounded-lg bg-white/60 p-3 dark:bg-gray-800/60">
                <div className="mb-1 text-xs font-semibold uppercase text-orange-600 dark:text-orange-400">
                  Gulika Kalam
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {data.guliKaal.start} - {data.guliKaal.end}
                </div>
              </div>
            )}

            {data.yamghant_kaal && (
              <div className="rounded-lg bg-white/60 p-3 dark:bg-gray-800/60">
                <div className="mb-1 text-xs font-semibold uppercase text-orange-600 dark:text-orange-400">
                  Yamaghanta
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {data.yamghant_kaal.start} - {data.yamghant_kaal.end}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}