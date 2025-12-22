// components/landing/horoscope/TodayHighlights.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, TrendingDown, Star, Sparkles, Loader2 } from "lucide-react";

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
      luckyColor: string; // "Red"
      luckyColorCode: string; // "#FF0000"
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

  if (!data) return null;

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
          <Star className="h-5 w-5 text-[#FF6B35]" />
          Today's Horoscope Highlights
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(data.date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Sign of the Day & Challenging */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Sign of the Day */}
        <motion.div
          className="relative overflow-hidden rounded-2xl border border-gray-200/70 bg-gradient-to-br from-green-50 to-emerald-50 p-6 backdrop-blur-xl dark:border-gray-800 dark:from-green-900/20 dark:to-emerald-900/20"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="absolute right-4 top-4 opacity-10">
            <Trophy className="h-20 w-20 text-green-500" />
          </div>

          <div className="relative z-10">
            <div className="mb-2 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-xs font-bold uppercase text-green-600 dark:text-green-400">
                Sign of the Day
              </span>
            </div>

            <h3 className="mb-1 text-2xl font-bold capitalize text-gray-900 dark:text-white">
              {data.highlights.signOfTheDay.zodiac}
            </h3>

            <div className="mb-3 text-3xl font-bold text-green-600 dark:text-green-400">
              {data.highlights.signOfTheDay.score}/100
            </div>

            <p className="mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {data.highlights.signOfTheDay.message}
            </p>

            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <div
                  className="h-4 w-4 rounded-full ring-2 ring-white dark:ring-gray-800"
                  style={{
                    backgroundColor:
                      data.highlights.signOfTheDay.luckyColorCode,
                  }}
                />
                <span>
                  Lucky Color:{" "}
                  <strong>{data.highlights.signOfTheDay.luckyColor}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>
                  Lucky Number:{" "}
                  <strong>{data.highlights.signOfTheDay.luckyNumber}</strong>
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Challenging Sign */}
        <motion.div
          className="relative overflow-hidden rounded-2xl border border-gray-200/70 bg-gradient-to-br from-orange-50 to-red-50 p-6 backdrop-blur-xl dark:border-gray-800 dark:from-orange-900/20 dark:to-red-900/20"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="absolute right-4 top-4 opacity-10">
            <TrendingDown className="h-20 w-20 text-orange-500" />
          </div>

          <div className="relative z-10">
            <div className="mb-2 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <span className="text-xs font-bold uppercase text-orange-600 dark:text-orange-400">
                Needs Extra Care
              </span>
            </div>

            <h3 className="mb-1 text-2xl font-bold capitalize text-gray-900 dark:text-white">
              {data.highlights.challenging.zodiac}
            </h3>

            <div className="mb-3 text-3xl font-bold text-orange-600 dark:text-orange-400">
              {data.highlights.challenging.score}/100
            </div>

            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {data.highlights.challenging.message}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Top 3 Signs */}
      <motion.div
        className="rounded-2xl border border-gray-200/70 bg-white/70 p-5 backdrop-blur-xl dark:border-gray-800 dark:bg-white/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900 dark:text-white">
          <Trophy className="h-4 w-4 text-[#FF6B35]" />
          Top 3 Signs Today
        </h3>

        <div className="grid gap-3 sm:grid-cols-3">
          {data.topThree.map((sign, index) => (
            <div
              key={sign.zodiac}
              className="flex items-center gap-3 rounded-xl bg-gray-50/80 p-3 dark:bg-gray-800/60"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-sm font-bold text-white">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold capitalize text-gray-900 dark:text-white">
                  {sign.zodiac}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Score: {sign.score}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Category Distribution */}
      <motion.div
        className="rounded-2xl border border-gray-200/70 bg-white/70 p-5 backdrop-blur-xl dark:border-gray-800 dark:bg-white/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h3 className="mb-4 font-bold text-gray-900 dark:text-white">
          Signs by Performance
        </h3>

        <div className="space-y-3">
          {Object.entries(data.byCategory).map(([category, signs]) => {
            if (signs.length === 0) return null;

            const colors = {
              excellent:
                "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
              veryGood:
                "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
              good: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20",
              fair: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20",
              challenging:
                "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
            };

            return (
              <div key={category} className="flex items-start gap-3">
                <span
                  className={`rounded-lg px-2 py-1 text-xs font-bold capitalize ${colors[category as keyof typeof colors]}`}
                >
                  {category.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {signs.map((sign) => (
                    <span
                      key={sign}
                      className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium capitalize text-gray-700 dark:bg-gray-800 dark:text-gray-300"
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
