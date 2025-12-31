///Users/xeoren/Desktop/gyanitallk-admin/src/components/AdminNotFound.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LayoutDashboard, ArrowLeft, AlertTriangle } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div
      className="
        relative flex w-full flex-col
        min-h-[calc(100vh-80px)]  /* match viewport minus header height */
        bg-gradient-to-br from-orange-50 via-white to-amber-50
        px-4 py-8
        text-gray-900
        dark:from-gray-950 dark:via-[#020617] dark:to-gray-950 dark:text-gray-50
      "
    >
      {/* subtle pattern / glows */}
      <div className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.16) 1px, transparent 0)",
            backgroundSize: "42px 42px",
          }}
        />
        <div className="absolute -top-32 -left-24 h-56 w-56 rounded-full bg-[#FF6B35]/18 blur-3xl dark:bg-[#FF6B35]/12" />
        <div className="absolute -bottom-40 -right-24 h-60 w-60 rounded-full bg-[#FFB347]/18 blur-3xl dark:bg-[#FFB347]/12" />
      </div>

      {/* main content */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-5xl flex-1 flex-col justify-center gap-10 md:flex-row md:items-center">
        {/* LEFT side */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-xl space-y-6"
        >
          {/* pill */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-gray-600 shadow-sm ring-1 ring-gray-200/70 backdrop-blur-sm dark:bg-gray-900/70 dark:text-gray-200 dark:ring-gray-700"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-[0.6rem] font-semibold text-[#FF6B35] dark:bg-orange-900/40">
              •
            </span>
            <span>Admin Control Center</span>
            <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-500" />
            <span className="tracking-[0.16em] text-[0.65rem] uppercase">
              404 status
            </span>
          </motion.div>

          <div className="space-y-3">
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="text-3xl font-extrabold leading-tight sm:text-4xl"
            >
              <span className="block text-gray-900 dark:text-gray-50">
                Ooops! Admin page
              </span>
              <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                went off the chart.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-sm leading-relaxed text-gray-600 sm:text-base dark:text-gray-300"
            >
              The route you&apos;re trying to access doesn&apos;t exist,
              was moved, or your role doesn&apos;t have permission to view it.
              The control panel is still online — pick where you want to go next.
            </motion.p>
          </div>

          {/* three hints */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="grid gap-3 text-xs text-gray-600 sm:grid-cols-3 sm:text-sm dark:text-gray-300"
          >
            <div className="rounded-2xl bg-white/85 px-3 py-2 shadow-sm ring-1 ring-gray-100/80 backdrop-blur-sm dark:bg-gray-900/80 dark:ring-gray-800">
              <div className="mb-1 text-[0.7rem] font-semibold text-[#FF6B35]">
                01
              </div>
              <p>Check if the URL is correct.</p>
            </div>
            <div className="rounded-2xl bg-white/85 px-3 py-2 shadow-sm ring-1 ring-gray-100/80 backdrop-blur-sm dark:bg-gray-900/80 dark:ring-gray-800">
              <div className="mb-1 text-[0.7rem] font-semibold text-[#FF6B35]">
                02
              </div>
              <p>This module might have moved or been removed.</p>
            </div>
            <div className="rounded-2xl bg-white/85 px-3 py-2 shadow-sm ring-1 ring-gray-100/80 backdrop-blur-sm dark:bg-gray-900/80 dark:ring-gray-800">
              <div className="mb-1 text-[0.7rem] font-semibold text-[#FF6B35]">
                03
              </div>
              <p>Your access level may need an update.</p>
            </div>
          </motion.div>

          {/* buttons – dashboard + back */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link
              href="/admin/dashboard"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF6B35] to-[#FFB347] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/30 transition hover:shadow-lg sm:w-auto"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>

            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300/80 bg-transparent px-4 py-3 text-sm font-medium text-gray-600 transition hover:border-gray-400 hover:bg-white/60 sm:flex-none dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-900/60"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Go back</span>
            </button>
          </motion.div>
        </motion.div>

        {/* RIGHT side – badge */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mt-8 flex justify-center md:mt-0 md:flex-1 md:justify-end"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <div className="h-40 w-40 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFB347] shadow-xl shadow-orange-500/40">
              <div className="flex h-full w-full items-center justify-center">
                <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-gray-950/95 ring-4 ring-white/80 dark:ring-gray-900">
                  <span className="text-[0.7rem] font-semibold tracking-[0.18em] text-orange-300">
                    LOST
                  </span>
                  <span className="text-sm font-semibold text-white">
                    ROUTE
                  </span>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.4 }}
              className="absolute -bottom-6 left-1/2 w-[260px] -translate-x-1/2 rounded-2xl bg-white/95 px-4 py-3 text-xs shadow-lg ring-1 ring-gray-200/80 backdrop-blur-md dark:bg-gray-900/95 dark:text-gray-100 dark:ring-gray-800"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300">
                  <AlertTriangle className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Module not found</p>
                  <p className="text-[0.7rem] text-gray-500 dark:text-gray-400">
                    Try going back to the dashboard or ask your admin if this
                    route should be enabled.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}