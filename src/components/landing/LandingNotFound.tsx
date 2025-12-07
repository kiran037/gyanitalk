
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Home, Search, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import Footer from "@/components/landing/Footer";

export default function LandingNotFound() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const savedTheme =
      (typeof window !== "undefined" &&
        (localStorage.getItem("theme") as "light" | "dark")) ||
      "light";

    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const particles = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        id: i,
        left: 8 + (i % 3) * 30,
        top: 10 + Math.floor(i / 3) * 25,
        xOffset: (i % 3) * 25 - 25,
        yOffset: (i % 3) * 15 - 15,
        duration: 14 + i * 1.3,
        delay: i * 0.3,
      })),
    []
  );

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-950 dark:via-black dark:to-gray-900 transition-colors duration-300 min-h-screen flex flex-col">
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden relative pt-16 pb-10 sm:pt-20">
          {/* Subtle grid */}
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255, 107, 53, 0.06) 1px, transparent 0)",
                backgroundSize: "40px 40px",
              }}
            />
          </div>

          {/* Particles – desktop only */}
          {!shouldReduceMotion && (
            <div className="hidden md:block pointer-events-none">
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: [0.15, 0.4, 0.15],
                    scale: [1, 1.6, 1],
                    x: [0, p.xOffset, 0],
                    y: [0, p.yOffset, 0],
                  }}
                  transition={{
                    duration: p.duration,
                    repeat: Infinity,
                    delay: p.delay,
                    ease: "easeInOut",
                  }}
                  style={{
                    left: `${p.left}%`,
                    top: `${p.top}%`,
                  }}
                >
                  <div className="relative">
                    <div className="w-2.5 h-2.5 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full blur-[2px] opacity-60" />
                    <div className="absolute inset-0 w-2.5 h-2.5 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full animate-ping opacity-30" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Gradient orbs – desktop only */}
          {!shouldReduceMotion && (
            <>
              <motion.div
                className="hidden md:block absolute top-1/4 -left-1/4 w-72 h-72 lg:w-96 lg:h-96 bg-[#FF6B35] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10"
                animate={{
                  scale: [1, 1.15, 1],
                  x: [0, 40, 0],
                  y: [0, 25, 0],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="hidden md:block absolute top-1/3 -right-1/4 w-72 h-72 lg:w-96 lg:h-96 bg-[#FFB347] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10"
                animate={{
                  scale: [1, 1.2, 1],
                  x: [0, -30, 0],
                  y: [0, 40, 0],
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.8,
                }}
              />
            </>
          )}

          {/* Main card */}
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 sm:space-y-8"
            >
              {/* Icon */}
              <motion.div
                className="relative inline-block"
                animate={
                  shouldReduceMotion
                    ? {}
                    : {
                        y: [0, -14, 0],
                        rotate: [0, 4, -4, 0],
                      }
                }
                transition={
                  shouldReduceMotion
                    ? undefined
                    : {
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }
                }
              >
                <div className="relative">
                  {!shouldReduceMotion && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full blur-3xl opacity-40"
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full flex items-center justify-center shadow-2xl">
                    <AlertCircle className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                  </div>
                </div>
              </motion.div>

              {/* 404 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <h1 className="text-5xl xs:text-6xl sm:text-7xl lg:text-8xl font-extrabold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                  404
                </h1>
              </motion.div>

              {/* Text */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="space-y-3 sm:space-y-4"
              >
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 border border-[#FF6B35]/20 rounded-full backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-[#FF6B35]" />
                  <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    PAGE NOT FOUND
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Oops! Lost in the Stars
                </h2>

                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  The page you&apos;re looking for seems to have drifted into
                  another dimension. Let&apos;s guide you back home.
                </p>
              </motion.div>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 sm:pt-4"
              >
                <Link href="/" className="w-full sm:w-auto">
                  <motion.button
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white rounded-xl shadow-lg text-sm sm:text-base font-medium"
                    whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                    Back to Home
                  </motion.button>
                </Link>

                <Link href="/landing/blog" className="w-full sm:w-auto">
                  <motion.button
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-white/70 dark:bg.white/5 backdrop-blur-sm border border-gray-200/70 dark:border-gray-700/60 text-gray-900 dark:text-white rounded-xl shadow-md text-sm sm:text-base font-medium hover:border-[#FF6B35]/60"
                    whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                    Explore Blog
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}