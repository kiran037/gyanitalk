// /src/app/layout.tsx
"use client";

import "@/css/satoshi.css";
import "@/css/style.css";
import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";
import NextTopLoader from "nextjs-toploader";
import type { PropsWithChildren } from "react";
import { Providers } from "./providers";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/sign-in" || pathname === "/login";

  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      {/* Disable body scroll; let the main column scroll */}
      <body className="h-full overflow-hidden">
        <Providers>
          <NextTopLoader color="#5750F1" showSpinner={false} />

          {isAuthPage ? (
            <div className="flex min-h-screen w-full">
              <div className="flex-1 min-w-0 bg-gray-2 dark:bg-[#020d1a]">
                <main className="w-full min-w-0 overflow-auto">{children}</main>
              </div>
            </div>
          ) : (
            // Grid: [Header] then [Sidebar | Main]
            <div className="grid h-screen w-full grid-rows-[auto,1fr] bg-gray-2 dark:bg-[#020d1a]">
              {/* Row 1 - header */}
              <div className="sticky top-0 z-50">
                <Header />
              </div>

              {/* Row 2 - columns */}
              {/* 🔑 min-h-0 + overflow-hidden so children can scroll */}
              <div className="grid min-h-0 min-w-0 grid-cols-[250px,1fr] overflow-hidden">
                {/* Sidebar column */}
                <div className="h-full min-w-0 overflow-hidden">
                  <Sidebar />
                </div>

                {/* Main column = primary scroll area */}
                {/* 🔑 min-h-0 + overflow-y-auto enables scrolling */}
                <div className="h-full min-h-0 min-w-0 overflow-y-auto overscroll-contain">
                  <main className="w-full min-w-0">{children}</main>
                  <Toaster position="top-right" />
                </div>
              </div>
            </div>
          )}
        </Providers>
      </body>
    </html>
  );
}
