"use client";

import dynamic from "next/dynamic";
import React from "react";

// Lazy-load the client-only chart wrapper (no SSR)
const ChartClient = dynamic(() => import("./ChartWrapper"), {
  ssr: false,
  loading: () => (
    <div
      className="h-[280px] w-full rounded-xl border border-white/30 bg-white/60 dark:border-white/10 dark:bg-white/[0.06] animate-pulse"
      aria-busy="true"
      aria-label="Loading chart…"
    />
  ),
});

export default ChartClient;
