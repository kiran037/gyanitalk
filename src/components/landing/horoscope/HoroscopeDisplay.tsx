// components/landing/horoscope/HoroscopeDisplay.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ZodiacSign,
  HoroscopeType,
} from "@/app/horoscope/HoroscopeClient";
import {
  Heart,
  Briefcase,
  DollarSign,
  Home,
  Users,
  Plane,
  TrendingUp,
  Activity,
  Calendar,
  Loader2,
  Sparkles,
  Info
} from "lucide-react";

interface HoroscopeData {
  zodiac: string;
  type: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  summary: {
    totalScore: number;
    luckyColor: string;
    luckyColorCode: string;
    luckyNumber: string;
    botResponse: string;
  };
  aspects: {
    health: { score: number; remark: string | null };
    career: { score: number; remark: string | null };
    relationship: { score: number; remark: string | null };
    finances: { score: number; remark: string | null };
    family: { score: number; remark: string | null };
    friends: { score: number; remark: string | null };
    travel: { score: number; remark: string | null };
    status: { score: number; remark: string | null };
    physique: { score: number; remark: string | null };
  };
}

const ASPECT_ICONS = {
  health: Activity,
  career: Briefcase,
  relationship: Heart,
  finances: DollarSign,
  family: Home,
  friends: Users,
  travel: Plane,
  status: TrendingUp,
  physique: Activity, // Fallback icon
};

interface Props {
  zodiac: ZodiacSign;
  horoscopeType: HoroscopeType;
  onTypeChange: (type: HoroscopeType) => void;
}

export default function HoroscopeDisplay({
  zodiac,
  horoscopeType,
  onTypeChange,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<HoroscopeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function fetchHoroscope() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/landing/horoscopes/${horoscopeType}/${zodiac}`,
        );
        const json = await res.json();

        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error || "Failed to load horoscope");
        }
      } catch (err) {
        setError("Failed to load horoscope. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchHoroscope();
  }, [zodiac, horoscopeType]);

  const handleTypeChange = (type: HoroscopeType) => {
    onTypeChange(type);
    router.push(
      `/horoscope/${zodiac}?type=${type}`,
      { scroll: false }
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const capitalize = (text?: string) =>
    text ? text.charAt(0).toUpperCase() + text.slice(1) : "";

  const formatDateRange = (start?: string, end?: string) => {
    if (!start || !end) return "";
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getFullYear() === endDate.getFullYear()
    ) {
      return `${startDate.getDate()}–${endDate.getDate()} ${startDate.toLocaleDateString(
        "en-IN",
        { month: "short", year: "numeric" },
      )}`;
    }
    return `${formatDate(start)} – ${formatDate(end)}`;
  };

  const formatYear = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).getFullYear().toString();
  };

  const getUiScore = (score: number, aspect: keyof HoroscopeData["aspects"]) => {
    if (aspect === "physique") return score;
    if (horoscopeType === "yearly") return score <= 10 ? score * 10 : score;
    return score;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    if (score >= 40) return "text-orange-600 dark:text-orange-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-rose-500";
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-gray-100 bg-white/80 p-12 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#FF6B35]" />
          <p className="text-sm font-medium text-gray-500">Consulting the stars...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-gray-100 bg-white/80 p-8 text-center backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/50">
        <div className="max-w-md">
          <div className="mb-4 inline-flex rounded-full bg-red-50 p-3 text-red-500 dark:bg-red-900/20">
            <Info className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">Horoscope Unavailable</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {error || "We couldn't retrieve the celestial data at this moment."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 sm:space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Type Selector Tabs - Horizontal Scroll on Mobile */}
      <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:pb-0">
        {(["daily", "weekly", "yearly"] as const).map((type) => (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            className={`flex-shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
              horoscopeType === type
                ? "bg-[#FF6B35] text-white shadow-lg shadow-orange-500/20"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)} Forecast
          </button>
        ))}
      </div>

      {/* Main Summary Card */}
      <motion.div
        className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Decorative Background Blob */}
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#FF6B35]/5 blur-3xl" />

        <div className="relative z-10">
          {/* Header Row */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-extrabold capitalize text-gray-900 dark:text-white sm:text-3xl">
                  {data.zodiac}
                </h3>
                <span className="rounded-md bg-orange-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-[#FF6B35] dark:bg-orange-900/20">
                  {data.type}
                </span>
              </div>
              
              <div className="mt-2 flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                <Calendar className="h-4 w-4 text-[#FF6B35]" />
                {horoscopeType === "daily" && formatDate(data.date)}
                {horoscopeType === "weekly" && formatDateRange(data.startDate, data.endDate)}
                {horoscopeType === "yearly" && formatYear(data.startDate)}
              </div>
            </div>

            {/* Overall Score Badge */}
            <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/50">
              <div className="text-right">
                <div className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Cosmic Score</div>
                <div className="text-2xl font-black text-[#FF6B35]">
                  {getUiScore(data.summary.totalScore, "health")}
                  <span className="text-sm font-medium text-gray-400">/100</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF6B35] text-white shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Bot Response */}
          <div className="mb-6 rounded-xl bg-orange-50/50 p-4 leading-relaxed text-gray-700 dark:bg-orange-900/10 dark:text-gray-300 sm:p-5">
            {data.summary.botResponse}
          </div>

          {/* Lucky Factors - Only for Daily/Weekly */}
          {horoscopeType !== "yearly" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3.5 shadow-sm dark:border-gray-800 dark:bg-gray-800/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Lucky Color</p>
                  <div className="flex items-center gap-2">
                    <span 
                      className="h-3 w-3 rounded-full shadow-sm ring-1 ring-gray-200 dark:ring-gray-700" 
                      style={{ backgroundColor: data.summary.luckyColorCode }}
                    />
                    <p className="font-bold text-gray-900 dark:text-white">{capitalize(data.summary.luckyColor)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3.5 shadow-sm dark:border-gray-800 dark:bg-gray-800/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Lucky Numbers</p>
                  <p className="font-bold text-gray-900 dark:text-white">{data.summary.luckyNumber}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Aspects Grid */}
      <div className={`grid gap-4 sm:gap-6 ${
        horoscopeType === "yearly" ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      }`}>
        {Object.entries(data.aspects).map(([key, aspect], index) => {
          const Icon = ASPECT_ICONS[key as keyof typeof ASPECT_ICONS] || Activity;
          const score = getUiScore(aspect.score, key as keyof HoroscopeData["aspects"]);

          return (
            <motion.div
              key={key}
              className="group flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900 sm:p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-600 transition-colors group-hover:bg-[#FF6B35] group-hover:text-white dark:bg-gray-800 dark:text-gray-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h4 className="font-bold capitalize text-gray-900 dark:text-white">{key}</h4>
                  </div>
                  <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                    {score}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <motion.div
                    className={`h-full rounded-full ${getScoreBg(score)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                </div>

                {/* Remark Text */}
                {aspect.remark && (
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {aspect.remark}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}