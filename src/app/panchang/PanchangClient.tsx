"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import LandingWrapper from "@/components/landing/LandingWrapper";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Loader2, Moon as MoonIcon, ChevronDown } from "lucide-react";
import DateSelector from "@/components/landing/panchang/DateSelector";
import PanchangDisplay from "@/components/landing/panchang/PanchangDisplay";
import PanchangExtendedInfo from "@/components/landing/panchang/PanchangExtendedInfo";
import { useRouter, useSearchParams } from "next/navigation";

const CosmicScene = dynamic(() => import("@/components/landing/panchang/3d/CosmicScene"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-transparent" />
});

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchPanchang = async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;

      const response = await fetch("/api/landing/panchang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formattedDate,
          lat: 28.6139,
          lon: 77.2090,
          tz: 5.5,
          time: "05:20",
          lang: "en",
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
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    const yyyyMMdd = adjustedDate.toISOString().split("T")[0];
    router.push(`?date=${yyyyMMdd}`, { scroll: false });
  };

  return (
    <LandingWrapper>
      {/* 
         HERO SECTION: 
         Forced 'bg-gray-950' and 'text-white' to ensure 3D scene looks good 
         regardless of Light/Dark mode preference. 
      */}
      <section className="relative flex min-h-[50vh] flex-col items-center justify-center overflow-hidden bg-gray-950 px-4 pb-12 pt-20 text-white sm:min-h-[65vh] sm:px-6 lg:px-8">
        
        {/* Dark Backgrounds for 3D Contrast */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-gray-950/60 to-gray-950" />
        
        {/* 3D Scene */}
        <div className="absolute inset-0 z-10 opacity-80 mix-blend-screen">
          {!prefersReducedMotion && (
            <Suspense fallback={null}>
               <CosmicScene 
                 className="h-full w-full" 
                 tithi={panchangData?.tithi} 
               />
            </Suspense>
          )}
        </div>

        {/* Hero Content */}
        <div className="relative z-20 mx-auto mt-6 w-full max-w-4xl text-center sm:mt-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-4 sm:gap-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-md shadow-[0_0_15px_rgba(255,107,53,0.3)] sm:px-4 sm:py-1.5">
              <MoonIcon className="h-3 w-3 text-[#FF6B35] sm:h-4 sm:w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/90 sm:text-xs">
                Live Cosmic Alignment
              </span>
            </div>

            <h1 className="bg-gradient-to-b from-white via-white/90 to-white/60 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-6xl lg:text-7xl">
              Daily <span className="text-[#FF6B35]">Vedic</span><br />
              Panchang
            </h1>

            <p className="max-w-md text-sm font-light leading-relaxed text-blue-100/70 sm:max-w-xl sm:text-lg">
              Observe the celestial dance. Accurate Tithi, Nakshatra, and Auspicious Muhurats synchronized with the cosmos.
            </p>
          </motion.div>
        </div>

        <motion.div 
          className="absolute bottom-6 z-20 text-white/30 sm:bottom-10"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="h-6 w-6 sm:h-8 sm:w-8" />
        </motion.div>
      </section>

      {/* MAIN CONTENT */}
      <section className="relative z-30 -mt-8 px-3 pb-12 sm:-mt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6 rounded-t-[2rem] bg-white/90 p-4 shadow-2xl backdrop-blur-xl dark:bg-gray-950/90 sm:space-y-8 sm:rounded-t-[3rem] sm:p-10">
          
          <div className="sticky top-[70px] z-40 mx-auto max-w-3xl sm:top-[80px]">
            <DateSelector
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
            />
          </div>

          <div className="min-h-[300px] sm:min-h-[400px]">
             <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-48 flex-col items-center justify-center gap-3 py-10 sm:h-64"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35] sm:h-10 sm:w-10" />
                  <p className="text-xs font-medium text-gray-500 sm:text-sm">Calculating planetary positions...</p>
                </motion.div>
              ) : error ? (
                <div key="error" className="py-10 text-center text-sm text-red-500 sm:py-20">{error}</div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6 sm:space-y-8"
                >
                  <PanchangDisplay
                    data={panchangData}
                    loading={loading}
                    error={error}
                    selectedDate={selectedDate}
                  />
                  
                  <div className="grid gap-6 lg:grid-cols-2">
                    <PanchangExtendedInfo data={panchangData} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </LandingWrapper>
  );
}