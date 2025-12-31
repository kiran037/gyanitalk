

"use client";

import { Sparkles, Star, Wallet, Zap, Moon, Sun } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import Image from "next/image";

export default function HomeMain() {
  const prefersReducedMotion = useReducedMotion();

  // Generate star positions for the "Night Sky" effect
  const stars = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 2,
      })),
    []
  );

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-12 lg:pt-0 lg:pb-0"
    >
      {/* ================= BACKGROUND LAYERS ================= */}
      
      {/* 1. Base Gradient (Dawn/Dusk feel) */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-50/30 via-white to-white dark:from-gray-900 dark:via-gray-950 dark:to-black pointer-events-none" />

      {/* 2. Celestial Grid */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* 3. Zodiac Wheel (Replacing the broken Image with reliable SVG) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vw] h-[140vw] opacity-[0.04] dark:opacity-[0.06] pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="w-full h-full"
        >
          <ZodiacWheel />
        </motion.div>
      </div>

      {/* 4. Twinkling Stars (Desktop & Mobile) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-[#FF6B35]"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* 5. Ambient Orbs (Soft Glows) */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-orange-400/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />


      {/* ================= MAIN CONTENT ================= */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* --- LEFT COLUMN: TEXT & CTA --- */}
          <motion.div
            className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 sm:space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-200/50 bg-orange-50/50 dark:bg-orange-900/10 dark:border-orange-500/20 backdrop-blur-md shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF6B35]" />
              <span className="text-xs font-bold uppercase tracking-wide text-orange-700 dark:text-orange-300">
                #1 Trusted Astrology Platform
              </span>
            </motion.div>

            {/* Headline */}
            <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.15]">
              <span className="text-gray-900 dark:text-white">Decode Your </span>
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-[#FF6B35] via-[#FF8C42] to-[#FFB347] bg-clip-text text-transparent">
                Cosmic Destiny
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
              Connect with verified astrologers instantly. Get your first chat or call 
              <span className="font-semibold text-[#FF6B35]"> FREE</span>. 
              No strings attached, just pure guidance.
            </p>

            {/* Mobile Visual (Visible only on Mobile/Tablet) */}
            <div className="block lg:hidden w-full py-6">
              <MobilePhoneVisual />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-md sm:max-w-lg">
              {[
                { label: "Active Users", value: "50K+" },
                { label: "Astrologers", value: "400+" },
                { label: "App Rating", value: "4.2★" },
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/60 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700 backdrop-blur-sm shadow-sm"
                >
                  <span className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </span>
                  <span className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md sm:max-w-lg pt-2">
              <a
                href="https://play.google.com/store/apps/details?id=com.app.gyanitalk"
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-[#FF6B35] to-[#FF9057] hover:to-[#FF6B35] text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg shadow-orange-500/25 transition-all active:scale-95"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" /></svg>
                <span>Google Play</span>
              </a>
              <a
                href="https://apps.apple.com/in/app/gyanitalk/id6742021396"
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-3.5 rounded-xl font-semibold shadow-sm transition-all active:scale-95"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
                <span>App Store</span>
              </a>
            </div>
          </motion.div>

          {/* --- RIGHT COLUMN: DESKTOP VISUAL --- */}
          <div className="hidden lg:block relative h-full min-h-[600px]">
            <DesktopVisual />
          </div>

        </div>
      </div>
    </section>
  );
}

// ================= SUB-COMPONENTS =================

// 1. ZODIAC WHEEL SVG - Pure CSS/SVG replacement for the broken image
function ZodiacWheel() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible opacity-50">
      {/* Outer Ring */}
      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="2 1" />
      <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.1" />
      
      {/* Sectors */}
      {[...Array(12)].map((_, i) => (
        <g key={i} transform={`rotate(${i * 30} 50 50)`}>
          <line x1="50" y1="15" x2="50" y2="2" stroke="currentColor" strokeWidth="0.1" />
          {/* Little dots for signs */}
          <circle cx="50" cy="10" r="0.5" fill="currentColor" />
        </g>
      ))}
      
      {/* Inner Geometry */}
      <path d="M50 2 L91.5 26 L91.5 74 L50 98 L8.5 74 L8.5 26 Z" fill="none" stroke="currentColor" strokeWidth="0.1" opacity="0.5" />
      <path d="M50 2 L8.5 74 L91.5 74 Z" fill="none" stroke="currentColor" strokeWidth="0.05" opacity="0.3" />
      <path d="M50 98 L8.5 26 L91.5 26 Z" fill="none" stroke="currentColor" strokeWidth="0.05" opacity="0.3" />
    </svg>
  );
}

