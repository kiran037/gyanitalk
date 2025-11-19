// src/app/(home)/layout.tsx
import React from "react";
import { GlassCard, cx } from "@/components/GlassUI/GlassKit";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-64px)] w-full">
      {/* Top gradient wash for subtle depth */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-40 bg-gradient-to-b from-blue-500/10 to-transparent" />
      <div className={cx("relative z-10 mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8")}>
        <GlassCard className="p-0 md:p-0 bg-transparent border-0 shadow-none hover:shadow-none">
          {children}
        </GlassCard>
      </div>
    </div>
  );
}
