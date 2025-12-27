'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Circle } from 'lucide-react';

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
  
  const getScoreIcon = (score: number, fullScore: number) => {
    const percentage = (score / fullScore) * 100;
    if (percentage >= 75) return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (percentage >= 50) return <Circle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getScoreColor = (score: number, fullScore: number) => {
    const percentage = (score / fullScore) * 100;
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number, fullScore: number) => {
    const percentage = (score / fullScore) * 100;
    if (percentage >= 75) return 'text-green-500';
    if (percentage >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-200/60 bg-white/60 p-6 backdrop-blur-sm dark:border-gray-700/60 dark:bg-white/5"
    >
      <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
        Detailed Guna Milan Analysis ({matchDetails.length} Parameters)
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {matchDetails.map((detail, idx) => {
          const percentage = (detail.score / detail.full_score) * 100;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-lg border border-gray-200/60 bg-white/60 p-4 transition-all hover:border-[#FF6B35]/30 hover:shadow-md dark:border-gray-700/60 dark:bg-white/5"
            >
              {/* Header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getScoreIcon(detail.score, detail.full_score)}
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {detail.title}
                  </h3>
                </div>
                <div className={`text-lg font-bold ${getScoreColor(detail.score, detail.full_score)}`}>
                  {detail.score}
                  <span className="text-xs text-gray-500">/{detail.full_score}</span>
                </div>
              </div>

              {/* Description */}
              <p className="mb-3 text-xs text-gray-600 dark:text-gray-400">
                {detail.description}
              </p>

              {/* Circular Progress */}
              <div className="mb-3 flex items-center gap-3">
                <div className="relative h-14 w-14 flex-shrink-0">
                  <svg className="h-14 w-14 -rotate-90 transform">
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${(percentage / 100) * 150.8} 150.8`}
                      strokeLinecap="round"
                      className={getProgressColor(detail.score, detail.full_score)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Values */}
                {(detail.boy_value || detail.girl_value) && (
                  <div className="flex-1 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-blue-900 dark:text-blue-300">
                        {maleData.name}:
                      </span>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-900 dark:bg-blue-900/30 dark:text-blue-100">
                        {String(detail.boy_value || 'N/A')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-pink-900 dark:text-pink-300">
                        {femaleData.name}:
                      </span>
                      <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs font-bold text-pink-900 dark:bg-pink-900/30 dark:text-pink-100">
                        {String(detail.girl_value || 'N/A')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={`h-full transition-all duration-500 ${
                    percentage >= 75
                      ? 'bg-green-500'
                      : percentage >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}