function MobilePhoneVisual() {
  return (
    <div className="relative flex justify-center items-center py-4">
      {/* Glowing Aura */}
      <div className="absolute w-48 h-48 bg-gradient-to-tr from-orange-400 to-pink-500 rounded-full blur-[60px] opacity-30 animate-pulse" />
      
      <div className="relative w-[180px] sm:w-[200px] z-10">
        <div className="relative aspect-[9/19] bg-gray-900 rounded-[2rem] p-1.5 shadow-2xl ring-1 ring-white/10">
          <div className="relative h-full bg-white dark:bg-gray-950 rounded-[1.75rem] overflow-hidden">
            <Image
              src="/landing/bannerlight.jpeg"
              alt="App Screenshot"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 200px"
              priority
            />
          </div>
        </div>

        {/* Floating Badges for Mobile */}
        <FloatingBadge 
          icon={Star} 
          text="Verified" 
          subtext="Astrologers" 
          position="top-8 -left-4" 
          color="bg-gradient-to-br from-orange-400 to-pink-500" 
        />
        <FloatingBadge 
          icon={Wallet} 
          text="₹51 Bonus" 
          subtext="Free Sign-up" 
          position="bottom-12 -right-4" 
          color="bg-gradient-to-br from-emerald-400 to-teal-500" 
        />
      </div>
    </div>
  );
}

function DesktopVisual() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* 1. Orbit Rings */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute w-[500px] h-[500px] rounded-full border border-dashed border-gray-300 dark:border-gray-700 opacity-50"
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        className="absolute w-[400px] h-[400px] rounded-full border border-gray-200 dark:border-gray-800 opacity-60"
      />

      {/* 2. Floating Planets */}
      <motion.div 
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 right-10 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-xl z-20"
      >
        <Sun className="w-8 h-8 text-yellow-500" />
      </motion.div>

      <motion.div 
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-20 left-10 bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-xl z-20"
      >
        <Moon className="w-8 h-8 text-indigo-500" />
      </motion.div>

      {/* 3. Central Phone */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 w-[280px]"
      >
        <div className="relative aspect-[9/19] bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl ring-4 ring-gray-900/10 dark:ring-white/5">
          <div className="relative h-full bg-white dark:bg-gray-950 rounded-[2rem] overflow-hidden">
            <Image
              src="/landing/bannerlight.jpeg"
              alt="Desktop App Preview"
              fill
              className="object-cover"
              sizes="300px"
              priority
            />
          </div>
          
          {/* Glass Reflection */}
          <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
        </div>

        {/* Feature Cards Attached to Phone */}
        <motion.div 
          className="absolute top-20 -left-16 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex items-center gap-3"
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
            <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 dark:text-white">Instant</p>
            <p className="text-[10px] text-gray-500">Connection</p>
          </div>
        </motion.div>

        <motion.div 
          className="absolute bottom-32 -right-12 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex items-center gap-3"
          animate={{ x: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
            <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 dark:text-white">Affordable</p>
            <p className="text-[10px] text-gray-500">Consultation</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function FloatingBadge({ icon: Icon, text, subtext, position, color }: any) {
  return (
    <motion.div
      className={`absolute ${position} bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-2 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex items-center gap-2 z-20`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className={`p-1.5 rounded-lg ${color}`}>
        <Icon className="w-3 h-3 text-white" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-900 dark:text-white leading-tight">{text}</p>
        <p className="text-[8px] text-gray-500 dark:text-gray-400 leading-tight">{subtext}</p>
      </div>
    </motion.div>
  );
}