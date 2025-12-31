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
  }, [searchParams]); // Depend on searchParams for updates

  return (
    <LandingWrapper>
      {/* ================= HERO SECTION ================= */}
      <section className="relative flex min-h-[40vh] items-center justify-center overflow-hidden px-4 pb-8 pt-24 sm:min-h-[50vh] sm:px-6 sm:pb-12 sm:pt-28 lg:px-8">
        {/* Decorative Grid and Gradient Background */}
        <div className="absolute inset-0">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35]/5 via-transparent to-[#FFB347]/5" />
          {/* Cosmic Grid Pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255, 107, 53, 0.08) 1px, transparent 0)", // Slightly increased opacity
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Floating stars - Hidden for reduced motion or on medium/small screens to avoid clutter */}
        {!prefersReducedMotion && (
          <div className="hidden md:block">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="pointer-events-none absolute"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0.15, 0.4, 0.15], // Subtle fade
                  scale: [1, 1.8, 1], // Gentle pulsate
                  x: [0, Math.random() * 80 - 40, 0], // Increased random movement
                  y: [0, Math.random() * 80 - 40, 0], // Increased random movement
                }}
                transition={{
                  duration: 15 + i * 1.5, // Varied durations
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeInOut",
                }}
                style={{
                  left: `${5 + (i % 4) * 20}%`, // Distribute stars
                  top: `${10 + Math.floor(i / 4) * 25}%`, // Distribute stars
                }}
              >
                <Star className="h-5 w-5 text-[#FF6B35]" fill="currentColor" /> {/* Slightly larger star icon */}
              </motion.div>
            ))}
          </div>
        )}

        <div className="relative z-10 mx-auto w-full max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-4 sm:space-y-6" // Responsive vertical spacing
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/20 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-[#FF6B35]" />
              <span className="text-xs font-semibold text-gray-900 dark:text-white sm:text-sm">
                DISCOVER YOUR DESTINY
              </span>
            </div>

            <h1 className="text-4xl font-extrabold leading-tight sm:text-6xl lg:text-7xl">
              <span className="text-gray-900 dark:text-white">Your </span>
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                Cosmic Journey
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">Awaits You</span>
            </h1>

            <p className="mx-auto max-w-2xl px-2 text-base text-gray-600 dark:text-gray-400 sm:text-lg">
              Unveil the mysteries of the cosmos with personalized, accurate horoscope readings
            </p>
          </motion.div>
        </div>
      </section>

      {/* ================= MAIN CONTENT SECTION ================= */}
      <section className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8"> {/* Increased vertical space between components */}
          {/* Zodiac Selector */}
          <ZodiacSelector selectedZodiac={zodiac ?? null} />

          {/* Horoscope Display - Only shown if a zodiac is selected */}
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

          {/* Today's Highlights - Always shown */}
          <TodayHighlights />
        </div>
      </section>
    </LandingWrapper>
  );
}