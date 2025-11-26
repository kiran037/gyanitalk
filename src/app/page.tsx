"use client";

import LandingWrapper from "@/components/landing/LandingWrapper";
import { Zap, Wallet, Star, Shield, Clock, Users, ChevronRight, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import AppDownloadPopup from "@/components/landing/AppDownloadPopup";
import AstrologerCarousel from "@/components/landing/AstrologerCarousel";
import ProductCarousel from "@/components/landing/ProductCarousel";
import PlaystoreReviewCarousel from "@/components/landing/PlaystoreReviewCarousel";
import HomeMain from "@/components/landing/HomeMain";

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
            <HomeMain />

            {/* Features Section */}
             <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-white/[0.02] dark:to-white/[0.02]">
             
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

            <AstrologerCarousel />
            <ProductCarousel />


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
                                    transition={{
                                        duration: 0.5,
                                        delay: i * 0.1
                                    }}
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
            <PlaystoreReviewCarousel />
        </LandingWrapper>
    );
}