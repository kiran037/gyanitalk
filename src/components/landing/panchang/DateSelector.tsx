"use client";

import { motion } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  };

  const getInputValue = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [year, month, day] = e.target.value.split('-').map(Number);
    const newDate = new Date(year, month - 1, day);
    if (!isNaN(newDate.getTime())) onDateChange(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth();
  };

  return (
    <motion.div
      className="rounded-2xl border border-gray-200/70 bg-white/70 p-3 shadow-sm backdrop-blur-xl dark:border-gray-800 dark:bg-white/5 sm:p-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        
        {/* Left: Date Display */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FFB347] text-white shadow-md sm:h-12 sm:w-12">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold leading-tight text-gray-900 dark:text-white sm:text-xl">
              {formatDate(selectedDate)}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 sm:text-xs">
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
        <div className="flex items-center justify-between gap-2 rounded-xl bg-gray-50/80 p-1 dark:bg-gray-800/50 md:justify-end md:p-1.5">
          <button
            onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); onDateChange(d); }}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm transition-all active:scale-95 dark:bg-gray-700 dark:text-gray-300 sm:h-10 sm:w-10"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <div className="relative flex-1 md:flex-none">
            <input
              type="date"
              value={getInputValue(selectedDate)}
              onChange={handleDateInput}
              className="h-9 w-full min-w-[120px] cursor-pointer rounded-lg border border-transparent bg-white px-2 text-center text-xs font-semibold text-gray-700 shadow-sm focus:outline-none dark:bg-gray-700 dark:text-white sm:h-10 sm:w-auto sm:min-w-[140px] sm:px-3 sm:text-sm"
            />
          </div>

          {!isToday(selectedDate) && (
            <button
              onClick={() => onDateChange(new Date())}
              className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-white px-2 text-xs font-semibold text-gray-600 shadow-sm transition-all active:scale-95 dark:bg-gray-700 dark:text-gray-300 sm:h-10 sm:px-3 sm:text-sm"
            >
              <RotateCcw className="h-3.5 w-3.5 sm:hidden" />
              <span className="hidden sm:inline">Today</span>
            </button>
          )}

          <button
            onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); onDateChange(d); }}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-gray-600 shadow-sm transition-all active:scale-95 dark:bg-gray-700 dark:text-gray-300 sm:h-10 sm:w-10"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}