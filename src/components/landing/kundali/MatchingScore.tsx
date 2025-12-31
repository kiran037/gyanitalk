// src/components/landing/kundali/MatchingScore.tsx
"use client";

import { motion } from 'framer-motion';
import { 
  CheckCircle2, XCircle, AlertTriangle, TrendingUp, 
  Heart, Users, Trophy, Sparkles 
} from 'lucide-react';

interface MatchingScoreProps {
  basic: {
    score: number;
    maxScore: number;
    percentage: number;
    message: string;
  };
  aggregate: {
    score: number;
    maxScore: number;
    ashtakoot_score: string;
    dashkoot_score: string;
    message: string;
    extended_message: string;
  };
  matchType: 'north' | 'south';
  maleData: { name: string };
  femaleData: { name: string };
}

export default function MatchingScore({ 
  basic, 
  aggregate, 
  matchType,
  maleData,
  femaleData 
}: MatchingScoreProps) {
  
  // Helper to determine styling based on score
  const getCompatibilityStyle = (percentage: number) => {
    if (percentage >= 75) return { 
      label: 'Excellent Match', 
      color: 'text-emerald-600 dark:text-emerald-400', 
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-900/50',
      icon: CheckCircle2 
    };
    if (percentage >= 50) return { 
      label: 'Good Match', 
      color: 'text-amber-600 dark:text-amber-400', 
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-900/50',
      icon: TrendingUp 
    };
    if (percentage >= 36) return { 
      label: 'Average Match', 
      color: 'text-orange-600 dark:text-orange-400', 
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-900/50',
      icon: AlertTriangle 
    };
    return { 
      label: 'Below Average', 
      color: 'text-rose-600 dark:text-rose-400', 
      bg: 'bg-rose-50 dark:bg-rose-900/20',
      border: 'border-rose-200 dark:border-rose-900/50',
      icon: XCircle 
    };
  };

  const basicStyle = getCompatibilityStyle(basic.percentage);
  const aggregatePercentage = (aggregate.score / aggregate.maxScore) * 100;
  const aggStyle = getCompatibilityStyle(aggregatePercentage);

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* 1. Score Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Basic Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md sm:p-6 ${basicStyle.bg} ${basicStyle.border}`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className={`rounded-full p-1.5 bg-white/60 dark:bg-black/20 ${basicStyle.color}`}>
                  <basicStyle.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider opacity-70">
                  {matchType === 'north' ? 'Ashtakoot' : 'Dashakoot'} Score
                </span>
              </div>
              
              <div>
                <div className={`text-4xl font-black ${basicStyle.color} sm:text-5xl`}>
                  {basic.score}<span className="text-xl text-gray-400 sm:text-2xl">/{basic.maxScore}</span>
                </div>
                <div className="mt-1 font-semibold text-gray-700 dark:text-gray-200">
                  {basicStyle.label}
                </div>
              </div>

              <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                {basic.message}
              </p>
            </div>

            {/* Circular Progress */}
            <div className="flex justify-center sm:justify-end">
              <div className="relative h-20 w-20 sm:h-24 sm:w-24">
                <svg className="h-full w-full -rotate-90 transform">
                  <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="8" fill="none" className="text-black/5 dark:text-white/5" />
                  <circle
                    cx="50%" cy="50%" r="40%"
                    stroke="currentColor" strokeWidth="8" fill="none"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * basic.percentage) / 100}
                    strokeLinecap="round"
                    className={basicStyle.color}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold">{basic.percentage}%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Aggregate Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md sm:p-6 ${aggStyle.bg} ${aggStyle.border}`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className={`rounded-full p-1.5 bg-white/60 dark:bg-black/20 ${aggStyle.color}`}>
                  <Trophy className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider opacity-70">
                  Overall Compatibility
                </span>
              </div>
              
              <div>
                <div className={`text-4xl font-black ${aggStyle.color} sm:text-5xl`}>
                  {aggregate.score}<span className="text-xl text-gray-400 sm:text-2xl">/{aggregate.maxScore}</span>
                </div>
                <div className="mt-1 font-semibold text-gray-700 dark:text-gray-200">
                  {aggStyle.label}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wide sm:text-xs">
                <span className="rounded-md bg-white/50 px-2 py-1 dark:bg-black/20">
                  North: {aggregate.ashtakoot_score}
                </span>
                <span className="rounded-md bg-white/50 px-2 py-1 dark:bg-black/20">
                  South: {aggregate.dashkoot_score}
                </span>
              </div>
            </div>

            {/* Circular Progress */}
            <div className="flex justify-center sm:justify-end">
              <div className="relative h-20 w-20 sm:h-24 sm:w-24">
                <svg className="h-full w-full -rotate-90 transform">
                  <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="8" fill="none" className="text-black/5 dark:text-white/5" />
                  <circle
                    cx="50%" cy="50%" r="40%"
                    stroke="currentColor" strokeWidth="8" fill="none"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * aggregatePercentage) / 100}
                    strokeLinecap="round"
                    className={aggStyle.color}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold">{Math.round(aggregatePercentage)}%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 2. Detailed Analysis Box */}
      {aggregate.extended_message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6"
        >
          <div className="flex gap-4">
            <div className="hidden rounded-xl bg-pink-50 p-3 text-pink-500 dark:bg-pink-900/20 sm:block">
              <Heart className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 sm:hidden">
                <Heart className="h-5 w-5" />
                <h3 className="font-bold">Relationship Insight</h3>
              </div>
              <h3 className="hidden text-lg font-bold text-gray-900 dark:text-white sm:block">
                Detailed Relationship Analysis
              </h3>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {aggregate.extended_message}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. Footer Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/50"
      >
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          <Users className="h-4 w-4" />
          Compatibility Summary
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-gray-800">
            <div className="text-xs text-gray-500 mb-1">Boy: {maleData.name}</div>
            <div className="font-semibold text-gray-900 dark:text-white">Traditional: {basic.percentage}%</div>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-gray-800">
            <div className="text-xs text-gray-500 mb-1">Girl: {femaleData.name}</div>
            <div className="font-semibold text-gray-900 dark:text-white">Overall: {Math.round(aggregatePercentage)}%</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}