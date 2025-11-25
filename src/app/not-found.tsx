"use client";

import { motion } from "framer-motion";
import { Home, Search, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import Footer from "@/components/landing/Footer";

export default function NotFound() {
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        // Check for saved theme preference or default to 'light'
        const savedTheme = localStorage.getItem("theme") || "light";
        setTheme(savedTheme);
        document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }, []);

    return (
        <div className={theme === "dark" ? "dark" : ""}>
            <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-950 dark:via-black dark:to-gray-900 transition-colors duration-300 min-h-screen flex flex-col">
                {/* Main Content */}
                <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden relative">
                    {/* Animated Grid Background */}
                    <div className="absolute inset-0">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 107, 53, 0.06) 1px, transparent 0)`,
                            backgroundSize: '40px 40px',
                        }} />
                    </div>

                    {/* Floating Particles */}
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

                    {/* Main Content */}
                    <div className="relative z-10 max-w-2xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-8"
                        >
                            {/* Floating Icon */}
                            <motion.div
                                className="relative inline-block"
                                animate={{ 
                                    y: [0, -20, 0],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ 
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <div className="relative">
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full blur-3xl opacity-40"
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                    <div className="relative w-32 h-32 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full flex items-center justify-center shadow-2xl">
                                        <AlertCircle className="w-16 h-16 text-white" />
                                    </div>
                                </div>
                            </motion.div>

                            {/* 404 Number */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            >
                                <h1 className="text-8xl sm:text-9xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                                    404
                                </h1>
                            </motion.div>

                            {/* Text Content */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="space-y-4"
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 border border-[#FF6B35]/20 rounded-full backdrop-blur-sm">
                                    <Sparkles className="w-4 h-4 text-[#FF6B35]" />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">PAGE NOT FOUND</span>
                                </div>

                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                                    Oops! Lost in the Stars
                                </h2>

                                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                                    The cosmic page you're looking for seems to have drifted into another dimension. Let's guide you back home.
                                </p>
                            </motion.div>

                            {/* Action Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                                className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
                            >
                                <Link href="/">
                                    <motion.button
                                        className="group flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white rounded-xl shadow-lg font-medium"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Home className="w-5 h-5" />
                                        Back to Home
                                    </motion.button>
                                </Link>

                                <Link href="/landing/blog">
                                    <motion.button
                                        className="group flex items-center justify-center gap-2 px-6 py-3 bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 text-gray-900 dark:text-white rounded-xl shadow-lg font-medium hover:border-[#FF6B35]/50"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Search className="w-5 h-5" />
                                        Explore Blog
                                    </motion.button>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                {/* Footer */}
                <Footer />

                {/* Custom Animations */}
                <style jsx global>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-20px); }
                    }
                    
                    .animate-float {
                        animation: float 3s ease-in-out infinite;
                    }
                    
                    .animate-float-delayed {
                        animation: float 3s ease-in-out infinite;
                        animation-delay: 1.5s;
                    }

                    * {
                        -webkit-tap-highlight-color: transparent;
                    }
                    
                    html {
                        scroll-behavior: smooth;
                    }
                `}</style>
            </div>
        </div>
    );
}