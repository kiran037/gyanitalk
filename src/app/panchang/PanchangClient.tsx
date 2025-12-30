// app/landing/panchang/PanchangClient.tsx
"use client";

import { useState, useEffect } from "react";
import LandingWrapper from "@/components/landing/LandingWrapper";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Calendar, Sun, Sparkles, Loader2, Info } from "lucide-react";
import DateSelector from "@/components/landing/panchang/DateSelector";
import PanchangDisplay from "@/components/landing/panchang/PanchangDisplay";
import PanchangInfo from "@/components/landing/panchang/PanchangInfo";
import { useRouter, useSearchParams } from "next/navigation";

export default function PanchangClient() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [panchangData, setPanchangData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();

  // Sync with URL params on load
  useEffect(() => {
    const dateParam = searchParams.get("date");
    let dateToUse = selectedDate;

    if (dateParam) {
      const parsedDate = new Date(dateParam);
      if (!isNaN(parsedDate.getTime())) {
        dateToUse = parsedDate;
        setSelectedDate(parsedDate);
      }
    }

    fetchPanchang(dateToUse);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchPanchang = async (date: Date) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/landing/panchang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day: date.getDate(),
          month: date.getMonth() + 1,
          year: date.getFullYear(),
          language: "en",
        }),
      });

      const json = await response.json();

      if (json.success) {
        setPanchangData(json.data);
      } else {
        setError(json.error || "Failed to fetch Panchang data");
      }
    } catch (err) {
      setError("Failed to fetch Panchang data. Please try again.");
      console.error("Panchang fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    // Format date as YYYY-MM-DD manually to avoid timezone shifts
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    const yyyyMMdd = adjustedDate.toISOString().split("T")[0];
    
    router.push(`?date=${yyyyMMdd}`, { scroll: false });
  };

  return (
    <LandingWrapper>
      {/* ================= HERO SECTION ================= */}
      <section className="relative flex min-h-[40vh] items-center justify-center overflow-hidden px-4 pb-8 pt-24 sm:min-h-[50vh] sm:px-6 sm:pt-32 lg:px-8">
        {/* Background Patterns */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(#FF6B35_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.03] dark:opacity-[0.05]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white dark:via-gray-950/50 dark:to-gray-950" />
        </div>

        {/* Floating Elements (Hidden on mobile for performance) */}
        {!prefersReducedMotion && (
          <div className="hidden md:block">
            <motion.div
              className="absolute left-[10%] top-[20%] h-64 w-64 rounded-full bg-orange-400/20 blur-[100px]"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div
              className="absolute right-[10%] top-[30%] h-64 w-64 rounded-full bg-yellow-400/20 blur-[100px]"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 10, repeat: Infinity, delay: 1 }}
            />
          </div>
        )}

        <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-4 sm:gap-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/20 bg-orange-50/50 px-3 py-1.5 backdrop-blur-sm dark:bg-orange-900/10 sm:px-4 sm:py-2">
              <Calendar className="h-3.5 w-3.5 text-[#FF6B35] sm:h-4 sm:w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B35] sm:text-xs">
                Daily Vedic Calendar
              </span>
            </div>

            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
              Your <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">Sacred Timing</span> Guide
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-lg">
              Align your activities with cosmic rhythms. Discover Tithi, Nakshatra, Yoga, and auspicious Muhurats for the day.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ================= MAIN CONTENT ================= */}
      <section className="relative z-20 px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
          
          {/* 1. Date Selector - Sticky on Mobile for better UX */}
          <div className="sticky top-[64px] z-30 -mx-4 bg-white/80 px-4 py-2 backdrop-blur-md dark:bg-gray-950/80 sm:static sm:mx-0 sm:bg-transparent sm:p-0">
             <DateSelector
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
            />
          </div>

          {/* 2. Content Area */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-64 flex-col items-center justify-center gap-3 rounded-3xl border border-gray-100 bg-white/50 p-8 text-center backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/50"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35]" />
                  <p className="text-sm font-medium text-gray-500">Calculating planetary positions...</p>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex h-64 flex-col items-center justify-center gap-4 rounded-3xl border border-red-100 bg-red-50/50 p-8 text-center dark:border-red-900/30 dark:bg-red-900/10"
                >
                  <div className="rounded-full bg-red-100 p-3 text-red-500 dark:bg-red-900/30">
                    <Info className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Unable to load Panchang</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{error}</p>
                  </div>
                  <button 
                    onClick={() => fetchPanchang(selectedDate)}
                    className="mt-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <PanchangDisplay
                    data={panchangData}
                    loading={loading}
                    error={error}
                    selectedDate={selectedDate}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Educational Info - Separate container for cleaner reading */}
          <div className="pt-8">
            <PanchangInfo />
          </div>

        </div>
      </section>
    </LandingWrapper>
  );
}