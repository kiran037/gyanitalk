// components/landing/panchang/DateSelector.tsx
"use client";

import { motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

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

  // Helper to format date for input value (YYYY-MM-DD)
  // We use local time components to avoid timezone shifts
  const getInputValue = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    if (!e.target.value) return;
    
    // Parse manually to ensure local time construction
    const [year, month, day] = e.target.value.split('-').map(Number);
    const newDate = new Date(year, month - 1, day);
    
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
      className="rounded-2xl border border-gray-200/70 bg-white/70 p-4 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-white/5 sm:p-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        
        {/* Left: Date Display */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FFB347] text-white shadow-md">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight text-gray-900 dark:text-white sm:text-xl">
              {formatDate(selectedDate)}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Panchang Date
              </span>
              {isToday(selectedDate) && (
                <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#FF6B35] dark:bg-orange-900/30">
                  Today
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Controls Toolbar */}
        <div className="flex items-center justify-between gap-2 rounded-xl bg-gray-50/80 p-1.5 dark:bg-gray-800/50 md:justify-end">
          
          {/* Previous Button */}
          <button
            onClick={handlePrevDay}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-[#FF6B35] active:scale-95 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            aria-label="Previous Day"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Date Picker Input */}
          <div className="relative flex-1 md:flex-none">
            <input
              type="date"
              value={getInputValue(selectedDate)}
              onChange={handleDateInput}
              className="h-10 w-full min-w-[140px] cursor-pointer rounded-lg border border-transparent bg-white px-3 text-center text-sm font-semibold text-gray-700 shadow-sm focus:border-[#FF6B35] focus:outline-none focus:ring-1 focus:ring-[#FF6B35] dark:bg-gray-700 dark:text-white sm:w-auto"
            />
          </div>

          {/* Today Button (Responsive Icon/Text) */}
          {!isToday(selectedDate) && (
            <button
              onClick={handleToday}
              className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-white px-3 text-sm font-semibold text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-[#FF6B35] active:scale-95 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              title="Go to Today"
            >
              <RotateCcw className="h-4 w-4 md:hidden" />
              <span className="hidden md:inline">Today</span>
            </button>
          )}

          {/* Next Button */}
          <button
            onClick={handleNextDay}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-[#FF6B35] active:scale-95 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            aria-label="Next Day"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}