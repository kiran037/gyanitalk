"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Sparkles, Smartphone, Download } from "lucide-react";

export default function AppDownloadPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle mounting state to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    
    // Check session storage
    const dismissed = sessionStorage.getItem("app-download-dismissed");
    if (dismissed) return;

    // SEO Tip: A delay of 2-3 seconds is better than instant popups
    // to avoid "Intrusive Interstitial" penalties on mobile.
    const timer = setTimeout(() => setIsOpen(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    sessionStorage.setItem("app-download-dismissed", "1");
    setIsOpen(false);
  };

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop with Blur */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Cosmic Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="popup-title"
            className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-[#FFFBF5] dark:bg-[#0f0f0f] shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Decorative Background Pattern (Stars) */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.1]">
              <svg className="h-full w-full" width="100%" height="100%">
                <pattern id="stars-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="currentColor" className="text-orange-900 dark:text-white" />
                  <path d="M20 20 L22 22 M22 20 L20 22" stroke="currentColor" strokeWidth="0.5" className="text-orange-900 dark:text-white" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#stars-pattern)" />
              </svg>
            </div>

            {/* Gradient Top Border */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF6B35] via-[#FFB347] to-[#FF6B35]" />

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close popup"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center p-6 text-center">
              
              {/* App Icon with Glow */}
              <div className="relative mb-5">
                <div className="absolute -inset-4 bg-orange-500/20 blur-xl rounded-full animate-pulse" />
                <div className="relative h-20 w-20 rounded-2xl overflow-hidden shadow-lg ring-4 ring-white dark:ring-gray-800">
                  <img
                    src="https://gyanitalk.s3.ap-south-1.amazonaws.com/public/storage/images/astrologer_7851728112667.png"
                    alt="Gyani Talk Logo"
                    className="h-full w-full object-cover"
                  />
                </div>
                {/* Floating Badge */}
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#FF6B35] to-[#FF9057] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span>FREE</span>
                </div>
              </div>

              {/* Text Content */}
              <h2 id="popup-title" className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Unlock Your Destiny
              </h2>
              
              <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl px-4 py-2 mb-6">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Download App & Get <span className="font-bold text-[#FF6B35]">₹51 Bonus</span> instantly!
                </p>
              </div>

              {/* Store Buttons - Stacked for better mobile touch targets */}
              <div className="w-full space-y-3">
                {/* Play Store */}
                <a
                  href="https://play.google.com/store/apps/details?id=com.app.gyanitalk&pcampaignid=web_share"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FFB347] px-4 py-3.5 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-[1.02] transition-all duration-200 group"
                >
                  <Download className="h-5 w-5 fill-current" />
                  <div className="text-left">
                    <div className="text-[10px] font-medium opacity-90 uppercase tracking-wide leading-none">Get it on</div>
                    <div className="text-sm font-bold leading-tight">Google Play</div>
                  </div>
                </a>

                {/* App Store */}
                <a
                  href="https://apps.apple.com/in/app/gyanitalk/id6742021396"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-gray-900 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-750 transition-all duration-200"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[10px] font-medium opacity-60 uppercase tracking-wide leading-none">Download on</div>
                    <div className="text-sm font-bold leading-tight">App Store</div>
                  </div>
                </a>
              </div>

              {/* Social Proof */}
              <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-6 w-6 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700" />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-700 dark:text-gray-200">4.2</span>
                  <span>(50K+ Users)</span>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}