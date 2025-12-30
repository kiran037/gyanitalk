// app/landing/horoscope/HoroscopeClient.tsx
"use client";

import { useState, useEffect } from "react";
import LandingWrapper from "@/components/landing/LandingWrapper";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, Star } from "lucide-react";
import ZodiacSelector from "@/components/landing/horoscope/ZodiacSelector";
import HoroscopeDisplay from "@/components/landing/horoscope/HoroscopeDisplay";
import TodayHighlights from "@/components/landing/horoscope/TodayHighlights";
import { useParams, useRouter, useSearchParams } from "next/navigation";

/* ---------- types ---------- */
export type ZodiacSign =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export type HoroscopeType = "daily" | "weekly" | "yearly";

export default function HoroscopeClient() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const zodiac = params?.zodiac as ZodiacSign | undefined;

  const [horoscopeType, setHoroscopeType] = useState<HoroscopeType>("daily");

  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const type = searchParams.get("type") as HoroscopeType | null;
    if (type) setHoroscopeType(type);
  }, []);

  return (
    <LandingWrapper>
      {/* ================= HERO ================= */}
      <section className="relative flex min-h-[45vh] items-center justify-center overflow-hidden px-4 pb-6 pt-24 sm:min-h-[50vh] sm:px-6 sm:pb-8 sm:pt-28 lg:px-8">
        {/* Grid background */}
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

        {/* Floating stars */}
        {!prefersReducedMotion && (
          <div className="hidden sm:block">
            {[...Array(12)].map((_, i) => (
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
                  duration: 15 + i * 1.5,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeInOut",
                }}
                style={{
                  left: `${5 + (i % 4) * 25}%`,
                  top: `${10 + Math.floor(i / 4) * 30}%`,
                }}
              >
                <Star className="h-4 w-4 text-[#FF6B35]" fill="currentColor" />
              </motion.div>
            ))}
          </div>
        )}

        <div className="relative z-10 mx-auto w-full max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-5 sm:space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/20 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 px-3 py-1.5 backdrop-blur-sm sm:px-4 sm:py-2">
              <Sparkles className="h-4 w-4 text-[#FF6B35]" />
              <span className="text-xs font-medium text-gray-900 dark:text-white sm:text-sm">
                DISCOVER YOUR DESTINY
              </span>
            </div>

            <h1 className="text-3xl font-bold sm:text-5xl lg:text-6xl">
              <span className="text-gray-900 dark:text-white">Your </span>
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                Cosmic Journey
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">Starts Here</span>
            </h1>

            <p className="mx-auto max-w-3xl text-sm text-gray-600 dark:text-gray-400 sm:text-lg">
              Unveil the mysteries of the cosmos with personalized horoscope
              readings
            </p>
          </motion.div>
        </div>
      </section>

      {/* ================= MAIN ================= */}
      <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Zodiac Selector */}
          <ZodiacSelector selectedZodiac={zodiac ?? null} />

          {zodiac && (
            <HoroscopeDisplay
              zodiac={zodiac}
              horoscopeType={horoscopeType}
              onTypeChange={(type) => {
                setHoroscopeType(type);
                router.push(`/horoscope/${zodiac}?type=${type}`, {
                  scroll: false,
                });
              }}
            />
          )}

          {/* Highlights */}
          <TodayHighlights />
        </div>
      </section>
    </LandingWrapper>
  );
}
