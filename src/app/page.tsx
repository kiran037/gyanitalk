"use client";

import LandingWrapper from "@/components/landing/LandingWrapper";
import { Zap, Wallet, Star, Shield, Clock, Users, ChevronRight, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import AppDownloadPopup from "@/components/landing/AppDownloadPopup";

export default function HomePage() {
    const [isVisible, setIsVisible] = useState(false);
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <LandingWrapper>
            <AppDownloadPopup />
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-20">
                {/* Animated Grid Background */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 107, 53, 0.06) 1px, transparent 0)`,
                        backgroundSize: '40px 40px',
                    }} />
                </div>

                {/* Floating Particles - Elegant replacements */}
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute pointer-events-none"
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
                            ease: "easeInOut"
                        }}
                        style={{
                            left: `${5 + (i % 5) * 20}%`,
                            top: `${5 + Math.floor(i / 5) * 25}%`,
                        }}
                    >
                        <div className="relative">
                            <div className="w-3 h-3 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full blur-[2px] opacity-60" />
                            <div className="absolute inset-0 w-3 h-3 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full animate-ping opacity-30" />
                        </div>
                    </motion.div>
                ))}

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

                        {/* Right - Phone Mockup with Orbit Animation */}
                        <motion.div 
                            className="relative flex justify-center lg:justify-end"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                        >
                            <div className="relative w-[280px] sm:w-[300px]">
                                {/* Orbiting Elements - Cosmic rings */}
                                <motion.div
                                    className="absolute top-1/2 left-1/2 w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                >
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg flex items-center justify-center">
                                        <div className="w-6 h-6 bg-yellow-300 rounded-full" />
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="absolute top-1/2 left-1/2 w-[350px] h-[350px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                >
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full shadow-lg flex items-center justify-center">
                                        <div className="w-4 h-4 bg-indigo-300 rounded-full" />
                                    </div>
                                </motion.div>

                                {/* Orbital rings */}
                                <motion.div
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full border border-[#FF6B35]/10 pointer-events-none"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                                />
                                <motion.div
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[330px] h-[330px] rounded-full border border-[#FFB347]/10 pointer-events-none"
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                                />

                                {/* Main Phone with Float Animation */}
                                <motion.div 
                                    className="relative"
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <div className="relative aspect-[9/19] bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
                                        <div className="absolute top-1/2 -translate-y-1/2 -left-0.5 w-0.5 h-12 bg-gray-800 rounded-l" />
                                        <div className="absolute top-1/2 -translate-y-1/2 translate-y-8 -left-0.5 w-0.5 h-16 bg-gray-800 rounded-l" />
                                        <div className="absolute top-1/2 -translate-y-1/2 -right-0.5 w-0.5 h-20 bg-gray-800 rounded-r" />
                                        
                                        <div className="relative h-full bg-white dark:bg-gray-950 rounded-[2rem] overflow-hidden">
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-gray-900 rounded-b-3xl z-10" />
                                            <img
                                                src="/landing/bannerlight.jpeg"
                                                alt="Gyani Talk App - Vedic Astrology"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Floating Cards with Stagger Animation */}
                                <motion.div 
                                    className="absolute -top-4 -left-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl shadow-xl p-3 border border-gray-200/60 dark:border-gray-700/60"
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1, duration: 0.5 }}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                >
                                    <div className="flex items-center gap-2">
                                        <motion.div 
                                            className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#FFB347] flex items-center justify-center"
                                            animate={{ rotate: [0, 360] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        >
                                            <Star className="w-4 h-4 text-white" />
                                        </motion.div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-900 dark:text-white">New Reading</p>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400">Tarot Available</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    className="absolute -bottom-4 -right-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl shadow-xl p-3 border border-gray-200/60 dark:border-gray-700/60"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.2, duration: 0.5 }}
                                    whileHover={{ scale: 1.1, rotate: -5 }}
                                >
                                    <div className="flex items-center gap-2">
                                        <motion.div 
                                            className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFB347] to-[#FF6B35] flex items-center justify-center"
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <Wallet className="w-4 h-4 text-white" />
                                        </motion.div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-900 dark:text-white">Sign-up Bonus</p>
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400">₹51</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <motion.div 
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <ChevronRight className="w-5 h-5 text-[#FF6B35] rotate-90" />
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="relative py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-block mb-6">
                            <span className="text-sm font-semibold tracking-wider uppercase text-[#FF6B35]">POWERFUL FEATURES</span>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                            <span className="text-gray-900 dark:text-white">Everything You Need </span>
                            <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">In One App</span>
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Seamlessly manage your spiritual journey with our comprehensive platform
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: Zap, title: "Instant Payments", desc: "Lightning-fast transactions with secure payment gateway." },
                            { icon: Wallet, title: "Digital Wallet", desc: "Manage your balance effortlessly and track transactions." },
                            { icon: Star, title: "Expert Astrologers", desc: "Connect with verified experts for personalized readings." },
                            { icon: Shield, title: "Bank-Level Security", desc: "Military-grade encryption protects your data." },
                            { icon: Clock, title: "24/7 Availability", desc: "Access services anytime, anywhere you need." },
                            { icon: Users, title: "Activity Tracking", desc: "Monitor spending patterns and consultation history." },
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                className="group p-6 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl cursor-pointer"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                whileHover={{ 
                                    scale: 1.05, 
                                    borderColor: "rgba(255, 107, 53, 0.5)",
                                    boxShadow: "0 20px 40px rgba(255, 107, 53, 0.2)"
                                }}
                            >
                                <motion.div 
                                    className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-xl flex items-center justify-center mb-4"
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <feature.icon className="w-6 h-6 text-white" />
                                </motion.div>
                                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-white/[0.02] dark:to-white/[0.02]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div 
                            className="space-y-8"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-block">
                                <span className="text-sm font-semibold tracking-wider uppercase text-[#FF6B35]">TRUSTED BY THOUSANDS</span>
                            </div>

                            <h2 className="text-4xl lg:text-5xl font-bold">
                                <span className="text-gray-900 dark:text-white">Why People Love </span>
                                <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">Gyani Talk</span>
                            </h2>

                            <div className="space-y-4">
                                {[
                                    { title: "Verified Experts", desc: "Thoroughly vetted certified professionals" },
                                    { title: "Transparent Pricing", desc: "No hidden fees, clear pricing" },
                                    { title: "Instant Consultations", desc: "Connect immediately without waiting" },
                                    { title: "Multilingual Support", desc: "Communicate in your language" },
                                ].map((benefit, i) => (
                                    <motion.div 
                                        key={i} 
                                        className="flex gap-4 items-start group p-4 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl cursor-pointer"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: i * 0.1 }}
                                        whileHover={{ 
                                            scale: 1.03,
                                            borderColor: "rgba(255, 107, 53, 0.5)"
                                        }}
                                    >
                                        <motion.div 
                                            className="w-12 h-12 bg-[#FF6B35]/10 rounded-lg flex items-center justify-center flex-shrink-0"
                                            whileHover={{ 
                                                background: "linear-gradient(to bottom right, #FF6B35, #FFB347)",
                                                rotate: 360
                                            }}
                                            transition={{ duration: 0.6 }}
                                        >
                                            <ChevronRight className="w-6 h-6 text-[#FF6B35] group-hover:text-white transition-colors" />
                                        </motion.div>
                                        <div>
                                            <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{benefit.title}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{benefit.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div 
                            className="grid grid-cols-2 gap-6"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            {[
                                { value: "50K+", label: "Happy Users", icon: Users },
                                { value: "100+", label: "Astrologers", icon: Star },
                                { value: "99.9%", label: "Uptime", icon: Shield },
                                { value: "24/7", label: "Support", icon: Clock },
                            ].map((stat, i) => (
                                <motion.div 
                                    key={i} 
                                    className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 p-6 rounded-2xl cursor-pointer"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5,
                                        delay: i * 0.1 }}
                                    whileHover={{ 
                                        scale: 1.05,
                                        borderColor: "rgba(255, 107, 53, 0.5)",
                                        boxShadow: "0 10px 30px rgba(255, 107, 53, 0.2)"
                                    }}
                                >
                                    <motion.div
                                        animate={{ rotate: [0, 5, 0, -5, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                                    >
                                        <stat.icon className="w-8 h-8 text-[#FF6B35] mb-3" />
                                    </motion.div>
                                    <div className="text-3xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent mb-2">{stat.value}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>
        </LandingWrapper>
    );
}