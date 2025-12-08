// components/landing/HomeClient.tsx
"use client";

import LandingWrapper from "@/components/landing/LandingWrapper";
import {
  Zap,
  Wallet,
  Star,
  Shield,
  Clock,
  Users,
  ChevronRight,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import HomeMain from "@/components/landing/HomeMain";

// Lazy-load heavy/animated sections for performance
const AppDownloadPopup = dynamic(
  () => import("@/components/landing/AppDownloadPopup"),
  { ssr: false }
);

const AstrologerCarousel = dynamic(
  () => import("@/components/landing/AstrologerCarousel"),
  { ssr: false }
);

const ProductCarousel = dynamic(
  () => import("@/components/landing/ProductCarousel"),
  { ssr: false }
);

const PlaystoreReviewCarousel = dynamic(
  () => import("@/components/landing/PlaystoreReviewCarousel"),
  { ssr: false }
);

export default function HomeClient() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <LandingWrapper>
      <AppDownloadPopup />

      {/* HERO */}
      <HomeMain />

      {/* FEATURES SECTION */}
      <section className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-white/[0.02] dark:to-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-10 sm:mb-14 lg:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block mb-4 sm:mb-5">
              <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#FF6B35]">
                POWERFUL FEATURES
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
              <span className="text-gray-900 dark:text-white">
                Everything You Need{" "}
              </span>
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                In One App
              </span>
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Seamlessly manage your spiritual journey with our comprehensive
              platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: Zap,
                title: "Instant Payments",
                desc: "Lightning-fast transactions with secure payment gateway.",
              },
              {
                icon: Wallet,
                title: "Digital Wallet",
                desc: "Manage your balance effortlessly and track transactions.",
              },
              {
                icon: Star,
                title: "Expert Astrologers",
                desc: "Connect with verified experts for personalized readings.",
              },
              {
                icon: Shield,
                title: "Bank-Level Security",
                desc: "Military-grade encryption protects your data.",
              },
              {
                icon: Clock,
                title: "24/7 Availability",
                desc: "Access services anytime, anywhere you need.",
              },
              {
                icon: Users,
                title: "Activity Tracking",
                desc: "Monitor spending patterns and consultation history.",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="group p-5 sm:p-6 bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                whileHover={
                  prefersReducedMotion
                    ? undefined
                    : {
                        scale: 1.03,
                        borderColor: "rgba(255, 107, 53, 0.5)",
                        boxShadow: "0 16px 30px rgba(255, 107, 53, 0.18)",
                      }
                }
              >
                <motion.div
                  className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-xl flex items-center justify-center mb-3 sm:mb-4"
                  whileHover={
                    prefersReducedMotion ? undefined : { rotate: 8, scale: 1.05 }
                  }
                  transition={{ duration: 0.3 }}
                >
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </motion.div>
                <h3 className="text-base sm:text-lg font-bold mb-1.5 sm:mb-2 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CAROUSELS (lazy loaded components) */}
      <AstrologerCarousel />
      <ProductCarousel />

      {/* BENEFITS SECTION */}
      <section className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-white/[0.02] dark:to-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* LEFT TEXT COLUMN */}
            <motion.div
              className="space-y-6 sm:space-y-8"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block">
                <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#FF6B35]">
                  TRUSTED BY THOUSANDS
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                <span className="text-gray-900 dark:text-white">
                  Why People Love{" "}
                </span>
                <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                  Gyani Talk
                </span>
              </h2>

              <div className="space-y-3 sm:space-y-4">
                {[
                  {
                    title: "Verified Experts",
                    desc: "Thoroughly vetted certified professionals.",
                  },
                  {
                    title: "Transparent Pricing",
                    desc: "No hidden fees, clear pricing.",
                  },
                  {
                    title: "Instant Consultations",
                    desc: "Connect immediately without waiting.",
                  },
                  {
                    title: "Multilingual Support",
                    desc: "Communicate in your language.",
                  },
                ].map((benefit, i) => (
                  <motion.div
                    key={i}
                    className="flex gap-3 sm:gap-4 items-start group p-3.5 sm:p-4 bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    whileHover={
                      prefersReducedMotion
                        ? undefined
                        : {
                            scale: 1.02,
                            borderColor: "rgba(255, 107, 53, 0.5)",
                          }
                    }
                  >
                    <motion.div
                      className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FF6B35]/10 rounded-lg flex items-center justify-center flex-shrink-0"
                      whileHover={
                        prefersReducedMotion
                          ? undefined
                          : { rotate: 8, backgroundColor: "#FF6B35" }
                      }
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronRight className="w-5 h-5 text-[#FF6B35] group-hover:text-white transition-colors" />
                    </motion.div>
                    <div>
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-0.5">
                        {benefit.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {benefit.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* RIGHT STATS GRID */}
            <motion.div
              className="grid grid-cols-2 gap-4 sm:gap-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              {[
                { value: "50K+", label: "Happy Users", icon: Users },
                { value: "100+", label: "Astrologers", icon: Star },
                { value: "99.9%", label: "Uptime", icon: Shield },
                { value: "24/7", label: "Support", icon: Clock },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className="bg-white/70 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 p-4 sm:p-6 rounded-2xl cursor-pointer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.08,
                  }}
                  whileHover={
                    prefersReducedMotion
                      ? undefined
                      : {
                          scale: 1.03,
                          borderColor: "rgba(255, 107, 53, 0.5)",
                          boxShadow: "0 12px 28px rgba(255, 107, 53, 0.18)",
                        }
                  }
                >
                  <motion.div
                    animate={
                      prefersReducedMotion
                        ? undefined
                        : { rotate: [0, 5, 0, -5, 0] }
                    }
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                  >
                    <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF6B35] mb-2 sm:mb-3" />
                  </motion.div>
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent mb-1.5 sm:mb-2">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <PlaystoreReviewCarousel />
    </LandingWrapper>
  );
}