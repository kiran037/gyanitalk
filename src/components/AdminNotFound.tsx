"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  MoveLeft, 
  Map, 
  Telescope, 
  Compass,
  AlertCircle
} from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="relative flex min-h-[calc(100vh-80px)] w-full items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-300">
      
      {/* --- BACKGROUND EFFECTS --- */}
      {/* Light Mode: Warm Amber Glow */}
      <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-orange-200/40 blur-3xl dark:hidden pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl dark:hidden pointer-events-none translate-x-1/2 translate-y-1/2" />
      
      {/* Dark Mode: Deep Space Glow */}
      <div className="hidden dark:block absolute top-0 left-0 h-96 w-96 rounded-full bg-[#FF6B35]/10 blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="hidden dark:block absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[#FFB347]/10 blur-[100px] pointer-events-none translate-x-1/2 translate-y-1/2" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        
        {/* LEFT: Text & Actions */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="order-2 lg:order-1 text-center lg:text-left space-y-6"
        >
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600 dark:border-orange-900/50 dark:bg-orange-900/20 dark:text-orange-300 mx-auto lg:mx-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            404 Error Detected
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
              Oops!
            </span><br className="hidden sm:block" />
            We couldn’t find this page. 
            
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            The admin route you are looking for has aligned incorrectly or doesn't exist in this system's constellation.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
            <Link 
              href="/admin/dashboard" 
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6B35] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-[#e55a2b] hover:scale-[1.02] hover:shadow-orange-500/30"
            >
              <LayoutDashboard className="h-4 w-4" />
              Return to Dashboard
            </Link>

            <button 
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <MoveLeft className="h-4 w-4" />
              Go Back
            </button>
          </div>

          {/* Helper Links */}
          <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-gray-400" />
              Check your URL
            </span>
            <span className="hidden sm:block text-gray-300 dark:text-gray-700">•</span>
            <span className="flex items-center gap-1.5">
              <Map className="w-4 h-4 text-gray-400" />
              Contact Super Admin
            </span>
          </div>
        </motion.div>

        {/* RIGHT: Illustration (Adaptive Light/Dark) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="order-1 lg:order-2 flex justify-center relative"
        >
          {/* Main Container for the Illustration */}
          <div className="relative h-80 w-80 sm:h-96 sm:w-96">
            
            {/* 1. Orbit Rings (CSS Circles) */}
            <motion.div 
              className="absolute inset-0 rounded-full border border-gray-200 dark:border-gray-700/50"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute inset-12 rounded-full border border-dashed border-gray-300 dark:border-gray-600/50"
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            />

            {/* 2. Floating Elements */}
            <motion.div
              animate={{ y: [-15, 15, -15] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center z-10"
            >
              {/* Central 404 Visual */}
              <div className="relative h-48 w-48 rounded-full bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-900 shadow-2xl dark:shadow-orange-900/20 border border-white dark:border-gray-700 flex items-center justify-center">
                {/* Number */}
                <span className="text-7xl font-black text-gray-200 dark:text-gray-800 select-none">
                  404
                </span>
                
                {/* Overlay Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                   <Telescope className="w-20 h-20 text-[#FF6B35] drop-shadow-xl" strokeWidth={1.5} />
                </div>
              </div>
            </motion.div>

            {/* 3. Orbiting Planets */}
            <motion.div 
               className="absolute top-10 left-10 p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
               animate={{ y: [10, -10, 10], x: [0, 5, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
               <Compass className="w-6 h-6 text-blue-500" />
            </motion.div>

            <motion.div 
               className="absolute bottom-20 right-0 p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
               animate={{ y: [-10, 10, -10], x: [0, -5, 0] }}
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
               <Map className="w-6 h-6 text-emerald-500" />
            </motion.div>

            {/* Decorative Dots */}
            <div className="absolute top-1/2 left-0 h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-700" />
            <div className="absolute top-0 left-1/2 h-3 w-3 rounded-full bg-[#FF6B35] opacity-50 blur-[1px]" />
            <div className="absolute bottom-10 left-20 h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-600" />

          </div>
        </motion.div>
      </div>
    </div>
  );
}