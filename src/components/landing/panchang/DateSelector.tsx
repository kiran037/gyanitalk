// components/landing/panchang/DateSelector.tsx
"use client";

import { motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DateSelector({
  selectedDate,
  onDateChange,
}: DateSelectorProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      onDateChange(newDate);
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <motion.div
      className="rounded-2xl border border-gray-200/70 bg-white/70 p-5 backdrop-blur-xl dark:border-gray-800 dark:bg-white/5 sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Date Display */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FFB347] p-3">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
              {formatDate(selectedDate)}
            </h2>
            {isToday(selectedDate) && (
              <span className="text-sm text-[#FF6B35]">Today</span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Previous Day */}
          <motion.button
            onClick={handlePrevDay}
            className="rounded-xl border border-gray-200/70 bg-white/60 p-2.5 text-gray-700 backdrop-blur-sm transition-colors hover:bg-gray-50 dark:border-gray-700/70 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-gray-800/60"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Previous day"
          >
            <ChevronLeft className="h-5 w-5" />
          </motion.button>

          {/* Today Button */}
          {!isToday(selectedDate) && (
            <motion.button
              onClick={handleToday}
              className="rounded-xl border border-gray-200/70 bg-white/60 px-4 py-2.5 text-sm font-medium text-gray-700 backdrop-blur-sm transition-colors hover:bg-gray-50 dark:border-gray-700/70 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-gray-800/60"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Today
            </motion.button>
          )}

          {/* Date Picker */}
          <div className="relative">
            <input
              type="date"
              value={selectedDate.toISOString().split("T")[0]}
              onChange={handleDateInput}
              className="rounded-xl border border-gray-200/70 bg-white/60 px-4 py-2.5 text-sm font-medium text-gray-700 backdrop-blur-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 dark:border-gray-700/70 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-gray-800/60"
            />
          </div>

          {/* Next Day */}
          <motion.button
            onClick={handleNextDay}
            className="rounded-xl border border-gray-200/70 bg-white/60 p-2.5 text-gray-700 backdrop-blur-sm transition-colors hover:bg-gray-50 dark:border-gray-700/70 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-gray-800/60"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Next day"
          >
            <ChevronRight className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}