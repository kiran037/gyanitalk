"use client";

import { motion } from "framer-motion";
import {
  Moon, Star, Sun, CloudMoon, Sunrise, Sunset, Clock, AlertCircle, Loader2,
  Calendar as CalendarIcon, Sparkles
} from "lucide-react";

interface PanchangDisplayProps {
  data: any;
  loading: boolean;
  error: string | null;
  selectedDate: Date;
}

export default function PanchangDisplay({ data, loading, error }: PanchangDisplayProps) {
  
  function parseTime(timeStr: string): string {
    if (!timeStr) return "--:--";
    return timeStr.trim();
  }

  if (loading || error || !data) return null; // Loading/Error handled in parent

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* 1. Core Panchang Elements */}
      <motion.div
        className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:rounded-3xl sm:p-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-4 flex items-center gap-3 sm:mb-6">
          <div className="rounded-xl bg-orange-50 p-2 text-[#FF6B35] dark:bg-orange-900/20 sm:p-2.5">
            <Star className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
            Core Elements
          </h3>
        </div>

        {/* Use grid-cols-1 on mobile to prevent squishing */}
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {data.tithi && <ElementCard title="Tithi" icon={Moon} name={data.tithi.name} number={data.tithi.number} endTime={data.tithi.end} type={data.tithi.type} special={data.tithi.special} />}
          {data.nakshatra && <ElementCard title="Nakshatra" icon={Star} name={data.nakshatra.name} number={data.nakshatra.number} endTime={data.nakshatra.end} deity={data.nakshatra.diety} lord={data.nakshatra.lord} />}
          {data.yoga && <ElementCard title="Yoga" icon={CloudMoon} name={data.yoga.name} number={data.yoga.number} endTime={data.yoga.end} meaning={data.yoga.meaning} />}
          {data.karana && <ElementCard title="Karana" icon={Sun} name={data.karana.name} number={data.karana.number} endTime={data.karana.end} special={data.karana.special} />}
        </div>
      </motion.div>

      {/* 2. Day & Meta Information */}
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {(data.day?.name || data.rasi?.name) && (
          <InfoCard label="Day & Rasi" icon={CalendarIcon} value={data.day?.name} subValue={data.rasi?.name ? `Rasi: ${data.rasi.name}` : null} color="blue" />
        )}
        {(data.sun_position || data.moon_position) && (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              Positions
            </div>
            <div className="space-y-2">
              {data.sun_position && (
                <div className="flex justify-between border-b border-dashed border-gray-100 pb-2 dark:border-gray-800">
                  <span className="text-xs text-gray-500 sm:text-sm">Sun Sign</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white sm:text-base">
                    {data.sun_position.zodiac || data.sun_position.rasi_no}
                  </span>
                </div>
              )}
              {data.moon_position && (
                <div className="flex justify-between pt-1">
                  <span className="text-xs text-gray-500 sm:text-sm">Moon Degree</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white sm:text-base">
                    {Math.round(data.moon_position.moon_degree)}°
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        {data.advanced_details?.masa && (
          <InfoCard label="Hindu Month" icon={Moon} value={data.advanced_details.masa.amanta_name || data.advanced_details.masa.purnimanta_name} subValue={`Paksha: ${data.advanced_details.masa.paksha || ''}`} color="purple" />
        )}
      </div>

      {/* 3. Celestial Timings */}
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {data.advanced_details && (
          <motion.div className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50/50 to-amber-50/50 p-4 dark:border-orange-900/30 dark:from-orange-900/10 dark:to-amber-900/10 sm:p-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white sm:mb-5 sm:text-lg">
              <Sun className="h-4 w-4 text-orange-500 sm:h-5 sm:w-5" />
              Solar Cycle
            </h3>
            <div className="space-y-1">
              <TimeRow label="Sunrise" time={parseTime(data.advanced_details.sun_rise)} icon={Sunrise} color="text-orange-500" />
              <TimeRow label="Sunset" time={parseTime(data.advanced_details.sun_set)} icon={Sunset} color="text-orange-600" />
            </div>
          </motion.div>
        )}
        {data.advanced_details && (
          <motion.div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-4 dark:border-blue-900/30 dark:from-blue-900/10 dark:to-indigo-900/10 sm:p-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white sm:mb-5 sm:text-lg">
              <Moon className="h-4 w-4 text-blue-500 sm:h-5 sm:w-5" />
              Lunar Cycle
            </h3>
            <div className="space-y-1">
              <TimeRow label="Moonrise" time={parseTime(data.advanced_details.moon_rise)} icon={Moon} color="text-blue-500" />
              <TimeRow label="Moonset" time={parseTime(data.advanced_details.moon_set)} icon={CloudMoon} color="text-indigo-500" />
            </div>
          </motion.div>
        )}
      </div>

      {/* 4. Timings */}
      <div className="space-y-4">
        {data.advanced_details?.abhijit_muhurta && (
          <motion.div className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 p-0 dark:border-emerald-900/50 dark:bg-emerald-900/20">
            <div className="flex flex-col sm:flex-row">
              <div className="flex items-center gap-3 bg-emerald-100/50 p-4 dark:bg-emerald-900/30 sm:w-48 sm:flex-col sm:justify-center sm:text-center">
                <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400 sm:h-6 sm:w-6" />
                <h3 className="font-bold text-emerald-900 dark:text-emerald-100">Abhijit Muhurta</h3>
              </div>
              <div className="flex flex-1 flex-col justify-center p-4">
                <p className="text-xl font-bold text-emerald-800 dark:text-emerald-200 sm:text-2xl">
                  {parseTime(data.advanced_details.abhijit_muhurta.start)} - {parseTime(data.advanced_details.abhijit_muhurta.end)}
                </p>
                <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 sm:text-sm">
                  Best time for auspicious activities
                </p>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Inauspicious Grid: 1 col on mobile, 3 on large */}
        {(data.rahukaal || data.gulika || data.yamakanta) && (
          <motion.div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white sm:text-lg">
              <AlertCircle className="h-4 w-4 text-rose-500 sm:h-5 sm:w-5" />
              Inauspicious Timings
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {data.rahukaal && <BadTimeCard label="Rahu Kaal" time={data.rahukaal} />}
              {data.gulika && <BadTimeCard label="Gulika Kalam" time={data.gulika} />}
              {data.yamakanta && <BadTimeCard label="Yamaghanta" time={data.yamakanta} />}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ElementCard({ title, icon: Icon, name, number, endTime, type, special, deity, lord, meaning }: any) {
  if (!name) return null;
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white/60 to-white/30 p-4 shadow-lg backdrop-blur-md transition-all hover:translate-y-[-2px] hover:shadow-xl dark:border-gray-700/50 dark:from-gray-800/60 dark:to-gray-900/30 sm:p-5">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-[#FF6B35]/20 to-purple-500/20 blur-3xl transition-opacity opacity-0 group-hover:opacity-100" />
      <div className="relative z-10">
        <div className="mb-2 flex items-center justify-between sm:mb-3">
          <div className="flex items-center gap-2 rounded-lg bg-white/50 px-2 py-1 dark:bg-black/20">
            <Icon className="h-3 w-3 text-[#FF6B35] sm:h-4 sm:w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              {title}
            </span>
          </div>
          {number && <span className="font-mono text-[10px] font-bold text-gray-400 sm:text-xs">#{number}</span>}
        </div>
        <h3 className="text-lg font-bold leading-tight text-gray-900 dark:text-white sm:text-xl">{name}</h3>
        {(special || type) && (
          <span className="mt-2 inline-block rounded-md bg-orange-100/80 px-2 py-0.5 text-[10px] font-bold uppercase text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
            {special || type}
          </span>
        )}
        <div className="mt-3 space-y-1 border-t border-gray-100/50 pt-2 dark:border-gray-700/50 sm:mt-4 sm:pt-3">
          {endTime && (
            <div className="flex items-center justify-between text-[10px] text-gray-600 dark:text-gray-300 sm:text-xs">
              <span>Ends at</span>
              <span className="font-mono font-bold bg-gray-100 px-1.5 py-0.5 rounded dark:bg-gray-800">{endTime}</span>
            </div>
          )}
          {(deity || lord) && (
             <div className="flex items-center gap-2 text-[10px] sm:text-xs">
                <span className="text-gray-400">Ruler:</span>
                <span className="font-medium text-gray-700 dark:text-gray-200">{deity || lord}</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, icon: Icon, value, subValue, color }: any) {
  const colors = { blue: "text-blue-500", purple: "text-purple-500", pink: "text-pink-500" };
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-5">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:mb-3">
        <Icon className={`h-4 w-4 ${colors[color as keyof typeof colors]}`} />
        {label}
      </div>
      <div>
        <div className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">{value || "--"}</div>
        {subValue && <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">{subValue}</div>}
      </div>
    </div>
  );
}

function TimeRow({ label, time, icon: Icon, color }: any) {
  return (
    <div className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-white/50 dark:hover:bg-white/5 sm:py-2">
      <div className="flex items-center gap-2 sm:gap-3">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-xs font-medium text-gray-700 dark:text-gray-200 sm:text-sm">{label}</span>
      </div>
      <span className="font-mono text-xs font-bold text-gray-900 dark:text-white sm:text-sm">{time}</span>
    </div>
  );
}

function BadTimeCard({ label, time }: any) {
  if (!time) return null;
  return (
    <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800 sm:p-3.5">
      <div className="mb-1 text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 sm:text-xs">{label}</div>
      <div className="flex items-center gap-1 text-xs font-bold text-gray-900 dark:text-white sm:text-sm">{time}</div>
    </div>
  );
}