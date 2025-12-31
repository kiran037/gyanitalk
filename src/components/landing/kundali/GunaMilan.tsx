// src/components/landing/kundali/GunaMilan.tsx
"use client";

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Minus, Layers, User, Heart } from 'lucide-react';

interface GunaMilanProps {
  matchDetails: Array<{
    key: string;
    title: string;
    boy_value: any;
    girl_value: any;
    score: number;
    full_score: number;
    description: string;
  }>;
  maleData: { name: string };
  femaleData: { name: string };
}

export default function GunaMilan({ matchDetails, maleData, femaleData }: GunaMilanProps) {
  
  // Helper for scoring logic styles
  const getScoreStyles = (score: number, fullScore: number) => {
    const percentage = (score / fullScore) * 100;
    if (percentage === 100) return {
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500",
      border: "border-emerald-100 dark:border-emerald-900/30",
      lightBg: "bg-emerald-50 dark:bg-emerald-900/10",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />
    };
    if (percentage >= 50) return {
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500",
      border: "border-amber-100 dark:border-amber-900/30",
      lightBg: "bg-amber-50 dark:bg-amber-900/10",
      icon: <Minus className="h-5 w-5 text-amber-500" />
    };
    return {
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500",
      border: "border-rose-100 dark:border-rose-900/30",
      lightBg: "bg-rose-50 dark:bg-rose-900/10",
      icon: <XCircle className="h-5 w-5 text-rose-500" />
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6"
    >
      {/* Section Header */}
      <div className="mb-6 flex flex-col gap-2 border-b border-gray-100 pb-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-900/20">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Guna Milan Details
            </h2>
            <p className="text-xs text-gray-500">
              Breakdown of the 8 Kootas (Ashtakoot)
            </p>
          </div>
        </div>
        <div className="hidden text-xs font-medium text-gray-400 sm:block">
          {matchDetails.length} Parameters Analyzed
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {matchDetails.map((detail, idx) => {
          const styles = getScoreStyles(detail.score, detail.full_score);
          const percentage = (detail.score / detail.full_score) * 100;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex flex-col justify-between rounded-xl border p-4 transition-all hover:shadow-md ${styles.border} ${styles.lightBg}`}
            >
              {/* Card Header */}
              <div>
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {detail.title}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-lg font-black ${styles.color}`}>
                      {detail.score}
                    </span>
                    <span className="text-xs font-medium text-gray-400">
                      / {detail.full_score}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-white dark:bg-black/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + (idx * 0.05) }}
                    className={`h-full rounded-full ${styles.bg}`}
                  />
                </div>

                {/* Comparison Box */}
                {(detail.boy_value || detail.girl_value) && (
                  <div className="mb-3 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-gray-200 bg-gray-200 dark:border-gray-700 dark:bg-gray-700">
                    {/* Boy */}
                    <div className="bg-white p-2 text-center dark:bg-gray-800">
                      <div className="mb-1 flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-blue-500">
                        <User className="h-3 w-3" />
                        Boy
                      </div>
                      <div className="truncate text-xs font-semibold text-gray-900 dark:text-gray-100" title={String(detail.boy_value)}>
                        {detail.boy_value || '-'}
                      </div>
                    </div>
                    {/* Girl */}
                    <div className="bg-white p-2 text-center dark:bg-gray-800">
                      <div className="mb-1 flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-pink-500">
                        <Heart className="h-3 w-3" />
                        Girl
                      </div>
                      <div className="truncate text-xs font-semibold text-gray-900 dark:text-gray-100" title={String(detail.girl_value)}>
                        {detail.girl_value || '-'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Description Footer */}
              <div className="mt-2 border-t border-gray-200/50 pt-2 dark:border-gray-700/30">
                <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  {detail.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}