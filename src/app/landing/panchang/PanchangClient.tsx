// app/landing/panchang/PanchangClient.tsx
"use client";

import { useState, useEffect } from "react";
import LandingWrapper from "@/components/landing/LandingWrapper";
import { motion, useReducedMotion } from "framer-motion";
import { Calendar, Sparkles, Sun } from "lucide-react";
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
}, [searchParams]);

  const fetchPanchang = async (date: Date) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/landing/panchang", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  const yyyyMMdd = date.toISOString().split("T")[0];
  router.push(`?date=${yyyyMMdd}`, { scroll: false });
};

  return (
    <LandingWrapper>
      {/* Hero Section */}
      <section className="relative flex min-h-[45vh] items-center justify-center overflow-hidden px-4 pb-6 pt-24 sm:min-h-[50vh] sm:px-6 sm:pb-8 sm:pt-28 lg:px-8">
        {/* Animated Grid Background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255, 107, 53, 0.06) 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Floating Particles */}
        {!prefersReducedMotion && (
          <div className="hidden sm:block">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="pointer-events-none absolute"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0.15, 0.4, 0.15],
                  scale: [1, 1.8, 1],
                  x: [0, Math.random() * 60 - 30, 0],
                  y: [0, Math.random() * 60 - 30, 0],
                }}
                transition={{
                  duration: 12 + i * 1.5,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeInOut",
                }}
                style={{
                  left: `${10 + (i % 4) * 25}%`,
                  top: `${15 + Math.floor(i / 4) * 30}%`,
                }}
              >
                <Sun className="h-4 w-4 text-[#FF6B35]" fill="currentColor" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Gradient Orbs */}
        {!prefersReducedMotion && (
          <>
            <motion.div
              className="absolute -left-1/4 top-1/4 hidden h-96 w-96 rounded-full bg-[#FF6B35] opacity-20 mix-blend-multiply blur-3xl filter dark:opacity-10 md:block"
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 50, 0],
                y: [0, 30, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -right-1/4 top-1/3 hidden h-96 w-96 rounded-full bg-[#FFB347] opacity-20 mix-blend-multiply blur-3xl filter dark:opacity-10 md:block"
              animate={{
                scale: [1, 1.3, 1],
                x: [0, -30, 0],
                y: [0, 50, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
          </>
        )}

        <div className="relative z-10 mx-auto w-full max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-5 sm:space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/20 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 px-3 py-1.5 backdrop-blur-sm sm:px-4 sm:py-2">
              <Calendar className="h-4 w-4 text-[#FF6B35]" />
              <span className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                DAILY PANCHANG
              </span>
            </div>

            <div className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-gray-900 dark:text-white">Your </span>
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                Sacred Calendar
              </span>
            </div>

            <p className="mx-auto max-w-3xl text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-lg">
              Discover auspicious timings and plan your day according to Vedic wisdom
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="space-y-6">
            {/* Date Selector */}
            <DateSelector
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
            />

            {/* Panchang Display */}
            <PanchangDisplay
              data={panchangData}
              loading={loading}
              error={error}
              selectedDate={selectedDate}
            />

            {/* Info Section */}
            <PanchangInfo />
          </div>
        </div>
      </section>
    </LandingWrapper>
  );
}