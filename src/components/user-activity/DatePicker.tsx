"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cx } from "@/components/GlassUI/GlassKit";
import { createPortal } from "react-dom";

export default function DatePicker({ 
  selectedDate 
}: { 
  selectedDate: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect());
    }
  }, [isOpen]);

  // Parse selected date or default to today
  const parseDate = (dateStr: string | null) => {
    if (!dateStr) return new Date();
    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const [viewDate, setViewDate] = useState(() => parseDate(selectedDate));

  const formatDateId = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const selectedDateObj = selectedDate ? parseDate(selectedDate) : null;

  const handleDateSelect = (date: Date) => {
    const dateId = formatDateId(date);
    setIsOpen(false);
    
    // Use startTransition for instant UI feedback
    startTransition(() => {
      router.push(`?date=${dateId}`, { scroll: false });
    });
  };

  // Calendar generation
  const generateCalendar = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    // Add padding for days before month starts
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }
    
    // Add actual days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const days = generateCalendar(viewDate);
  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Min date: July 1, 2025
  const minDate = new Date(2025, 6, 1); // Month is 0-indexed
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const canGoPrevMonth = () => {
    const prevMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    return prevMonth >= minDate;
  };

  const canGoNextMonth = () => {
    const nextMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    return nextMonth <= today;
  };

  const isDateDisabled = (date: Date | null) => {
    if (!date) return true;
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    return dateOnly < minDate || dateOnly > today;
  };

  const isDateSelected = (date: Date | null) => {
    if (!date || !selectedDateObj) return false;
    return formatDateId(date) === formatDateId(selectedDateObj);
  };

  const dropdownContent = isOpen && buttonRect && (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998]"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Dropdown - Positioned using fixed */}
      <div
        style={{
          position: 'fixed',
          top: buttonRect.bottom + 8,
          left: buttonRect.left,
          width: '320px'
        }}
        className={cx(
          "z-[9999] p-4",
          "rounded-2xl border",
          "border-slate-200 bg-white",
          "dark:border-white/10 dark:bg-gray-900",
          "shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
        )}
      >
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}
            disabled={!canGoPrevMonth()}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="font-semibold text-slate-900 dark:text-white">
            {monthName}
          </span>
          <button
            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}
            disabled={!canGoNextMonth()}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, idx) => {
            const disabled = isDateDisabled(date);
            const selected = isDateSelected(date);
            
            return (
              <button
                key={idx}
                onClick={() => date && !disabled && handleDateSelect(date)}
                disabled={disabled}
                className={cx(
                  "aspect-square rounded-lg text-sm font-medium transition-all",
                  !date && "invisible",
                  disabled && "text-slate-300 dark:text-slate-700 cursor-not-allowed",
                  !disabled && !selected && "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08]",
                  selected && "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                {date?.getDate()}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10">
          <button
            onClick={() => handleDateSelect(new Date())}
            className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            Today
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={cx(
          "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border text-sm",
          "border-slate-200 bg-white text-slate-900",
          "dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-100",
          "hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-all",
          isPending && "opacity-60 cursor-wait"
        )}
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-500" />
          <span className="font-medium">
            {selectedDateObj 
              ? selectedDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : "Select a date"}
          </span>
        </div>
        {isPending && (
          <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
      </button>

      {mounted && dropdownContent && createPortal(dropdownContent, document.body)}
    </>
  );
}