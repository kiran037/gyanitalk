
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
  Sparkles,
  Moon
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import HomeMain from "@/components/landing/HomeMain";
import { useSecretGyani } from "./useSecretGyani";

// Lazy-load heavy/animated sections for performance
const AppDownloadPopup = dynamic(
  () => import("@/components/landing/AppDownloadPopup"),
  { ssr: false }
);

const AstrologerCarousel = dynamic(
  () => import("@/components/landing/AstrologerCarousel"),
  {
    ssr: false,
    loading: () => <div className="h-[320px] w-full bg-gray-50 dark:bg-gray-900 animate-pulse rounded-3xl" aria-hidden="true" />,
  }
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
  useSecretGyani();
  const prefersReducedMotion = useReducedMotion();

  return (
    <LandingWrapper>
      <AppDownloadPopup />

      {/* 1. HERO SECTION */}
      <HomeMain />

      {/* 2. FEATURES SECTION - COSMIC GRID */}
      
        <section
        aria-labelledby="features-heading"
        className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black/40 overflow-hidden"
      >
        {/* Zodiac Background Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
          <svg className="h-full w-full" width="100%" height="100%">
            <pattern id="zodiac-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" className="text-gray-900 dark:text-white" fill="currentColor" />
              <path d="M50 50 L60 60 M60 50 L50 60" stroke="currentColor" strokeWidth="0.5" className="text-gray-900 dark:text-white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#zodiac-pattern)" />
          </svg>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-orange-50/30 to-white/0 dark:from-black/0 dark:via-orange-900/5 dark:to-black/0 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto z-10">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 text-xs font-bold tracking-widest uppercase mb-4">
              <Sparkles className="w-3 h-3" />
              Why Choose Us
            </div>
            
            <h2
              id="features-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4"
            >
              <span className="text-gray-900 dark:text-white">
                Everything You Need for Your 
              </span>
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                Spiritual Journey
              </span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              We combine ancient Vedic wisdom with modern technology to provide you with a seamless and secure experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {[
              {
                icon: Zap,
                title: "Instant Payments",
                desc: "Lightning-fast transactions with secure payment gateway.",
                color: "from-amber-400 to-orange-500"
              },
              {
                icon: Wallet,
                title: "Digital Wallet",
                desc: "Manage your balance effortlessly and track transactions.",
                color: "from-emerald-400 to-teal-500"
              },
              {
                icon: Star,
                title: "Expert Astrologers",
                desc: "Connect with verified experts for personalized readings.",
                color: "from-purple-400 to-indigo-500"
              },
              {
                icon: Shield,
                title: "Bank-Level Security",
                desc: "Military-grade encryption protects your data.",
                color: "from-blue-400 to-cyan-500"
              },
              {
                icon: Clock,
                title: "24/7 Availability",
                desc: "Access services anytime, anywhere you need.",
                color: "from-pink-400 to-rose-500"
              },
              {
                icon: Users,
                title: "Activity Tracking",
                desc: "Monitor spending patterns and consultation history.",
                color: "from-yellow-400 to-amber-500"
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="group relative p-6 sm:p-8 bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                whileHover={prefersReducedMotion ? undefined : { y: -5 }}
              >
                {/* Gradient Blob on Hover */}
                <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`} />

                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-[#FF6B35] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. DYNAMIC SECTIONS */}
      <div className="">
        <AstrologerCarousel />
        <ProductCarousel />
      </div>

      {/* 4. BENEFITS SECTION */}
      <section
        aria-labelledby="benefits-heading"
        className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black/40 overflow-hidden"
      >
        {/* Decorative Moon */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 opacity-10 dark:opacity-20 pointer-events-none">
          <Moon size={400} strokeWidth={0.5} />
        </div>

        <div className="relative max-w-7xl mx-auto z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* LEFT TEXT COLUMN */}
            <motion.div
              className="space-y-8 text-center lg:text-left"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <div>
                <span className="text-sm font-bold tracking-widest uppercase text-[#FF6B35]">
                  TRUSTED BY THOUSANDS
                </span>
                <h2
                  id="benefits-heading"
                  className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight"
                >
                  Why the World Loves <br />
                  <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                    Gyani Talk
                  </span>
                </h2>
              </div>

              <div className="grid gap-4 text-left">
                {[
                  { title: "Verified Experts", desc: "100% ID & skill-verified astrologers." },
                  { title: "Transparent Pricing", desc: "Pay per minute. No hidden charges." },
                  { title: "Instant Consultations", desc: "Connect via Chat or Call in seconds." },
                  { title: "Multilingual Support", desc: "Consult in Hindi, English, Tamil & more." },
                ].map((benefit, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:border-[#FF6B35]/30 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                      <ChevronRight className="w-5 h-5 text-[#FF6B35]" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-900 dark:text-white">
                        {benefit.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {benefit.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* RIGHT STATS GRID - Floating Card Effect */}
            <motion.div
              className="grid grid-cols-2 gap-4 sm:gap-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              {[
                { value: "50K+", label: "Happy Users", icon: Users, delay: 0 },
                { value: "100+", label: "Astrologers", icon: Star, delay: 0.1 },
                { value: "99.9%", label: "Uptime", icon: Shield, delay: 0.2 },
                { value: "24/7", label: "Support", icon: Clock, delay: 0.3 },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className="flex flex-col items-center justify-center p-6 sm:p-8 bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-gray-800 text-center"
                  whileHover={{ y: -5, borderColor: "#FF6B35" }}
                  transition={{ delay: stat.delay }}
                >
                  <stat.icon className="w-8 h-8 sm:w-10 sm:h-10 text-[#FF6B35] mb-4" />
                  <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. REVIEWS */}
      <PlaystoreReviewCarousel />
    </LandingWrapper>
  );
}