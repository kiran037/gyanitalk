"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, Sparkles, Smartphone, Download } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";

// --- Dynamic Import for Performance ---
const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

// --- Assets ---
const APP_LOGO =
  "https://gyanitalk.s3.ap-south-1.amazonaws.com/public/storage/images/astrologer_7851728112667.png";
const ANDROID_LINK =
  "https://play.google.com/store/apps/details?id=com.app.gyanitalk";
const IOS_LINK = "https://apps.apple.com/in/app/gyanitalk/id6742021396";

export default function ScratchAndWin() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScratched, setIsScratched] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
  }, []);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
  }, [isOpen]);

  return (
    <>
      <FloatingGiftTrigger onClick={() => setIsOpen(true)} visible={!isOpen} />

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* 1. Backdrop (Clean Blur) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* 2. Main Modal (Brand Aligned) */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-[320px] overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            >
              {/* Confetti */}
              {isScratched && (
                <div className="pointer-events-none absolute inset-0 z-50">
                  <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    numberOfPieces={200}
                    gravity={0.2}
                    className="!fixed !inset-0"
                  />
                </div>
              )}

              {/* Background Decor (Matches your site theme) */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-50">
                <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-orange-100 blur-3xl dark:bg-orange-900/20" />
                <div className="absolute bottom-0 left-0 h-32 w-32 -translate-x-1/2 translate-y-1/2 rounded-full bg-purple-100 blur-3xl dark:bg-purple-900/20" />
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 z-50 rounded-full bg-gray-100 p-2 text-gray-500 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Content Container */}
              <div className="relative z-10 flex flex-col items-center px-6 pb-6 pt-8 text-center">
                {/* Header */}
                <div className="mb-6 space-y-1">
                  <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-[#FF6B35] dark:bg-orange-900/20">
                    {isScratched ? (
                      <Sparkles className="h-6 w-6" />
                    ) : (
                      <Gift className="h-6 w-6" />
                    )}
                  </div>
                  <h3 className="text-xl font-extrabold uppercase tracking-wide text-gray-900 dark:text-white">
                    {isScratched ? "Congratulations!" : "Surprise Gift"}
                  </h3>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {isScratched
                      ? "You've unlocked a welcome bonus"
                      : "Scratch below to reveal your prize"}
                  </p>
                </div>

                {/* Scratch Area */}
                <div className="relative h-[240px] w-[240px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-950">
                  {/* REVEALED PRIZE (Bottom Layer) */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <div className="relative mb-4 h-16 w-16">
                      <Image
                        src={APP_LOGO}
                        alt="Logo"
                        fill
                        className="rounded-full border-4 border-white object-cover shadow-md dark:border-gray-800"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        You Won
                      </div>
                      <div className="text-4xl font-black text-[#FF6B35]">
                        ₹51
                      </div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Wallet Cash on Signup
                      </div>
                    </div>
                  </div>

                  {/* SCRATCH CANVAS (Top Layer) */}
                  {!isScratched && (
                    <ScratchCardOverlay
                      width={240}
                      height={240}
                      onScratchComplete={() => setIsScratched(true)}
                    />
                  )}

                  {isScratched && (
                    <div className="absolute inset-0 z-10 bg-transparent" />
                  )}
                </div>

                {/* Download Actions (Fade In) */}
                <div className="relative mt-6 h-[50px] w-full">
                  <AnimatePresence mode="wait">
                    {!isScratched ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="flex animate-pulse items-center gap-2 text-xs text-gray-400">
                          <Sparkles className="h-3 w-3" />
                          <span>Rub the card to play</span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute inset-0 flex items-center justify-center gap-3"
                      >
                        <a
                          href={ANDROID_LINK}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black py-3 text-xs font-bold text-white shadow-lg transition-opacity hover:opacity-80"
                        >
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                          </svg>

                          <span>Android</span>
                        </a>
                        <a
                          href={IOS_LINK}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FF9057] py-3 text-xs font-bold text-white shadow-lg transition-opacity hover:opacity-90"
                        >
                          <svg
                            className="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                          </svg>
                          <span>iOS App</span>
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// --- Component: Floating Trigger Button (Matches Theme) ---
function FloatingGiftTrigger({
  onClick,
  visible,
}: {
  onClick: () => void;
  visible: boolean;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          className="group fixed bottom-6 right-6 z-40 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#FF6B35] shadow-lg shadow-orange-500/30 sm:h-16 sm:w-16"
        >
          {/* Ping Effect */}
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF6B35] opacity-75" />

          <Gift className="relative h-6 w-6 text-white transition-transform duration-300 group-hover:-rotate-12 sm:h-7 sm:w-7" />

          {/* Badge */}
          <div className="absolute -right-1 -top-1 min-w-[18px] rounded-full border border-orange-100 bg-white px-1.5 py-0.5 text-[10px] font-extrabold text-[#FF6B35] shadow-sm">
            1
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// --- Component: Canvas Overlay (Silver/Platinum Style) ---
function ScratchCardOverlay({
  width,
  height,
  onScratchComplete,
}: {
  width: number;
  height: number;
  onScratchComplete: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Silver/Platinum Gradient (Matches clean UI)
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#E2E2E2");
    gradient.addColorStop(0.5, "#FFFFFF");
    gradient.addColorStop(1, "#D1D1D1");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. Subtle Pattern (Dots)
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    for (let i = 0; i < width; i += 10) {
      for (let j = 0; j < height; j += 10) {
        if ((i + j) % 20 === 0) ctx.fillRect(i, j, 2, 2);
      }
    }

    // 3. Text (Matches Brand Orange)
    ctx.fillStyle = "#FF6B35";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SCRATCH HERE", width / 2, height / 2);
  }, [width, height]);

  // Scratch Logic
  const scratch = (x: number, y: number) => {
    if (isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 35, 0, Math.PI * 2);
    ctx.fill();

    checkCompletion();
  };

  const checkCompletion = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    let transparentPixels = 0;
    const totalPixels = pixels.length / 4;

    for (let i = 0; i < pixels.length; i += 80) {
      if (pixels[i + 3] < 128) transparentPixels++;
    }

    // Win Threshold: 30%
    const checkedPixels = totalPixels / 20;
    const percentage = (transparentPixels / checkedPixels) * 100;

    if (percentage > 30) {
      setIsRevealed(true);
      canvas.style.transition = "opacity 0.6s ease-out";
      canvas.style.opacity = "0";
      setTimeout(onScratchComplete, 300);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.buttons !== 1) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    scratch(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const touch = e.touches[0];
    scratch(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`absolute inset-0 z-20 cursor-crosshair touch-none rounded-2xl transition-all ${isRevealed ? "pointer-events-none" : ""}`}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    />
  );
}
