// components/landing/horoscope/TodayHighlights.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Trophy, TrendingDown, Star, Sparkles, Loader2, 
  Calendar, Medal, AlertCircle, BarChart3 
} from "lucide-react";

interface HighlightsData {
  date: string;
  summary: {
    totalSigns: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
  };
  highlights: {
    signOfTheDay: {
      zodiac: string;
      score: number;
      luckyColor: string;
      luckyColorCode: string;
      luckyNumber: string;
      message: string;
    };
    challenging: {
      zodiac: string;
      score: number;
      message: string;
    };
  };
  topThree: Array<{
    zodiac: string;
    score: number;
    luckyColor: string;
  }>;
  byCategory: {
    excellent: string[];
    veryGood: string[];
    good: string[];
    fair: string[];
    challenging: string[];
  };
}

export default function TodayHighlights() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<HighlightsData | null>(null);

  useEffect(() => {
    async function fetchHighlights() {
      try {
        const res = await fetch("/api/landing/horoscopes/highlights");
        const json = await res.json();
        if (json.success) {
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch highlights:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHighlights();
  }, []);

  const titleCase = (text?: string) =>
    text
      ? text
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : "";

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-gray-100 bg-white/50 backdrop-blur-sm dark:border-gray-800 dark:bg-white/5">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35]" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      className="space-y-6 sm:space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-gray-100 pb-4 dark:border-gray-800 sm:flex-row sm:items-end sm:justify-between sm:pb-0 sm:border-b-0">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            <Star className="h-6 w-6 text-[#FF6B35]" />
            Daily Highlights
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Celestial insights for the collective zodiac.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-1.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(data.date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Hero Grid: Best vs Challenging */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Sign of the Day */}
        <motion.div
          className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-sm dark:border-emerald-900/30 dark:from-emerald-900/20 dark:to-teal-900/20 sm:p-6"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Background Icon */}
          <div className="absolute -right-4 -top-4 opacity-[0.08] dark:opacity-[0.15]">
            <Trophy className="h-32 w-32 text-emerald-600" />
          </div>

          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 backdrop-blur-sm dark:bg-emerald-900/50 dark:text-emerald-300">
              <Trophy className="h-3.5 w-3.5" />
              Sign of the Day
            </div>

            <div className="flex items-baseline justify-between">
              <h3 className="text-3xl font-black capitalize text-gray-900 dark:text-white sm:text-4xl">
                {data.highlights.signOfTheDay.zodiac}
              </h3>
              <div className="text-right">
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 sm:text-4xl">
                  {data.highlights.signOfTheDay.score}
                </span>
                <span className="text-sm font-bold text-emerald-600/60 dark:text-emerald-400/60">/100</span>
              </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300 sm:text-base">
              {data.highlights.signOfTheDay.message}
            </p>

            {/* Lucky Factors Footer */}
            <div className="mt-6 flex flex-wrap gap-3 border-t border-emerald-100 pt-4 dark:border-emerald-800/30">
              <div className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-1.5 text-xs text-gray-700 dark:bg-black/20 dark:text-gray-300">
                <div
                  className="h-3 w-3 rounded-full shadow-sm ring-1 ring-black/5"
                  style={{ backgroundColor: data.highlights.signOfTheDay.luckyColorCode }}
                />
                <span>
                  Color: <strong>{titleCase(data.highlights.signOfTheDay.luckyColor)}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-1.5 text-xs text-gray-700 dark:bg-black/20 dark:text-gray-300">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>
                  Number: <strong>{data.highlights.signOfTheDay.luckyNumber}</strong>
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Challenging Sign */}
        <motion.div
          className="relative overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 to-rose-50 p-5 shadow-sm dark:border-orange-900/30 dark:from-orange-900/20 dark:to-rose-900/20 sm:p-6"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="absolute -right-4 -top-4 opacity-[0.08] dark:opacity-[0.15]">
            <TrendingDown className="h-32 w-32 text-orange-600" />
          </div>

          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-orange-100/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-orange-700 backdrop-blur-sm dark:bg-orange-900/50 dark:text-orange-300">
              <AlertCircle className="h-3.5 w-3.5" />
              Needs Care
            </div>

            <div className="flex items-baseline justify-between">
              <h3 className="text-3xl font-black capitalize text-gray-900 dark:text-white sm:text-4xl">
                {data.highlights.challenging.zodiac}
              </h3>
              <div className="text-right">
                <span className="text-3xl font-black text-orange-600 dark:text-orange-400 sm:text-4xl">
                  {data.highlights.challenging.score}
                </span>
                <span className="text-sm font-bold text-orange-600/60 dark:text-orange-400/60">/100</span>
              </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300 sm:text-base">
              {data.highlights.challenging.message}
            </p>
            
            <div className="mt-6 flex items-center gap-2 text-xs font-medium text-orange-800 opacity-80 dark:text-orange-200">
              <div className="h-1 flex-1 rounded-full bg-orange-200 dark:bg-orange-800" />
              <span>Practice Mindfulness Today</span>
              <div className="h-1 flex-1 rounded-full bg-orange-200 dark:bg-orange-800" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top 3 Podium */}
      <motion.div
        className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="mb-5 flex items-center gap-2 font-bold text-gray-900 dark:text-white">
          <Medal className="h-5 w-5 text-[#FF6B35]" />
          Top Performers
        </h3>

        <div className="grid gap-3 sm:grid-cols-3">
          {data.topThree.map((sign, index) => {
            // Rank Styles
            const styles = [
              { bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800", icon: "text-amber-500", text: "Gold" },
              { bg: "bg-gray-50 dark:bg-gray-800", border: "border-gray-200 dark:border-gray-700", icon: "text-gray-400", text: "Silver" },
              { bg: "bg-orange-50 dark:bg-orange-900/10", border: "border-orange-200 dark:border-orange-900/30", icon: "text-orange-700 dark:text-orange-400", text: "Bronze" },
            ][index];

            return (
              <div
                key={sign.zodiac}
                className={`flex items-center gap-3 rounded-2xl border p-3 ${styles.bg} ${styles.border}`}
              >
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white text-lg font-bold shadow-sm dark:bg-gray-900 ${styles.icon}`}>
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate font-bold capitalize text-gray-900 dark:text-white">
                      {sign.zodiac}
                    </span>
                    <span className="text-xs font-bold text-gray-500">{sign.score}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                     Lucky: {sign.luckyColor}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Category Breakdown */}
      <motion.div
        className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h3 className="mb-5 flex items-center gap-2 font-bold text-gray-900 dark:text-white">
          <BarChart3 className="h-5 w-5 text-[#FF6B35]" />
          Performance Distribution
        </h3>

        <div className="flex flex-col gap-4">
          {Object.entries(data.byCategory).map(([category, signs]) => {
            if (signs.length === 0) return null;

            const categoryStyle = {
              excellent: { label: "text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/20", pill: "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200" },
              veryGood: { label: "text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/20", pill: "bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200" },
              good: { label: "text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-900/20", pill: "bg-indigo-50 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200" },
              fair: { label: "text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/20", pill: "bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200" },
              challenging: { label: "text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-900/20", pill: "bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200" },
            }[category as keyof typeof data.byCategory];

            return (
              <div key={category} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                {/* Fixed width label for alignment */}
                <span className={`w-28 flex-shrink-0 rounded-lg py-1.5 text-center text-xs font-bold uppercase tracking-wide ${categoryStyle?.label}`}>
                  {category.replace(/([A-Z])/g, " $1").trim()}
                </span>
                
                {/* Sign Pills */}
                <div className="flex flex-wrap gap-2">
                  {signs.map((sign) => (
                    <span
                      key={sign}
                      className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition-transform hover:scale-105 ${categoryStyle?.pill}`}
                    >
                      {sign}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}