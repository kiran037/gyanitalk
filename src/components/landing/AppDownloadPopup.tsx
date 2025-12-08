// "use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star } from "lucide-react";

export default function AppDownloadPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => setIsOpen(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          {/* Card */}
          <motion.div
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 border border-white/10 shadow-2xl p-6 relative"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100/90 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Logo */}
            <div className="flex flex-col items-center text-center gap-3 mt-2">
              <img
                src="https://gyanitalk.s3.ap-south-1.amazonaws.com/public/storage/images/astrologer_7851728112667.png"
                alt="Gyani Talk"
                className="w-16 h-16 rounded-2xl object-contain shadow-md"
              />

              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Download Gyani Talk
                </h2>
                <p className="mt-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                  Get <span className="text-[#FF6B35] font-semibold">₹51</span> sign-up bonus
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-5 space-y-2.5">
              {/* App Store */}
              <a
                href="https://apps.apple.com/in/app/gyanitalk/id6742021396"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white text-sm font-semibold hover:border-[#FF6B35]/60 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] opacity-70">Download on</div>
                  <div>App Store</div>
                </div>
              </a>

              {/* Play Store */}
              <a
                href="https://play.google.com/store/apps/details?id=com.app.gyanitalk&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 rounded-xl border border-[#FF6B35] bg-gradient-to-r from-[#FF6B35] to-[#FFB347] px-4 py-3 text-white text-sm font-semibold shadow-md hover:shadow-lg transition"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div className="text-left">
                  <div className="text-[10px] opacity-90">Get it on</div>
                  <div>Google Play</div>
                </div>
              </a>
            </div>

            {/* Small meta row */}
            <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-gray-600 dark:text-gray-400">
              <span className="inline-flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                4.2 rating
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-400/70" />
              <span>50K+ users</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}