'use client';

import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  TrendingUp,
  Heart,
  Users
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
  
  const getCompatibilityLevel = (percentage: number) => {
    if (percentage >= 75) return { text: 'Excellent', color: 'green', icon: CheckCircle2 };
    if (percentage >= 60) return { text: 'Good', color: 'blue', icon: TrendingUp };
    if (percentage >= 50) return { text: 'Average', color: 'yellow', icon: AlertTriangle };
    return { text: 'Below Average', color: 'red', icon: XCircle };
  };

  const basicCompat = getCompatibilityLevel(basic.percentage);
  const BasicIcon = basicCompat.icon;

  const aggregatePercentage = (aggregate.score / aggregate.maxScore) * 100;
  const aggregateCompat = getCompatibilityLevel(aggregatePercentage);
  const AggregateIcon = aggregateCompat.icon;

  return (
    <div className="space-y-4">
      {/* Main Score Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Basic Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[#FF6B35]/20 bg-gradient-to-br from-[#FF6B35]/10 to-[#FFB347]/10 p-6 backdrop-blur-sm"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BasicIcon className={`h-5 w-5 text-${basicCompat.color}-600`} />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {matchType === 'north' ? 'Ashtakoot' : 'Dashakoot'} Score
                </span>
              </div>
              
              <div className="space-y-1">
                <div className={`text-3xl font-bold text-${basicCompat.color}-600`}>
                  {basic.score}/{basic.maxScore}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {basic.percentage}% Compatible
                </div>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400">
                {basic.message}
              </p>
            </div>

            {/* Circular Progress */}
            <div className="relative h-20 w-20">
              <svg className="h-20 w-20 -rotate-90 transform">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="url(#basicGradient)"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${(basic.percentage / 100) * 226} 226`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="basicGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF6B35" />
                    <stop offset="100%" stopColor="#FFB347" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {basic.percentage}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Aggregate Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-purple-200/60 bg-gradient-to-br from-purple-50/60 to-pink-50/60 p-6 backdrop-blur-sm dark:border-purple-900/60 dark:from-purple-900/10 dark:to-pink-900/10"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AggregateIcon className={`h-5 w-5 text-${aggregateCompat.color}-600`} />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Overall Compatibility
                </span>
              </div>
              
              <div className="space-y-1">
                <div className={`text-3xl font-bold text-${aggregateCompat.color}-600`}>
                  {aggregate.score}/{aggregate.maxScore}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {Math.round(aggregatePercentage)}% Match
                </div>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400">
                {aggregate.message}
              </p>

              <div className="mt-3 flex gap-2 text-xs">
                <div className="rounded-lg bg-white/60 px-2 py-1 dark:bg-gray-900/60">
                  <span className="font-medium text-gray-900 dark:text-white">
                    North: {aggregate.ashtakoot_score}
                  </span>
                </div>
                <div className="rounded-lg bg-white/60 px-2 py-1 dark:bg-gray-900/60">
                  <span className="font-medium text-gray-900 dark:text-white">
                    South: {aggregate.dashkoot_score}
                  </span>
                </div>
              </div>
            </div>

            {/* Circular Progress */}
            <div className="relative h-20 w-20">
              <svg className="h-20 w-20 -rotate-90 transform">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="url(#aggregateGradient)"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${(aggregatePercentage / 100) * 226} 226`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="aggregateGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#9333EA" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {Math.round(aggregatePercentage)}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Extended Message */}
      {aggregate.extended_message && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-gray-200/60 bg-white/60 p-4 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
        >
          <div className="flex items-start gap-3">
            <Heart className="h-5 w-5 flex-shrink-0 text-[#FF6B35]" />
            <div className="flex-1">
              <h3 className="mb-2 text-sm font-bold text-gray-900 dark:text-white">
                Detailed Analysis
              </h3>
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {aggregate.extended_message}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Compatibility Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-gray-200/60 bg-white/60 p-4 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
      >
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-[#FF6B35]" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Compatibility Summary
          </h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-blue-200/60 bg-blue-50/60 p-3 dark:border-blue-900/60 dark:bg-blue-900/10">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              {maleData.name}
            </div>
            <div className="text-sm font-bold text-blue-900 dark:text-blue-100">
              Traditional Match: {basic.percentage}%
            </div>
          </div>

          <div className="rounded-lg border border-pink-200/60 bg-pink-50/60 p-3 dark:border-pink-900/60 dark:bg-pink-900/10">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              {femaleData.name}
            </div>
            <div className="text-sm font-bold text-pink-900 dark:text-pink-100">
              Overall Match: {Math.round(aggregatePercentage)}%
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}