"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export default function AppDownloadPopup() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Show popup after a short delay when component mounts
        const timer = setTimeout(() => {
            setIsOpen(true);
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop with cosmic dust effect */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm"
                        onClick={handleClose}
                    >
                        {/* Animated stars in background */}
                        {[...Array(30)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white rounded-full pointer-events-none"
                                initial={{ 
                                    opacity: 0,
                                    scale: 0,
                                    x: `${Math.random() * 100}vw`,
                                    y: `${Math.random() * 100}vh`
                                }}
                                animate={{ 
                                    opacity: [0, 1, 0],
                                    scale: [0, 1.5, 0],
                                }}
                                transition={{
                                    duration: 2 + Math.random() * 2,
                                    repeat: Infinity,
                                    delay: Math.random() * 2,
                                }}
                            />
                        ))}
                    </motion.div>

                    {/* Main Popup Card - Properly Centered */}
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0, rotate: -180, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            exit={{ scale: 0, rotate: 180, opacity: 0 }}
                            transition={{ 
                                type: "spring",
                                stiffness: 200,
                                damping: 20,
                                duration: 0.8
                            }}
                            className="w-full max-w-[340px] sm:max-w-md pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative">
                                {/* Rotating cosmic ring with rounded corners */}
                                <motion.div
                                    className="absolute -inset-3 sm:-inset-4 rounded-[28px] sm:rounded-[32px]"
                                    style={{
                                        background: "linear-gradient(45deg, #FF6B35, #FFB347, #FF6B35)",
                                        backgroundSize: "200% 200%",
                                    }}
                                    animate={{
                                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                                        rotate: 360,
                                    }}
                                    transition={{
                                        backgroundPosition: {
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: "linear"
                                        },
                                        rotate: {
                                            duration: 8,
                                            repeat: Infinity,
                                            ease: "linear"
                                        }
                                    }}
                                />

                                {/* Glowing orbs */}
                                <motion.div
                                    className="absolute -top-6 -right-6 sm:-top-8 sm:-right-8 w-16 h-16 sm:w-24 sm:h-24 bg-yellow-400 dark:bg-yellow-500 rounded-full blur-2xl sm:blur-3xl opacity-40 sm:opacity-60 pointer-events-none"
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.4, 0.7, 0.4],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                    }}
                                />
                                <motion.div
                                    className="absolute -bottom-6 -left-6 sm:-bottom-8 sm:-left-8 w-16 h-16 sm:w-24 sm:h-24 bg-orange-500 dark:bg-orange-600 rounded-full blur-2xl sm:blur-3xl opacity-40 sm:opacity-60 pointer-events-none"
                                    animate={{
                                        scale: [1, 1.3, 1],
                                        opacity: [0.4, 0.8, 0.4],
                                    }}
                                    transition={{
                                        duration: 2.5,
                                        repeat: Infinity,
                                        delay: 0.5
                                    }}
                                />

                                {/* Main card - Theme Aware with Better Readability */}
                                <div className="relative bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-black rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 shadow-2xl overflow-hidden border-[3px] border-[#FF6B35]/20 dark:border-[#FF6B35]/30">
                                    {/* Animated gradient border effect - More subtle in light mode */}
                                    <div className="absolute inset-0 rounded-[24px] sm:rounded-[28px] overflow-hidden pointer-events-none">
                                        <motion.div
                                            className="absolute inset-0 opacity-30 dark:opacity-100"
                                            style={{
                                                background: "radial-gradient(circle at 50% 50%, rgba(255,107,53,0.15) 0%, transparent 70%)",
                                            }}
                                            animate={{
                                                scale: [1, 1.5, 1],
                                                opacity: [0.15, 0.3, 0.15],
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                            }}
                                        />
                                    </div>

                                    {/* Floating particles - More subtle in light mode */}
                                    {[...Array(8)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-40 dark:opacity-100 pointer-events-none"
                                            initial={{
                                                x: Math.random() * 300 - 150,
                                                y: Math.random() * 400 - 200,
                                                scale: 0,
                                            }}
                                            animate={{
                                                y: [null, -400],
                                                opacity: [0, 0.6, 0],
                                                scale: [0, 1, 0],
                                            }}
                                            transition={{
                                                duration: 3 + Math.random() * 2,
                                                repeat: Infinity,
                                                delay: Math.random() * 2,
                                                ease: "easeOut"
                                            }}
                                        />
                                    ))}

                                    {/* Close button - Fixed with proper z-index and larger hit area */}
                                    <motion.button
                                        onClick={handleClose}
                                        className="absolute top-3 right-3 sm:top-4 sm:right-4 z-[100] w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-gray-300 dark:border-white/20 transition-all duration-200 shadow-lg cursor-pointer"
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        style={{ pointerEvents: 'auto' }}
                                    >
                                        <X className="w-5 h-5 sm:w-5 sm:h-5 text-gray-700 dark:text-white" />
                                    </motion.button>

                                    {/* Content */}
                                    <div className="relative z-10 text-center">
                                        {/* Icon with pulse effect */}
                                        {/* <motion.div
                                            className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-[20px] sm:rounded-[24px] flex items-center justify-center mb-4 sm:mb-6 relative p-2 sm:p-2.5"
                                            animate={{
                                                boxShadow: [
                                                    "0 0 20px rgba(255,107,53,0.5)",
                                                    "0 0 35px rgba(255,107,53,0.8)",
                                                    "0 0 20px rgba(255,107,53,0.5)",
                                                ],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                            }}
                                        > */}
                                            <motion.img
                                                src="https://gyanitalk.s3.ap-south-1.amazonaws.com/public/storage/images/astrologer_7851728112667.png"
                                                alt="Gyani Talk"
                                                className="w-full h-full object-contain"
                                                animate={{ 
                                                    scale: [1, 1.05, 1],
                                                }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                            />

                                            {/* Orbiting mini stars - Responsive */}
                                            <motion.div
                                                className="absolute w-full h-full pointer-events-none"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                            >
                                                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300 absolute -top-1 sm:-top-2 left-1/2 -translate-x-1/2" />
                                            </motion.div>
                                            <motion.div
                                                className="absolute w-full h-full pointer-events-none"
                                                animate={{ rotate: -360 }}
                                                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                                            >
                                                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-orange-300 absolute -bottom-1 sm:-bottom-2 left-1/2 -translate-x-1/2" />
                                            </motion.div>
                                        {/* </motion.div> */}

                                        {/* Title with gradient animation - Better contrast */}
                                        <motion.h2
                                            className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <motion.span
                                                className="bg-gradient-to-r from-[#FF6B35] via-[#FF8C00] to-[#FF6B35] bg-clip-text text-transparent"
                                                animate={{
                                                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                                                }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                }}
                                                style={{ backgroundSize: "200% auto" }}
                                            >
                                                Download Gyani Talk
                                            </motion.span>
                                        </motion.h2>

                                        <motion.p
                                            className="text-gray-700 dark:text-gray-300 mb-6 sm:mb-8 text-xs sm:text-sm px-2 font-medium"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                        >
                                            🌟 Get ₹51 Sign-up Bonus & Free Consultation
                                        </motion.p>

                                        {/* Download buttons - Enhanced borders and shadows */}
                                        <motion.div
                                            className="flex flex-col gap-2.5 sm:gap-3"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            {/* App Store Button */}
                                            <motion.a
                                                href="https://apps.apple.com/in/app/gyanitalk/id6742021396"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group relative overflow-hidden flex items-center justify-center gap-2.5 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-[16px] font-semibold shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:border-[#FF6B35]/40 dark:hover:border-[#FF6B35]/60 transition-all"
                                                whileHover={{ scale: 1.03, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10"
                                                    initial={{ x: "-100%" }}
                                                    whileHover={{ x: "100%" }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                                <svg className="w-6 h-6 sm:w-7 sm:h-7 relative z-10" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                                </svg>
                                                <div className="text-left relative z-10">
                                                    <div className="text-[10px] sm:text-xs opacity-70 font-normal">Download on</div>
                                                    <div className="text-sm sm:text-base font-bold">App Store</div>
                                                </div>
                                            </motion.a>

                                            {/* Play Store Button */}
                                            <motion.a
                                                href="https://play.google.com/store/apps/details?id=com.app.gyanitalk&pcampaignid=web_share"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group relative overflow-hidden flex items-center justify-center gap-2.5 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white rounded-[16px] font-semibold shadow-lg border-2 border-[#FF6B35] hover:shadow-xl transition-all"
                                                whileHover={{ scale: 1.03, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <motion.div
                                                    className="absolute inset-0 bg-white/20"
                                                    initial={{ x: "-100%" }}
                                                    whileHover={{ x: "100%" }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                                <svg className="w-6 h-6 sm:w-7 sm:h-7 relative z-10" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                                                </svg>
                                                <div className="text-left relative z-10">
                                                    <div className="text-[10px] sm:text-xs opacity-90 font-normal">Get it on</div>
                                                    <div className="text-sm sm:text-base font-bold">Google Play</div>
                                                </div>
                                            </motion.a>
                                        </motion.div>

                                        {/* Trust badges - Better contrast */}
                                        <motion.div
                                            className="mt-4 sm:mt-6 flex items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.7 }}
                                        >
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-yellow-500" />
                                                <span>4.2 Rating</span>
                                            </div>
                                            <div className="w-1 h-1 bg-gray-400 dark:bg-gray-600 rounded-full" />
                                            <div>50K+ Users</div>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}