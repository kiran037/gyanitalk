// components/landing/panchang/PanchangDisplay.tsx
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
  Info,
  ChevronRight
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
}: PanchangDisplayProps) {
  
  // Robust time formatter handling both string "HH:MM" and object {hour, minute}
  function formatTimeToAMPM(time: string | { hour: number; minute: number } | undefined) {
    if (!time) return "--:--";
    
    let hours: number;
    let minutes: number;

    if (typeof time === "string") {
      const parts = time.split(":");
      hours = Number(parts[0]);
      minutes = Number(parts[1] || 0);
    } else {
      hours = time.hour;
      minutes = time.minute;
    }

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${hours}:${String(minutes).padStart(2, "0")} ${ampm}`;
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white/80 p-8 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/50">
        <Loader2 className="h-10 w-10 animate-spin text-[#FF6B35]" />
        <p className="mt-4 text-sm font-medium text-gray-500">Aligning with the cosmos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-red-100 bg-red-50/50 p-8 text-center backdrop-blur-xl dark:border-red-900/30 dark:bg-red-900/10">
        <div className="mb-4 rounded-full bg-red-100 p-3 text-red-500 dark:bg-red-900/20">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Data Unavailable</h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* 1. Core Panchang Elements (The "Big 4") */}
      <motion.div
        className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-orange-50 p-2.5 text-[#FF6B35] dark:bg-orange-900/20">
            <Star className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Core Elements
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ElementCard 
            title="Tithi" 
            icon={Moon}
            name={data.tithi?.details?.tithi_name}
            endTime={data.tithi?.end_time}
            extra={data.tithi?.details?.special}
            formatter={formatTimeToAMPM}
          />
          <ElementCard 
            title="Nakshatra" 
            icon={Star}
            name={data.nakshatra?.details?.nak_name}
            endTime={data.nakshatra?.end_time}
            extra={data.nakshatra?.details?.ruler ? `Ruler: ${data.nakshatra.details.ruler}` : null}
            formatter={formatTimeToAMPM}
          />
          <ElementCard 
            title="Yoga" 
            icon={CloudMoon}
            name={data.yog?.details?.yog_name}
            endTime={data.yog?.end_time}
            formatter={formatTimeToAMPM}
          />
          <ElementCard 
            title="Karana" 
            icon={Sun}
            name={data.karan?.details?.karan_name}
            endTime={data.karan?.end_time}
            formatter={formatTimeToAMPM}
          />
        </div>
      </motion.div>

      {/* 2. Meta Info Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Day Info */}
        {(data.day || data.paksha) && (
          <InfoCard 
            label="Day & Paksha"
            icon={CalendarIcon}
            value={data.day}
            subValue={data.paksha}
            color="blue"
          />
        )}

        {/* Hindu Month */}
        {data.hindu_maah && (
          <InfoCard 
            label="Hindu Month"
            icon={Moon}
            value={data.hindu_maah.purnimanta}
            subValue={data.hindu_maah.amanta ? `Amanta: ${data.hindu_maah.amanta}` : null}
            color="purple"
          />
        )}

        {/* Zodiac Signs */}
        {(data.sun_sign || data.moon_sign) && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <Star className="h-4 w-4 text-pink-500" />
              Zodiac
            </div>
            <div className="space-y-2">
              <div className="flex justify-between border-b border-dashed border-gray-100 pb-2 dark:border-gray-800">
                <span className="text-sm text-gray-500">Sun Sign</span>
                <span className="font-bold text-gray-900 dark:text-white">{data.sun_sign || "--"}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-sm text-gray-500">Moon Sign</span>
                <span className="font-bold text-gray-900 dark:text-white">{data.moon_sign || "--"}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Celestial Timings (Sun & Moon) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sun */}
        {(data.sunrise || data.sunset) && (
          <motion.div
            className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50/50 to-amber-50/50 p-6 dark:border-orange-900/30 dark:from-orange-900/10 dark:to-amber-900/10"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
              <Sun className="h-5 w-5 text-orange-500" />
              Solar Cycle
            </h3>
            <div className="space-y-1">
              <TimeRow label="Sunrise" time={formatTimeToAMPM(data.sunrise)} icon={Sunrise} color="text-orange-500" />
              <TimeRow label="Sunset" time={formatTimeToAMPM(data.sunset)} icon={Sunset} color="text-orange-600" />
              <div className="my-2 h-px bg-orange-200/50 dark:bg-orange-800/30" />
              <TimeRow label="Vedic Sunrise" time={formatTimeToAMPM(data.vedic_sunrise)} icon={Sun} color="text-yellow-600" />
              <TimeRow label="Vedic Sunset" time={formatTimeToAMPM(data.vedic_sunset)} icon={Sunset} color="text-yellow-700" />
            </div>
          </motion.div>
        )}

        {/* Moon */}
        {(data.moonrise || data.moonset) && (
          <motion.div
            className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-6 dark:border-blue-900/30 dark:from-blue-900/10 dark:to-indigo-900/10"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
              <Moon className="h-5 w-5 text-blue-500" />
              Lunar Cycle
            </h3>
            <div className="space-y-1">
              <TimeRow label="Moonrise" time={formatTimeToAMPM(data.moonrise)} icon={Moon} color="text-blue-500" />
              <TimeRow label="Moonset" time={formatTimeToAMPM(data.moonset)} icon={CloudMoon} color="text-indigo-500" />
            </div>
          </motion.div>
        )}
      </div>

      {/* 4. Auspicious / Inauspicious */}
      <div className="space-y-4">
        {/* Abhijit Muhurta - The Good Stuff */}
        {data.abhijit_muhurta && (
          <motion.div
            className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 p-0 dark:border-emerald-900/50 dark:bg-emerald-900/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex flex-col sm:flex-row">
              <div className="flex items-center gap-3 bg-emerald-100/50 p-4 dark:bg-emerald-900/30 sm:w-48 sm:flex-col sm:justify-center sm:text-center">
                <Clock className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-emerald-900 dark:text-emerald-100">Abhijit Muhurta</h3>
              </div>
              <div className="flex flex-1 flex-col justify-center p-4">
                <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                  {formatTimeToAMPM(data.abhijit_muhurta.start)} - {formatTimeToAMPM(data.abhijit_muhurta.end)}
                </p>
                <p className="mt-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  Best time for auspicious activities
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* The Bad Stuff - Grid */}
        {(data.rahukaal || data.guliKaal || data.yamghant_kaal) && (
          <motion.div
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
              <AlertCircle className="h-5 w-5 text-rose-500" />
              Inauspicious Timings
            </h3>

            <div className="grid gap-3 sm:grid-cols-3">
              <BadTimeCard 
                label="Rahu Kaal" 
                data={data.rahukaal} 
                formatter={formatTimeToAMPM} 
              />
              <BadTimeCard 
                label="Gulika Kalam" 
                data={data.guliKaal} 
                formatter={formatTimeToAMPM} 
              />
              <BadTimeCard 
                label="Yamaghanta" 
                data={data.yamghant_kaal} 
                formatter={formatTimeToAMPM} 
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* --- Sub Components for cleaner JSX --- */

function ElementCard({ title, icon: Icon, name, endTime, extra, formatter }: any) {
  if (!name) return null;
  return (
    <div className="flex flex-col justify-between rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-800/80">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Icon className="h-4 w-4 text-[#FF6B35]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {title}
          </span>
        </div>
        <div className="text-lg font-bold leading-tight text-gray-900 dark:text-white">
          {name}
        </div>
      </div>
      
      <div className="mt-3 border-t border-gray-200 pt-2 dark:border-gray-700">
        {endTime && (
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Ends:</span>
            <span className="font-medium">{formatter(endTime)}</span>
          </div>
        )}
        {extra && (
          <div className="mt-1 text-xs font-medium text-[#FF6B35]">
            {extra}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ label, icon: Icon, value, subValue, color }: any) {
  const colors = {
    blue: "text-blue-500",
    purple: "text-purple-500",
    pink: "text-pink-500"
  };
  
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        <Icon className={`h-4 w-4 ${colors[color as keyof typeof colors]}`} />
        {label}
      </div>
      <div>
        <div className="text-xl font-bold text-gray-900 dark:text-white">
          {value || "--"}
        </div>
        {subValue && (
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
}

function TimeRow({ label, time, icon: Icon, color }: any) {
  return (
    <div className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-white/50 dark:hover:bg-white/5">
      <div className="flex items-center gap-3">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
      </div>
      <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
        {time}
      </span>
    </div>
  );
}

function BadTimeCard({ label, data, formatter }: any) {
  if (!data) return null;
  return (
    <div className="rounded-xl bg-gray-50 p-3.5 dark:bg-gray-800">
      <div className="mb-1 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
        {label}
      </div>
      <div className="flex items-center gap-1 font-mono text-sm font-bold text-gray-900 dark:text-white">
        {formatter(data.start)} 
        <ChevronRight className="h-3 w-3 text-gray-400" /> 
        {formatter(data.end)}
      </div>
    </div>
  );
}