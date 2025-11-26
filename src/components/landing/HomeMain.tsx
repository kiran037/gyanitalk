"use client";

import { Sparkles, Star, Wallet, Zap, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo } from "react";

export default function HomeMain() {
    // Generate particle positions once during render to avoid hydration mismatch
    const particles = useMemo(() =>
        Array.from({ length: 20 }, (_, i) => ({
            id: i,
            left: (i * 5.2 + 1.76) % 100, // Deterministic positioning
            top: (i * 7.3 + 3.72) % 100,
            xOffset: (i % 3 - 1) * 50,
            yOffset: (i % 4 - 1.5) * 50,
        }))
        , []);

    return (
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-20">
            {/* Animated Grid Background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 107, 53, 0.06) 1px, transparent 0)`,
                    backgroundSize: '40px 40px',
                }} />
            </div>

            {/* Mystical Particles - Reduced for performance */}
            <div className="hidden md:block">
                {particles.slice(0, 10).map((particle) => (
                    <motion.div
                        key={particle.id}
                        className="absolute pointer-events-none"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: [0.2, 0.6, 0.2],
                            scale: [1, 2, 1],
                            x: [0, particle.xOffset, 0],
                            y: [0, particle.yOffset, 0],
                        }}
                        transition={{
                            duration: 15 + particle.id * 2,
                            repeat: Infinity,
                            delay: particle.id * 0.3,
                            ease: "easeInOut"
                        }}
                        style={{
                            left: `${particle.left}%`,
                            top: `${particle.top}%`,
                        }}
                    >
                        <Star className="w-2 h-2 text-[#FF6B35] opacity-60" />
                    </motion.div>
                ))}
            </div>

            {/* Gradient Orbs */}
            <motion.div
                className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[#FF6B35] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10"
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className="absolute top-1/3 -right-1/4 w-96 h-96 bg-[#FFB347] rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10"
                animate={{
                    scale: [1, 1.3, 1],
                    x: [0, -30, 0],
                    y: [0, 50, 0],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
            />

            <div className="relative z-10 max-w-7xl mx-auto w-full">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left Content */}
                    <motion.div
                        className="space-y-8"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <motion.div
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 border border-[#FF6B35]/20 rounded-full backdrop-blur-sm"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400 }}
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            >
                                <Sparkles className="w-4 h-4 text-[#FF6B35]" />
                            </motion.div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">E-platform for astrology</span>
                        </motion.div>

                        <motion.h1
                            className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <span className="block bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                                The Easiest Way
                            </span>
                            <span className="block text-gray-900 dark:text-white">to Connect with</span>
                            <span className="block text-gray-900 dark:text-white">Astrologers</span>
                        </motion.h1>

                        <motion.p
                            className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            Enjoy a Free Astrology Session. Get started with a free chat or call with a verified astrologer. No strings attached!
                        </motion.p>

                        {/* Mobile Phone Preview - Shows only on mobile */}
                        <div className="block lg:hidden py-6">
                            <div className="relative flex justify-center">
                                <div className="relative w-full max-w-[350px]">
                                    <motion.div
                                        className="relative w-[200px] mx-auto"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.8, delay: 0.5 }}
                                    >
                                        <div className="relative aspect-[9/19] bg-gray-900 rounded-[2rem] p-1.5 shadow-2xl">
                                            <div className="absolute top-1/2 -translate-y-1/2 -left-0.5 w-0.5 h-10 bg-gray-800 rounded-l" />
                                            <div className="absolute top-1/2 -translate-y-1/2 translate-y-6 -left-0.5 w-0.5 h-12 bg-gray-800 rounded-l" />
                                            <div className="absolute top-1/2 -translate-y-1/2 -right-0.5 w-0.5 h-16 bg-gray-800 rounded-r" />

                                            <div className="relative h-full bg-white dark:bg-gray-950 rounded-[1.75rem] overflow-hidden">
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-5 bg-gray-900 rounded-b-3xl z-10" />
                                                <img
                                                    src="/landing/bannerlight.jpeg"
                                                    alt="Gyani Talk App - Vedic Astrology"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#FF6B35] to-[#FFB347] opacity-20 blur-2xl -z-10" />
                                    </motion.div>

                                    {/* Mobile Floating Cards */}
                                    <motion.div
                                        className="absolute top-[8%] left-[5%] bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-lg shadow-xl p-2 border border-[#FF6B35]/20 z-30"
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.8, duration: 0.5 }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#FFB347] flex items-center justify-center">
                                                <Star className="w-3 h-3 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-semibold text-gray-900 dark:text-white">Verified</p>
                                                <p className="text-[8px] text-gray-500 dark:text-gray-400">Astrologers</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        className="absolute bottom-[8%] right-[5%] bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-lg shadow-xl p-2 border border-[#FFB347]/20 z-30"
                                        initial={{ opacity: 0, x: 30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1, duration: 0.5 }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#FFB347] to-[#FF6B35] flex items-center justify-center">
                                                <Wallet className="w-3 h-3 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-semibold text-gray-900 dark:text-white">₹51 Bonus</p>
                                                <p className="text-[8px] text-gray-500 dark:text-gray-400">Sign-up Gift</p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        className="absolute top-[48%] right-[5%] bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-lg shadow-xl p-2 border border-[#FF6B35]/20 z-30"
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 1.2, duration: 0.5 }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                                                <Zap className="w-3 h-3 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-semibold text-gray-900 dark:text-white">Instant</p>
                                                <p className="text-[8px] text-gray-500 dark:text-gray-400">Connect</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <motion.div
                            className="grid grid-cols-3 gap-4 pt-4 max-w-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                        >
                            {[
                                { value: "50K+", label: "Active Users" },
                                { value: "400+", label: "Astrologers" },
                                { value: "4.2★", label: "App Rating" }
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl p-4 cursor-pointer"
                                    whileHover={{
                                        scale: 1.05,
                                        borderColor: "rgba(255, 107, 53, 0.5)",
                                        transition: { duration: 0.2 }
                                    }}
                                >
                                    <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">{stat.value}</div>
                                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Download Buttons */}
                        <motion.div
                            className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 max-w-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                        >
                            <motion.a
                                href="https://apps.apple.com/in/app/gyanitalk/id6742021396"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center justify-center gap-3 px-5 py-3 bg-white dark:bg-gray-900 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 text-gray-900 dark:text-white rounded-xl shadow-lg"
                                whileHover={{ scale: 1.05, borderColor: "rgba(255, 107, 53, 0.5)" }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                </svg>
                                <div className="text-left">
                                    <div className="text-xs opacity-70">Download on</div>
                                    <div className="text-sm sm:text-base font-semibold">App Store</div>
                                </div>
                            </motion.a>

                            <motion.a
                                href="https://play.google.com/store/apps/details?id=com.app.gyanitalk&pcampaignid=web_share"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center justify-center gap-3 px-5 py-3 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white rounded-xl shadow-lg"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                                </svg>
                                <div className="text-left">
                                    <div className="text-xs opacity-90">Get it on</div>
                                    <div className="text-sm sm:text-base font-semibold">Google Play</div>
                                </div>
                            </motion.a>
                        </motion.div>
                    </motion.div>


                    {/* Right - Mobile Phone & Mystical Zodiac Wheel - Desktop Only */}
                    <motion.div
                        className="hidden lg:flex relative justify-center lg:justify-end"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.3 }}
                    >
                        <div className="relative w-full max-w-[500px]">
                            {/* Mobile Phone - Positioned in center */}
                            <div className="relative z-10 flex justify-center items-center h-full">
                                <motion.div
                                    className="relative w-[240px] md:w-[280px] lg:w-[320px]"
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <div className="relative aspect-[9/19] bg-gray-900 rounded-[2rem] md:rounded-[2.5rem] p-1.5 md:p-2 shadow-2xl">
                                        <div className="absolute top-1/2 -translate-y-1/2 -left-0.5 w-0.5 h-10 md:h-12 bg-gray-800 rounded-l" />
                                        <div className="absolute top-1/2 -translate-y-1/2 translate-y-6 md:translate-y-8 -left-0.5 w-0.5 h-12 md:h-16 bg-gray-800 rounded-l" />
                                        <div className="absolute top-1/2 -translate-y-1/2 -right-0.5 w-0.5 h-16 md:h-20 bg-gray-800 rounded-r" />

                                        <div className="relative h-full bg-white dark:bg-gray-950 rounded-[1.75rem] md:rounded-[2rem] overflow-hidden">
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-5 md:h-6 bg-gray-900 rounded-b-3xl z-10" />
                                            <img
                                                src="/landing/bannerlight.jpeg"
                                                alt="Gyani Talk App - Vedic Astrology"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>

                                    {/* Glow effect around phone */}
                                    <div className="absolute inset-0 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-[#FF6B35] to-[#FFB347] opacity-20 blur-2xl -z-10" />
                                </motion.div>
                            </div>
                            {/* Zodiac Wheel Background Elements */}
                            <div className="absolute inset-0 w-full aspect-square scale-90 md:scale-100">
                                {/* Central Cosmic Core */}
                                <motion.div
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-[#FF6B35] via-[#FFB347] to-[#FF6B35] shadow-2xl -z-10"
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        rotate: 360,
                                    }}
                                    transition={{
                                        scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                                        rotate: { duration: 20, repeat: Infinity, ease: "linear" }
                                    }}
                                >
                                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center">
                                        <motion.div
                                            animate={{ rotate: -360 }}
                                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        >
                                            <Sparkles className="w-12 h-12 text-white" />
                                        </motion.div>
                                    </div>
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFB347] blur-xl opacity-60 animate-pulse" />
                                </motion.div>

                                {/* Orbital Rings */}
                                <motion.div
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border-2 border-[#FF6B35]/20 -z-10"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                                />
                                <motion.div
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border-2 border-[#FFB347]/20 border-dashed -z-10"
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                                />
                                <motion.div
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-[#FF6B35]/10 -z-10"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                />

                                {/* Celestial Elements */}
                                <motion.div
                                    className="absolute top-[15%] right-[10%] -z-10"
                                    animate={{
                                        y: [0, -20, 0],
                                        rotate: [0, 10, 0]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400 flex items-center justify-center shadow-xl">
                                        <Sun className="w-8 h-8 text-yellow-600" />
                                    </div>
                                    <div className="absolute inset-0 rounded-full bg-yellow-300 blur-lg opacity-50 animate-pulse" />
                                </motion.div>

                                <motion.div
                                    className="absolute bottom-[15%] left-[10%] -z-10"
                                    animate={{
                                        y: [0, 20, 0],
                                        rotate: [0, -10, 0]
                                    }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                >
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-300 to-purple-400 flex items-center justify-center shadow-xl">
                                        <Moon className="w-7 h-7 text-indigo-100" />
                                    </div>
                                    <div className="absolute inset-0 rounded-full bg-purple-400 blur-lg opacity-50 animate-pulse" />
                                </motion.div>
                            </div>

                            {/* Floating Feature Cards - OUTSIDE zodiac wheel container */}
                            <motion.div
                                className="absolute top-[5%] left-[-5%] bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl shadow-xl p-3 border border-[#FF6B35]/20 z-30"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.5, duration: 0.6 }}
                                whileHover={{ scale: 1.1, rotate: 3 }}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#FFB347] flex items-center justify-center">
                                        <Star className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-900 dark:text-white">Verified</p>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Astrologers</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                className="absolute bottom-[5%] right-[-5%] bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl shadow-xl p-3 border border-[#FFB347]/20 z-30"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.7, duration: 0.6 }}
                                whileHover={{ scale: 1.1, rotate: -3 }}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFB347] to-[#FF6B35] flex items-center justify-center">
                                        <Wallet className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-900 dark:text-white">₹51 Bonus</p>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Sign-up Gift</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                className="absolute top-[50%] right-[-8%] bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl shadow-xl p-3 border border-[#FF6B35]/20 z-30"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1.9, duration: 0.6 }}
                                whileHover={{ scale: 1.15 }}
                            >
                                <div className="flex items-center gap-2">
                                    <motion.div
                                        className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    >
                                        <Zap className="w-4 h-4 text-white" />
                                    </motion.div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-900 dark:text-white">Instant</p>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Connect</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}