
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
      {/* clip horizontal overflow globally to avoid side scroll */}
      <body className="min-h-screen overflow-x-clip">
        <Providers>
          <NextTopLoader color="#5750F1" showSpinner={false} />

          {isAuthPage ? (
            // Auth layout (no sidebar/header)
            <div className="flex min-h-screen w-full">
              <div className="flex-1 min-w-0 bg-gray-2 dark:bg-[#020d1a]">
                {/* Full-bleed main: no max-width / no big gutters */}
                <main className="w-full min-w-0 overflow-x-clip">
                  {children}
                </main>
              </div>
            </div>
          ) : (
            // App layout with sidebar + header
            <div className="flex min-h-screen w-full">
              <Sidebar />

              <div className="flex-1 min-w-0 bg-gray-2 dark:bg-[#020d1a]">
                <Header />

                {/* Full-bleed main: no max-width / no big gutters */}
                <main className="w-full min-w-0 overflow-x-clip ">
                  {children}
                </main>

                <Toaster position="top-right" />
              </div>
            </div>
          )}
        </Providers>
      </body>
    </html>
  );
}
