"use client";

import dynamic from "next/dynamic";
import React from "react";

// Lazy-load your client-only chart wrapper with no-SSR
const ChartClient = dynamic(() => import("./ChartWrapper"), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] rounded-xl bg-gray-100 animate-pulse" />
  ),
});

export default ChartClient;
