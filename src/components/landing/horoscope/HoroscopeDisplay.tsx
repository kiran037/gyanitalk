// components/landing/horoscope/HoroscopeDisplay.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ZodiacSign,
  HoroscopeType,
} from "@/app/landing/horoscope/HoroscopeClient";
import {
  Heart,
  Briefcase,
  DollarSign,
  Home,
  Users,
  Plane,
  TrendingUp,
  Activity,
  Sparkles,
  Calendar,
  Loader2,
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
  physique: Activity,
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

    // Same month & year → "8–14 Dec 2025"
    if (
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getFullYear() === endDate.getFullYear()
    ) {
      return `${startDate.getDate()}–${endDate.getDate()} ${startDate.toLocaleDateString(
        "en-IN",
        { month: "short", year: "numeric" },
      )}`;
    }

    // Different months → "21 Oct 2025 – 21 Dec 2025"
    return `${formatDate(start)} – ${formatDate(end)}`;
  };

  const formatYear = (dateStr?: string) => {
    if (!dateStr) return "";

    return new Date(dateStr).getFullYear().toString();
  };

  const getUiScore = (
    score: number,
    aspect: keyof HoroscopeData["aspects"],
  ) => {
    // Physique is always already 0–100
    if (aspect === "physique") {
      return score;
    }

    // Yearly may be 0–10 OR 0–100
    if (horoscopeType === "yearly") {
      // If it looks like 0–10, scale it
      return score <= 10 ? score * 10 : score;
    }

    // Daily / Weekly already 0–100
    return score;
  };
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 40) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

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

  if (error || !data) {
    return (
      <motion.div
        className="rounded-2xl border border-gray-200/70 bg-white/70 p-8 text-center backdrop-blur-xl dark:border-gray-800 dark:bg-white/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-gray-600 dark:text-gray-400">
          {error || "No horoscope data available"}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Type Selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["daily", "weekly", "yearly"] as const).map((type) => (
          <motion.button
            key={type}
            onClick={() => onTypeChange(type)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              horoscopeType === type
                ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-md"
                : "border border-gray-200/70 bg-white/70 text-gray-700 dark:border-gray-700/70 dark:bg-white/5 dark:text-gray-300"
            }`}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Summary Card */}
      <motion.div
        className="rounded-2xl border border-gray-200/70 bg-white/70 p-6 backdrop-blur-xl dark:border-gray-800 dark:bg-white/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="mb-1 text-2xl font-bold capitalize text-gray-900 dark:text-white">
              {data.zodiac} - {data.type}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              {horoscopeType === "daily" && formatDate(data.date)}

              {horoscopeType === "weekly" &&
                formatDateRange(data.startDate, data.endDate)}

              {horoscopeType === "yearly" && formatYear(data.startDate)}
            </div>
          </div>
          <div className="text-right">
            <div className="mb-1 text-3xl font-bold text-[#FF6B35]">
              {getUiScore(data.summary.totalScore, "health")}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Overall Score
            </div>
          </div>
        </div>

        <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
          {data.summary.botResponse}
        </p>

        {horoscopeType !== "yearly" && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-gray-50/80 p-3 dark:bg-gray-800/60">
              <div className="mb-1 text-xs text-gray-600 dark:text-gray-400">
                Lucky Color
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-5 w-5 rounded-full ring-2 ring-white dark:ring-gray-800"
                  style={{ backgroundColor: data.summary.luckyColorCode }}
                />
               <span className="font-semibold text-gray-900 dark:text-white">
  {capitalize(data.summary.luckyColor)}
</span>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50/80 p-3 dark:bg-gray-800/60">
              <div className="mb-1 text-xs text-gray-600 dark:text-gray-400">
                Lucky Numbers
              </div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {data.summary.luckyNumber}
              </div>
            </div>
          </div>
        )}
      </motion.div>
      {/* Aspects Grid */}
      <div
        className={`grid gap-4 ${
          horoscopeType === "yearly"
            ? "grid-cols-1"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {Object.entries(data.aspects).map(([key, aspect], index) => {
          const Icon = ASPECT_ICONS[key as keyof typeof ASPECT_ICONS];

          return (
            <motion.div
              key={key}
              className="rounded-2xl border border-gray-200/70 bg-white/70 p-5 backdrop-blur-xl dark:border-gray-800 dark:bg-white/5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-[#FF6B35]/10 p-2">
                    <Icon className="h-4 w-4 text-[#FF6B35]" />
                  </div>
                  <h4 className="font-semibold capitalize text-gray-900 dark:text-white">
                    {key}
                  </h4>
                </div>
                <div
                  className={`text-xl font-bold ${getScoreColor(
                    getUiScore(
                      aspect.score,
                      key as keyof HoroscopeData["aspects"],
                    ),
                  )}`}
                >
                  {getUiScore(
                    aspect.score,
                    key as keyof HoroscopeData["aspects"],
                  )}
                  /100
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <motion.div
                  className={`h-full ${getScoreBg(
                    getUiScore(
                      aspect.score,
                      key as keyof HoroscopeData["aspects"],
                    ),
                  )}`}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${getUiScore(
                      aspect.score,
                      key as keyof HoroscopeData["aspects"],
                    )}%`,
                  }}
                  transition={{ duration: 0.8, delay: index * 0.05 }}
                />
              </div>

              {aspect.remark && (
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {aspect.remark}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
